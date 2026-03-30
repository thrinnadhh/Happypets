// apps/mobile/app/checkout.tsx — Multi-step Checkout
import { useState } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  SafeAreaView, StatusBar, Alert, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, ChevronRight, CheckCircle2, MapPin, ClipboardList, CreditCard } from "lucide-react-native";
import { useCartStore } from "../store/cart";

const STEPS = [
  { id: 1, label: "Address",  icon: MapPin },
  { id: 2, label: "Review",   icon: ClipboardList },
  { id: 3, label: "Payment",  icon: CreditCard },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Assam","Bihar","Delhi","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha",
  "Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal",
];

interface AddressForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

const emptyAddress: AddressForm = { fullName: "", phone: "", street: "", city: "", state: "", pincode: "" };

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <View className="flex-row items-center justify-center py-4 px-4">
      {STEPS.map((step, i) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;
        const Icon = step.icon;
        return (
          <View key={step.id} className="flex-row items-center">
            <View className="items-center">
              <View
                className={`w-9 h-9 rounded-full items-center justify-center ${
                  done ? "bg-green-500" : active ? "bg-primary" : "bg-gray-200"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={18} color="white" />
                ) : (
                  <Icon size={16} color={active ? "white" : "#9ca3af"} />
                )}
              </View>
              <Text className={`text-[10px] mt-1 font-medium ${active ? "text-primary" : done ? "text-green-600" : "text-gray-400"}`}>
                {step.label}
              </Text>
            </View>
            {i < STEPS.length - 1 && (
              <View className={`w-10 h-0.5 mx-1 mb-4 ${done ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </View>
        );
      })}
    </View>
  );
}

function InputField({ label, value, onChange, placeholder, keyboardType = "default", maxLength }: any) {
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold text-gray-600 mb-1.5">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        maxLength={maxLength}
        className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900"
      />
    </View>
  );
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [loading, setLoading] = useState(false);

  const subtotal = total();
  const shipping = subtotal >= 499 ? 0 : 49;
  const grandTotal = subtotal + shipping;

  const setField = (field: keyof AddressForm) => (val: string) =>
    setAddress((a) => ({ ...a, [field]: val }));

  const validateAddress = () => {
    if (!address.fullName.trim()) { Alert.alert("Required", "Enter your full name"); return false; }
    if (!/^\d{10}$/.test(address.phone)) { Alert.alert("Invalid", "Enter a valid 10-digit phone number"); return false; }
    if (!address.street.trim()) { Alert.alert("Required", "Enter your street address"); return false; }
    if (!address.city.trim()) { Alert.alert("Required", "Enter your city"); return false; }
    if (!address.state) { Alert.alert("Required", "Select a state"); return false; }
    if (!/^\d{6}$/.test(address.pincode)) { Alert.alert("Invalid", "Enter a valid 6-digit pincode"); return false; }
    return true;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Simulate API call to create order + Razorpay order
      await new Promise((r) => setTimeout(r, 1500));
      // In production: call /api/payment/create-order, then open RazorpayCheckout
      Alert.alert("🎉 Order Placed!", "Your order has been confirmed. Order ID: ORD-" + Date.now(), [
        { text: "OK", onPress: () => { clearCart(); router.replace("/(tabs)/orders"); } },
      ]);
    } catch {
      Alert.alert("Error", "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FDF6EC" />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-cream">
        <TouchableOpacity onPress={() => step > 1 ? setStep(s => s - 1) : router.back()} className="p-2 mr-2">
          <ArrowLeft size={20} color="#1a2e1c" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Checkout</Text>
      </View>

      <StepIndicator currentStep={step} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>

        {/* ── Step 1: Address ── */}
        {step === 1 && (
          <View>
            <Text className="text-base font-bold mb-4">Delivery Address</Text>

            <InputField label="Full Name *" value={address.fullName} onChange={setField("fullName")} placeholder="e.g. Aryan Gupta" />
            <InputField label="Phone Number *" value={address.phone} onChange={setField("phone")} placeholder="10-digit mobile number" keyboardType="phone-pad" maxLength={10} />
            <InputField label="Street Address *" value={address.street} onChange={setField("street")} placeholder="House/Flat, Colony, Street" />
            <InputField label="City *" value={address.city} onChange={setField("city")} placeholder="Your city" />

            <View className="mb-3">
              <Text className="text-xs font-semibold text-gray-600 mb-1.5">State *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {INDIAN_STATES.slice(0, 10).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setField("state")(s)}
                    className={`mr-2 px-3 py-2 rounded-xl border ${address.state === s ? "bg-primary border-primary" : "bg-white border-gray-200"}`}
                  >
                    <Text className={`text-xs font-medium ${address.state === s ? "text-white" : "text-gray-700"}`}>{s}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity className="mr-2 px-3 py-2 rounded-xl border border-dashed border-gray-300 bg-gray-50">
                  <Text className="text-xs text-gray-400">More…</Text>
                </TouchableOpacity>
              </ScrollView>
              {address.state ? <Text className="text-xs text-primary mt-1 font-medium">Selected: {address.state}</Text> : null}
            </View>

            <InputField label="Pincode *" value={address.pincode} onChange={setField("pincode")} placeholder="6-digit PIN code" keyboardType="numeric" maxLength={6} />
          </View>
        )}

        {/* ── Step 2: Review ── */}
        {step === 2 && (
          <View>
            <Text className="text-base font-bold mb-4">Review Order</Text>

            {/* Delivery address recap */}
            <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Delivering to</Text>
              <Text className="text-sm font-semibold">{address.fullName}</Text>
              <Text className="text-xs text-gray-500 mt-0.5">{address.street}, {address.city}, {address.state} - {address.pincode}</Text>
              <Text className="text-xs text-gray-500">{address.phone}</Text>
            </View>

            {/* Items */}
            <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Items ({items.length})</Text>
              {items.map((item, i) => (
                <View key={item.id} className={`flex-row justify-between items-center py-2 ${i < items.length - 1 ? "border-b border-gray-50" : ""}`}>
                  <Text className="text-sm text-gray-700 flex-1" numberOfLines={1}>{item.name} × {item.quantity}</Text>
                  <Text className="text-sm font-bold text-gray-900 ml-2">₹{(item.price * item.quantity).toLocaleString("en-IN")}</Text>
                </View>
              ))}
            </View>

            {/* Price breakdown */}
            <View className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Subtotal</Text>
                <Text className="text-sm font-medium">₹{subtotal.toLocaleString("en-IN")}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Shipping</Text>
                <Text className={`text-sm font-medium ${shipping === 0 ? "text-green-600" : ""}`}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </Text>
              </View>
              <View className="h-px bg-gray-100" />
              <View className="flex-row justify-between">
                <Text className="text-base font-bold">Total</Text>
                <Text className="text-base font-bold" style={{ color: "#D4862B" }}>₹{grandTotal.toLocaleString("en-IN")}</Text>
              </View>
            </View>
          </View>
        )}

        {/* ── Step 3: Payment ── */}
        {step === 3 && (
          <View className="items-center py-8">
            <Text className="text-4xl mb-4">💳</Text>
            <Text className="text-base font-bold text-gray-800 mb-2">Payment via Razorpay</Text>
            <Text className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
              You'll be directed to Razorpay's secure payment page to complete payment of{"\n"}
              <Text className="font-bold" style={{ color: "#D4862B" }}>₹{grandTotal.toLocaleString("en-IN")}</Text>
            </Text>

            <View className="w-full bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
              <Text className="text-xs text-green-700 text-center">
                🔒 Secured by Razorpay · UPI, Cards, NetBanking, Wallets accepted
              </Text>
            </View>

            <View className="w-full gap-3">
              {["UPI (GPay, PhonePe, Paytm)", "Credit / Debit Card", "Net Banking", "EMI (0% for 3 months)"].map((m) => (
                <View key={m} className="flex-row items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3">
                  <View className="w-2 h-2 rounded-full bg-green-400" />
                  <Text className="text-sm text-gray-700">{m}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 pt-4"
        style={{ paddingBottom: 28 }}
      >
        {step < 3 ? (
          <TouchableOpacity
            onPress={() => {
              if (step === 1 && !validateAddress()) return;
              setStep((s) => s + 1);
            }}
            className="bg-primary h-13 rounded-2xl items-center justify-center flex-row gap-2"
            style={{ height: 52 }}
          >
            <Text className="text-white font-bold text-sm">
              {step === 1 ? "Continue to Review" : "Proceed to Payment"}
            </Text>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handlePlaceOrder}
            disabled={loading}
            className="bg-primary h-13 rounded-2xl items-center justify-center flex-row gap-2"
            style={{ height: 52, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-sm">Pay ₹{grandTotal.toLocaleString("en-IN")} via Razorpay</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
