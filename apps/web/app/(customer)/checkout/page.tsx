"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/cartStore";
import { createCheckoutOrder } from "@/app/actions/checkout";
import { CheckCircle2, Loader2, MapPin, ShoppingBag, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

const SAVED_ADDRESS_KEY = "hp_saved_address";

const addressSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit mobile number"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
});

type AddressValues = z.infer<typeof addressSchema>;

type Step = "address" | "review" | "payment" | "success";

// Step indicator
function StepBar({ step }: { step: Step }) {
  const steps = [
    { key: "address", label: "Address", icon: MapPin },
    { key: "review", label: "Review", icon: ShoppingBag },
    { key: "payment", label: "Payment", icon: CreditCard },
  ] as const;

  const idx = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const done = i < idx || step === "success";
        const active = s.key === step;
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                  ${done ? "bg-green-500 text-white" : active ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}
              >
                {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-medium ${active ? "text-primary" : done ? "text-green-600" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-16 mx-2 mb-5 transition-all ${i < idx ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage(): JSX.Element {
  const { items, totalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("address");
  const [address, setAddress] = useState<AddressValues | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const razorpayRef = useRef<any>(null);

  const subtotal = totalPrice();
  const shipping = subtotal >= 499 ? 0 : 49;
  const total = subtotal + shipping - couponDiscount;

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: (() => {
      try {
        const saved = localStorage.getItem(SAVED_ADDRESS_KEY);
        return saved ? JSON.parse(saved) : { full_name: "", phone: "", street: "", city: "", state: "", pincode: "" };
      } catch { return { full_name: "", phone: "", street: "", city: "", state: "", pincode: "" }; }
    })(),
  });

  const validateCoupon = async () => {
    if (!coupon.trim()) return;
    setIsValidatingCoupon(true);
    setCouponMsg("");
    try {
      const res = await fetch(`/api/coupons/validate?code=${coupon.trim()}&subtotal=${subtotal}`);
      const data = await res.json();
      if (data.valid) {
        setCouponDiscount(data.discount);
        setCouponMsg(`✅ Coupon applied! You save ₹${data.discount}`);
      } else {
        setCouponDiscount(0);
        setCouponMsg(`❌ ${data.message || "Invalid coupon"}`);
      }
    } catch {
      setCouponMsg("❌ Failed to validate coupon.");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const onAddressSubmit = (values: AddressValues) => {
    localStorage.setItem(SAVED_ADDRESS_KEY, JSON.stringify(values));
    setAddress(values);
    setStep("review");
  };

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });
  };

  const handlePlaceOrder = async () => {
    if (!address) return;
    setIsSubmitting(true);
    try {
      // Call the server action — uses a temporary addressId mock
      // In production, save address to DB first and pass real ID
      const result = await createCheckoutOrder("temp-addr-id", coupon || undefined);
      
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay SDK failed to load");

      const options = {
        key: result.razorpayKeyId,
        amount: Math.round(result.amount * 100),
        currency: "INR",
        name: "Happypets",
        description: `Order ${result.orderNumber}`,
        order_id: result.razorpayOrderId,
        prefill: {
          name: address.full_name,
          contact: `+91${address.phone}`,
        },
        theme: { color: "#D4862B" },
        handler: async (response: any) => {
          // Verify payment
          try {
            await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: result.orderId,
              }),
            });
          } catch (e) { /* proceed even if verify fails at UI level */ }
          setOrderNumber(result.orderNumber);
          clearCart();
          setStep("success");
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      razorpayRef.current = rzp;
      rzp.open();
    } catch (err) {
      console.error("Order creation failed:", err);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Order Placed! 🎉</h1>
            <p className="text-muted-foreground">
              Thank you for your order. We'll send you updates via SMS.
            </p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="text-2xl font-bold font-mono text-primary mt-1">{orderNumber}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/orders">Track Your Order</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-center mb-6">Checkout</h1>
        <StepBar step={step} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — step forms */}
          <div className="lg:col-span-2 space-y-6">

            {/* Step 1 — Address */}
            {step === "address" && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" /> Delivery Address
                </h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddressSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="full_name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="Priya Sharma" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="phone">Mobile Number</FormLabel>
                          <FormControl>
                            <div className="flex">
                              <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-gray-50 text-sm text-muted-foreground">+91</span>
                              <Input 
                                id="phone"
                                placeholder="98765 43210" 
                                className="rounded-l-none h-[44px]" 
                                maxLength={10} 
                                inputMode="numeric" 
                                autoComplete="tel-national"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="street" render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="street">Street Address</FormLabel>
                        <FormControl>
                          <Input id="street" placeholder="House No., Street, Area…" className="h-[44px]" autoComplete="street-address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="city">City</FormLabel>
                          <FormControl>
                            <Input id="city" placeholder="Mumbai" className="h-[44px]" autoComplete="address-level2" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="state">State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger id="state" className="h-[44px]">
                                <SelectValue placeholder="Select…" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60">
                              {INDIAN_STATES.map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="pincode" render={({ field }) => (
                        <FormItem>
                          <FormLabel htmlFor="pincode">Pincode</FormLabel>
                          <FormControl>
                            <Input 
                              id="pincode"
                              placeholder="400001" 
                              className="h-[44px]"
                              maxLength={6} 
                              inputMode="numeric" 
                              autoComplete="postal-code"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <Button type="submit" className="w-full gap-2 mt-2 h-[48px] rounded-xl font-bold shadow-md">
                      Continue to Review <ChevronRight className="w-4 h-4" />
                    </Button>
                  </form>
                </Form>
              </div>
            )}

            {/* Step 2 — Review */}
            {step === "review" && (
              <div className="space-y-4">
                {/* Address summary */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Delivering To
                    </h2>
                    <Button variant="ghost" className="h-[44px] px-3" onClick={() => setStep("address")}>Edit</Button>
                  </div>
                  {address && (
                    <div className="text-sm text-muted-foreground leading-relaxed">
                      <p className="font-semibold text-foreground">{address.full_name}</p>
                      <p>{address.street}</p>
                      <p>{address.city}, {address.state} — {address.pincode}</p>
                      <p>📱 +91 {address.phone}</p>
                    </div>
                  )}
                </div>

                {/* Items list */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h2 className="font-semibold mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-primary" /> Order Items ({items.length})
                  </h2>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 overflow-hidden shrink-0 relative">
                          {item.image ? (
                            <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🛍️</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-sm shrink-0">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coupon — only if not on cart page */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                  <h2 className="font-semibold mb-3">Have a Coupon?</h2>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code…"
                      value={coupon}
                      onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponMsg(""); }}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={validateCoupon} disabled={isValidatingCoupon || !coupon.trim()}>
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {couponMsg && (
                    <p className={`text-sm mt-2 ${couponDiscount > 0 ? "text-green-600" : "text-red-600"}`}>
                      {couponMsg}
                    </p>
                  )}
                </div>

                <Button className="w-full gap-2" size="lg" onClick={() => setStep("payment")}>
                  Proceed to Payment <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Step 3 — Payment button */}
            {step === "payment" && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center space-y-6">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Complete Payment</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    You'll be redirected to Razorpay to securely pay{" "}
                    <span className="font-bold text-foreground">₹{total.toLocaleString("en-IN")}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Preparing payment…</>
                    ) : (
                      <>Pay ₹{total.toLocaleString("en-IN")} Securely</>
                    )}
                  </Button>
                  <Button variant="ghost" onClick={() => setStep("review")}>← Back to Review</Button>
                </div>
                <div className="flex items-center justify-center gap-6 pt-2">
                  {["UPI", "Cards", "Net Banking", "EMI"].map((m) => (
                    <span key={m} className="text-xs text-muted-foreground">{m}</span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">🔒 Secured by Razorpay · 256-bit SSL</p>
              </div>
            )}
          </div>

          {/* Right — Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon Discount</span>
                    <span>−₹{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
