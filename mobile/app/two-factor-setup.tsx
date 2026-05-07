// mobile/app/(auth)/two-factor-setup.tsx
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SvgXml } from 'react-native-svg';
import { useTwoFactor } from '@/hooks/profile/useTwoFactor';

export default function TwoFactorSetupScreen() {
  const { state, setters, handlers } = useTwoFactor();

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Setup 2FA</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="px-6 pt-6">
          
          <Text className="mb-2 text-xl font-kumbh-bold text-brand-dark">Secure your account</Text>
          <Text className="mb-8 leading-relaxed font-manrope text-brand-secondary">
            Open your authenticator app (like Google Authenticator or Authy) and scan the QR code below.
          </Text>

          {/* QR Code Container */}
          <View className="items-center justify-center p-6 mb-8 bg-white border border-gray-100 shadow-sm rounded-3xl">
            {state.qrCode ? (
              <SvgXml xml={state.qrCode} width="200" height="200" />
            ) : (
              <View className="items-center justify-center w-[200px] h-[200px]">
                <ActivityIndicator size="large" color="#285A48" />
              </View>
            )}
            
            <Text className="mt-6 text-sm font-manrope-semi text-brand-secondary">Can't scan? Use this setup key:</Text>
            <Text className="mt-2 text-base tracking-widest font-kumbh-bold text-brand-dark">{state.secret || '...'}</Text>
          </View>

          {/* Verification Input */}
          <View className="mb-8">
            <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Enter 6-digit code</Text>
            <View className="flex-row items-center px-4 py-2 bg-white border border-gray-200 shadow-sm h-14 rounded-2xl">
              <Ionicons name="keypad-outline" size={20} color="#8E8E93" className="mr-3" />
              <TextInput 
                value={state.verifyCode}
                onChangeText={setters.setVerifyCode}
                placeholder="000000"
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor="#8E8E93"
                className="flex-1 text-xl tracking-widest font-kumbh-bold text-brand-dark" 
              />
            </View>
          </View>

          <TouchableOpacity 
            onPress={handlers.handleVerify}
            disabled={state.loading || state.verifyCode.length !== 6}
            className={`items-center justify-center w-full shadow-sm h-14 rounded-2xl mb-12 ${state.verifyCode.length === 6 ? 'bg-brand-primary' : 'bg-gray-300'}`}
          >
            {state.loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-lg text-white font-manrope-bold">Verify & Enable</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}