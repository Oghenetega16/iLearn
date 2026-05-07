// mobile/app/(auth)/device-history.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/lib/supabase';
import * as Device from 'expo-device';

interface DeviceRecord {
  id: string;
  device_name: string;
  os_name: string;
  last_login: string;
}

export default function DeviceHistoryScreen() {
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const currentDeviceName = Device.modelName || Device.deviceName;

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('device_history')
        .select('*')
        .eq('user_id', user.id)
        .order('last_login', { ascending: false });

      if (error) throw error;
      if (data) setDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string, deviceName: string) => {
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to sign out and remove "${deviceName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Revoke', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Remove the device from the database
              await supabase.from('device_history').delete().eq('id', deviceId);
              
              // Update local state to remove it from the UI instantly
              setDevices(current => current.filter(d => d.id !== deviceId));
              
              // Note: To forcefully log out the actual session, you would need to use 
              // Supabase's admin API to delete the specific refresh token, 
              // but deleting the record is step 1 for user visibility.
            } catch (error) {
              Alert.alert('Error', 'Failed to remove device.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-brand-background">
        <ActivityIndicator size="large" color="#285A48" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Device History</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
        <Text className="mb-6 leading-relaxed font-manrope text-brand-secondary">
          Review the devices that have logged into your account. Revoke access for any unrecognized activity.
        </Text>

        {devices.map((device) => {
          const isCurrentDevice = device.device_name === currentDeviceName;
          
          return (
            <View 
              key={device.id} 
              className={`p-5 mb-4 border rounded-3xl ${isCurrentDevice ? 'bg-brand-light/20 border-brand-primary/30' : 'bg-white border-gray-100 shadow-sm'}`}
            >
              {/* Device Info Header */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <View className={`items-center justify-center w-12 h-12 mr-4 rounded-full ${isCurrentDevice ? 'bg-brand-light' : 'bg-gray-50'}`}>
                    <Ionicons 
                      name={device.os_name.includes('iOS') ? 'logo-apple' : device.os_name.includes('Android') ? 'logo-android' : 'laptop-outline'} 
                      size={24} 
                      color={isCurrentDevice ? '#285A48' : '#8E8E93'} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-kumbh-bold text-brand-dark" numberOfLines={1}>
                      {device.device_name}
                    </Text>
                    <Text className="mt-1 text-sm font-manrope-semi text-brand-secondary">
                      {device.os_name}
                    </Text>
                  </View>
                </View>
                
                {/* Action Button / Badge */}
                {isCurrentDevice ? (
                  <View className="px-3 py-1.5 bg-brand-primary/10 rounded-full">
                    <Text className="text-xs font-kumbh-bold text-brand-primary">This Device</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    onPress={() => handleRevokeDevice(device.id, device.device_name)}
                    className="p-2 -mt-2 -mr-2"
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Explicit Activity Block */}
              <View className={`p-4 rounded-2xl ${isCurrentDevice ? 'bg-white' : 'bg-gray-50'}`}>
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs tracking-wider uppercase font-manrope-bold text-brand-secondary">
                    Activity Status
                  </Text>
                  <View className="flex-row items-center">
                    <View className={`w-2 h-2 rounded-full mr-1.5 ${isCurrentDevice ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <Text className={`text-xs font-manrope-bold ${isCurrentDevice ? 'text-green-600' : 'text-gray-500'}`}>
                      {isCurrentDevice ? 'Active Now' : 'Offline'}
                    </Text>
                  </View>
                </View>
                
                <Text className="text-sm font-manrope-bold text-brand-dark mt-0.5">
                  {isCurrentDevice ? 'Current Active Session' : 'Session Logged'}
                </Text>
                <Text className="mt-1 text-xs text-gray-500 font-manrope">
                  Last seen: {formatDistanceToNow(new Date(device.last_login), { addSuffix: true })}
                </Text>
              </View>

            </View>
          );
        })}
        <View className="h-12" />
      </ScrollView>
    </SafeAreaView>
  );
}