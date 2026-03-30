// apps/mobile/components/ProductCard.tsx
// Reusable React Native ProductCard
import { TouchableOpacity, View, Text } from "react-native";
import { Image } from "expo-image";
import { Star, ShoppingCart } from "lucide-react-native";
import { useCartStore } from "../store/cart";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  shop: string;
  image: string;
  discount?: number;
  stock?: number;
}

interface Props {
  product: Product;
  onPress: () => void;
  compact?: boolean;
}

export default function ProductCard({ product, onPress, compact = false }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: any) => {
    e.stopPropagation?.();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
      activeOpacity={0.85}
    >
      {/* Product image */}
      <View className="relative">
        <Image
          source={{ uri: product.image }}
          style={{ width: "100%", height: compact ? 120 : 160 }}
          contentFit="cover"
          transition={300}
        />
        {/* Discount badge */}
        {product.discount && product.discount > 0 && (
          <View className="absolute top-2 left-2 bg-red-500 rounded-lg px-2 py-0.5">
            <Text className="text-white text-[10px] font-bold">-{product.discount}%</Text>
          </View>
        )}
        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <View className="absolute inset-0 bg-black/40 items-center justify-center">
            <Text className="text-white font-bold text-xs">Out of Stock</Text>
          </View>
        )}
      </View>

      <View className="p-3 gap-1">
        {/* Shop tag */}
        <Text className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
          {product.shop}
        </Text>

        {/* Product name */}
        <Text
          className="text-sm font-bold text-gray-900 leading-snug"
          numberOfLines={compact ? 1 : 2}
        >
          {product.name}
        </Text>

        {/* Rating */}
        <View className="flex-row items-center gap-1">
          <Star size={11} color="#D4862B" fill="#D4862B" />
          <Text className="text-xs text-gray-500">
            {product.rating} ({product.reviews})
          </Text>
        </View>

        {/* Price + Cart */}
        <View className="flex-row items-center justify-between mt-1">
          <View>
            <Text className="text-base font-bold" style={{ color: "#D4862B" }}>
              ₹{product.price.toLocaleString("en-IN")}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text className="text-xs text-gray-400 line-through">
                ₹{product.originalPrice}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={handleAddToCart}
            className="w-8 h-8 rounded-xl items-center justify-center"
            style={{ backgroundColor: "#D4862B" }}
            disabled={product.stock === 0}
            activeOpacity={0.7}
          >
            <ShoppingCart size={14} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
