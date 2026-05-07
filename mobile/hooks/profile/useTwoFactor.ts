// mobile/hooks/profile/useTwoFactor.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

export function useTwoFactor() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    startMfaEnrollment();
  }, []);

  const startMfaEnrollment = async () => {
    try {
      setLoading(true);
      // 1. Tell Supabase we want to enroll a new TOTP factor
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      // 2. Save the details needed for the UI and verification
      setFactorId(data.id);
      setQrCode(data.totp.qr_code); // This is an SVG string
      setSecret(data.totp.secret);  // Text fallback
    } catch (error: any) {
      Alert.alert('Enrollment Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter a 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      if (!factorId) throw new Error('Missing factor ID');

      // 1. Issue a challenge to this specific factor
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) throw challenge.error;

      // 2. Verify the code against the challenge
      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: verifyCode,
      });

      if (verify.error) throw verify.error;

      // 3. Success! Update our profile database to reflect it's turned on
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ two_factor_enabled: true })
          .eq('id', user.id);
      }

      setIsSetupComplete(true);
      Alert.alert('Success', 'Two-Factor Authentication is now active!', [
        { text: 'Done', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Verification Failed', 'Incorrect code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    state: { qrCode, secret, verifyCode, loading, isSetupComplete },
    setters: { setVerifyCode },
    handlers: { handleVerify }
  };
}