import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image, Modal } from 'react-native';
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
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  
  const [countryCode, setCountryCode] = useState<CountryCode>('NG');
  const [countryName, setCountryName] = useState('Nigeria');
  const [showPicker, setShowPicker] = useState(false);

  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountryName(country.name as string);
  };

  // 1. SIGNUP & TRIGGER OTP
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

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setShowOtpModal(true); // Open the verification screen
    }
  }

  // 2. VERIFY OTP LOGIC
  async function handleVerifyOtp() {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (error) {
      Alert.alert('Verification Failed', error.message);
      setLoading(false);
    } else {
      setShowOtpModal(false);
      Alert.alert('Success', 'Account verified! Welcome to iLearn.');
      router.replace('/(tabs)');
    }
  }

  // 3. SOCIAL AUTH HANDLERS
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'ilearn://(tabs)' }
    });
    if (error) Alert.alert("Google Error", error.message);
  };

  const handleAppleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: 'ilearn://(tabs)' }
    });
    if (error) Alert.alert("Apple Error", error.message);
  };

  const handleGuestLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>

        <View className="items-center mb-6">
          <Image 
            source={{ uri: 'https://ouch-cdn2.icons8.com/mY77H3L2j_8I9r7pBqS9X1X5G7zZ9k1Y3h8o9L5e4yA/rs:fit:456:456/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvMTYx/LzYyZDEzN2E0LTk1/ZjItNDY4OC1iN2Ex/LTVmZjI0YmE0YzFm/NC5zdmc.png' }} 
            className="w-40 h-40"
            resizeMode="contain"
          />
        </View>

        <Text className="mb-8 text-2xl text-center font-kumbh-bold text-brand-dark">Sign Up</Text>

        <View className="mb-6 gap-y-3">
          <View className="flex-row items-center h-12 px-4 border border-gray-100 bg-gray-50 rounded-xl">
            <Ionicons name="mail-outline" size={18} color="#8E8E93" />
            <TextInput 
              placeholder="Email Address" 
              placeholderTextColor="#8E8E93"
              value={email}
              onChangeText={setEmail}
              className="flex-1 ml-3 text-sm font-manrope text-brand-dark" 
            />
          </View>

          <View className="flex-row items-center h-12 px-4 border border-gray-100 bg-gray-50 rounded-xl">
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
            className="flex-row items-center h-12 px-4 border border-gray-100 bg-gray-50 rounded-xl"
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

          <View className="flex-row items-center h-12 px-4 border border-gray-100 bg-gray-50 rounded-xl">
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

        <TouchableOpacity 
          onPress={signUpWithEmail}
          disabled={loading}
          className={`items-center w-full py-3.5 mb-6 rounded-full shadow-sm ${loading ? 'bg-brand-dark/80' : 'bg-brand-dark'}`}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text className="text-base text-white font-manrope-bold">Create Account</Text>}
        </TouchableOpacity>

        <Text className="mb-6 text-xs text-center font-manrope text-brand-secondary">or</Text>

        <View className="mb-8 gap-y-3">
          <TouchableOpacity onPress={handleGoogleLogin} className="flex-row items-center w-full h-12 px-6 border border-gray-100 rounded-full bg-gray-50">
            <Image source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} className="w-5 h-5" resizeMode="contain" />
            <Text className="flex-1 text-sm text-center font-manrope-bold text-brand-dark">Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAppleLogin} className="flex-row items-center w-full h-12 bg-[#9BFD7B] rounded-full px-6">
            <Image 
              source={{ uri: 'https://img.icons8.com/?size=100&id=30659&format=png&color=ffffff' }} 
              className="w-5 h-5" 
              style={{ tintColor: 'white' }} 
              resizeMode="contain" 
            />
            <Text className="flex-1 text-sm text-center font-manrope-bold text-brand-dark">Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleGuestLogin} className="flex-row items-center w-full h-12 px-6 border border-gray-100 rounded-full bg-gray-50">
            <Ionicons name="person-circle-outline" size={22} color="black" />
            <Text className="flex-1 text-sm text-center font-manrope-bold text-brand-dark">Continue As Guest</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center pb-12">
          <Text className="text-xs font-manrope text-brand-secondary">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-xs font-manrope-bold text-brand-dark">Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* OTP VERIFICATION MODAL */}
      <Modal visible={showOtpModal} animationType="slide" transparent={true}>
        <View className="justify-end flex-1 bg-black/50">
          <View className="bg-white p-8 rounded-t-[40px] items-center">
            <View className="w-12 h-1 mb-6 bg-gray-200 rounded-full" />
            <Text className="mb-2 text-2xl font-kumbh-bold text-brand-dark">Verify Email</Text>
            <Text className="px-4 mb-8 text-center text-brand-secondary">
              Enter the 6-digit code sent to{"\n"}<Text className="font-manrope-bold text-brand-dark">{email}</Text>
            </Text>

            <TextInput
              value={otp}
              onChangeText={setOtp}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6} // Back to 6
              // We can increase the tracking (spacing) now that we have fewer digits
              className="w-full bg-gray-50 h-16 rounded-2xl text-center text-3xl font-kumbh-bold tracking-[10px] mb-6 border border-gray-100"
            />

            <TouchableOpacity 
              onPress={handleVerifyOtp}
              // Disable button until all 6 digits are entered
              disabled={loading || otp.length < 6} 
              className={`w-full py-4 rounded-full items-center mb-4 ${otp.length === 6 ? 'bg-brand-dark' : 'bg-gray-300'}`}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text className="text-white font-manrope-bold">Verify & Finish</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowOtpModal(false)}>
              <Text className="text-brand-secondary font-manrope-semi">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}