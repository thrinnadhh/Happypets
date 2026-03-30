// apps/mobile/app/(tabs)/cart.tsx — Cart Screen
import {
  View, Text, FlatList, TouchableOpacity, SafeAreaView,
  StatusBar, Alert,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react-native";
import { useCartStore } from "../../store/cart";

function CartItem({ item }: { item: { id: string; name: string; price: number; image: string; quantity: number } }) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 flex-row gap-3 shadow-sm border border-gray-100">
      <Image
        source={{ uri: item.image }}
        style={{ width: 80, height: 80, borderRadius: 12 }}
        contentFit="cover"
      />
      <View className="flex-1 gap-1">
        <Text className="text-sm font-bold text-gray-900 leading-snug" numberOfLines={2}>
          {item.name}
        </Text>
        <Text className="text-base font-bold" style={{ color: "#D4862B" }}>
          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
        </Text>
        <Text className="text-xs text-gray-400">₹{item.price.toLocaleString("en-IN")} × {item.quantity}</Text>

        {/* Qty controls */}
        <View className="flex-row items-center gap-3 mt-1">
          <View className="flex-row items-center border border-gray-200 rounded-xl overflow-hidden">
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-8 h-8 items-center justify-center bg-gray-50"
            >
              <Minus size={12} color="#374151" />
            </TouchableOpacity>
            <Text className="w-6 text-center text-sm font-bold">{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 items-center justify-center bg-gray-50"
            >
              <Plus size={12} color="#374151" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            className="ml-auto p-1.5"
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const subtotal = total();
  const shipping = subtotal >= 499 ? 0 : 49;
  const grandTotal = subtotal + shipping;

  if (items.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center px-8">
        <Text className="text-6xl mb-4">🛒</Text>
        <Text className="text-xl font-bold text-gray-800 mb-2">Your cart is empty</Text>
        <Text className="text-sm text-gray-500 text-center mb-6">
          Add products to your cart to checkout
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/products")}
          className="bg-primary px-8 py-3.5 rounded-2xl flex-row items-center gap-2"
        >
          <Text className="text-white font-bold">Browse Products</Text>
          <ArrowRight size={16} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EC" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-xl font-bold">My Cart</Text>
        <TouchableOpacity onPress={() => Alert.alert("Clear Cart", "Remove all items?", [
          { text: "Cancel", style: "cancel" },
          { text: "Clear", style: "destructive", onPress: clearCart },
        ])}>
          <Text className="text-sm text-red-500 font-medium">Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => <CartItem item={item} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 220 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View className="mt-2">
            {/* Free shipping progress */}
            {subtotal < 499 && (
              <View className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-3">
                <Text className="text-xs text-green-700 font-medium">
                  🚚 Add ₹{(499 - subtotal).toLocaleString("en-IN")} more for FREE shipping!
                </Text>
              </View>
            )}
          </View>
        }
      />

      {/* Bottom summary card */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-4"
        style={{ paddingBottom: 28 }}
      >
        {/* Price breakdown */}
        <View className="gap-2 mb-4">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Subtotal</Text>
            <Text className="text-sm font-semibold">₹{subtotal.toLocaleString("en-IN")}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Shipping</Text>
            <Text className={`text-sm font-semibold ${shipping === 0 ? "text-green-600" : ""}`}>
              {shipping === 0 ? "FREE" : `₹${shipping}`}
            </Text>
          </View>
          <View className="h-px bg-gray-100 my-1" />
          <View className="flex-row justify-between">
            <Text className="text-base font-bold">Total</Text>
            <Text className="text-base font-bold" style={{ color: "#D4862B" }}>
              ₹{grandTotal.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/checkout")}
          className="bg-primary h-13 rounded-2xl items-center justify-center flex-row gap-2"
          style={{ height: 52 }}
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-base">Proceed to Checkout</Text>
          <ArrowRight size={18} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
