// apps/mobile/app/(tabs)/index.tsx — Home Screen
import { useState, useRef, useCallback } from "react";
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  FlatList, SafeAreaView, StatusBar, ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Search, ChevronRight, Flame, Star } from "lucide-react-native";

/* ─── Mock data ──────────────────────────────── */
const CATEGORIES = [
  { id: "dog_food",    emoji: "🐕", label: "Dog",     color: "#FFF3E0" },
  { id: "cat_food",   emoji: "🐈", label: "Cat",     color: "#F3E5F5" },
  { id: "bird_food",  emoji: "🦜", label: "Bird",    color: "#E8F5E9" },
  { id: "fish_food",  emoji: "🐟", label: "Fish",    color: "#E3F2FD" },
  { id: "hamster",    emoji: "🐹", label: "Hamster", color: "#FFF9C4" },
];

const BRANDS = [
  { id: "b1", name: "Royal Canin", emoji: "👑" },
  { id: "b2", name: "Whiskas",     emoji: "🐈" },
  { id: "b3", name: "Drools",      emoji: "🐾" },
  { id: "b4", name: "Pedigree",    emoji: "🏅" },
  { id: "b5", name: "Farmina",     emoji: "🌿" },
  { id: "b6", name: "Taiyo",       emoji: "🐟" },
];

const PRODUCTS = [
  { id: "p1", name: "Royal Canin Medium Adult 2kg", price: 1299, originalPrice: 1599, rating: 4.8, reviews: 342, shop: "PawFeast", image: "https://placehold.co/300x300/FFF3E0/D4862B?text=🐕", discount: 19 },
  { id: "p2", name: "Whiskas Kitten Ocean Fish", price: 349, originalPrice: 399, rating: 4.5, reviews: 187, shop: "PetMart", image: "https://placehold.co/300x300/F3E5F5/9C27B0?text=🐈", discount: 13 },
  { id: "p3", name: "Drools Focus Puppy 1kg", price: 649, originalPrice: 799, rating: 4.6, reviews: 215, shop: "PawFeast", image: "https://placehold.co/300x300/E8F5E9/2C4A2E?text=🐕", discount: 19 },
  { id: "p4", name: "Farmina N&D Cat Ancestral", price: 2499, originalPrice: 2799, rating: 4.9, reviews: 98, shop: "NutriVet", image: "https://placehold.co/300x300/FFF9C4/F57F17?text=🐈", discount: 11 },
  { id: "p5", name: "Pedigree Dentastix M/L", price: 199, originalPrice: 249, rating: 4.4, reviews: 521, shop: "PetMart", image: "https://placehold.co/300x300/E3F2FD/1565C0?text=🐕", discount: 20 },
];

const TRENDING = [
  { id: "t1", name: "Drools Champion Lite Dog 3kg", price: 999, originalPrice: 1299, rating: 4.7, reviews: 412, shop: "FurFit", image: "https://placehold.co/300x300/FCE4EC/C62828?text=🔥", discount: 23 },
  { id: "t2", name: "Whiskas Adult Tuna 1.1kg", price: 299, originalPrice: 349, rating: 4.3, reviews: 289, shop: "PetMart", image: "https://placehold.co/300x300/E8EAF6/283593?text=🔥", discount: 14 },
  { id: "t3", name: "Taiyo Goldfish Colour Pellets", price: 149, originalPrice: 199, rating: 4.5, reviews: 176, shop: "FurFit", image: "https://placehold.co/300x300/E0F7FA/006064?text=🔥", discount: 25 },
];

/* ─── ProductCard ────────────────────────────── */
function ProductCard({ item, onPress }: { item: typeof PRODUCTS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl mr-3 overflow-hidden shadow-sm border border-gray-100"
      style={{ width: 180 }}
      activeOpacity={0.8}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image }}
          style={{ width: "100%", height: 140 }}
          contentFit="cover"
        />
        {item.discount > 0 && (
          <View className="absolute top-2 right-2 bg-red-500 rounded-lg px-2 py-0.5">
            <Text className="text-white text-[10px] font-bold">-{item.discount}%</Text>
          </View>
        )}
      </View>
      <View className="p-3 gap-1">
        <Text className="text-[10px] text-gray-400 font-medium">{item.shop}</Text>
        <Text className="text-sm font-bold text-gray-900 leading-snug" numberOfLines={2}>{item.name}</Text>
        <View className="flex-row items-center gap-1">
          <Star size={11} color="#D4862B" fill="#D4862B" />
          <Text className="text-xs text-gray-600">{item.rating} ({item.reviews})</Text>
        </View>
        <View className="flex-row items-center gap-2 mt-1">
          <Text className="text-base font-bold text-primary">₹{item.price.toLocaleString("en-IN")}</Text>
          {item.originalPrice > item.price && (
            <Text className="text-xs text-gray-400 line-through">₹{item.originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Section Header ─────────────────────────── */
function SectionHeader({ title, emoji, onSeeAll }: { title: string; emoji?: string; onSeeAll?: () => void }) {
  return (
    <View className="flex-row items-center justify-between px-4 mb-3">
      <View className="flex-row items-center gap-2">
        {emoji && <Text className="text-lg">{emoji}</Text>}
        <Text className="text-base font-bold text-gray-900">{title}</Text>
      </View>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} className="flex-row items-center gap-0.5">
          <Text className="text-xs text-primary font-semibold">See all</Text>
          <ChevronRight size={14} color="#D4862B" />
        </TouchableOpacity>
      )}
    </View>
  );
}

/* ─── Home Screen ────────────────────────────── */
export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const goToProduct = (id: string) => router.push(`/product/${id}`);
  const goToProducts = (category?: string) =>
    router.push(category ? `/products?category=${category}` : "/products");

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EC" />
      <ScrollView
        className="flex-1"
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Sticky Header / Search ── */}
        <View className="bg-cream pb-3 pt-2 px-4">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-xs text-gray-500">Deliver to India 📍</Text>
              <Text className="text-base font-bold text-gray-900">Hello, Pet Parent! 🐾</Text>
            </View>
            <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center">
              <Text className="text-xl">🐕</Text>
            </View>
          </View>

          <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 h-12 shadow-sm">
            <Search size={18} color="#9ca3af" />
            <TextInput
              placeholder="Search for dog food, treats…"
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => search && router.push(`/products?q=${search}`)}
              returnKeyType="search"
              className="flex-1 ml-3 text-sm text-gray-900"
            />
          </View>
        </View>

        {/* ── Category Chips ── */}
        <View className="mb-6">
          <SectionHeader title="Shop by Pet" emoji="🏷️" onSeeAll={() => goToProducts()} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => goToProducts(cat.id)}
                className="mr-3 items-center"
                activeOpacity={0.7}
              >
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-1.5 shadow-sm"
                  style={{ backgroundColor: cat.color }}
                >
                  <Text className="text-3xl">{cat.emoji}</Text>
                </View>
                <Text className="text-xs font-semibold text-gray-700">{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Hero Banner ── */}
        <View className="mx-4 mb-6 bg-gradient-to-r from-secondary to-secondary-light rounded-3xl overflow-hidden shadow-md">
          <View
            className="p-5"
            style={{ backgroundColor: "#2C4A2E" }}
          >
            <Text className="text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
              Limited Offer 🎉
            </Text>
            <Text className="text-white text-xl font-bold leading-tight mb-1">
              Free Shipping on{"\n"}Orders above ₹499
            </Text>
            <Text className="text-green-200/70 text-xs mb-3">Valid on all products storewide</Text>
            <TouchableOpacity
              onPress={() => goToProducts()}
              className="bg-primary self-start px-4 py-2 rounded-xl"
            >
              <Text className="text-white font-bold text-xs">Shop Now →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Recommended Products ── */}
        <View className="mb-6">
          <SectionHeader title="Recommended" emoji="⭐" onSeeAll={() => goToProducts()} />
          <FlatList
            horizontal
            data={PRODUCTS}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => <ProductCard item={item} onPress={() => goToProduct(item.id)} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>

        {/* ── Trending This Week ── */}
        <View className="mb-6">
          <SectionHeader
            title="Trending This Week"
            emoji="🔥"
            onSeeAll={() => goToProducts()}
          />
          <FlatList
            horizontal
            data={TRENDING}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => (
              <View className="relative">
                <View className="absolute top-2 left-2 z-10 bg-orange-500 rounded-full px-2 py-0.5 flex-row items-center gap-1">
                  <Flame size={10} color="white" />
                  <Text className="text-white text-[9px] font-bold">HOT</Text>
                </View>
                <ProductCard item={item} onPress={() => goToProduct(item.id)} />
              </View>
            )}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          />
        </View>

        {/* ── Brands Strip ── */}
        <View className="mb-8">
          <SectionHeader title="Top Brands" emoji="🏆" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {BRANDS.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                className="mr-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 items-center shadow-sm"
                style={{ minWidth: 90 }}
                activeOpacity={0.7}
                onPress={() => goToProducts()}
              >
                <Text className="text-2xl mb-1">{brand.emoji}</Text>
                <Text className="text-xs font-semibold text-gray-700 text-center">{brand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
