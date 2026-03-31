import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
          
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Ionicons name="arrow-back" size={24} color="#091413" />
          </TouchableOpacity>

          <Text className="mb-2 text-3xl font-kumbh-bold text-brand-dark">Reset Password</Text>
          <Text className="mb-8 text-sm leading-relaxed font-manrope text-brand-secondary">
            Enter the email address associated with your account and we will send you a link to reset your password.
          </Text>

          <View className="mb-8">
            <View className="flex-row items-center px-4 py-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
              <Ionicons name="mail-outline" size={20} color="#8E8E93" className="mr-3" />
              <TextInput 
                placeholder="Email Address" 
                placeholderTextColor="#8E8E93"
                keyboardType="email-address" 
                autoCapitalize="none" 
                className="flex-1 text-base font-manrope text-brand-dark" 
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => router.back()} 
            className="items-center w-full py-4 shadow-sm bg-brand-primary rounded-2xl"
          >
            <Text className="text-lg text-white font-manrope-bold">Send Reset Link</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}