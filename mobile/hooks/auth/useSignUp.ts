// mobile/hooks/auth/useSignUp.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { CountryCode, Country } from 'react-native-country-picker-modal';
import { supabase } from '../../lib/supabase';

export function useSignUp() {
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

    const onSelectCountry = (country: Country) => {
        setCountryCode(country.cca2);
        setCountryName(country.name as string);
    };

    const signUpWithEmail = async () => {
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
            setShowOtpModal(true);
        }
    };

    const handleVerifyOtp = async () => {
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
    };

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

    return {
        state: { fullName, email, password, otp, loading, showPassword, showOtpModal, countryCode, countryName, showPicker },
        setters: { setFullName, setEmail, setPassword, setOtp, setShowPassword, setShowOtpModal, setShowPicker },
        handlers: { onSelectCountry, signUpWithEmail, handleVerifyOtp, handleGoogleLogin, handleAppleLogin }
    };
}