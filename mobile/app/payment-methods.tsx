import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PaymentMethodsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#091413" />
          </TouchableOpacity>
          <Text className="text-xl font-kumbh-bold text-brand-dark">Payment Methods</Text>
        </View>
        <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full bg-brand-light">
          <Ionicons name="add" size={24} color="#285A48" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
        
        {/* Active Credit Card */}
        <View className="relative p-6 mb-4 overflow-hidden bg-white border-2 shadow-sm rounded-3xl border-brand-primary">
          <View className="absolute top-0 right-0 bg-brand-primary px-4 py-1.5 rounded-bl-2xl">
            <Text className="text-xs tracking-wider text-white font-manrope-bold">DEFAULT</Text>
          </View>
          
          <View className="flex-row items-center mt-2 mb-8">
            <Ionicons name="card" size={28} color="#285A48" className="mr-3" />
            <Text className="text-xl tracking-widest font-kumbh-bold text-brand-dark">•••• •••• •••• 4242</Text>
          </View>
          
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="mb-1 text-xs font-manrope text-brand-secondary">Card Holder</Text>
              <Text className="text-base font-kumbh-bold text-brand-dark">Oghenetega</Text>
            </View>
            <View>
              <Text className="mb-1 text-xs font-manrope text-brand-secondary">Expires</Text>
              <Text className="text-base font-kumbh-bold text-brand-dark">12/28</Text>
            </View>
            <View className="items-center justify-center w-12 h-8 bg-gray-100 rounded-md">
              <Text className="italic font-kumbh-bold text-brand-primary">VISA</Text>
            </View>
          </View>
        </View>

        {/* Apple Pay Row */}
        <View className="flex-row items-center justify-between p-4 mb-4 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <View className="flex-row items-center">
            <View className="items-center justify-center w-12 h-12 mr-4 bg-gray-100 rounded-full">
              <Ionicons name="logo-apple" size={24} color="#091413" />
            </View>
            <Text className="text-base font-kumbh-bold text-brand-dark">Apple Pay</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </View>

      </ScrollView>

      {/* Footer Button */}
      <View className="px-6 pt-4 pb-8 bg-white border-t border-gray-100">
        <TouchableOpacity className="items-center w-full py-4 border bg-brand-light rounded-2xl border-brand-primary/20">
          <Text className="text-lg font-manrope-bold text-brand-primary">Add New Card</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}