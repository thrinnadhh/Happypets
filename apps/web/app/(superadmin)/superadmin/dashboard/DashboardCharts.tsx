"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ── Mock data ─────────────────────────────── */
const CATEGORY_DATA = [
  { category: "Dog Food", products: 480 },
  { category: "Cat Food", products: 310 },
  { category: "Bird Food", products: 210 },
  { category: "Fish Food", products: 148 },
  { category: "Hamster", products: 100 },
];

const SHOP_REVENUE = [
  { shop: "PawFeast", revenue: 420000 },
  { shop: "PetMart", revenue: 380000 },
  { shop: "NutriPet", revenue: 290000 },
  { shop: "FurFit", revenue: 220000 },
  { shop: "BirdNest", revenue: 140000 },
  { shop: "ZooZone", revenue: 80000 },
];

const ORDER_STATUS = [
  { name: "Delivered", value: 4820, color: "#22c55e" },
  { name: "Shipped", value: 1950, color: "#3b82f6" },
  { name: "Processing", value: 1240, color: "#a855f7" },
  { name: "Pending", value: 980, color: "#f59e0b" },
  { name: "Cancelled", value: 551, color: "#ef4444" },
];

export default function DashboardCharts(): JSX.Element {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products by Category */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold mb-4">Products by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ left: 16, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v) => [`${v} products`, ""]} />
              <Bar dataKey="products" fill="#D4862B" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status donut */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold mb-4">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={ORDER_STATUS}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {ORDER_STATUS.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} orders`, ""]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Shop bar chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold mb-4">Revenue by Shop (₹)</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={SHOP_REVENUE}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="shop" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
            <Bar dataKey="revenue" fill="#2C4A2E" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
