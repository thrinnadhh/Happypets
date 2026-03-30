// apps/web/app/actions/orders.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUserOrders() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch orders');

  return data;
}

export async function getOrderDetails(orderId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), addresses(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (error || !data) throw new Error('Order not found');

  return data;
}

export async function cancelOrder(orderId: string, reason: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  const { data: order } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order || !['pending', 'processing'].includes(order.status)) {
    throw new Error('Order cannot be cancelled at this stage');
  }

  const { error } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', orderId);

  if (error) throw new Error('Failed to cancel order');

  revalidatePath('/orders');
  revalidatePath(`/orders/${orderId}`);
  return { success: true };
}
