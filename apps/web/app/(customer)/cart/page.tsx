"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  ChevronRight,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 499;

export default function CartPage(): JSX.Element {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{
    valid: boolean;
    discountAmount?: number;
    description?: string;
    message: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = totalPrice();
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
  const couponDiscount = couponResult?.valid ? (couponResult.discountAmount ?? 0) : 0;
  const grandTotal = subtotal + shippingFee - couponDiscount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }
    setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      setCouponResult(data);
      if (data.valid) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
    toast.info("Coupon removed");
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="container px-4 py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="w-16 h-16 text-primary/40" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground max-w-sm">
            Looks like you haven&apos;t added anything yet. Start browsing our premium pet nutrition!
          </p>
        </div>
        <Link href="/products">
          <Button size="lg" className="h-12 px-10 text-base gap-2 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Shopping Cart</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Shopping Cart
          <Badge variant="secondary" className="ml-3 text-base px-3">{items.length}</Badge>
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { clearCart(); toast.success("Cart cleared"); }}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Cart Items ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Shipping progress bar */}
          {subtotal < FREE_SHIPPING_THRESHOLD && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="w-4 h-4 text-amber-700" />
                <p className="text-sm font-medium text-amber-800">
                  Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString("en-IN")} more for <strong>free shipping</strong>!
                </p>
              </div>
              <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                />
              </div>
            </div>
          )}
          {subtotal >= FREE_SHIPPING_THRESHOLD && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-sm font-medium text-emerald-800">You qualify for <strong>free shipping</strong>!</p>
            </div>
          )}

          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 bg-card border border-border rounded-2xl hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <Link href={`/products/${item.productId}`} className="shrink-0">
                <div className="w-24 h-24 relative rounded-xl overflow-hidden bg-muted">
                  <Image
                    src={item.image || "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&q=70"}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 96px"
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <Link href={`/products/${item.productId}`} className="block">
                  <p className="font-heading font-semibold text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">
                    {item.name}
                  </p>
                </Link>
                <p className="text-lg font-bold text-primary">
                  ₹{item.price.toLocaleString("en-IN")}
                  <span className="text-sm font-normal text-muted-foreground ml-2">/ item</span>
                </p>

                {/* Qty + Remove row */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => { removeItem(item.id); toast.success("Item removed"); }}
                    className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Line total */}
              <div className="shrink-0 text-right">
                <p className="font-bold text-lg text-foreground">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}

          <Link href="/products" className="flex items-center gap-1 text-sm text-primary hover:underline w-fit mt-4">
            <ChevronRight className="w-4 h-4 rotate-180" />
            Continue Shopping
          </Link>
        </div>

        {/* ── Order Summary ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 space-y-5 shadow-sm">
            <h2 className="text-xl font-heading font-bold text-foreground">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                {shippingFee === 0 ? (
                  <span className="font-medium text-emerald-600">FREE</span>
                ) : (
                  <span className="font-medium">₹{shippingFee}</span>
                )}
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Coupon ({couponResult?.valid && couponCode.toUpperCase()})
                  </span>
                  <span className="font-medium">−₹{couponDiscount.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-foreground">Grand Total</span>
              <span className="text-2xl font-bold text-primary">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>

            <Separator />

            {/* Coupon Input */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <Tag className="w-4 h-4" />
                Have a coupon?
              </p>
              {couponResult?.valid ? (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-800">{couponCode.toUpperCase()}</p>
                    <p className="text-xs text-emerald-600">{couponResult.description}</p>
                  </div>
                  <button onClick={removeCoupon} className="cursor-pointer text-emerald-700 hover:text-red-600 transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter code (e.g. HAPPYPETS10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    className="h-10 text-sm uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode}
                    className="h-10 px-4 shrink-0"
                  >
                    {couponLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Apply"}
                  </Button>
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <Link href="/checkout" className="block">
              <Button size="lg" className="w-full h-12 text-base gap-2 rounded-xl font-semibold">
                Proceed to Checkout
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center">
              {["🔒 Secure", "✓ Authentic", "↩ Easy Returns"].map((item) => (
                <p key={item} className="text-[10px] text-muted-foreground font-medium">{item}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
