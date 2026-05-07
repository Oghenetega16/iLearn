// mobile/app/(auth)/change-password.tsx
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useChangePassword } from '@/hooks/profile/useChangePassword';

export default function ChangePasswordScreen() {
  const { state, setters, handlers } = useChangePassword();

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Change Password</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 px-6 pt-8">
        
        <View className="mb-6">
          <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">New Password</Text>
          <View className="flex-row items-center px-4 py-2 bg-white border border-gray-200 shadow-sm h-14 rounded-2xl">
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" className="mr-3" />
            <TextInput 
              value={state.newPassword}
              onChangeText={setters.setNewPassword}
              placeholder="Enter new password"
              secureTextEntry={!state.showPassword}
              placeholderTextColor="#8E8E93"
              className="flex-1 text-base font-manrope text-brand-dark" 
            />
            <TouchableOpacity onPress={() => setters.setShowPassword(!state.showPassword)}>
              <Ionicons name={state.showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8">
          <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Confirm New Password</Text>
          <View className="flex-row items-center px-4 py-2 bg-white border border-gray-200 shadow-sm h-14 rounded-2xl">
            <Ionicons name="shield-checkmark-outline" size={20} color="#8E8E93" className="mr-3" />
            <TextInput 
              value={state.confirmPassword}
              onChangeText={setters.setConfirmPassword}
              placeholder="Confirm new password"
              secureTextEntry={!state.showPassword}
              placeholderTextColor="#8E8E93"
              className="flex-1 text-base font-manrope text-brand-dark" 
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handlers.handleChangePassword}
          disabled={state.loading}
          className="items-center justify-center w-full shadow-sm h-14 bg-brand-primary rounded-2xl"
        >
          {state.loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-lg text-white font-manrope-bold">Update Password</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}