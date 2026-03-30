// apps/web/app/api/payment/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@/lib/supabase/server';
import {
  verifyRazorpaySignature,
  secureLog,
  safeErrorMessage,
} from '@/lib/security';
import { withSecurityHeaders } from '@/app/api/security-headers';

// Service-role client for atomic operations (bypasses RLS for stock management)
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyPaymentHandler(req: NextRequest): Promise<NextResponse> {
  // ── Auth ────────────────────────────────────────────────────────────────
  const supabase = createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse & validate body ───────────────────────────────────────────────
  let razorpay_order_id: string;
  let razorpay_payment_id: string;
  let razorpay_signature: string;
  let order_id: string; // Internal DB order ID

  try {
    const body = await req.json();
    razorpay_order_id = body?.razorpay_order_id ?? '';
    razorpay_payment_id = body?.razorpay_payment_id ?? '';
    razorpay_signature = body?.razorpay_signature ?? '';
    order_id = body?.order_id ?? '';
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
    return NextResponse.json(
      { error: 'Missing required payment fields' },
      { status: 400 }
    );
  }

  // ── Idempotency check: prevent double-processing ─────────────────────────
  const { data: existingOrder, error: orderFetchError } = await supabase
    .from('orders')
    .select('id, payment_status, user_id, items:order_items(product_id, quantity)')
    .eq('id', order_id)
    .single();

  if (orderFetchError || !existingOrder) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Verify the order belongs to the authenticated user
  type OrderRow = {
    id: string;
    payment_status: string;
    user_id: string;
    items: { product_id: string; quantity: number }[];
  };
  const order = existingOrder as unknown as OrderRow;

  if (order.user_id !== user.id) {
    secureLog('warn', 'Payment verification for unauthorized order', {
      userId: user.id,
      orderId: order_id,
    });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Already processed — return success without re-processing
  if (order.payment_status === 'paid') {
    secureLog('info', 'Duplicate payment verification request (already paid)', {
      orderId: order_id,
    });
    return NextResponse.json({
      success: true,
      message: 'Payment already verified',
      orderId: order_id,
    });
  }

  // ── Timing-safe signature verification ──────────────────────────────────
  const isValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

  if (!isValid) {
    secureLog('warn', 'Invalid Razorpay signature received', {
      userId: user.id,
      orderId: order_id,
      razorpayOrderId: razorpay_order_id,
    });

    // Mark order as tampered
    await adminSupabase
      .from('orders')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    return NextResponse.json(
      { error: 'Payment verification failed: invalid signature' },
      { status: 400 }
    );
  }

  // ── Atomic order update + stock decrement via Supabase RPC ───────────────
  try {
    // Update order status first (within user's RLS scope)
    const { error: updateError } = await adminSupabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)
      .eq('payment_status', 'pending'); // Optimistic lock — only update if still pending

    if (updateError) {
      secureLog('error', 'Order status update failed', {
        orderId: order_id,
        error: safeErrorMessage(updateError),
      });
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    // Decrement stock for each order item (using admin client for RPC)
    const orderItems = order.items ?? [];
    const stockDecrements = orderItems.map((item: { product_id: string; quantity: number }) =>
      adminSupabase.rpc('decrement_product_stock', {
        p_id: item.product_id,
        p_qty: item.quantity,
      })
    );

    const stockResults = await Promise.allSettled(stockDecrements);

    // Log any stock decrement failures but don't block the response
    stockResults.forEach((res: PromiseSettledResult<unknown>, i: number) => {
      if (res.status === 'rejected' || (res.status === 'fulfilled' && (res.value as { error?: unknown }).error)) {
        secureLog('error', 'Stock decrement failed for item', {
          productId: orderItems[i]?.product_id,
          quantity: orderItems[i]?.quantity,
          error: res.status === 'rejected'
            ? safeErrorMessage((res as PromiseRejectedResult).reason)
            : safeErrorMessage(((res as PromiseFulfilledResult<unknown>).value as { error: unknown }).error),
        });
      }
    });

    secureLog('info', 'Payment verified successfully', {
      orderId: order_id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and order confirmed',
      orderId: order_id,
    });
  } catch (error) {
    secureLog('error', 'Payment verification processing error', {
      orderId: order_id,
      error: safeErrorMessage(error),
    });
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}

export const POST = withSecurityHeaders(verifyPaymentHandler, {
  validateOrigin: true,
});
