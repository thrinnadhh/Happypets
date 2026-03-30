import { NextResponse } from "next/server";

const MOCK_COUPONS: Record<string, { discount: number; type: "percent" | "flat"; maxDiscount?: number; description: string }> = {
  HAPPYPETS10: { discount: 10, type: "percent", maxDiscount: 200, description: "10% off (up to ₹200)" },
  FIRSTORDER: { discount: 150, type: "flat", description: "₹150 off on first order" },
  PET20: { discount: 20, type: "percent", maxDiscount: 500, description: "20% off (up to ₹500)" },
  SAVE50: { discount: 50, type: "flat", description: "₹50 flat off" },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal } = body as { code: string; subtotal: number };

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, message: "Coupon code is required" }, { status: 400 });
    }

    const coupon = MOCK_COUPONS[code.trim().toUpperCase()];

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Invalid or expired coupon code" }, { status: 200 });
    }

    let discountAmount: number;
    if (coupon.type === "percent") {
      discountAmount = Math.round((subtotal * coupon.discount) / 100);
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discount;
    }

    return NextResponse.json({
      valid: true,
      code: code.toUpperCase(),
      discountAmount,
      description: coupon.description,
      message: `Coupon applied! You save ₹${discountAmount.toLocaleString("en-IN")}`,
    });
  } catch {
    return NextResponse.json({ valid: false, message: "Something went wrong" }, { status: 500 });
  }
}
