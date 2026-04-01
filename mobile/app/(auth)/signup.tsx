// mobile/app/(auth)/signup.tsx
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import CountryPicker, { CountryCode, Country } from 'react-native-country-picker-modal';
import { supabase } from '../../lib/supabase';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [countryCode, setCountryCode] = useState<CountryCode>('NG');
  const [countryName, setCountryName] = useState('Nigeria');
  const [showPicker, setShowPicker] = useState(false);

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountryName(country.name as string);
  };

  // 1. STANDARD EMAIL SIGNUP
  async function signUpWithEmail() {
    if (!email || !password || !fullName) {
      Alert.alert('Missing Info', 'Please fill in all fields to continue.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, country: countryName, country_code: countryCode },
      },
    });
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Success', 'Verification email sent!');
      router.replace('/(auth)/login');
    }
    setLoading(false);
  }

  // 2. SOCIAL AUTH HANDLERS
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'ilearn://(tabs)', // Replace with your deep link scheme
      }
    });
    if (error) Alert.alert("Google Error", error.message);
  };

  const handleAppleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: 'ilearn://(tabs)',
      }
    });
    if (error) Alert.alert("Apple Error", error.message);
  };

  // 3. GUEST HANDLER
  const handleGuestLogin = () => {
    // Simply bypass the auth check
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
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

        <Text className="text-center text-2xl font-kumbh-bold text-brand-dark mb-8">Sign Up</Text>

        {/* Input Fields */}
        <View className="gap-y-3 mb-6">
          <View className="flex-row items-center px-4 h-12 bg-gray-50 border border-gray-100 rounded-xl">
            <Ionicons name="mail-outline" size={18} color="#8E8E93" />
            <TextInput 
              placeholder="Email Address" 
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              className="flex-1 ml-3 text-sm font-manrope text-brand-dark" 
            />
          </View>

          <View className="flex-row items-center px-4 h-12 bg-gray-50 border border-gray-100 rounded-xl">
            <Ionicons name="person-outline" size={18} color="#8E8E93" />
            <TextInput 
              placeholder="Full Name" 
              placeholderTextColor="#8E8E93"
              value={fullName}
              onChangeText={setFullName}
              className="flex-1 ml-3 text-sm font-manrope text-brand-dark" 
            />
          </View>

          <TouchableOpacity 
            onPress={() => setShowPicker(true)}
            className="flex-row items-center px-4 h-12 bg-gray-50 border border-gray-100 rounded-xl"
          >
            <View className="mr-3">
              <CountryPicker
                countryCode={countryCode}
                withFilter withFlag withEmoji
                onSelect={onSelect}
                visible={showPicker}
                onClose={() => setShowPicker(false)}
              />
            </View>
            <Text className="flex-1 text-sm font-manrope text-brand-dark">{countryName}</Text>
            <Ionicons name="chevron-down" size={16} color="#8E8E93" />
          </TouchableOpacity>

          <View className="flex-row items-center px-4 h-12 bg-gray-50 border border-gray-100 rounded-xl">
            <Ionicons name="lock-closed-outline" size={18} color="#8E8E93" />
            <TextInput 
              placeholder="Password" 
              placeholderTextColor="#8E8E93"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              className="flex-1 ml-3 text-sm font-manrope text-brand-dark" 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={18} color="#8E8E93" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          onPress={signUpWithEmail}
          disabled={loading}
          className={`items-center w-full py-3.5 mb-6 rounded-full shadow-sm ${loading ? 'bg-brand-dark/80' : 'bg-brand-dark'}`}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text className="text-base text-white font-manrope-bold">Create Account</Text>}
        </TouchableOpacity>

        <Text className="text-center text-xs font-manrope text-brand-secondary mb-6">or</Text>

        {/* Social Buttons Section */}
        <View className="gap-y-3 mb-8">
          <TouchableOpacity 
            onPress={handleGoogleLogin}
            className="flex-row items-center w-full h-12 bg-gray-50 rounded-full border border-gray-100 px-6"
          >
            <Image 
              source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} 
              className="w-5 h-5" 
              resizeMode="contain"
            />
            <Text className="flex-1 text-center text-sm font-manrope-bold text-brand-dark">Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleAppleLogin}
            className="flex-row items-center w-full h-12 bg-[#9BFD7B] rounded-full px-6"
          >
            <Image 
              source={{ uri: 'https://img.icons8.com/?size=100&id=30659&format=png&color=ffffff' }} 
              className="w-5 h-5" 
              style={{ tintColor: 'black' }} // White logo on green bg
              resizeMode="contain"
            />
            <Text className="flex-1 text-center text-sm font-manrope-bold text-brand-dark">Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleGuestLogin}
            className="flex-row items-center w-full h-12 bg-gray-50 rounded-full border border-gray-100 px-6"
          >
            <Ionicons name="person-circle-outline" size={22} color="black" />
            <Text className="flex-1 text-center text-sm font-manrope-bold text-brand-dark">Continue As Guest</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="flex-row justify-center pb-12">
          <Text className="font-manrope text-xs text-brand-secondary">Need an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="font-manrope-bold text-xs text-brand-dark">Log In</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}