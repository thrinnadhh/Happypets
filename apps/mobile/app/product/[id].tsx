// apps/mobile/app/product/[id].tsx — Product Detail Screen
import { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Star, ShoppingCart, Heart, Minus, Plus, ChevronRight } from "lucide-react-native";
import { useCartStore } from "../../store/cart";

/* ── Mock products data (in production fetch from API) ─ */
const MOCK_PRODUCT = {
  id: "p1",
  name: "Royal Canin Medium Adult",
  description:
    "Royal Canin Medium Adult is a complete nutritional solution for medium-sized adult dogs (11-25 kg), aged 12 months to 7 years. Formulated with an ideal content of key nutrients, adapted energy levels, and exclusive kibble shape that encourages chewing.",
  price: 1299,
  originalPrice: 1599,
  discount: 19,
  rating: 4.8,
  reviews: 342,
  stock: 45,
  shop: "PawFeast",
  brand: "Royal Canin",
  category: "Dog Food",
  weight: "2 kg",
  images: [
    "https://placehold.co/600x600/FFF3E0/D4862B?text=RC+Main",
    "https://placehold.co/600x600/FFF3E0/D4862B?text=RC+Side",
    "https://placehold.co/600x600/FFF3E0/D4862B?text=RC+Back",
  ],
  features: [
    "Adapted energy content for medium breeds",
    "Exclusive S-shaped kibble for easier chewing",
    "Supports healthy digestion with adapted fibers",
    "Promotes lean muscle mass with balanced proteins",
    "No artificial preservatives or colors",
  ],
};

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const product = MOCK_PRODUCT; // TODO: fetch by id from /api/products/:id
  const [qty, setQty] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const isOOS = product.stock === 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* ScrollView content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Image gallery */}
        <View className="relative">
          <Image
            source={{ uri: product.images[selectedImage] }}
            style={{ width: "100%", height: 340 }}
            contentFit="cover"
            transition={200}
          />
          {/* Overlay header */}
          <View className="absolute top-0 left-0 right-0 flex-row justify-between items-center p-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-black/20 backdrop-blur rounded-full items-center justify-center"
            >
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setWishlisted((w) => !w)}
              className="w-10 h-10 bg-black/20 backdrop-blur rounded-full items-center justify-center"
            >
              <Heart
                size={20}
                color={wishlisted ? "#ef4444" : "white"}
                fill={wishlisted ? "#ef4444" : "transparent"}
              />
            </TouchableOpacity>
          </View>
          {/* Discount badge */}
          {product.discount > 0 && (
            <View className="absolute bottom-4 left-4 bg-red-500 rounded-xl px-3 py-1">
              <Text className="text-white font-bold text-xs">-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* Thumbnail strip */}
        <View className="flex-row gap-2 px-4 py-3">
          {product.images.map((img, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedImage(i)}
              className={`rounded-xl overflow-hidden border-2 ${selectedImage === i ? "border-primary" : "border-gray-200"}`}
              style={{ width: 60, height: 60 }}
            >
              <Image source={{ uri: img }} style={{ width: 60, height: 60 }} contentFit="cover" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Product info */}
        <View className="px-4 gap-3">
          {/* Shop + Category */}
          <View className="flex-row items-center gap-2">
            <View className="bg-green-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs font-bold text-green-700">{product.shop}</Text>
            </View>
            <View className="bg-gray-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs text-gray-500">{product.category}</Text>
            </View>
            <View className="bg-gray-100 px-2.5 py-1 rounded-full">
              <Text className="text-xs text-gray-500">{product.weight}</Text>
            </View>
          </View>

          {/* Name */}
          <Text className="text-xl font-bold text-gray-900 leading-tight">{product.name}</Text>

          {/* Rating */}
          <View className="flex-row items-center gap-2">
            <View className="flex-row gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  color="#D4862B"
                  fill={i <= Math.floor(product.rating) ? "#D4862B" : "transparent"}
                />
              ))}
            </View>
            <Text className="text-sm font-semibold text-gray-800">{product.rating}</Text>
            <Text className="text-xs text-gray-400">({product.reviews} reviews)</Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl font-bold" style={{ color: "#D4862B" }}>
              ₹{product.price.toLocaleString("en-IN")}
            </Text>
            {product.originalPrice > product.price && (
              <Text className="text-base text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </Text>
            )}
            {product.discount > 0 && (
              <Text className="text-sm font-bold text-green-600">
                Save ₹{(product.originalPrice - product.price).toLocaleString("en-IN")}!
              </Text>
            )}
          </View>

          {/* Stock indicator */}
          {product.stock < 20 && product.stock > 0 && (
            <View className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <Text className="text-xs text-amber-700 font-medium">
                ⚠️ Only {product.stock} left in stock!
              </Text>
            </View>
          )}

          {/* Description */}
          <View className="bg-gray-50 rounded-2xl p-4 mt-1">
            <Text className="text-sm font-bold text-gray-800 mb-2">About this product</Text>
            <Text className="text-sm text-gray-600 leading-relaxed">{product.description}</Text>
          </View>

          {/* Features */}
          <View>
            <Text className="text-sm font-bold text-gray-800 mb-2">Key Features</Text>
            {product.features.map((f, i) => (
              <View key={i} className="flex-row gap-2 mb-1.5">
                <Text className="text-primary text-xs mt-0.5">✓</Text>
                <Text className="text-xs text-gray-600 flex-1">{f}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom bar */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex-row items-center gap-3"
        style={{ paddingBottom: 24 }}
      >
        {/* Qty picker */}
        <View className="flex-row items-center border border-gray-200 rounded-2xl overflow-hidden">
          <TouchableOpacity
            onPress={() => setQty((q) => Math.max(1, q - 1))}
            className="w-10 h-10 items-center justify-center bg-gray-50"
          >
            <Minus size={16} color="#374151" />
          </TouchableOpacity>
          <Text className="w-8 text-center font-bold text-sm">{qty}</Text>
          <TouchableOpacity
            onPress={() => setQty((q) => Math.min(product.stock, q + 1))}
            className="w-10 h-10 items-center justify-center bg-gray-50"
          >
            <Plus size={16} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Add to Cart */}
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={isOOS}
          className="flex-1 h-12 rounded-2xl items-center justify-center flex-row gap-2"
          style={{ backgroundColor: added ? "#22c55e" : isOOS ? "#d1d5db" : "#D4862B" }}
          activeOpacity={0.8}
        >
          <ShoppingCart size={18} color="white" />
          <Text className="text-white font-bold text-sm">
            {isOOS ? "Out of Stock" : added ? "Added to Cart!" : `Add to Cart · ₹${(product.price * qty).toLocaleString("en-IN")}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
