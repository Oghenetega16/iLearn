// mobile/hooks/auth/useProfile.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export function useProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
            // Use .maybeSingle() instead of .single()
            // .maybeSingle() returns null if no row is found instead of throwing an error
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle(); 

            if (error) throw error;
            
            setProfile(data);
            }
        } catch (error: any) {
            console.error('Error fetching profile:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Logout', 
                style: 'destructive', 
                onPress: async () => {
                await supabase.auth.signOut();
                router.replace('/(auth)/login');
                } 
            },
        ]);
    };

    return {
        state: { profile, loading },
        handlers: { handleLogout, fetchProfile }
    };
}