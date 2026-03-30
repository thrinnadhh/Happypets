"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Search, ChevronRight } from "lucide-react";

interface Customer {
  id: string; name: string; email: string; joined: string;
  orders: number; spent: number; lastOrder?: string;
  recentOrders: { id: string; date: string; total: number; status: string; shop: string }[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800", confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-cyan-100 text-cyan-800", delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const MOCK_CUSTOMERS: Customer[] = [
  { id: "c1", name: "Aryan Gupta", email: "aryan@gmail.com", joined: "Jan 2026", orders: 8, spent: 12400, lastOrder: "30 Mar 2026",
    recentOrders: [
      { id: "ORD-A1", date: "30 Mar 2026", total: 1299, status: "shipped", shop: "PawFeast" },
      { id: "ORD-A2", date: "15 Mar 2026", total: 2450, status: "delivered", shop: "PetMart" },
      { id: "ORD-A3", date: "1 Mar 2026", total: 849, status: "delivered", shop: "FurFit" },
    ]
  },
  { id: "c2", name: "Meera Singh", email: "meera@yahoo.com", joined: "Feb 2026", orders: 5, spent: 7800, lastOrder: "29 Mar 2026",
    recentOrders: [
      { id: "ORD-B1", date: "29 Mar 2026", total: 599, status: "delivered", shop: "NutriVet" },
      { id: "ORD-B2", date: "20 Mar 2026", total: 1350, status: "delivered", shop: "PawFeast" },
    ]
  },
  { id: "c3", name: "Vijay Kumar", email: "vijay@outlook.com", joined: "Jan 2026", orders: 12, spent: 24500, lastOrder: "29 Mar 2026",
    recentOrders: [
      { id: "ORD-C1", date: "29 Mar 2026", total: 2450, status: "processing", shop: "PetMart" },
      { id: "ORD-C2", date: "10 Mar 2026", total: 3200, status: "delivered", shop: "PetMart" },
      { id: "ORD-C3", date: "25 Feb 2026", total: 1800, status: "delivered", shop: "PawFeast" },
    ]
  },
  { id: "c4", name: "Riya Shah", email: "riya@gmail.com", joined: "Mar 2026", orders: 2, spent: 1650, lastOrder: "28 Mar 2026",
    recentOrders: [
      { id: "ORD-D1", date: "28 Mar 2026", total: 850, status: "pending", shop: "FurFit" },
    ]
  },
  { id: "c5", name: "Sanjay Joshi", email: "sanjay@icloud.com", joined: "Feb 2026", orders: 6, spent: 9200, lastOrder: "27 Mar 2026",
    recentOrders: [
      { id: "ORD-E1", date: "27 Mar 2026", total: 370, status: "delivered", shop: "BirdNest" },
      { id: "ORD-E2", date: "12 Mar 2026", total: 1200, status: "delivered", shop: "PetMart" },
    ]
  },
  { id: "c6", name: "Pooja Reddy", email: "pooja@gmail.com", joined: "Jan 2026", orders: 4, spent: 5300, lastOrder: "26 Mar 2026",
    recentOrders: [
      { id: "ORD-F1", date: "26 Mar 2026", total: 1799, status: "cancelled", shop: "PawFeast" },
    ]
  },
];

export default function SuperAdminCustomers(): JSX.Element {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = useMemo(() =>
    MOCK_CUSTOMERS.filter((c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-muted-foreground text-sm mt-1">{MOCK_CUSTOMERS.length} registered customers</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: "4,302" },
          { label: "Active (30 days)", value: "1,847" },
          { label: "Avg. Order Value", value: "₹1,290" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm text-center">
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-center">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Last Order</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow
                key={c.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedCustomer(c)}
              >
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{c.joined}</TableCell>
                <TableCell className="text-center font-semibold">{c.orders}</TableCell>
                <TableCell className="text-right font-bold text-primary text-sm">
                  ₹{c.spent.toLocaleString("en-IN")}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.lastOrder}</TableCell>
                <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Customer detail sheet */}
      <Sheet open={!!selectedCustomer} onOpenChange={(o) => !o && setSelectedCustomer(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>{selectedCustomer?.name}</SheetTitle>
            <SheetDescription>{selectedCustomer?.email}</SheetDescription>
          </SheetHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Orders", value: selectedCustomer.orders },
                  { label: "Spent", value: `₹${selectedCustomer.spent.toLocaleString("en-IN")}` },
                  { label: "Since", value: selectedCustomer.joined },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="font-bold text-sm">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Order history */}
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Recent Orders
                </h3>
                <div className="space-y-2">
                  {selectedCustomer.recentOrders.map((o) => (
                    <div key={o.id} className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-mono font-bold text-primary">{o.id}</p>
                        <p className="text-xs text-muted-foreground">{o.date} · {o.shop}</p>
                      </div>
                      <p className="font-semibold text-sm shrink-0">₹{o.total.toLocaleString("en-IN")}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize shrink-0 ${STATUS_STYLES[o.status] || "bg-gray-100 text-gray-600"}`}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
