// apps/mobile/app/(tabs)/orders.tsx — Orders Screen
import { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, SafeAreaView,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Package, ChevronRight, RotateCcw } from "lucide-react-native";

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  pending:    { color: "#b45309", bg: "#FEF3C7", label: "Pending",    emoji: "⏳" },
  confirmed:  { color: "#1d4ed8", bg: "#DBEAFE", label: "Confirmed",  emoji: "✅" },
  processing: { color: "#7c3aed", bg: "#EDE9FE", label: "Processing", emoji: "⚙️" },
  shipped:    { color: "#0e7490", bg: "#CFFAFE", label: "Shipped",    emoji: "🚚" },
  delivered:  { color: "#15803d", bg: "#DCFCE7", label: "Delivered",  emoji: "🎉" },
  cancelled:  { color: "#b91c1c", bg: "#FEE2E2", label: "Cancelled",  emoji: "❌" },
};

const MOCK_ORDERS = [
  { id: "ORD-001", date: "30 Mar 2026", items: 2, total: 1648, status: "shipped", products: ["Royal Canin Medium 2kg", "Pedigree Dentastix"] },
  { id: "ORD-002", date: "25 Mar 2026", items: 1, total: 349, status: "delivered", products: ["Whiskas Kitten Ocean Fish"] },
  { id: "ORD-003", date: "18 Mar 2026", items: 3, total: 3377, status: "delivered", products: ["Drools Focus Puppy 1kg", "Farmina N&D Cat", "+1 more"] },
  { id: "ORD-004", date: "10 Mar 2026", items: 1, total: 280, status: "cancelled", products: ["Vitapol Budgie Mix"] },
  { id: "ORD-005", date: "28 Feb 2026", items: 2, total: 1478, status: "delivered", products: ["NutriPet Hamster Mix", "Taiyo Goldfish Pellets"] },
];

const TABS = ["All", "Active", "Delivered", "Cancelled"] as const;
type Tab = typeof TABS[number];

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered = MOCK_ORDERS.filter((o) => {
    if (activeTab === "All") return true;
    if (activeTab === "Active") return ["pending", "confirmed", "processing", "shipped"].includes(o.status);
    if (activeTab === "Delivered") return o.status === "delivered";
    if (activeTab === "Cancelled") return o.status === "cancelled";
    return true;
  });

  const StatusPill = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
      <View className="flex-row items-center gap-1 rounded-full px-3 py-1" style={{ backgroundColor: cfg.bg }}>
        <Text style={{ fontSize: 10 }}>{cfg.emoji}</Text>
        <Text className="text-xs font-bold" style={{ color: cfg.color }}>{cfg.label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EC" />

      {/* Header */}
      <View className="px-4 py-3">
        <Text className="text-xl font-bold">My Orders</Text>
      </View>

      {/* Tab bar */}
      <View className="flex-row px-4 mb-4 gap-2">
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full border ${activeTab === tab ? "bg-primary border-primary" : "bg-white border-gray-200"}`}
          >
            <Text className={`text-xs font-semibold ${activeTab === tab ? "text-white" : "text-gray-600"}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-3">📦</Text>
          <Text className="text-base font-bold text-gray-800 mb-1">No orders here</Text>
          <Text className="text-xs text-gray-400 text-center">
            {activeTab === "Active" ? "No active orders at the moment." : "No orders in this category."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: order }) => {
            const cfg = STATUS_CONFIG[order.status];
            return (
              <TouchableOpacity
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100"
                activeOpacity={0.8}
              >
                {/* Order header */}
                <View className="flex-row items-start justify-between mb-3">
                  <View>
                    <Text className="text-xs font-mono font-bold text-primary">{order.id}</Text>
                    <Text className="text-xs text-gray-400 mt-0.5">{order.date}</Text>
                  </View>
                  <StatusPill status={order.status} />
                </View>

                {/* Products list */}
                <View className="bg-gray-50 rounded-xl px-3 py-2.5 mb-3">
                  {order.products.map((p, i) => (
                    <Text key={i} className="text-xs text-gray-700 py-0.5" numberOfLines={1}>
                      • {p}
                    </Text>
                  ))}
                </View>

                {/* Footer */}
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs text-gray-400">{order.items} item{order.items > 1 ? "s" : ""}</Text>
                    <Text className="text-base font-bold" style={{ color: "#D4862B" }}>
                      ₹{order.total.toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    {order.status === "delivered" && (
                      <TouchableOpacity className="flex-row items-center gap-1 border border-gray-200 rounded-xl px-3 py-2">
                        <RotateCcw size={12} color="#374151" />
                        <Text className="text-xs font-medium text-gray-700">Reorder</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity className="flex-row items-center gap-1 rounded-xl px-3 py-2" style={{ backgroundColor: "#D4862B" }}>
                      <Text className="text-xs font-medium text-white">Details</Text>
                      <ChevronRight size={12} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
