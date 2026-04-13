// mobile/hooks/auth/useLogin.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export function useLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const signInWithEmail = async () => {
        if (!email || !password) {
            Alert.alert('Missing Info', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Login Failed', error.message);
            setLoading(false);
        } else {
            setLoading(false);
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

    const handleGuestLogin = () => {
        router.replace('/(tabs)');
    };

    return {
        state: { email, password, loading, showPassword },
        setters: { setEmail, setPassword, setShowPassword },
        handlers: { signInWithEmail, handleGoogleLogin, handleAppleLogin, handleGuestLogin }
    };
}