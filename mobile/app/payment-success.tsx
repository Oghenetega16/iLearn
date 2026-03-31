import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function PaymentSuccessScreen() {
  return (
    <SafeAreaView className="items-center justify-center flex-1 px-6 bg-brand-background">
      
      <View className="items-center w-full p-8 mb-8 bg-white border shadow-sm rounded-3xl border-gray-50">
        <View className="items-center justify-center w-24 h-24 mb-6 rounded-full bg-brand-light">
          <Ionicons name="checkmark-circle" size={60} color="#285A48" />
        </View>
        
        <Text className="mb-2 text-2xl font-kumbh-bold text-brand-dark">Payment Successful!</Text>
        <Text className="mb-6 leading-relaxed text-center font-manrope text-brand-secondary">
          You have successfully enrolled in React Native Mastery. Your receipt has been sent to your email.
        </Text>

        <View className="w-full p-4 mb-2 border border-gray-100 bg-gray-50 rounded-2xl">
          <View className="flex-row justify-between mb-2">
            <Text className="font-manrope text-brand-secondary">Amount Paid</Text>
            <Text className="font-manrope-bold text-brand-dark">$90.00</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="font-manrope text-brand-secondary">Payment Method</Text>
            <Text className="font-manrope-bold text-brand-dark">Apple Pay</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => router.replace({ pathname: "/lesson/[id]", params: { id: '1' } })}
        className="items-center w-full py-4 mb-4 shadow-sm bg-brand-primary rounded-2xl"
      >
        <Text className="text-lg text-white font-manrope-bold">Start Learning Now</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(tabs)/courses')}>
        <Text className="text-base font-manrope-bold text-brand-secondary">Go to My Courses</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}