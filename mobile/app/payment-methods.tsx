// mobile/app/(tabs)/payment-methods.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePurchases } from '@/hooks/profile/usePurchases';

export default function PaymentMethodsScreen() {
  const { state, handlers } = usePurchases();

  if (state.loading && state.packages.length === 0) {
    return (
      <View className="items-center justify-center flex-1 bg-brand-background">
        <ActivityIndicator size="large" color="#285A48" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="#091413" />
          </TouchableOpacity>
          <Text className="text-xl font-kumbh-bold text-brand-dark">Billing & Plans</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
        
        {/* Current Plan Status */}
        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Current Status</Text>
        <View className={`relative p-6 mb-8 overflow-hidden bg-white border-2 shadow-sm rounded-3xl ${state.isPremium ? 'border-brand-primary' : 'border-gray-200'}`}>
          {state.isPremium && (
            <View className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-2xl bg-brand-primary">
              <Text className="text-xs tracking-wider text-white font-manrope-bold">ACTIVE</Text>
            </View>
          )}
          
          <View className="flex-row items-center mt-2 mb-4">
            <Ionicons name={state.isPremium ? "star" : "person"} size={28} color={state.isPremium ? "#285A48" : "#8E8E93"} className="mr-3" />
            <Text className="text-xl tracking-widest font-kumbh-bold text-brand-dark">
              {state.isPremium ? 'iLearn Pro' : 'iLearn Free Tier'}
            </Text>
          </View>
          
          <Text className="text-sm leading-relaxed font-manrope text-brand-secondary">
            {state.isPremium 
              ? 'You have unlimited access to all advanced courses and certifications.'
              : 'You are currently on the free tier. Upgrade to access premium features.'}
          </Text>
        </View>

        {/* Native Billing Info */}
        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Payment Method</Text>
        <View className="flex-row items-center justify-between p-4 mb-8 bg-white border border-gray-100 shadow-sm rounded-3xl">
          <View className="flex-row items-center">
            <View className="items-center justify-center w-12 h-12 mr-4 bg-gray-100 rounded-full">
              <Ionicons name={Platform.OS === 'ios' ? "logo-apple" : "logo-google"} size={24} color="#091413" />
            </View>
            <View>
              <Text className="text-base font-kumbh-bold text-brand-dark">
                {Platform.OS === 'ios' ? 'Apple App Store' : 'Google Play Billing'}
              </Text>
              <Text className="mt-1 text-xs font-manrope text-brand-secondary">Managed by your device</Text>
            </View>
          </View>
          <Ionicons name="shield-checkmark" size={20} color="#285A48" />
        </View>

        {/* Available Upgrades */}
        {!state.isPremium && state.packages.length > 0 && (
          <>
            <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Available Upgrades</Text>
            {state.packages.map((pack) => (
              <TouchableOpacity 
                key={pack.identifier}
                onPress={() => handlers.purchasePackage(pack)}
                className="p-5 mb-4 bg-white border border-gray-100 shadow-sm rounded-3xl"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-lg font-kumbh-bold text-brand-dark">{pack.product.title}</Text>
                  <Text className="text-lg font-kumbh-bold text-brand-primary">{pack.product.priceString}</Text>
                </View>
                <Text className="text-sm font-manrope text-brand-secondary">{pack.product.description}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
        
        <View className="h-12" />
      </ScrollView>

      {/* Footer Restorer */}
      <View className="px-6 pt-4 pb-8 bg-white border-t border-gray-100">
        <TouchableOpacity 
          onPress={handlers.restorePurchases}
          className="items-center w-full py-4 bg-transparent"
        >
          <Text className="text-sm font-manrope-bold text-brand-secondary">Restore Previous Purchases</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}