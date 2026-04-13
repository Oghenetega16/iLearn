// mobile/app/(auth)/reset-password-confirm.tsx
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useResetPasswordConfirm } from '../../hooks/auth/useResetPasswordConfirm';

export default function ResetPasswordConfirmScreen() {
    const { state, setters, handlers } = useResetPasswordConfirm();

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Decorative Background Elements */}
            <View 
                className="absolute w-64 h-64 rounded-full -top-20 -right-20 bg-brand-light/30" 
                style={{ transform: [{ scale: 1.5 }] }}
            />
            <View 
                className="absolute rounded-full top-1/2 -left-32 w-80 h-80 bg-brand-secondary/5" 
            />

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>

                {/* Header Navigation */}
                <TouchableOpacity onPress={() => router.back()} className="mb-2">
                    <Ionicons name="arrow-back" size={24} color="#091413" />
                </TouchableOpacity>

                {/* Illustration Section */}
                <View className="items-center mb-6">
                    <Image 
                        source={{ uri: 'https://ouch-cdn2.icons8.com/mY77H3L2j_8I9r7pBqS9X1X5G7zZ9k1Y3h8o9L5e4yA/rs:fit:456:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvMTYx/LzYyZDEzN2E0LTk1/ZjItNDY4OC1iN2Ex/LTVmZjI0YmE0YzFm/NC5zdmc.png' }} 
                        className="w-40 h-40"
                        resizeMode="contain"
                    />
                </View>

                <Text className="mb-2 text-3xl text-center font-kumbh-bold text-brand-dark">New Password</Text>
                <Text className="mb-8 text-sm text-center font-manrope text-brand-secondary">
                    Set a strong password to secure your iLearn account.
                </Text>

                <View className="mb-6 gap-y-4">
                    {/* New Password Input */}
                    <View className="flex-row items-center h-12 px-4 border border-gray-100 bg-gray-50 rounded-xl">
                        <Ionicons name="lock-closed-outline" size={18} color="#8E8E93" />
                        <TextInput 
                            placeholder="New Password" 
                            placeholderTextColor="#8E8E93"
                            secureTextEntry={!state.showPassword}
                            value={state.password}
                            onChangeText={setters.setPassword}
                            className="flex-1 ml-3 text-sm font-manrope text-brand-dark" 
                        />
                        <TouchableOpacity onPress={() => setters.setShowPassword(!state.showPassword)}>
                            <Ionicons name={state.showPassword ? "eye-outline" : "eye-off-outline"} size={18} color="#8E8E93" />
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password Input */}
                    <View className="flex-row items-center h-12 px-4 border border-gray-100 bg-gray-50 rounded-xl">
                        <Ionicons name="shield-checkmark-outline" size={18} color="#8E8E93" />
                        <TextInput 
                            placeholder="Confirm New Password" 
                            placeholderTextColor="#8E8E93"
                            secureTextEntry={!state.showPassword}
                            value={state.confirmPassword}
                            onChangeText={setters.setConfirmPassword}
                            className="flex-1 ml-3 text-sm font-manrope text-brand-dark" 
                        />
                    </View>
                </View>

                <TouchableOpacity 
                    onPress={handlers.handleUpdatePassword}
                    disabled={state.loading}
                    className={`items-center w-full py-4 mb-6 rounded-full shadow-sm ${state.loading ? 'bg-brand-dark/80' : 'bg-brand-dark'}`}
                >
                    {state.loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text className="text-base text-white font-manrope-bold">Update Password</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}