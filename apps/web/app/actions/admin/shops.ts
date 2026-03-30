// apps/web/app/actions/admin/shops.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { redis } from '@/lib/redis';
import { revalidatePath } from 'next/cache';

export async function suspendShop(shopId: string, reason: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Verify superadmin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
  if (profile?.role !== 'superadmin') throw new Error('Unauthorized');

  // Suspend shop
  const { error: shopError } = await supabase.from('shops').update({
    status: 'suspended',
    suspension_reason: reason,
    suspended_at: new Date().toISOString(),
  }).eq('id', shopId);

  if (shopError) throw new Error('Failed to suspend shop');

  // Deactivate admin's profile to trigger middleware session kill
  const { data: shop } = await supabase.from('shops').select('admin_id').eq('id', shopId).single();
  await supabase.from('profiles').update({ is_active: false }).eq('id', shop!.admin_id);

  // Invalidate all cached products from this shop
  const keys = await redis.keys(`shop:${shopId}:*`);
  if (keys.length) await redis.del(...keys);
  await redis.del('homepage:featured'); // Refresh homepage

  revalidatePath('/superadmin/shops');
  return { success: true };
}
