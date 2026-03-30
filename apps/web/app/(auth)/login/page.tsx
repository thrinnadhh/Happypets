"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/app/actions/auth";
import { Eye, EyeOff, AlertCircle, Clock, ShieldX, Loader2, CheckCircle2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { label: "Customer", email: "customer@demo.in", password: "Demo@123" },
  { label: "Admin", email: "admin@demo.in", password: "Demo@123" },
  { label: "SuperAdmin", email: "superadmin@demo.in", password: "Demo@123" },
];

const STATUS_MESSAGES: Record<string, { icon: typeof AlertCircle; color: string; message: string }> = {
  pending_approval: {
    icon: Clock,
    color: "bg-amber-50 border-amber-200 text-amber-800",
    message: "Your admin account is pending approval. We'll notify you via email within 24 hours.",
  },
  rejected: {
    icon: ShieldX,
    color: "bg-red-50 border-red-200 text-red-800",
    message: "Your admin application was not approved. Contact support@thehappypets.in for details.",
  },
  suspended: {
    icon: ShieldX,
    color: "bg-red-50 border-red-200 text-red-800",
    message: "Your account has been suspended. Please contact support@thehappypets.in.",
  },
};

const CATEGORY_LIST = [
  { emoji: "🐕", label: "Dog Food", count: "480+" },
  { emoji: "🐈", label: "Cat Food", count: "310+" },
  { emoji: "🦜", label: "Bird Food", count: "210+" },
  { emoji: "🐟", label: "Fish Food", count: "148+" },
  { emoji: "🐹", label: "Hamster", count: "100+" },
];

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string };
}): JSX.Element {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusKey, setStatusKey] = useState<string | null>(searchParams?.message || null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const isDev = process.env.NODE_ENV === "development";

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginForm) {
    setLoading(true);
    setError(null);
    setStatusKey(null);
    try {
      const result = await loginAction(values);
      if (result.success && result.redirect) {
        setSuccess(true);
        setTimeout(() => router.push(result.redirect!), 800);
      } else {
        const msg = result.error || "Login failed";
        // Map server messages to status keys
        if (msg.toLowerCase().includes("pending")) setStatusKey("pending_approval");
        else if (msg.toLowerCase().includes("rejected")) setStatusKey("rejected");
        else if (msg.toLowerCase().includes("suspended")) setStatusKey("suspended");
        else setError(msg);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fillDemo = (email: string, password: string) => {
    form.setValue("email", email);
    form.setValue("password", password);
  };

  const statusInfo = statusKey ? STATUS_MESSAGES[statusKey] : null;

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ────────────────────── */}
      <div className="hidden lg:flex flex-col w-[460px] shrink-0 bg-gradient-to-br from-[#D4862B] via-[#c47220] to-[#2C4A2E] p-12 justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 right-8 w-32 h-32 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              🐾
            </div>
            <div>
              <h1 className="text-white text-xl font-bold leading-tight">Happypets</h1>
              <p className="text-amber-200 text-xs">Premium Pet Nutrition</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Everything your<br />pet needs. 🐾
          </h2>
          <p className="text-amber-100/80 text-sm leading-relaxed">
            Trusted by thousands of pet parents across India for authentic, 
            vet-approved nutrition.
          </p>
        </div>

        {/* Categories */}
        <div className="relative z-10 space-y-2">
          <p className="text-amber-200/70 text-xs uppercase tracking-widest mb-4">Browse Categories</p>
          {CATEGORY_LIST.map((c) => (
            <div key={c.label} className="flex items-center justify-between bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className="text-lg">{c.emoji}</span>
                <span className="text-white text-sm font-medium">{c.label}</span>
              </div>
              <span className="text-amber-200/70 text-xs">{c.count}</span>
            </div>
          ))}

          <p className="text-amber-100/50 text-xs text-center mt-6">
            © {new Date().getFullYear()} Happypets · support@thehappypets.in
          </p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FDF6EC]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold">Happypets</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign in to continue.{" "}
            <Link href="/register" className="text-primary font-medium hover:underline">
              New here?
            </Link>
          </p>

          {/* Status message */}
          {statusInfo && (
            <div className={`flex gap-3 border rounded-xl p-4 mb-6 ${statusInfo.color}`}>
              <statusInfo.icon className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{statusInfo.message}</p>
            </div>
          )}

          {/* Generic error */}
          {error && (
            <div className="flex gap-3 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-6">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center">
                      <FormLabel>Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot Password?
                      </Link>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className={`w-full gap-2 transition-all duration-300 ${success ? "bg-green-600 hover:bg-green-700" : ""}`} 
                disabled={loading || success}
              >
                {success ? (
                  <><CheckCircle2 className="w-4 h-4 animate-in zoom-in duration-300" /> Success!</>
                ) : loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing In...</>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </Form>

          {/* Demo accounts (dev only) */}
          {isDev && (
            <div className="mt-8 border border-dashed border-amber-300 rounded-xl p-4 bg-amber-50">
              <p className="text-xs font-semibold text-amber-800 mb-3 uppercase tracking-wider">
                🧪 Dev Demo Accounts
              </p>
              <div className="flex gap-2 flex-wrap">
                {DEMO_ACCOUNTS.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => fillDemo(d.email, d.password)}
                    className="text-xs px-3 py-1.5 bg-white border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors font-medium text-amber-800"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-amber-600/70 mt-2">Password: Demo@123 for all · Hidden in production</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
