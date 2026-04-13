// mobile/app/(auth)/forgot-password.tsx
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForgotPassword } from '../../hooks/auth/useForgotPassword';

export default function ForgotPasswordScreen() {
    const { state, setters, handlers } = useForgotPassword();

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

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
                
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

                    <Text className="mb-2 text-3xl text-center font-kumbh-bold text-brand-dark">Reset Password</Text>
                    <Text className="mb-8 text-sm leading-relaxed text-center font-manrope text-brand-secondary">
                        Enter the email address associated with your account and we will send you a link to reset your password.
                    </Text>

                    <View className="flex-row items-center h-12 px-4 border border-[#0000001A] bg-gray-50 rounded-xl">
                        <Ionicons name="mail-outline" size={18} color="#8E8E93" />
                        <TextInput 
                            placeholder="Email Address" 
                            placeholderTextColor="#8E8E93"
                            keyboardType="email-address" 
                            autoCapitalize="none" 
                            value={state.email}
                            onChangeText={setters.setEmail}
                            className="flex-1 ml-3 text-base font-manrope text-brand-dark"
                        />
                    </View>

                    <TouchableOpacity 
                        onPress={handlers.handleResetPassword} 
                        disabled={state.loading}
                        className={`items-center w-full py-3.5 my-6 shadow-sm rounded-2xl ${state.loading ? 'bg-brand-dark/80' : 'bg-brand-dark'}`}
                    >
                        {state.loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text className="text-base text-white font-manrope-bold">Send Reset Link</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}