// apps/web/app/actions/products.ts
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { ProductCategory } from '@happypets/shared/types';
import { revalidatePath } from 'next/cache';

export async function getProducts(options: {
  category?: ProductCategory;
  query?: string;
  limit?: number;
  offset?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
}) {
  const supabase = createServerClient();
  const { category, query, limit = 12, offset = 0, minPrice, maxPrice, sortBy } = options;

  let dbQuery = supabase
    .from('products')
    .select('*, shops!inner(name, status), categories!inner(slug)', { count: 'exact' })
    .eq('is_active', true)
    .eq('shops.status', 'active');

  if (category) {
    dbQuery = dbQuery.eq('categories.slug', category);
  }

  if (query) {
    dbQuery = dbQuery.ilike('name', `%${query}%`);
  }

  if (minPrice !== undefined) {
    dbQuery = dbQuery.gte('price_inr', minPrice);
  }

  if (maxPrice !== undefined) {
    dbQuery = dbQuery.lte('price_inr', maxPrice);
  }

  // Sorting
  switch (sortBy) {
    case 'price_asc':
      dbQuery = dbQuery.order('price_inr', { ascending: true });
      break;
    case 'price_desc':
      dbQuery = dbQuery.order('price_inr', { ascending: false });
      break;
    case 'rating':
      // rating column does not exist on products; fallback to created_at
      dbQuery = dbQuery.order('created_at', { ascending: false });
      break;
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false });
  }

  const { data, count, error } = await dbQuery.range(offset, offset + limit - 1);

  if (error) throw new Error('Failed to fetch products');

  return { products: data, total: count || 0 };
}

export async function getProductBySlug(slug: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select('*, shops!inner(*), product_variants(*), reviews(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  return data;
}

export async function toggleWishlist(productId: string) {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Login required');

  const { data: existing } = await supabase
    .from('wishlist_items')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existing) {
    await supabase.from('wishlist_items').delete().eq('id', existing.id);
  } else {
    await supabase.from('wishlist_items').insert({ user_id: user.id, product_id: productId });
  }

  revalidatePath('/wishlist');
  revalidatePath(`/product/${productId}`);
  return { success: true, added: !existing };
}
