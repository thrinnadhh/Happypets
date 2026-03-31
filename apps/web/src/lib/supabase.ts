import { createClient, Session, SupabaseClient, User as SupabaseAuthUser } from "@supabase/supabase-js";
import {
  DEFAULT_PRODUCT_POSITION,
  getCategoryFromSlug,
  getDefaultDisplaySection,
  productCategories,
  sortTags,
} from "@/data/catalog";
import { AdminRecord, LoginPayload, Product, ProductCategory, SignupPayload, SignupResult, User } from "@/types";

function getEnvValue(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = import.meta.env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

const supabaseUrl = getEnvValue("VITE_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = getEnvValue("VITE_SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
const supabaseBucket =
  getEnvValue("VITE_SUPABASE_BUCKET", "NEXT_PUBLIC_SUPABASE_BUCKET") ?? "product-images";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

type SupabaseProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: User["role"] | null;
  approved: boolean | null;
  last_login_at?: string | null;
};

type SupabaseCategoryJoin = {
  name: string | null;
  slug: string | null;
} | null;

type SupabaseProductRow = {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  price_inr: number;
  discount?: number | null;
  stock_quantity: number;
  images: string[] | null;
  is_active: boolean;
  tags?: Product["tags"] | null;
  brand?: string | null;
  manufacture_date?: string | null;
  expiry_date?: string | null;
  sold_count?: number | null;
  revenue?: number | null;
  rating?: number | null;
  display_section?: Product["displaySection"] | null;
  position?: number | null;
  category?: SupabaseCategoryJoin | SupabaseCategoryJoin[];
};

type SupabaseAdminRequestRow = {
  user_id: string;
  status: "pending" | "approved" | "rejected" | "revoked";
};

const PRODUCT_SELECT = `
  id,
  shop_id,
  name,
  description,
  price_inr,
  discount,
  stock_quantity,
  images,
  is_active,
  tags,
  brand,
  manufacture_date,
  expiry_date,
  sold_count,
  revenue,
  rating,
  display_section,
  position,
  category:categories!products_category_id_fkey(name, slug)
`;

function requireSupabaseClient(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL and the matching anon key.",
    );
  }

  return supabase;
}

function deriveNameFromEmail(email: string): string {
  return email
    .split("@")[0]
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function mapProfileToUser(profile: SupabaseProfileRow): User {
  return {
    id: profile.id,
    name: profile.full_name?.trim() || deriveNameFromEmail(profile.email ?? "user@happypets.com"),
    email: profile.email ?? "unknown@happypets.com",
    role: profile.role ?? "customer",
    approved: profile.approved ?? profile.role !== "admin",
  };
}

function normalizeCategory(join: SupabaseCategoryJoin | SupabaseCategoryJoin[] | undefined): ProductCategory {
  const category = Array.isArray(join) ? join[0] : join;
  const byName = productCategories.find((item) => item === category?.name);
  if (byName) return byName;

  const bySlug = getCategoryFromSlug(category?.slug ?? undefined);
  if (bySlug) return bySlug;

  return "Dog";
}

function mapRowToProduct(row: SupabaseProductRow): Product {
  const category = normalizeCategory(row.category);
  const images = row.images?.length ? row.images : [];
  const primaryImage = images[0] ?? "";

  return {
    id: row.id,
    name: row.name,
    category,
    displaySection: row.display_section ?? getDefaultDisplaySection(category),
    position: row.position ?? DEFAULT_PRODUCT_POSITION,
    tags: sortTags(row.tags ?? []),
    brand: row.brand ?? "HappyPets",
    image: primaryImage,
    gallery: images.length ? images : primaryImage ? [primaryImage] : [],
    description: row.description ?? "",
    quantity: row.stock_quantity,
    price: Number(row.price_inr),
    discount: Number(row.discount ?? 0),
    manufactureDate: row.manufacture_date ?? "",
    expiryDate: row.expiry_date ?? "",
    soldCount: row.sold_count ?? 0,
    revenue: Number(row.revenue ?? 0),
    rating: Number(row.rating ?? 4.8),
  };
}

async function getCurrentAuthUser(): Promise<SupabaseAuthUser | null> {
  const client = requireSupabaseClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

async function getCurrentProfileRow(): Promise<SupabaseProfileRow | null> {
  const client = requireSupabaseClient();
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    return null;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, email, full_name, role, approved, last_login_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as SupabaseProfileRow | null;
}

async function getCurrentAdminShopId(profileId?: string): Promise<string> {
  const client = requireSupabaseClient();
  const resolvedProfileId = profileId ?? (await getCurrentProfileRow())?.id;

  if (!resolvedProfileId) {
    throw new Error("Unable to resolve the current admin profile.");
  }

  const { data, error } = await client
    .from("shops")
    .select("id")
    .eq("admin_id", resolvedProfileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw new Error("No shop is linked to this admin account yet.");
  }

  return data.id as string;
}

async function resolveCategoryId(category: ProductCategory): Promise<string> {
  const client = requireSupabaseClient();
  const { data, error } = await client
    .from("categories")
    .select("id")
    .or(`name.eq.${category},slug.eq.${category.toLowerCase()}`)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data?.id) {
    throw new Error(`Category '${category}' is not configured in Supabase.`);
  }

  return data.id as string;
}

function buildProductImages(product: Pick<Product, "image" | "gallery">): string[] {
  const images = [product.image, ...(product.gallery ?? [])].filter(Boolean);
  return [...new Set(images)];
}

function buildProductSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${base || "product"}-${Date.now().toString(36)}`;
}

async function fetchProductById(productId: string): Promise<Product> {
  const client = requireSupabaseClient();
  const { data, error } = await client.from("products").select(PRODUCT_SELECT).eq("id", productId).single();

  if (error) {
    throw error;
  }

  return mapRowToProduct(data as SupabaseProductRow);
}

export async function uploadImageToSupabase(
  file: File,
  onProgress?: (value: number) => void,
): Promise<string> {
  const client = requireSupabaseClient();

  let progress = 8;
  onProgress?.(progress);

  const interval = window.setInterval(() => {
    progress = Math.min(progress + 12, 90);
    onProgress?.(progress);
  }, 120);

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const { error } = await client.storage.from(supabaseBucket).upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  window.clearInterval(interval);

  if (error) {
    onProgress?.(0);
    throw error;
  }

  const { data } = client.storage.from(supabaseBucket).getPublicUrl(path);
  onProgress?.(100);
  return data.publicUrl;
}

export async function fetchCurrentUserFromSupabase(): Promise<User | null> {
  const profile = await getCurrentProfileRow();
  return profile ? mapProfileToUser(profile) : null;
}

export async function signInWithSupabase(
  payload: LoginPayload,
): Promise<{ user: User; session: Session }> {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error("Supabase did not return an active session.");
  }

  await client.from("profiles").update({ last_login_at: new Date().toISOString() }).eq("id", data.user.id);
  const user = await fetchCurrentUserFromSupabase();

  if (!user) {
    throw new Error("Your profile was not found. Apply the Supabase migrations before signing in.");
  }

  return {
    user,
    session: data.session,
  };
}

export async function signUpWithSupabase(payload: SignupPayload): Promise<SignupResult> {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.name,
        requested_role: payload.role,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.session) {
    return {
      user: null,
      requiresEmailVerification: true,
      message: "Account created. Verify your email, then sign in to continue.",
    };
  }

  const user = await fetchCurrentUserFromSupabase();

  return {
    user,
    requiresEmailVerification: false,
    message:
      payload.role === "admin"
        ? "Admin account created. It will remain pending until a superadmin approves it."
        : "Account created successfully.",
  };
}

export async function signOutFromSupabase(): Promise<void> {
  const client = requireSupabaseClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function fetchProductsFromSupabase(): Promise<Product[]> {
  const client = requireSupabaseClient();
  const profile = await getCurrentProfileRow();
  let query = client.from("products").select(PRODUCT_SELECT).order("position").order("name");

  if (!profile || profile.role === "customer") {
    query = query.eq("is_active", true);
  } else if (profile.role === "admin") {
    const shopId = await getCurrentAdminShopId(profile.id);
    query = query.eq("shop_id", shopId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapRowToProduct(row as SupabaseProductRow));
}

export async function createProductInSupabase(
  product: Omit<Product, "id" | "soldCount" | "revenue">,
): Promise<Product> {
  const client = requireSupabaseClient();
  const profile = await getCurrentProfileRow();

  if (!profile || profile.role !== "admin" || !profile.approved) {
    throw new Error("Only approved admins can create products.");
  }

  const [categoryId, shopId] = await Promise.all([
    resolveCategoryId(product.category),
    getCurrentAdminShopId(profile.id),
  ]);

  const { data, error } = await client
    .from("products")
    .insert({
      shop_id: shopId,
      category_id: categoryId,
      name: product.name,
      slug: buildProductSlug(product.name),
      description: product.description,
      price_inr: product.price,
      compare_at_price: null,
      stock_quantity: product.quantity,
      images: buildProductImages(product),
      tags: sortTags(product.tags ?? []),
      brand: product.brand,
      discount: product.discount ?? 0,
      manufacture_date: product.manufactureDate,
      expiry_date: product.expiryDate,
      sold_count: 0,
      revenue: 0,
      rating: product.rating,
      display_section: product.displaySection,
      position: product.position,
      is_active: true,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return fetchProductById(data.id as string);
}

export async function updateProductInSupabase(
  productId: string,
  product: Omit<Product, "id" | "soldCount" | "revenue">,
): Promise<Product> {
  const client = requireSupabaseClient();
  const profile = await getCurrentProfileRow();

  if (!profile || profile.role !== "admin" || !profile.approved) {
    throw new Error("Only approved admins can update products.");
  }

  const categoryId = await resolveCategoryId(product.category);

  const { error } = await client
    .from("products")
    .update({
      category_id: categoryId,
      name: product.name,
      description: product.description,
      price_inr: product.price,
      stock_quantity: product.quantity,
      images: buildProductImages(product),
      tags: sortTags(product.tags ?? []),
      brand: product.brand,
      discount: product.discount ?? 0,
      manufacture_date: product.manufactureDate,
      expiry_date: product.expiryDate,
      rating: product.rating,
      display_section: product.displaySection,
      position: product.position,
    })
    .eq("id", productId);

  if (error) {
    throw error;
  }

  return fetchProductById(productId);
}

export async function deleteProductFromSupabase(productId: string): Promise<void> {
  const client = requireSupabaseClient();
  const { error } = await client.from("products").update({ is_active: false }).eq("id", productId);

  if (error) {
    throw error;
  }
}

export async function fetchFavoriteIdsFromSupabase(): Promise<string[]> {
  const client = requireSupabaseClient();
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    return [];
  }

  const { data, error } = await client
    .from("favorites")
    .select("product_id")
    .eq("user_id", authUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => row.product_id as string);
}

export async function addFavoriteInSupabase(productId: string): Promise<string[]> {
  const client = requireSupabaseClient();
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    throw new Error("Sign in to manage favorites.");
  }

  const { error } = await client.from("favorites").insert({
    user_id: authUser.id,
    product_id: productId,
  });

  if (error && error.code !== "23505") {
    throw error;
  }

  return fetchFavoriteIdsFromSupabase();
}

export async function removeFavoriteInSupabase(productId: string): Promise<string[]> {
  const client = requireSupabaseClient();
  const authUser = await getCurrentAuthUser();

  if (!authUser) {
    throw new Error("Sign in to manage favorites.");
  }

  const { error } = await client
    .from("favorites")
    .delete()
    .eq("user_id", authUser.id)
    .eq("product_id", productId);

  if (error) {
    throw error;
  }

  return fetchFavoriteIdsFromSupabase();
}

export async function fetchAdminsFromSupabase(): Promise<AdminRecord[]> {
  const client = requireSupabaseClient();
  const { data: profiles, error: profileError } = await client
    .from("profiles")
    .select("id, full_name, email, approved, last_login_at")
    .eq("role", "admin")
    .order("updated_at", { ascending: false });

  if (profileError) {
    throw profileError;
  }

  const adminIds = (profiles ?? []).map((profile) => profile.id as string);
  let requests: SupabaseAdminRequestRow[] = [];

  if (adminIds.length) {
    const { data, error } = await client
      .from("admin_requests")
      .select("user_id, status")
      .in("user_id", adminIds);

    if (error) {
      throw error;
    }

    requests = (data ?? []) as SupabaseAdminRequestRow[];
  }

  const requestsByUser = new Map(requests.map((request) => [request.user_id, request.status]));

  return (profiles ?? []).map((profile) => {
    const requestStatus = requestsByUser.get(profile.id as string);
    const status =
      requestStatus === "pending"
        ? "Pending"
        : requestStatus === "rejected"
          ? "Rejected"
          : requestStatus === "revoked"
            ? "Revoked"
            : profile.approved
              ? "Approved"
              : "Pending";

    return {
      id: profile.id as string,
      name: (profile.full_name as string | null) ?? deriveNameFromEmail((profile.email as string) ?? "admin"),
      email: (profile.email as string) ?? "unknown@happypets.com",
      status,
      leaveDays: 0,
      lastLogin: profile.last_login_at ? String(profile.last_login_at).slice(0, 10) : "Never",
    };
  });
}

async function updateAdminState(
  adminId: string,
  status: "approved" | "rejected" | "revoked",
): Promise<void> {
  const client = requireSupabaseClient();
  const approved = status === "approved";

  const { error: profileError } = await client
    .from("profiles")
    .update({ approved })
    .eq("id", adminId)
    .eq("role", "admin");

  if (profileError) {
    throw profileError;
  }

  const { error: requestError } = await client.from("admin_requests").upsert(
    {
      user_id: adminId,
      status,
      reviewed_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (requestError) {
    throw requestError;
  }

  const nextShopStatus = status === "approved" ? "active" : status === "revoked" ? "suspended" : "pending";
  const { error: shopError } = await client
    .from("shops")
    .update({ status: nextShopStatus })
    .eq("admin_id", adminId);

  if (shopError) {
    throw shopError;
  }

  if (status === "revoked") {
    const { data: shops, error: shopSelectError } = await client
      .from("shops")
      .select("id")
      .eq("admin_id", adminId);

    if (shopSelectError) {
      throw shopSelectError;
    }

    const shopIds = (shops ?? []).map((shop) => shop.id as string);
    if (shopIds.length) {
      const { error: productError } = await client
        .from("products")
        .update({ is_active: false })
        .in("shop_id", shopIds);

      if (productError) {
        throw productError;
      }
    }
  }
}

export async function approveAdminInSupabase(adminId: string): Promise<void> {
  await updateAdminState(adminId, "approved");
}

export async function rejectAdminInSupabase(adminId: string): Promise<void> {
  await updateAdminState(adminId, "rejected");
}

export async function revokeAdminInSupabase(adminId: string): Promise<void> {
  await updateAdminState(adminId, "revoked");
}
