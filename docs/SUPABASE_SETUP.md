# Supabase Setup

## Environment

The Vite app now supports both of these variable styles:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Because `apps/web` is nested, Vite is configured to read `.env.local` from the repo root.

## Run the repo-side migrations

Apply these Supabase SQL files in order:

1. `supabase/migrations/001_core_tables.sql`
2. `supabase/migrations/002_orders_cart.sql`
3. `supabase/migrations/003_engagement.sql`
4. `supabase/migrations/004_stock_rpcs.sql`
5. `supabase/migrations/005_product_placement.sql`
6. `supabase/migrations/006_supabase_auth_roles_alignment.sql`
7. `supabase/migrations/007_supabase_rls_policies.sql`

## Promote the first superadmin

1. Sign up through the app as a normal customer account.
2. In Supabase SQL editor, run:

```sql
update public.profiles
set role = 'superadmin',
    approved = true
where email = 'your-email@example.com';
```

3. Sign out and sign back in.
4. You should then land on `/superadmin/dashboard`.
