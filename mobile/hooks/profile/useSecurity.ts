// mobile/hooks/profile/useSecurity.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../../lib/supabase';

export function useSecurity() {
  const [biometric, setBiometric] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecuritySettings();
  }, []);

  const fetchSecuritySettings = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('biometric_enabled, two_factor_enabled')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setBiometric(data.biometric_enabled || false);
        setTwoFactor(data.two_factor_enabled || false);
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricToggle = async (newValue: boolean) => {
    try {
      if (newValue) {
        // 1. Check if the hardware even supports biometrics
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        if (!hasHardware) {
          Alert.alert('Error', 'Your device does not support biometric authentication.');
          return;
        }

        // 2. Check if the user actually has a fingerprint/face enrolled on their phone
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!isEnrolled) {
          Alert.alert('Error', 'No biometrics enrolled on this device. Please set it up in your phone settings first.');
          return;
        }

        // 3. Prompt them to authenticate right now to prove it's them turning it on
        const auth = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to enable Biometric Login',
          fallbackLabel: 'Use Passcode',
        });

        if (!auth.success) {
          return; // User cancelled or failed
        }
      }

      // Optimistic UI update
      setBiometric(newValue);

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ biometric_enabled: newValue })
          .eq('id', user.id);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setBiometric(!newValue); // Revert on error
    }
  };

  const handleTwoFactorToggle = async (newValue: boolean) => {
    // Note: Full TOTP 2FA implementation requires setting up the Supabase MFA API.
    // For now, we will persist the state to the DB.
    try {
      setTwoFactor(newValue);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ two_factor_enabled: newValue })
          .eq('id', user.id);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      setTwoFactor(!newValue); // Revert on error
    }
  };

  return {
    state: { biometric, twoFactor, loading },
    handlers: { handleBiometricToggle, handleTwoFactorToggle }
  };
}