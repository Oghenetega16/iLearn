// mobile/hooks/auth/useResetPasswordConfirm.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export function useResetPasswordConfirm() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in both fields.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            Alert.alert('Update Failed', error.message);
            setLoading(false);
        } else {
            setLoading(false);
            Alert.alert('Success', 'Your password has been updated. Please log in.');
            router.replace('/(auth)/login');
        }
    };

    return {
        state: { password, confirmPassword, loading, showPassword },
        setters: { setPassword, setConfirmPassword, setShowPassword },
        handlers: { handleUpdatePassword }
    };
}