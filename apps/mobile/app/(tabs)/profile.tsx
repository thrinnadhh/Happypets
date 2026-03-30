// apps/mobile/app/(tabs)/profile.tsx — Profile Screen
import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  StatusBar, Alert, Switch,
} from "react-native";
import { useRouter } from "expo-router";
import {
  User, Package, Heart, MapPin, CreditCard, Bell,
  ChevronRight, LogOut, ShieldCheck, HelpCircle,
} from "lucide-react-native";
import { supabase } from "../../lib/supabase";

const MOCK_USER = {
  name: "Aryan Gupta",
  email: "aryan@gmail.com",
  phone: "+91 98765 43210",
  joinedSince: "Jan 2026",
  orders: 8,
  spent: 12400,
  pets: 2,
};

const MENU_ITEMS = [
  { id: "orders",    icon: Package,     label: "My Orders",        route: "/orders" as const },
  { id: "wishlist",  icon: Heart,       label: "Wishlist",         route: "/wishlist" as const },
  { id: "addresses", icon: MapPin,      label: "Saved Addresses",  route: "/addresses" as const },
  { id: "payments",  icon: CreditCard,  label: "Payment Methods",  route: "/payments" as const },
];

const SUPPORT_ITEMS = [
  { id: "help",     icon: HelpCircle, label: "Help & Support" },
  { id: "privacy",  icon: ShieldCheck, label: "Privacy Policy"  },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EC" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Profile Card */}
        <View className="mx-4 mt-3 mb-4 rounded-3xl overflow-hidden shadow-md">
          <View style={{ backgroundColor: "#2C4A2E" }} className="p-6">
            {/* Avatar */}
            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-primary/20 border-4 border-amber-300/30 items-center justify-center mb-3">
                <Text className="text-4xl">{MOCK_USER.name[0]}</Text>
              </View>
              <Text className="text-white text-xl font-bold">{MOCK_USER.name}</Text>
              <Text className="text-green-300 text-sm mt-0.5">{MOCK_USER.email}</Text>
              <Text className="text-green-400/70 text-xs mt-1">Member since {MOCK_USER.joinedSince}</Text>
            </View>

            {/* Stats */}
            <View className="flex-row mt-2">
              {[
                { label: "Orders", value: MOCK_USER.orders },
                { label: "Total Spent", value: `₹${(MOCK_USER.spent / 1000).toFixed(1)}k` },
                { label: "Pets", value: MOCK_USER.pets },
              ].map((stat, i) => (
                <View
                  key={stat.label}
                  className={`flex-1 items-center ${i < 2 ? "border-r border-green-700" : ""}`}
                >
                  <Text className="text-amber-300 text-lg font-bold">{stat.value}</Text>
                  <Text className="text-green-300/70 text-xs">{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Menu items */}
        <View className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {MENU_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center gap-3 px-4 py-4 ${i < MENU_ITEMS.length - 1 ? "border-b border-gray-50" : ""}`}
                activeOpacity={0.7}
              >
                <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: "#FDF6EC" }}>
                  <Icon size={18} color="#D4862B" />
                </View>
                <Text className="flex-1 text-sm font-semibold text-gray-800">{item.label}</Text>
                <ChevronRight size={16} color="#9ca3af" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifications toggle */}
        <View className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-4 mb-4 flex-row items-center">
          <View className="w-9 h-9 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: "#FDF6EC" }}>
            <Bell size={18} color="#D4862B" />
          </View>
          <Text className="flex-1 text-sm font-semibold text-gray-800">Push Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: "#d1d5db", true: "#D4862B" }}
            thumbColor="white"
          />
        </View>

        {/* Support */}
        <View className="mx-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
          {SUPPORT_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center gap-3 px-4 py-4 ${i < SUPPORT_ITEMS.length - 1 ? "border-b border-gray-50" : ""}`}
                activeOpacity={0.7}
              >
                <View className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: "#FDF6EC" }}>
                  <Icon size={18} color="#D4862B" />
                </View>
                <Text className="flex-1 text-sm font-semibold text-gray-800">{item.label}</Text>
                <ChevronRight size={16} color="#9ca3af" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Sign out */}
        <View className="mx-4">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center gap-2 bg-red-50 border border-red-200 rounded-2xl py-4"
            activeOpacity={0.8}
          >
            <LogOut size={18} color="#ef4444" />
            <Text className="text-red-600 font-bold text-sm">Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Happypets · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
