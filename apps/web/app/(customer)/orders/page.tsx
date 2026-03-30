"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ChevronRight, RefreshCcw } from "lucide-react";
import Link from "next/link";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-violet-100 text-violet-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const STATUS_ICONS: Record<string, string> = {
  pending: "🕐",
  confirmed: "✅",
  processing: "🏭",
  shipped: "🚚",
  delivered: "📦",
  cancelled: "❌",
};

const MOCK_ORDERS = [
  {
    id: "ord-1",
    order_number: "ORD-7H2A",
    date: "30 Mar 2026",
    status: "shipped",
    total: 1499,
    items: [
      { name: "Royal Canin Medium Adult 2kg", qty: 1, price: 1299, image: "" },
      { name: "Pedigree Dentastix", qty: 1, price: 200, image: "" },
    ],
    address: "204, Sunrise Apartments, Bandra West, Mumbai 400050",
    tracking: "DTDC1234567890IN",
  },
  {
    id: "ord-2",
    order_number: "ORD-3QRS",
    date: "29 Mar 2026",
    status: "delivered",
    total: 2350,
    items: [
      { name: "Farmina N&D Cat Ancestral Grain 1.5kg", qty: 1, price: 2350, image: "" },
    ],
    address: "78, Sector 18, Noida 201301",
    tracking: "ECOMS9988776655IN",
  },
  {
    id: "ord-3",
    order_number: "ORD-1LMN",
    date: "20 Mar 2026",
    status: "cancelled",
    total: 649,
    items: [
      { name: "Drools Focus Puppy 1kg", qty: 1, price: 649, image: "" },
    ],
    address: "Flat 5, Silicon Towers, Hitech City, Hyderabad 500081",
    tracking: null,
  },
];

type Order = typeof MOCK_ORDERS[0];

// Progress bar for active orders
function OrderProgress({ status }: { status: string }) {
  const steps = ["confirmed", "processing", "shipped", "delivered"];
  const idx = steps.indexOf(status);
  if (idx === -1) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between mb-1.5">
        {steps.map((s, i) => (
          <div key={s} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                ${i < idx ? "bg-green-500 text-white" : i === idx ? "bg-primary text-white" : "bg-gray-200 text-gray-400"}`}
            >
              {i < idx ? "✓" : i + 1}
            </div>
            <p className={`text-[10px] mt-1 text-center capitalize ${i === idx ? "text-primary font-semibold" : "text-muted-foreground"}`}>
              {s}
            </p>
          </div>
        ))}
      </div>
      <div className="relative h-1 bg-gray-200 rounded-full mx-4">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
          style={{ width: `${(idx / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-sm font-bold text-primary">{order.order_number}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{order.date}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${STATUS_STYLES[order.status]}`}>
          {STATUS_ICONS[order.status]} <span className="capitalize">{order.status}</span>
        </span>
      </div>

      {/* Mini item list */}
      <div className="flex gap-2 mb-3">
        {order.items.slice(0, 3).map((item, i) => (
          <div key={i} className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-xl shrink-0">
            🛍️
          </div>
        ))}
        {order.items.length > 3 && (
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
            +{order.items.length - 3}
          </div>
        )}
      </div>

      {/* Progress */}
      {["confirmed", "processing", "shipped"].includes(order.status) && (
        <OrderProgress status={order.status} />
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <p className="text-sm">
          <span className="text-muted-foreground">{order.items.length} item{order.items.length > 1 ? "s" : ""} · </span>
          <span className="font-bold">₹{order.total.toLocaleString("en-IN")}</span>
        </p>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export default function OrdersPage(): JSX.Element {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const filterOrders = (tab: string) => {
    if (tab === "all") return MOCK_ORDERS;
    if (tab === "active") return MOCK_ORDERS.filter((o) => ["pending", "confirmed", "processing", "shipped"].includes(o.status));
    if (tab === "delivered") return MOCK_ORDERS.filter((o) => o.status === "delivered");
    if (tab === "cancelled") return MOCK_ORDERS.filter((o) => o.status === "cancelled");
    return MOCK_ORDERS;
  };

  const filteredOrders = filterOrders(activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-1">My Orders</h1>
        <p className="text-muted-foreground text-sm mb-6">{MOCK_ORDERS.length} total orders</p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="bg-white border">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
            ))}
            {filteredOrders.length === 0 && (
              <div className="text-center py-16 space-y-4">
                <div className="text-5xl">📭</div>
                <p className="text-muted-foreground">No orders here yet.</p>
                <Button asChild>
                  <Link href="/products">Shop Now</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Order {selectedOrder?.order_number}</SheetTitle>
            <SheetDescription>{selectedOrder?.date}</SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className={`rounded-2xl p-4 ${STATUS_STYLES[selectedOrder.status]}`}>
                <p className="text-lg font-bold capitalize flex items-center gap-2">
                  {STATUS_ICONS[selectedOrder.status]} {selectedOrder.status}
                </p>
                {selectedOrder.tracking && (
                  <p className="text-xs mt-1 opacity-80">Tracking: {selectedOrder.tracking}</p>
                )}
              </div>

              {/* Progress */}
              {["confirmed", "processing", "shipped"].includes(selectedOrder.status) && (
                <div className="bg-white border rounded-2xl p-5">
                  <p className="text-sm font-semibold mb-3">Delivery Progress</p>
                  <OrderProgress status={selectedOrder.status} />
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-xl shrink-0">🛍️</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                      </div>
                      <p className="font-semibold text-sm">₹{item.price.toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Delivery Address</h3>
                <p className="text-sm text-muted-foreground bg-gray-50 rounded-xl p-4">{selectedOrder.address}</p>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <span className="font-semibold">Total Paid</span>
                <span className="text-xl font-bold text-primary">₹{selectedOrder.total.toLocaleString("en-IN")}</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {selectedOrder.status === "delivered" && (
                  <Button variant="outline" className="flex-1 gap-2" asChild>
                    <Link href={`/products?reorder=${selectedOrder.id}`}>
                      <RefreshCcw className="w-4 h-4" /> Reorder
                    </Link>
                  </Button>
                )}
                <Button className="flex-1" variant="outline" asChild>
                  <Link href="/products">Shop More</Link>
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
