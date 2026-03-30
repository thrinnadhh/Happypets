// apps/web/app/api/products/[id]/delete-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  validateCloudinaryPublicId,
  secureLog,
  safeErrorMessage,
} from '@/lib/security';
import { withSecurityHeaders } from '@/app/api/security-headers';

/** Delete an image via Cloudinary REST API (avoids SDK peer-dep issues) */
async function destroyCloudinaryAsset(publicId: string): Promise<{ result: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000);
  const { createHmac } = await import('crypto');
  const signature = createHmac('sha256', apiSecret)
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');

  // Use Node's built-in crypto hmac properly: sign without secret in the string
  const toSign = `public_id=${publicId}&timestamp=${timestamp}`;
  const sig = createHmac('sha256', apiSecret).update(toSign).digest('hex');
  void signature; // discard the wrong one

  const body = new URLSearchParams({
    public_id: publicId,
    api_key: apiKey,
    timestamp: String(timestamp),
    signature: sig,
  });

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    { method: 'POST', body }
  );
  return res.json() as Promise<{ result: string }>;
}

async function deleteImageHandler(
  req: NextRequest,
  context?: { params: Record<string, string> }
): Promise<NextResponse> {
  const productId = context?.params?.id;

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  // ── Auth ──────────────────────────────────────────────────────────────────
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────
  let publicId: string;
  try {
    const body = await req.json();
    publicId = body?.publicId ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // ── Validate publicId (prevent directory traversal) ──────────────────────
  if (!validateCloudinaryPublicId(publicId)) {
    secureLog('warn', 'Invalid Cloudinary publicId rejected', {
      userId: user.id,
      publicId,
    });
    return NextResponse.json(
      { error: 'Invalid image identifier' },
      { status: 400 }
    );
  }

  // ── Ownership check: ensure user owns a shop that owns this product ──────
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, shop_id, images')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  const typedProduct = product as { id: string; shop_id: string; images: string[] | null };

  const { data: shop, error: shopError } = await supabase
    .from('shops')
    .select('id, owner_id')
    .eq('id', typedProduct.shop_id)
    .single();

  if (shopError || !shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
  }

  const typedShop = shop as { id: string; owner_id: string };

  if (typedShop.owner_id !== user.id) {
    secureLog('warn', 'Unauthorized image deletion attempt', {
      userId: user.id,
      shopOwnerId: typedShop.owner_id,
      productId,
    });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // ── Verify the publicId actually belongs to this product ─────────────────
  const currentImages: string[] = Array.isArray(typedProduct.images)
    ? (typedProduct.images as string[])
    : [];
  const imageExistsOnProduct = currentImages.some(
    (img) => typeof img === 'string' && img.includes(publicId)
  );

  if (!imageExistsOnProduct) {
    return NextResponse.json(
      { error: 'Image not associated with this product' },
      { status: 400 }
    );
  }

  // ── Delete from Cloudinary ────────────────────────────────────────────────
  try {
    const result = await destroyCloudinaryAsset(publicId);

    if (result.result !== 'ok' && result.result !== 'not found') {
      secureLog('error', 'Cloudinary deletion failed', { result, publicId });
      return NextResponse.json(
        { error: 'Failed to delete image from storage' },
        { status: 500 }
      );
    }

    // Remove from product images array in DB
    const updatedImages = currentImages.filter(
      (img) => typeof img === 'string' && !img.includes(publicId)
    );

    // Use the admin client here as it has the full typed Database schema
    // (the SSR client's type inference resolves .update() to 'never' in this context)
    const { createClient: mkAdmin } = await import('@supabase/supabase-js');
    const typedAdmin = mkAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error: updateError } = await typedAdmin
      .from('products')
      .update({ images: updatedImages, updated_at: new Date().toISOString() })
      .eq('id', productId);

    if (updateError) {
      secureLog('error', 'Failed to update product images after deletion', {
        productId,
      });
      return NextResponse.json(
        { error: 'Image deleted but product update failed' },
        { status: 500 }
      );
    }

    secureLog('info', 'Product image deleted successfully', {
      productId,
      userId: user.id,
    });

    return NextResponse.json({ success: true, deleted: publicId });
  } catch (error) {
    secureLog('error', 'Image deletion error', {
      productId,
      error: safeErrorMessage(error),
    });
    return NextResponse.json({ error: 'Image deletion failed' }, { status: 500 });
  }
}

export const DELETE = withSecurityHeaders(deleteImageHandler, {
  validateOrigin: true,
});
