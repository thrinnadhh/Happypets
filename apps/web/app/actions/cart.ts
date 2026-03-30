// apps/web/app/actions/cart.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';

export async function addToCart(productId: string, variantId: string | null, quantity: number) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  // Verify product is active and in stock
  const { data: product } = await supabase
    .from('products')
    .select('id, stock_quantity, is_active, shop_id, shops!inner(status)')
    .eq('id', productId)
    .single();

  if (!product?.is_active || product.shops.status !== 'active') {
    throw new Error('Product is unavailable');
  }

  if (product.stock_quantity < quantity) {
    throw new Error(`Only ${product.stock_quantity} items in stock`);
  }

  // Upsert cart item
  const { error } = await supabase.from('cart_items').upsert(
    { user_id: user.id, product_id: productId, variant_id: variantId, quantity },
    { onConflict: 'user_id,product_id,variant_id' }
  );

  if (error) throw new Error('Failed to update cart');

  await redis.del(`cart:${user.id}`);
  revalidatePath('/cart');
  return { success: true };
}
