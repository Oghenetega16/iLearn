// mobile/app/(auth)/login.tsx
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLogin } from '../../hooks/auth/useLogin';

export default function LoginScreen() {
    const { state, setters, handlers } = useLogin();

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

                <Text className="mb-8 text-2xl text-center font-kumbh-bold text-brand-dark">Log In</Text>

                {/* Input Fields */}
                <View className="mb-2 gap-y-3">
                    <View className="flex-row items-center h-12 px-4 border border-gray-100 bg-gray-50 rounded-xl">
                        <Ionicons name="mail-outline" size={18} color="#8E8E93" />
                        <TextInput 
                            placeholder="Email Address" 
                            placeholderTextColor="#8E8E93"
                            value={state.email}
                            onChangeText={setters.setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            className="flex-1 ml-3 text-sm font-manrope text-brand-dark" 
                        />
                    </View>

                    <View className="flex-row items-center h-12 px-4 border border-gray-100 bg-gray-50 rounded-xl">
                        <Ionicons name="lock-closed-outline" size={18} color="#8E8E93" />
                        <TextInput 
                            placeholder="Password" 
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
                </View>

                {/* Forgot Password */}
                <TouchableOpacity className="items-end mb-8" onPress={() => router.push('/(auth)/forgot-password')}>
                    <Text className="text-xs font-manrope-bold text-brand-dark">Forgot Password?</Text>
                </TouchableOpacity>

                {/* Action Button */}
                <TouchableOpacity 
                    onPress={handlers.signInWithEmail}
                    disabled={state.loading}
                    className={`items-center w-full py-3.5 mb-6 rounded-full shadow-sm ${state.loading ? 'bg-brand-dark/80' : 'bg-brand-dark'}`}
                >
                    {state.loading ? <ActivityIndicator color="#FFF" /> : <Text className="text-base text-white font-manrope-bold">Log In</Text>}
                </TouchableOpacity>

                <Text className="mb-6 text-xs tracking-widest text-center uppercase font-manrope text-brand-secondary">or</Text>

                {/* Social Buttons Section */}
                <View className="mb-8 gap-y-3">
                    <TouchableOpacity onPress={handlers.handleGoogleLogin} className="flex-row items-center w-full h-12 px-6 border border-gray-100 rounded-full bg-gray-50">
                        <Image source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} className="w-5 h-5" resizeMode="contain" />
                        <Text className="flex-1 text-sm text-center font-manrope-bold text-brand-dark">Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handlers.handleAppleLogin} className="flex-row items-center w-full h-12 bg-[#9BFD7B] rounded-full px-6">
                        <Image 
                            source={{ uri: 'https://img.icons8.com/?size=100&id=30659&format=png&color=ffffff' }} 
                            className="w-5 h-5" 
                            style={{ tintColor: 'white' }} 
                            resizeMode="contain" 
                            />
                        <Text className="flex-1 text-sm text-center font-manrope-bold text-brand-dark">Continue with Apple</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handlers.handleGuestLogin} className="flex-row items-center w-full h-12 px-6 border border-gray-100 rounded-full bg-gray-50">
                        <Ionicons name="person-circle-outline" size={22} color="black" />
                        <Text className="flex-1 text-sm text-center font-manrope-bold text-brand-dark">Continue As Guest</Text>
                    </TouchableOpacity>
                </View>

                    {/* Footer */}
                <View className="flex-row justify-center pb-12">
                    <Text className="text-xs font-manrope text-brand-secondary">Don&apos;t have an account? </Text>
                    <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                        <Text className="text-xs font-manrope-bold text-brand-dark">Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}