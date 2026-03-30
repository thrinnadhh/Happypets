"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  UserCheck,
  Clock,
  Users,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const DashboardCharts = dynamic(() => import("./DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-[290px]" />
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-[290px]" />
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 h-[290px]" />
    </div>
  ),
});

/* ── Mock data ─────────────────────────────── */
const STATS = [
  { label: "Total Products", value: "1,248", icon: Package, color: "bg-blue-50 text-blue-700", delta: "+12 this week" },
  { label: "Approved Admins", value: "18", icon: UserCheck, color: "bg-green-50 text-green-700", delta: "Across 18 shops" },
  { label: "Pending Approvals", value: "3", icon: Clock, color: "bg-amber-50 text-amber-700", delta: "Needs attention", alert: true },
  { label: "Total Customers", value: "4,302", icon: Users, color: "bg-purple-50 text-purple-700", delta: "+87 this month" },
  { label: "Total Orders", value: "9,541", icon: ShoppingBag, color: "bg-cyan-50 text-cyan-700", delta: "All time" },
  { label: "Platform Revenue", value: "₹18.3L", icon: IndianRupee, color: "bg-emerald-50 text-emerald-700", delta: "+₹2.1L this month" },
];

const PENDING_ADMINS = [
  { id: "pa-1", name: "Rahul Mehta", email: "rahul@petsupply.in", shop: "PetSupply India", registered: "28 Mar 2026" },
  { id: "pa-2", name: "Sneha Patel", email: "sneha@furryfoods.com", shop: "Furry Foods Co.", registered: "29 Mar 2026" },
  { id: "pa-3", name: "Kiran Nair", email: "kiran@zoozone.in", shop: "ZooZone", registered: "30 Mar 2026" },
];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const RECENT_ORDERS = [
  { id: "ORD-A1", customer: "Aryan Gupta", shop: "PawFeast", items: 2, total: 1299, status: "shipped" },
  { id: "ORD-B2", customer: "Meera Singh", shop: "NutriPet", items: 1, total: 599, status: "delivered" },
  { id: "ORD-C3", customer: "Vijay Kumar", shop: "PetMart", items: 3, total: 2450, status: "processing" },
  { id: "ORD-D4", customer: "Riya Shah", shop: "FurFit", items: 1, total: 850, status: "pending" },
  { id: "ORD-E5", customer: "Sanjay Joshi", shop: "BirdNest", items: 2, total: 370, status: "delivered" },
  { id: "ORD-F6", customer: "Pooja Reddy", shop: "PawFeast", items: 1, total: 1799, status: "cancelled" },
  { id: "ORD-G7", customer: "Dev Malhotra", shop: "PetMart", items: 4, total: 3200, status: "shipped" },
  { id: "ORD-H8", customer: "Anita Verma", shop: "ZooZone", items: 1, total: 429, status: "pending" },
  { id: "ORD-I9", customer: "Rohit Sharma", shop: "NutriPet", items: 2, total: 960, status: "confirmed" },
  { id: "ORD-J10", customer: "Kavya Nair", shop: "FurFit", items: 1, total: 750, status: "delivered" },
];

/* ── Approve/Reject handlers (mock) ────────── */
function pendingAdminAction(id: string, action: "approve" | "reject") {
  alert(`${action === "approve" ? "Approved" : "Rejected"} admin ${id} (mock)`);
}

export default function SuperAdminDashboard(): JSX.Element {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time stats across the Happypets ecosystem</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`bg-white rounded-2xl border p-5 shadow-sm ${s.alert ? "border-amber-300" : "border-gray-200"}`}
            >
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-1 opacity-70">{s.delta}</p>
            </div>
          );
        })}
      </div>

      {/* Pending Approvals Alert */}
      {PENDING_ADMINS.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-bold text-amber-900">
              {PENDING_ADMINS.length} Admin{PENDING_ADMINS.length > 1 ? "s" : ""} Waiting for Approval
            </h2>
          </div>

          <div className="space-y-3">
            {PENDING_ADMINS.map((admin) => (
              <div
                key={admin.id}
                className="bg-white rounded-xl border border-amber-100 p-4 flex flex-wrap items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center font-bold text-amber-800 shrink-0">
                  {admin.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{admin.name}</p>
                  <p className="text-xs text-muted-foreground">{admin.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Shop: <span className="font-medium">{admin.shop}</span> · Registered: {admin.registered}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 gap-1"
                    onClick={() => pendingAdminAction(admin.id, "approve")}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 gap-1"
                    onClick={() => pendingAdminAction(admin.id, "reject")}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="space-y-6">
        <DashboardCharts />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">Recent Orders (Last 10)</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Shop</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RECENT_ORDERS.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-xs font-bold text-primary">{order.id}</TableCell>
                <TableCell className="text-sm">{order.customer}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{order.shop}</TableCell>
                <TableCell className="text-center text-sm">{order.items}</TableCell>
                <TableCell className="text-right font-semibold text-sm">₹{order.total.toLocaleString("en-IN")}</TableCell>
                <TableCell>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[order.status]}`}>
                    {order.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
