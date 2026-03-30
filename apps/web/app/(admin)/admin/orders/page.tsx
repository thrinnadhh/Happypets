"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye } from "lucide-react";

const STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-violet-100 text-violet-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const MOCK_ORDERS = [
  {
    id: "ord-1",
    order_number: "ORD-7H2A",
    customer_name: "Priya Sharma",
    customer_email: "priya@example.com",
    customer_phone: "+91 98765 43210",
    total: 1499,
    status: "pending",
    items: [
      { name: "Royal Canin Medium Adult 2kg", qty: 1, price: 1299 },
      { name: "Pedigree Dentastix", qty: 1, price: 200 },
    ],
    address: "204, Sunrise Apartments, Bandra West, Mumbai 400050",
    date: "30 Mar 2026, 2:15 PM",
  },
  {
    id: "ord-2",
    order_number: "ORD-9KMP",
    customer_name: "Rahul Nair",
    customer_email: "rahul@example.com",
    customer_phone: "+91 91234 56789",
    total: 899,
    status: "confirmed",
    items: [
      { name: "Whiskas Adult Tuna 1.2kg", qty: 2, price: 499 },
    ],
    address: "12-B, Palm Grove, Indiranagar, Bangalore 560038",
    date: "30 Mar 2026, 11:02 AM",
  },
  {
    id: "ord-3",
    order_number: "ORD-3QRS",
    customer_name: "Ananya Patel",
    customer_email: "ananya@example.com",
    customer_phone: "+91 70000 12345",
    total: 2350,
    status: "shipped",
    items: [
      { name: "Farmina N&D Cat 1.5kg", qty: 1, price: 2350 },
    ],
    address: "78, Sector 18, Noida 201301",
    date: "29 Mar 2026, 6:45 PM",
  },
  {
    id: "ord-4",
    order_number: "ORD-1LMN",
    customer_name: "Vijay Kumar",
    customer_email: "vijay@example.com",
    customer_phone: "+91 99999 88888",
    total: 650,
    status: "delivered",
    items: [
      { name: "Drools Focus Puppy 1kg", qty: 1, price: 649 },
    ],
    address: "Flat 5, Silicon Towers, Hitech City, Hyderabad 500081",
    date: "29 Mar 2026, 9:00 AM",
  },
];

const NEXT_STATUS: Record<string, string> = {
  pending: "confirmed",
  confirmed: "processing",
  processing: "shipped",
  shipped: "delivered",
};

export default function AdminOrdersPage(): JSX.Element {
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<(typeof MOCK_ORDERS)[0] | null>(null);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "all" || o.status === filter;
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const advanceStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = NEXT_STATUS[o.status];
        return next ? { ...o, status: next } : o;
      })
    );
    if (selectedOrder?.id === orderId) {
      const next = NEXT_STATUS[selectedOrder.status];
      if (next) setSelectedOrder((prev) => prev ? { ...prev, status: next } : prev);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">{filtered.length} orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by order # or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s === "all" ? "All Statuses" : s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="pl-5">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right pr-5">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="pl-5 font-mono text-xs font-semibold text-primary">{o.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{o.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.items.length} item{o.items.length !== 1 ? "s" : ""}</TableCell>
                  <TableCell className="font-semibold text-sm">₹{o.total.toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}>
                      {o.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="text-right pr-5">
                    <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setSelectedOrder(o)}>
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Order detail slideout */}
      <Sheet open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Order {selectedOrder?.order_number}</SheetTitle>
            <SheetDescription>Placed on {selectedOrder?.date}</SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Status</p>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${STATUS_STYLES[selectedOrder.status]}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                {NEXT_STATUS[selectedOrder.status] && (
                  <Button size="sm" onClick={() => advanceStatus(selectedOrder.id)} className="capitalize">
                    Mark as {NEXT_STATUS[selectedOrder.status]}
                  </Button>
                )}
              </div>

              {/* Customer */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Customer</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
                  <p className="font-semibold">{selectedOrder.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                  <p className="text-sm text-muted-foreground mt-2">📍 {selectedOrder.address}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-base">🛍️</div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                        </div>
                      </div>
                      <p className="font-semibold text-sm">₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <span className="font-semibold">Order Total</span>
                <span className="text-xl font-bold text-primary">₹{selectedOrder.total.toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
