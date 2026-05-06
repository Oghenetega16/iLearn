// mobile/hooks/profile/useEditProfile.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { decode } from 'base64-arraybuffer';
import { CountryCode, Country } from 'react-native-country-picker-modal';

export function useEditProfile() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Country States
  const [country, setCountry] = useState('Nigeria');
  const [countryCode, setCountryCode] = useState<CountryCode>('NG');
  const [callingCode, setCallingCode] = useState('234');
  const [showPicker, setShowPicker] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, phone, avatar_url, country, country_code')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          setAvatarUrl(data.avatar_url || null);
          if (data.country) setCountry(data.country);
          if (data.country_code) setCountryCode(data.country_code as CountryCode);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onSelectCountry = (selectedCountry: Country) => {
    setCountryCode(selectedCountry.cca2);
    setCountry(selectedCountry.name as string);
    if (selectedCountry.callingCode && selectedCountry.callingCode.length > 0) {
      setCallingCode(selectedCountry.callingCode[0]);
    }
  };

  const pickImage = async () => {
    // ... (Keep your existing pickImage logic)
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need access to your camera roll to update your picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      uploadAvatar(result.assets[0].base64, result.assets[0].uri);
    }
  };

  const uploadAvatar = async (base64Str: string, fileUri: string) => {
    // ... (Keep your existing uploadAvatar logic)
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = fileUri.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, decode(base64Str), {
          contentType: `image/${fileExt}`,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: phone, // This saves just the local number
          country: country,
          country_code: countryCode,
          avatar_url: avatarUrl,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (error) throw error;
      Alert.alert('Success', 'Profile changes saved successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    state: { fullName, email, phone, country, countryCode, callingCode, showPicker, avatarUrl, loading, uploading },
    setters: { setFullName, setPhone, setShowPicker },
    handlers: { pickImage, handleSaveChanges, onSelectCountry }
  };
}