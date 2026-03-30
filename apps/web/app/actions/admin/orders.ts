// apps/web/app/actions/admin/orders.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getShopOrders() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' || !profile.shop_id) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*), delivery_addresses(*), user_profiles(full_name, email)')
    .eq('order_items.shop_id', profile.shop_id)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Failed to fetch orders');

  return data;
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const updateData: any = { status };
  if (trackingNumber) {
    updateData.tracking_number = trackingNumber;
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId);

  if (error) throw new Error('Failed to update order status');

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/orders');
  return { success: true };
}
