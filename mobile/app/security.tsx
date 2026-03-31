import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

export default function SecurityScreen() {
  const [biometric, setBiometric] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Security</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">

        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">App Access</Text>
        
        <View className="mb-8 overflow-hidden bg-white border shadow-sm rounded-3xl border-gray-50">
          <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="items-center justify-center w-10 h-10 mr-4 rounded-full bg-brand-light">
                <Ionicons name="finger-print-outline" size={20} color="#285A48" />
              </View>
              <Text className="text-base font-manrope-bold text-brand-dark">Biometric Login</Text>
            </View>
            <Switch 
              value={biometric} 
              onValueChange={setBiometric} 
              trackColor={{ false: '#E5E5EA', true: '#285A48' }}
              thumbColor="#FFFFFF"
            />
          </View>
          <View className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center">
              <View className="items-center justify-center w-10 h-10 mr-4 rounded-full bg-brand-light">
                <Ionicons name="phone-portrait-outline" size={20} color="#285A48" />
              </View>
              <View>
                <Text className="text-base font-manrope-bold text-brand-dark">Two-Factor Auth</Text>
                <Text className="mt-1 text-xs font-manrope text-brand-primary">Highly Recommended</Text>
              </View>
            </View>
            <Switch 
              value={twoFactor} 
              onValueChange={setTwoFactor} 
              trackColor={{ false: '#E5E5EA', true: '#285A48' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Account</Text>
        
        <TouchableOpacity className="flex-row items-center justify-between p-5 mb-3 bg-white border shadow-sm rounded-2xl border-gray-50">
          <View className="flex-row items-center">
            <View className="items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
              <Ionicons name="lock-closed-outline" size={20} color="#091413" />
            </View>
            <Text className="text-base font-manrope-bold text-brand-dark">Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between p-5 bg-white border shadow-sm rounded-2xl border-gray-50">
          <View className="flex-row items-center">
            <View className="items-center justify-center w-10 h-10 mr-4 bg-gray-100 rounded-full">
              <Ionicons name="time-outline" size={20} color="#091413" />
            </View>
            <Text className="text-base font-manrope-bold text-brand-dark">Device History</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}