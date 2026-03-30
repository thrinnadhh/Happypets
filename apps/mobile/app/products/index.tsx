// apps/mobile/app/products/index.tsx — Product Listing
import { useState, useRef, useCallback, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity, TextInput,
  SafeAreaView, StatusBar, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Search, SlidersHorizontal, ArrowLeft, Check } from "lucide-react-native";
import ProductCard from "../../components/ProductCard";

/* ── Mock product data ─────────────────────── */
const ALL_PRODUCTS = [
  { id: "p1", name: "Royal Canin Medium Adult 2kg", price: 1299, originalPrice: 1599, rating: 4.8, reviews: 342, shop: "PawFeast", image: "https://placehold.co/300x300/FFF3E0/D4862B?text=RC", discount: 19, category: "dog_food", brand: "Royal Canin", stock: 45 },
  { id: "p2", name: "Whiskas Kitten Ocean Fish 400g", price: 349, originalPrice: 399, rating: 4.5, reviews: 187, shop: "PetMart", image: "https://placehold.co/300x300/F3E5F5/9C27B0?text=WK", discount: 13, category: "cat_food", brand: "Whiskas", stock: 8 },
  { id: "p3", name: "Drools Focus Puppy 1kg", price: 649, originalPrice: 799, rating: 4.6, reviews: 215, shop: "PawFeast", image: "https://placehold.co/300x300/E8F5E9/2C4A2E?text=DF", discount: 19, category: "dog_food", brand: "Drools", stock: 30 },
  { id: "p4", name: "Farmina N&D Cat Ancestral 1.5kg", price: 2499, originalPrice: 2799, rating: 4.9, reviews: 98, shop: "NutriVet", image: "https://placehold.co/300x300/FFF9C4/F57F17?text=FN", discount: 11, category: "cat_food", brand: "Farmina", stock: 12 },
  { id: "p5", name: "Pedigree Dentastix M/L 7 sticks", price: 199, originalPrice: 249, rating: 4.4, reviews: 521, shop: "PetMart", image: "https://placehold.co/300x300/E3F2FD/1565C0?text=PD", discount: 20, category: "dog_food", brand: "Pedigree", stock: 120 },
  { id: "p6", name: "Vitapol Budgie Seed Mix 500g", price: 280, originalPrice: 320, rating: 4.3, reviews: 76, shop: "BirdNest", image: "https://placehold.co/300x300/E8F5E9/388E3C?text=VB", discount: 13, category: "bird_food", brand: "Vitapol", stock: 5 },
  { id: "p7", name: "Taiyo Goldfish Colour Pellets", price: 129, originalPrice: 149, rating: 4.5, reviews: 143, shop: "FurFit", image: "https://placehold.co/300x300/E0F7FA/006064?text=TG", discount: 13, category: "fish_food", brand: "Taiyo", stock: 33 },
  { id: "p8", name: "NutriPet Hamster Mix 500g", price: 229, originalPrice: 299, rating: 4.2, reviews: 54, shop: "FurFit", image: "https://placehold.co/300x300/FFF3E0/5D4037?text=NH", discount: 23, category: "hamster_food", brand: "NutriPet", stock: 18 },
];

const SORT_OPTIONS = [
  { id: "relevance", label: "Relevance" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "rating", label: "Highest Rated" },
  { id: "discount", label: "Best Discount" },
];

const CATEGORY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "dog_food", label: "🐕 Dog Food" },
  { id: "cat_food", label: "🐈 Cat Food" },
  { id: "bird_food", label: "🦜 Bird Food" },
  { id: "fish_food", label: "🐟 Fish Food" },
  { id: "hamster_food", label: "🐹 Hamster" },
];

export default function ProductListingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string; q?: string }>();

  const [search, setSearch] = useState(params.q || "");
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCategory, setSelectedCategory] = useState(params.category || "all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

  const filterRef = useRef<BottomSheet>(null);
  const sortRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%"], []);

  const filtered = useMemo(() => {
    let list = [...ALL_PRODUCTS];
    if (search) list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()));
    if (selectedCategory !== "all") list = list.filter((p) => p.category === selectedCategory);
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "discount") list.sort((a, b) => b.discount - a.discount);
    return list;
  }, [search, selectedCategory, priceRange, sortBy]);

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EC" />

      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pt-2 pb-3 bg-cream">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <ArrowLeft size={20} color="#1a2e1c" />
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center bg-white border border-gray-200 rounded-2xl px-3 h-11">
          <Search size={16} color="#9ca3af" />
          <TextInput
            placeholder="Search products…"
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-2 text-sm text-gray-900"
          />
        </View>
      </View>

      {/* Filter/Sort toolbar */}
      <View className="flex-row gap-2 px-4 pb-3">
        <TouchableOpacity
          onPress={() => filterRef.current?.expand()}
          className="flex-row items-center gap-1.5 border border-gray-300 rounded-xl px-3 py-2 bg-white"
        >
          <SlidersHorizontal size={14} color="#374151" />
          <Text className="text-xs font-semibold text-gray-700">Filter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => sortRef.current?.expand()}
          className="flex-row items-center gap-1.5 border border-gray-300 rounded-xl px-3 py-2 bg-white"
        >
          <Text className="text-xs font-semibold text-gray-700">
            Sort: {SORT_OPTIONS.find((s) => s.id === sortBy)?.label}
          </Text>
        </TouchableOpacity>
        <Text className="ml-auto text-xs text-gray-400 self-center">{filtered.length} results</Text>
      </View>

      {/* Category chips scroll */}
      <View className="mb-3 pl-4">
        <FlatList
          horizontal
          data={CATEGORY_OPTIONS}
          keyExtractor={(i) => i.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.id)}
              className={`mr-2 px-4 py-2 rounded-full border ${selectedCategory === item.id ? "bg-primary border-primary" : "bg-white border-gray-200"}`}
            >
              <Text className={`text-xs font-semibold ${selectedCategory === item.id ? "text-white" : "text-gray-600"}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product grid */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => (
          <View style={{ flex: 1 }}>
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item.id}`)}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="py-20 items-center">
            <Text className="text-4xl mb-3">🔍</Text>
            <Text className="text-base font-bold text-gray-700">No products found</Text>
            <Text className="text-xs text-gray-400 mt-1">Try adjusting your filters</Text>
          </View>
        }
      />

      {/* Filter Bottom Sheet */}
      <BottomSheet ref={filterRef} index={-1} snapPoints={snapPoints} enablePanDownToClose>
        <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
          <Text className="text-base font-bold mb-5">Filters</Text>
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Category</Text>
          {CATEGORY_OPTIONS.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              <Text className="text-sm text-gray-800">{cat.label}</Text>
              {selectedCategory === cat.id && <Check size={16} color="#D4862B" />}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={() => { setSelectedCategory("all"); setPriceRange([0, 5000]); filterRef.current?.close(); }}
            className="mt-6 bg-primary rounded-2xl py-3 items-center"
          >
            <Text className="text-white font-bold">Apply Filters</Text>
          </TouchableOpacity>
        </BottomSheetScrollView>
      </BottomSheet>

      {/* Sort Bottom Sheet */}
      <BottomSheet ref={sortRef} index={-1} snapPoints={snapPoints} enablePanDownToClose>
        <BottomSheetScrollView contentContainerStyle={{ padding: 20 }}>
          <Text className="text-base font-bold mb-5">Sort By</Text>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => { setSortBy(opt.id); sortRef.current?.close(); }}
              className="flex-row items-center justify-between py-3.5 border-b border-gray-100"
            >
              <Text className={`text-sm ${sortBy === opt.id ? "font-bold text-primary" : "text-gray-800"}`}>
                {opt.label}
              </Text>
              {sortBy === opt.id && <Check size={16} color="#D4862B" />}
            </TouchableOpacity>
          ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
