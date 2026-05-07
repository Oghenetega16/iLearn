// mobile/hooks/auth/useLogin.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import * as Device from 'expo-device'; // <-- 1. Import expo-device

export function useLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // 2. Create a silent helper to log the device
    const logDeviceHistory = async (userId: string) => {
        try {
            await supabase.from('device_history').upsert(
                { 
                    user_id: userId,
                    device_name: Device.modelName || Device.deviceName || 'Unknown Device',
                    os_name: `${Device.osName} ${Device.osVersion}`
                },
                { onConflict: 'user_id, device_name' }
            );
        } catch (e) {
            console.log('Non-critical: Failed to log device', e);
        }
    };

    const signInWithEmail = async () => {
        if (!email || !password) {
            Alert.alert('Missing Info', 'Please enter your email and password.');
            return;
        }
        setLoading(true);
        // 3. Destructure 'data' so we can access the user ID on success
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            Alert.alert('Login Failed', error.message);
            setLoading(false);
        } else {
            // 4. Log the device right before routing them to the app
            if (data.user) {
                await logDeviceHistory(data.user.id);
            }
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