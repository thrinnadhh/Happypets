// apps/web/app/actions/checkout.ts
'use server';

import Razorpay from 'razorpay';
import { createServerClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function createCheckoutOrder(addressId: string, couponCode?: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  // Fetch cart items with product details
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, products(*), product_variants(*)')
    .eq('user_id', user.id);

  if (!cartItems?.length) throw new Error('Cart is empty');

  // Verify all products are still available
  for (const item of cartItems) {
    if (!item.products.is_active || item.quantity > item.products.stock_quantity) {
      throw new Error(`${item.products.name} is no longer available in requested quantity`);
    }
  }

  // Calculate totals with GST
  let subtotal = 0;
  let totalGst = 0;
  for (const item of cartItems) {
    const unitPrice = item.variant_id ? item.product_variants.price_inr : item.products.price_inr;
    const lineTotal = unitPrice * item.quantity;
    const gstRate = item.products.gst_rate / 100;
    const basePrice = lineTotal / (1 + gstRate); // Price is inclusive of GST
    const gstAmount = lineTotal - basePrice;
    subtotal += lineTotal;
    totalGst += gstAmount;
  }

  // Apply coupon if provided
  let discount = 0;
  if (couponCode) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .single();

    if (coupon && subtotal >= coupon.min_order_inr && coupon.used_count < (coupon.usage_limit ?? Infinity)) {
      discount = coupon.discount_type === 'percentage'
        ? Math.min(subtotal * coupon.discount_value / 100, coupon.max_discount_inr ?? Infinity)
        : coupon.discount_value;
    }
  }

  const shipping = subtotal >= 499 ? 0 : 49; // Free shipping over ₹499
  const total = subtotal - discount + shipping;

  // Create Razorpay order
  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // Razorpay expects paise
    currency: 'INR',
    receipt: `THP-${Date.now()}-${nanoid(4)}`,
  });

  // Create order record in DB
  const orderNumber = `THP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${nanoid(4).toUpperCase()}`;

  const { data: order } = await supabase.from('orders').insert({
    order_number: orderNumber,
    user_id: user.id,
    address_id: addressId,
    subtotal_inr: subtotal,
    gst_amount: totalGst,
    shipping_inr: shipping,
    discount_inr: discount,
    total_inr: total,
    payment_method: 'upi', // Default, updated on client
    razorpay_order_id: rzpOrder.id,
  }).select().single();

  // Create order items (product snapshots)
  const orderItems = cartItems.map(item => ({
    order_id: order!.id,
    product_id: item.product_id,
    shop_id: item.products.shop_id,
    variant_id: item.variant_id,
    product_name: item.products.name,
    variant_name: item.product_variants?.name ?? null,
    quantity: item.quantity,
    unit_price_inr: item.variant_id ? item.product_variants.price_inr : item.products.price_inr,
    gst_rate: item.products.gst_rate,
    total_inr: (item.variant_id ? item.product_variants.price_inr : item.products.price_inr) * item.quantity,
  }));

  await supabase.from('order_items').insert(orderItems);

  return {
    orderId: order!.id,
    orderNumber,
    razorpayOrderId: rzpOrder.id,
    razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    amount: total,
  };
}
