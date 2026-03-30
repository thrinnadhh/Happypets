"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-violet-100 text-violet-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-600",
};

const STATUS_FLOW: Record<string, string> = {
  pending: "confirmed", confirmed: "processing", processing: "shipped",
  shipped: "delivered",
};

interface Order {
  id: string; customer: string; shop: string; items: number;
  total: number; status: string; date: string; address: string;
}

const MOCK_ORDERS: Order[] = [
  { id: "ORD-A1", customer: "Aryan Gupta", shop: "PawFeast", items: 2, total: 1299, status: "shipped", date: "30 Mar 2026", address: "204, Andheri West, Mumbai 400058" },
  { id: "ORD-B2", customer: "Meera Singh", shop: "NutriVet", items: 1, total: 599, status: "delivered", date: "29 Mar 2026", address: "78, Sec 18, Noida 201301" },
  { id: "ORD-C3", customer: "Vijay Kumar", shop: "PetMart", items: 3, total: 2450, status: "processing", date: "29 Mar 2026", address: "12, BTM Layout, Bengaluru 560076" },
  { id: "ORD-D4", customer: "Riya Shah", shop: "FurFit", items: 1, total: 850, status: "pending", date: "28 Mar 2026", address: "Flat 5, Hitech City, Hyderabad 500081" },
  { id: "ORD-E5", customer: "Sanjay Joshi", shop: "BirdNest", items: 2, total: 370, status: "delivered", date: "27 Mar 2026", address: "23, Model Town, Delhi 110009" },
  { id: "ORD-F6", customer: "Pooja Reddy", shop: "PawFeast", items: 1, total: 1799, status: "cancelled", date: "26 Mar 2026", address: "101, Salt Lake, Kolkata 700064" },
  { id: "ORD-G7", customer: "Dev Malhotra", shop: "PetMart", items: 4, total: 3200, status: "shipped", date: "25 Mar 2026", address: "7, Banjara Hills, Hyderabad 500034" },
  { id: "ORD-H8", customer: "Anita Verma", shop: "ZooZone", items: 1, total: 429, status: "confirmed", date: "24 Mar 2026", address: "56, Gomtinagar, Lucknow 226010" },
];

const ALL_STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function SuperAdminOrders(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);

  const filtered = useMemo(() => orders.filter((o) => {
    if (tab !== "all" && o.status !== tab) return false;
    if (search && !o.customer.toLowerCase().includes(search.toLowerCase()) && !o.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [orders, tab, search]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selected?.id === orderId) setSelected((s) => s ? { ...s, status: newStatus } : s);
    toast.success(`Order status updated to "${newStatus}"`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Orders</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform-wide order management</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customer or order ID…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-white border flex-wrap h-auto gap-1">
          {ALL_STATUSES.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize text-xs">{s}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">No orders found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => (
                    <TableRow key={o.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelected(o)}>
                      <TableCell className="font-mono text-xs font-bold text-primary">{o.id}</TableCell>
                      <TableCell className="text-sm">{o.customer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{o.shop}</TableCell>
                      <TableCell className="text-center text-sm">{o.items}</TableCell>
                      <TableCell className="text-right font-semibold text-sm">₹{o.total.toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[o.status]}`}>{o.status}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{o.date}</TableCell>
                      <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order detail slide-out */}
      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Order {selected?.id}</SheetTitle>
            <SheetDescription>{selected?.date} · {selected?.shop}</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="space-y-6">
              <div className={`rounded-2xl p-4 ${STATUS_STYLES[selected.status]}`}>
                <p className="font-bold capitalize text-lg">{selected.status}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Customer</p>
                  <p className="font-semibold">{selected.customer}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Delivery Address</p>
                  <p className="text-sm">{selected.address}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex justify-between">
                  <span className="text-sm font-medium">Items</span>
                  <span className="font-bold">{selected.items}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 flex justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="font-bold text-primary">₹{selected.total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Status update */}
              {STATUS_FLOW[selected.status] && (
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Update Status</p>
                  <Select onValueChange={(v) => handleStatusUpdate(selected.id, v)} defaultValue={selected.status}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.filter((s) => s !== "all").map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
