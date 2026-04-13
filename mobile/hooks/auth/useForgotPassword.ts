// mobile/hooks/auth/useForgotPassword.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export function useForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'ilearn://(auth)/reset-password-confirm',
        });

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            Alert.alert(
                'Check your email',
                'We have sent a password reset link to your email address.'
            );
            router.back();
        }
        setLoading(false);
    };

    return {
        state: { email, loading },
        setters: { setEmail },
        handlers: { handleResetPassword }
    };
}