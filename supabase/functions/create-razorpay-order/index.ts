import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  assertAllowedOrigin,
  assertPostRequest,
  getCorsHeaders,
  HttpError,
  logInternalError,
} from "../_shared/cors.ts";
import { enforceRateLimit } from "../_shared/rate-limit.ts";

type CartRow = {
  id: string;
  quantity: number;
  selected?: boolean | null;
  product: {
    price_inr: number;
    discount: number | null;
  } | {
    price_inr: number;
    discount: number | null;
  }[] | null;
};

type CouponRow = {
  code: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_order_inr: number | null;
  max_discount_inr: number | null;
};

function calculateDiscountedPrice(price: number, discount?: number | null): number {
  if (!discount) return price;
  return Math.max(price - (price * discount) / 100, 0);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function withCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(getCorsHeaders(request)).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isHttpError(issue: unknown): issue is HttpError {
  return issue instanceof HttpError;
}

function sanitizeCouponCode(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  if (!/^[A-Z0-9_-]{3,32}$/.test(normalized)) {
    throw new HttpError(400, "Coupon code format is invalid.");
  }

  return normalized;
}

async function getCurrentUser(request: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: request.headers.get("Authorization") ?? "",
      },
    },
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new HttpError(401, "Unauthorized");
  }

  return data.user;
}

async function fetchSelectedCart(adminClient: ReturnType<typeof createClient>, userId: string): Promise<CartRow[]> {
  const attempt = async (selectClause: string): Promise<CartRow[]> => {
    const { data, error } = await adminClient
      .from("cart_items")
      .select(selectClause)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    return (data ?? []) as CartRow[];
  };

  try {
    const rows = await attempt(
      "id, quantity, selected, product:products!cart_items_product_id_fkey(price_inr, discount)",
    );
    return rows.filter((row) => row.selected ?? true);
  } catch (issue) {
    const message = issue instanceof Error ? issue.message.toLowerCase() : "";
    if (!message.includes("selected")) {
      throw issue;
    }

    return attempt("id, quantity, product:products!cart_items_product_id_fkey(price_inr, discount)");
  }
}

async function resolveCoupon(
  adminClient: ReturnType<typeof createClient>,
  couponCode: string | null,
  subtotal: number,
): Promise<{ code: string; discountAmount: number } | null> {
  if (!couponCode) {
    return null;
  }

  const now = new Date().toISOString();
  const { data, error } = await adminClient
    .from("coupons")
    .select("code, discount_type, discount_value, min_order_inr, max_discount_inr")
    .eq("code", couponCode)
    .eq("is_active", true)
    .lte("valid_from", now)
    .gte("valid_until", now)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const coupon = data as CouponRow;
  if (subtotal < Number(coupon.min_order_inr ?? 0)) {
    throw new HttpError(400, "Coupon minimum order value not met.");
  }

  let discountAmount =
    coupon.discount_type === "percentage"
      ? (subtotal * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);

  if (coupon.max_discount_inr) {
    discountAmount = Math.min(discountAmount, Number(coupon.max_discount_inr));
  }

  return {
    code: coupon.code,
    discountAmount: Math.min(discountAmount, subtotal),
  };
}

serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(request) });
  }

  try {
    assertAllowedOrigin(request);
    assertPostRequest(request);

    const user = await getCurrentUser(request);
    const body = await request.json().catch(() => ({}));
    if (body && typeof body !== "object") {
      throw new HttpError(400, "Invalid request body.");
    }

    const couponCode = sanitizeCouponCode((body as { couponCode?: unknown }).couponCode ?? null);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const razorpayKeyId =
      Deno.env.get("NEXT_PUBLIC_RAZORPAY_KEY_ID") ?? Deno.env.get("RAZORPAY_KEY_ID") ?? "";
    const razorpaySecret = Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

    if (!razorpayKeyId || !razorpaySecret) {
      throw new HttpError(500, "Payment service is temporarily unavailable.", { expose: false });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    await enforceRateLimit(adminClient, {
      scopeKey: `payment:create-order:${user.id}`,
      action: "create_razorpay_order",
      maxRequests: 12,
      windowSeconds: 300,
    });
    const cartRows = await fetchSelectedCart(adminClient, user.id);

    if (!cartRows.length) {
      throw new HttpError(400, "No selected cart items found for checkout.");
    }

    const subtotal = cartRows.reduce((sum, row) => {
      const product = Array.isArray(row.product) ? row.product[0] : row.product;
      return sum + calculateDiscountedPrice(Number(product?.price_inr ?? 0), product?.discount) * row.quantity;
    }, 0);

    const coupon = await resolveCoupon(adminClient, couponCode ?? null, subtotal);
    const total = Math.max(subtotal - (coupon?.discountAmount ?? 0), 0);
    const amountPaise = Math.round(total * 100);

    const auth = btoa(`${razorpayKeyId}:${razorpaySecret}`);
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `hpt-${Date.now()}`,
        notes: {
          user_id: user.id,
          coupon_code: coupon?.code ?? "",
        },
      }),
    });

    if (!razorpayResponse.ok) {
      throw new HttpError(502, "Unable to start the payment session.", { expose: false });
    }

    const razorpayOrder = await razorpayResponse.json();

    return withCors(request, jsonResponse({
      razorpayOrderId: razorpayOrder.id,
      amountPaise: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: razorpayKeyId,
    }));
  } catch (issue) {
    logInternalError("create-razorpay-order", issue);
    const status = isHttpError(issue) ? issue.status : 500;
    const message = isHttpError(issue) && issue.expose
      ? issue.message
      : "Unable to create the payment session right now.";
    return withCors(request, jsonResponse({ error: message }, status));
  }
});
