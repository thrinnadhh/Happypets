// apps/mobile/components/shared/PriceDisplay.tsx
import { View, Text } from "react-native";

interface Props {
  price: number;
  originalPrice?: number;
  size?: "sm" | "md" | "lg";
}

const FONT_SIZES = {
  sm: { price: "text-sm", original: "text-xs" },
  md: { price: "text-base", original: "text-xs" },
  lg: { price: "text-2xl", original: "text-sm" },
};

export function PriceDisplay({ price, originalPrice, size = "md" }: Props) {
  const fonts = FONT_SIZES[size];
  const discount = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <View className="flex-row items-baseline gap-2 flex-wrap">
      <Text className={`${fonts.price} font-bold`} style={{ color: "#D4862B" }}>
        ₹{price.toLocaleString("en-IN")}
      </Text>
      {originalPrice && originalPrice > price && (
        <>
          <Text className={`${fonts.original} text-gray-400 line-through`}>
            ₹{originalPrice.toLocaleString("en-IN")}
          </Text>
          <Text className="text-[10px] font-bold text-green-600">-{discount}%</Text>
        </>
      )}
    </View>
  );
}

// apps/mobile/components/shared/StockBadge.tsx
interface StockProps { stock: number; }
export function StockBadge({ stock }: StockProps) {
  if (stock === 0) return (
    <View className="bg-red-100 px-2.5 py-1 rounded-full self-start">
      <Text className="text-[10px] font-bold text-red-700">Out of Stock</Text>
    </View>
  );
  if (stock < 10) return (
    <View className="bg-amber-100 px-2.5 py-1 rounded-full self-start">
      <Text className="text-[10px] font-bold text-amber-700">Only {stock} left</Text>
    </View>
  );
  return (
    <View className="bg-green-100 px-2.5 py-1 rounded-full self-start">
      <Text className="text-[10px] font-bold text-green-700">In Stock</Text>
    </View>
  );
}

// apps/mobile/components/shared/RatingStars.tsx
import { Star } from "lucide-react-native";
interface RatingProps { rating: number; reviews?: number; size?: number; }
export function RatingStars({ rating, reviews, size = 12 }: RatingProps) {
  return (
    <View className="flex-row items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          color="#D4862B"
          fill={i <= Math.floor(rating) ? "#D4862B" : "transparent"}
        />
      ))}
      <Text className="text-xs text-gray-500 ml-1">
        {rating}{reviews !== undefined ? ` (${reviews})` : ""}
      </Text>
    </View>
  );
}

// apps/mobile/components/shared/CategoryPill.tsx
interface CategoryProps { label: string; emoji?: string; active?: boolean; onPress?: () => void; }
export function CategoryPill({ label, emoji, active, onPress }: CategoryProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center gap-1.5 px-4 py-2 rounded-full border mr-2 ${
        active ? "bg-primary border-primary" : "bg-white border-gray-200"
      }`}
      activeOpacity={0.7}
    >
      {emoji && <Text style={{ fontSize: 13 }}>{emoji}</Text>}
      <Text className={`text-xs font-semibold ${active ? "text-white" : "text-gray-600"}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// apps/mobile/components/shared/ShopTag.tsx
interface ShopTagProps { name: string; }
export function ShopTag({ name }: ShopTagProps) {
  return (
    <View className="bg-secondary/10 px-2.5 py-1 rounded-full self-start">
      <Text className="text-[10px] font-bold" style={{ color: "#2C4A2E" }}>
        🏪 {name}
      </Text>
    </View>
  );
}
