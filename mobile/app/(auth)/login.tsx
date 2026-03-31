// mobile/app/(auth)/login.tsx
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>

        <Text className="mb-2 text-3xl font-kumbh-bold text-brand-dark">Welcome back</Text>
        <Text className="mb-8 text-sm font-manrope text-brand-secondary">
          Log in to continue your learning progress.
        </Text>

        <View className="gap-4 mb-3">
          <View className="flex-row items-center px-4 py-4 bg-white border border-gray-200 rounded-2xl">
            <Ionicons name="mail-outline" size={20} color="#8E8E93" className="mr-3" />
            <TextInput 
              placeholder="Email Address" 
              placeholderTextColor="#8E8E93"
              keyboardType="email-address" 
              autoCapitalize="none" 
              className="flex-1 text-base font-manrope text-brand-dark" 
            />
          </View>

          <View className="flex-row items-center px-4 py-4 bg-white border border-gray-200 rounded-2xl">
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" className="mr-3" />
            <TextInput 
              placeholder="Password" 
              placeholderTextColor="#8E8E93"
              secureTextEntry 
              className="flex-1 text-base font-manrope text-brand-dark" 
            />
            <Ionicons name="eye-off-outline" size={20} color="#8E8E93" />
          </View>
        </View>

        <TouchableOpacity className="items-end mb-8">
          <Text className="text-sm font-manrope-semi text-brand-primary">Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.replace('/(tabs)')} 
          className="items-center w-full py-4 mb-6 shadow-sm bg-brand-primary rounded-2xl"
        >
          <Text className="text-lg text-white font-manrope-bold">Sign in</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center gap-6 mb-8">
          <TouchableOpacity className="items-center justify-center bg-white border border-gray-200 rounded-full w-14 h-14">
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity className="items-center justify-center bg-white border border-gray-200 rounded-full w-14 h-14">
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center pb-8">
          <Text className="font-manrope text-brand-secondary">Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text className="font-manrope-bold text-brand-primary">Sign up</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}