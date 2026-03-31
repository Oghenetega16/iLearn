import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="text-xl font-kumbh-bold text-brand-dark">Checkout</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Order Summary</Text>
        <View className="p-4 mb-8 bg-white border shadow-sm rounded-2xl border-gray-50">
          <View className="flex-row justify-between mb-2">
            <Text className="text-base font-manrope-semi text-brand-dark">React Native Mastery</Text>
            <Text className="text-base font-manrope-bold text-brand-dark">$90.00</Text>
          </View>
          <View className="flex-row justify-between pb-4 mb-4 border-b border-gray-100">
            <Text className="font-manrope text-brand-secondary">Tax</Text>
            <Text className="font-manrope text-brand-secondary">$0.00</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-lg font-kumbh-bold text-brand-dark">Total</Text>
            <Text className="text-lg font-kumbh-bold text-brand-primary">$90.00</Text>
          </View>
        </View>

        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Payment Method</Text>
        
        <TouchableOpacity className="flex-row items-center p-4 mb-3 bg-white border-2 shadow-sm rounded-2xl border-brand-primary">
          <View className="items-center justify-center w-10 h-10 mr-4 rounded-full bg-brand-light">
            <Ionicons name="card" size={20} color="#285A48" />
          </View>
          <Text className="flex-1 text-base font-manrope-bold text-brand-dark">Credit Card</Text>
          <Ionicons name="checkmark-circle" size={24} color="#285A48" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center p-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
          <View className="items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
            <Ionicons name="logo-apple" size={20} color="#091413" />
          </View>
          <Text className="flex-1 text-base font-manrope-bold text-brand-dark">Apple Pay</Text>
          <View className="w-6 h-6 border-2 border-gray-200 rounded-full" />
        </TouchableOpacity>
      </ScrollView>

      <View className="px-6 pt-4 pb-8 bg-white border-t border-gray-100">
        <TouchableOpacity 
          onPress={() => router.replace({ pathname: "/lesson/[id]", params: { id: id as string } })}
          className="items-center w-full py-4 shadow-sm bg-brand-primary rounded-2xl"
        >
          <Text className="text-lg text-white font-manrope-bold">Confirm Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}