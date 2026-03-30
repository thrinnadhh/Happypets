"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { registerAction } from "@/app/actions/auth";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

/* ── Schemas ─────────────────────────────── */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const customerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().regex(passwordRegex, "Must be 8+ chars with uppercase, number & special char"),
});

const adminSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().regex(passwordRegex, "Must be 8+ chars with uppercase, number & special char"),
  shop_tag: z.string().min(1, "Select a shop"),
});

type CustomerForm = z.infer<typeof customerSchema>;
type AdminForm = z.infer<typeof adminSchema>;

/* ── Shop list ───────────────────────────── */
const AVAILABLE_SHOPS = [
  { id: "pawfeast", label: "PawFeast" },
  { id: "petmart", label: "PetMart" },
  { id: "nutrivet", label: "NutriVet" },
  { id: "furfit", label: "FurFit" },
  { id: "birdnest", label: "BirdNest" },
  { id: "zoozone", label: "ZooZone" },
];

/* ── Password strength ───────────────────── */
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "bg-gray-200" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[@$!%*?&]/.test(pw)) score++;
  const map = [
    { score: 1, label: "Weak", color: "bg-red-500" },
    { score: 2, label: "Fair", color: "bg-amber-500" },
    { score: 3, label: "Good", color: "bg-yellow-500" },
    { score: 4, label: "Strong", color: "bg-green-500" },
  ];
  return map[score - 1] || { score: 0, label: "", color: "bg-gray-200" };
}

function PasswordStrengthBar({ password }: { password: string }) {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : "bg-gray-200"}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score >= 4 ? "text-green-600" : score >= 3 ? "text-yellow-600" : "text-red-500"}`}>
        {label}
      </p>
    </div>
  );
}

/* ── Success state ───────────────────────── */
function SuccessState({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h3 className="text-xl font-bold">
          {isAdmin ? "Application Submitted!" : "Almost there!"}
        </h3>
        <p className="text-muted-foreground text-sm mt-2 leading-relaxed max-w-xs mx-auto">
          {isAdmin
            ? "We'll review your application within 24 hours. You'll receive an email when approved."
            : "Check your email to verify your account and start shopping! 🐾"}
        </p>
      </div>
      <Link href="/login">
        <Button className="gap-2">Go to Sign In</Button>
      </Link>
    </div>
  );
}

/* ── Brand panel ─────────────────────────── */
function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col w-[460px] shrink-0 bg-gradient-to-br from-[#2C4A2E] via-[#3a5f3c] to-[#D4862B] p-12 justify-between relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl shadow-lg">🐾</div>
          <div>
            <h1 className="text-white text-xl font-bold leading-tight">Happypets</h1>
            <p className="text-green-200 text-xs">Premium Pet Nutrition</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-white leading-tight mb-3">
          Join 4,000+<br />happy pet parents 🎉
        </h2>
        <p className="text-green-100/80 text-sm leading-relaxed">
          Access vet-approved nutrition, exclusive deals, and fast delivery across India.
        </p>
      </div>

      {/* Trust features */}
      <div className="relative z-10 space-y-3">
        {[
          { emoji: "✅", text: "100% Authentic Products" },
          { emoji: "🚚", text: "Fast Delivery Pan-India" },
          { emoji: "🔄", text: "Easy 7-Day Returns" },
          { emoji: "👨‍⚕️", text: "Vet-Approved Brands" },
          { emoji: "🔒", text: "Secure Razorpay Checkout" },
        ].map((f) => (
          <div key={f.text} className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
            <span>{f.emoji}</span>
            <span className="text-white text-sm font-medium">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────── */
export default function RegisterPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<"customer" | "admin">("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [btnSuccess, setBtnSuccess] = useState(false);
  const [success, setSuccess] = useState(false);

  const customerForm = useForm<CustomerForm>({
    resolver: zodResolver(customerSchema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  const adminForm = useForm<AdminForm>({
    resolver: zodResolver(adminSchema),
    defaultValues: { full_name: "", email: "", password: "", shop_tag: "" },
  });

  const password =
    activeTab === "customer"
      ? customerForm.watch("password")
      : adminForm.watch("password");

  async function onCustomerSubmit(values: CustomerForm) {
    setLoading(true);
    setError(null);
    try {
      const result = await registerAction({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        confirm_password: values.password,
        phone: "", // optional on register
        agree_terms: true,
      });
      if (result.success) {
        setBtnSuccess(true);
        setTimeout(() => setSuccess(true), 800);
      }
      else setError(result.error || "Registration failed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onAdminSubmit(values: AdminForm) {
    setLoading(true);
    setError(null);
    try {
      // Admin registration — passes shop_tag in user metadata
      const result = await registerAction({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        confirm_password: values.password,
        phone: "",
        agree_terms: true,
        // shop_tag passed via metadata
      } as any);
      if (result.success) {
        setBtnSuccess(true);
        setTimeout(() => setSuccess(true), 800);
      }
      else setError(result.error || "Registration failed");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const PasswordField = ({ control, name }: { control: any; name: string }) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min 8 chars, uppercase & special"
                className="pr-10"
                {...field}
              />
            </FormControl>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword((s) => !s)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={password} />
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FDF6EC]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold">Happypets</span>
          </div>

          {success ? (
            <SuccessState isAdmin={activeTab === "admin"} />
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-1">Create an account</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Already have one?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>

              {error && (
                <div className="flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-5">
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "customer" | "admin")}>
                <TabsList className="w-full bg-white border mb-6">
                  <TabsTrigger value="customer" className="flex-1 gap-2">
                    🐾 I&apos;m a Customer
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex-1 gap-2">
                    🏪 I&apos;m a Shop Admin
                  </TabsTrigger>
                </TabsList>

                {/* Customer form */}
                <TabsContent value="customer">
                  <Form {...customerForm}>
                    <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                      <FormField control={customerForm.control} name="full_name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="e.g. Priya sharma" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={customerForm.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <PasswordField control={customerForm.control} name="password" />
                      <Button 
                        type="submit" 
                        className={`w-full gap-2 mt-2 transition-all duration-300 ${btnSuccess ? "bg-green-600 hover:bg-green-700" : ""}`} 
                        disabled={loading || btnSuccess}
                      >
                        {btnSuccess ? (
                          <><CheckCircle2 className="w-4 h-4 animate-in zoom-in duration-300" /> Success!</>
                        ) : loading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Admin form */}
                <TabsContent value="admin">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-800">
                    📋 Admin accounts require approval. You'll be notified within 24 hours of applying.
                  </div>
                  <Form {...adminForm}>
                    <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-4">
                      <FormField control={adminForm.control} name="full_name" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="Your full name" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={adminForm.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input type="email" placeholder="you@yourshop.in" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={adminForm.control} name="shop_tag" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Shop</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger><SelectValue placeholder="Select your shop…" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {AVAILABLE_SHOPS.map((s) => (
                                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <PasswordField control={adminForm.control} name="password" />
                      <Button 
                        type="submit" 
                        className={`w-full gap-2 mt-2 transition-all duration-300 ${btnSuccess ? "bg-green-600 hover:bg-green-700" : ""}`} 
                        disabled={loading || btnSuccess}
                      >
                        {btnSuccess ? (
                          <><CheckCircle2 className="w-4 h-4 animate-in zoom-in duration-300" /> Success!</>
                        ) : loading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
