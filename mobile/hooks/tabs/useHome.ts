// mobile/hooks/auth/useHome.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export function useHome() {
    const [profile, setProfile] = useState<any>(null);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        fetchProfile();
        calculateGreeting();
    }, []);

    const calculateGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    };

    const fetchProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', user.id)
                .maybeSingle();
                
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching home profile:', error);
        }
    };

    return {
        state: { profile, greeting },
        handlers: { fetchProfile }
    };
}