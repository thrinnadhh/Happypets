// apps/web/app/actions/admin/products.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { productSchema, productUpdateSchema } from '@happypets/shared/validations';
import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  // Verify admin role and shop ownership
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' || !profile.shop_id) {
    throw new Error('Unauthorized');
  }

  const rawData = Object.fromEntries(formData.entries());
  const validation = productSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.format() };
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      ...validation.data,
      shop_id: profile.shop_id,
      is_active: true
    })
    .select()
    .single();

  if (error) throw new Error('Failed to create product');

  revalidatePath('/admin/products');
  return { success: true, product: data };
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const rawData = Object.fromEntries(formData.entries());
  const validation = productUpdateSchema.safeParse(rawData);

  if (!validation.success) {
    return { error: validation.error.format() };
  }

  const { error } = await supabase
    .from('products')
    .update(validation.data)
    .eq('id', productId)
    .eq('shop_id', profile.shop_id!);

  if (error) throw new Error('Failed to update product');

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabase
    .from('products')
    .update({ is_active: false })
    .eq('id', productId)
    .eq('shop_id', profile.shop_id!);

  if (error) throw new Error('Failed to delete product');

  revalidatePath('/admin/products');
  return { success: true };
}
