// apps/web/app/api/webhooks/razorpay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { redis } from '@/lib/redis';

// Use service role for webhook processing (no user session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-razorpay-signature');

  if (!signature || !verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  const eventType = event.event;

  try {
    switch (eventType) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        const razorpayOrderId = payment.order_id;

        // Update order status
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'confirmed',
            payment_method: mapRazorpayMethod(payment.method),
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', razorpayOrderId)
          .select('id, user_id, order_number')
          .single();

        if (orderError || !order) {
          console.error('Order update failed:', orderError);
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Deduct stock for each order item
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_id, variant_id, quantity')
          .eq('order_id', order.id);

        for (const item of orderItems ?? []) {
          if (item.variant_id) {
            await supabase.rpc('decrement_variant_stock', {
              p_variant_id: item.variant_id,
              p_quantity: item.quantity,
            });
          } else {
            await supabase.rpc('decrement_product_stock', {
              p_product_id: item.product_id,
              p_quantity: item.quantity,
            });
          }
        }

        // Clear user's cart
        await supabase.from('cart_items').delete().eq('user_id', order.user_id);
        await redis.del(`cart:${order.user_id}`);

        // Update coupon usage if applicable
        const { data: couponUsage } = await supabase
          .from('orders')
          .select('discount_inr')
          .eq('id', order.id)
          .single();

        // Queue email notification (via Supabase Edge Function or external service)
        await redis.lpush('email:queue', JSON.stringify({
          type: 'order_confirmed',
          orderId: order.id,
          orderNumber: order.order_number,
          userId: order.user_id,
        }));

        // Notify shop admins for each shop involved
        const { data: shopItems } = await supabase
          .from('order_items')
          .select('shop_id')
          .eq('order_id', order.id);

        const uniqueShopIds = [...new Set(shopItems?.map(i => i.shop_id))];
        for (const shopId of uniqueShopIds) {
          await redis.lpush('notification:queue', JSON.stringify({
            type: 'new_order',
            shopId,
            orderId: order.id,
            orderNumber: order.order_number,
          }));
        }

        break;
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
            razorpay_payment_id: payment.id,
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', payment.order_id);

        break;
      }

      case 'refund.processed': {
        const refund = event.payload.refund.entity;
        await supabase
          .from('orders')
          .update({
            payment_status: 'refunded',
            updated_at: new Date().toISOString(),
          })
          .eq('razorpay_payment_id', refund.payment_id);

        // Restore stock
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('razorpay_payment_id', refund.payment_id)
          .single();

        if (order) {
          const { data: items } = await supabase
            .from('order_items')
            .select('product_id, variant_id, quantity')
            .eq('order_id', order.id);

          for (const item of items ?? []) {
            if (item.variant_id) {
              await supabase.rpc('increment_variant_stock', {
                p_variant_id: item.variant_id,
                p_quantity: item.quantity,
              });
            } else {
              await supabase.rpc('increment_product_stock', {
                p_product_id: item.product_id,
                p_quantity: item.quantity,
              });
            }
          }
        }

        break;
      }

      default:
        console.log(`Unhandled Razorpay event: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

function mapRazorpayMethod(method: string): string {
  const methodMap: Record<string, string> = {
    upi: 'upi',
    card: 'card',
    netbanking: 'netbanking',
    wallet: 'wallet',
  };
  return methodMap[method] ?? 'card';
}
