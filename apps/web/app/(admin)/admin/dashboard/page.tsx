import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Package,
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ScrollText,
  PlusCircle,
  ClipboardList,
  Archive,
  Star,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — Happypets Admin",
};

// Dynamically import charts with no SSR to optimize performance
const AdminCharts = dynamic(() => import("./AdminCharts"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-2xl border border-border flex items-center justify-center text-sm text-muted-foreground">
      Loading visual insights…
    </div>
  ),
});

// ── Types ─────────────────────────────────────────────
interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

// ── Mock data — replace with Supabase queries ──────────
const STATS: StatCard[] = [
  {
    label: "Total Orders",
    value: "1,284",
    change: "+12%",
    icon: Package,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Revenue (Month)",
    value: "₹4,87,200",
    change: "+8%",
    icon: DollarSign,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    label: "Active Products",
    value: "342",
    change: "+3",
    icon: ShoppingBag,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Customers",
    value: "8,921",
    change: "+156",
    icon: Users,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

const LOW_STOCK = [
  { id: "1", name: "Royal Canin Medium Adult 2kg", sku: "RC-MA-2KG", stock: 2, category: "Dog Food" },
  { id: "2", name: "Whiskas Tuna 400g", sku: "WK-TU-400G", stock: 5, category: "Cat Food" },
  { id: "3", name: "Drools Focus Puppy 1kg", sku: "DR-FP-1KG", stock: 3, category: "Dog Food" },
  { id: "4", name: "Taiyo Goldfish Pellets", sku: "TY-GF-200G", stock: 7, category: "Fish Food" },
];

const RECENT_ORDERS = [
  { id: "ORD-7H2A", customer: "Priya Sharma", amount: "₹1,499", status: "pending", items: 3, date: "Today, 2:15 PM" },
  { id: "ORD-9KMP", customer: "Rahul Nair", amount: "₹899", status: "confirmed", items: 1, date: "Today, 11:02 AM" },
  { id: "ORD-3QRS", customer: "Ananya Patel", amount: "₹2,350", status: "shipped", items: 4, date: "Yesterday" },
  { id: "ORD-1LMN", customer: "Vijay Kumar", amount: "₹650", status: "delivered", items: 2, date: "Yesterday" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-violet-100 text-violet-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const QUICK_ACTIONS = [
  { label: "Add Product", href: "/admin/products?action=new", icon: PlusCircle },
  { label: "View Orders", href: "/admin/orders", icon: ClipboardList },
  { label: "Manage Inventory", href: "/admin/inventory", icon: Archive },
  { label: "Edit Featured", href: "/admin/featured", icon: Star },
];

// ── Skeleton sub-components ────────────────────────────
function StatCardSkeleton(): React.JSX.Element {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
      aria-hidden="true"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 bg-muted skeleton-shimmer rounded" />
          <div className="h-7 w-32 bg-muted skeleton-shimmer rounded" />
          <div className="h-3 w-28 bg-muted skeleton-shimmer rounded" />
        </div>
        <div className="w-12 h-12 bg-muted skeleton-shimmer rounded-xl" />
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────
export default function AdminDashboardPage(): JSX.Element {
  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          Dashboard Overview
        </h1>
        <p className="text-muted-foreground text-sm">
          Welcome back,{" "}
          <span className="text-foreground font-medium">Admin</span>. Everything
          looks good today.
        </p>
      </header>

      {/* Stats cards */}
      <section
        aria-labelledby="stats-heading"
        className="grid grid-cols-1 xs:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5"
      >
        <h2 id="stats-heading" className="sr-only">
          Key Statistics
        </h2>
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">
                    {s.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    {s.value}
                  </p>
                  <p className="mt-2 text-xs flex items-center gap-1 font-semibold text-green-600">
                    <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                    {s.change} from last month
                  </p>
                </div>
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${s.iconBg}`}
                >
                  <Icon
                    className={`w-5 h-5 sm:w-6 sm:h-6 ${s.iconColor}`}
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Visual Insights Section */}
      <section aria-labelledby="insights-heading" className="space-y-4">
        <h2
          id="insights-heading"
          className="text-base sm:text-lg font-semibold text-foreground"
        >
          Visual Insights
        </h2>
        <AdminCharts />
      </section>

      {/* Low stock + Recent orders */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Low stock */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <AlertTriangle
                className="w-4 h-4 text-amber-500"
                aria-hidden="true"
              />
              Low Stock Alerts
            </h2>
            <Link
              href="/admin/inventory"
              className="text-xs text-primary hover:underline shrink-0"
              aria-label="View full inventory"
            >
              View inventory →
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {LOW_STOCK.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.sku} · {p.category}
                  </p>
                </div>
                <span
                  className={`ml-3 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${
                    p.stock <= 3
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                  aria-label={`${p.stock} units remaining`}
                >
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-primary" aria-hidden="true" />
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline shrink-0"
              aria-label="View all orders"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-gray-50">
                <tr>
                  {["Order", "Customer", "Items", "Amount", "Status", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {RECENT_ORDERS.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-medium text-primary">
                      {o.id}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{o.customer}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      {o.items}
                    </td>
                    <td className="px-4 py-3.5 font-semibold">{o.amount}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs">
                      {o.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm sm:text-base font-semibold mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-primary hover:text-primary rounded-xl px-4 py-2.5 text-sm font-medium transition-all shadow-sm hover:shadow-md min-h-[44px]"
                aria-label={a.label}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {a.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Export skeleton for Suspense usage
export { StatCardSkeleton };
