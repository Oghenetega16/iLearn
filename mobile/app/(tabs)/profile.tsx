// mobile/app/(tabs)/profile.tsx
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Added 'route' properties to the items we just built
const MENU_ITEMS = [
  { icon: 'person-outline', title: 'Edit Profile', route: '/edit-profile' },
  { icon: 'notifications-outline', title: 'Notifications', route: '/notifications' },
  { icon: 'card-outline', title: 'Payment Methods', route: '/payment-methods' }, // Updated
  { icon: 'shield-checkmark-outline', title: 'Security', route: '/security' },   // Updated
  { icon: 'help-buoy-outline', title: 'Help & Support', route: '/help-support' }, // Updated
];

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header & Avatar */}
        <View className="items-center px-6 pt-8 pb-6">
          <View className="relative">
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} className="border-4 border-white rounded-full shadow-sm w-28 h-28" />
            <TouchableOpacity className="absolute bottom-0 right-0 items-center justify-center w-8 h-8 border-2 border-white rounded-full bg-brand-primary">
              <Ionicons name="pencil" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text className="mt-4 text-2xl font-kumbh-bold text-brand-dark">Oghenetega</Text>
          <Text className="mt-1 font-manrope text-brand-secondary">Frontend Developer</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between p-6 mx-6 mb-8 bg-white border shadow-sm rounded-3xl border-gray-50">
          <View className="items-center">
            <Text className="text-2xl font-kumbh-bold text-brand-primary">12</Text>
            <Text className="mt-1 text-xs font-manrope-semi text-brand-secondary">Courses</Text>
          </View>
          <View className="w-[1px] h-full bg-gray-100" />
          <View className="items-center">
            <Text className="text-2xl font-kumbh-bold text-brand-primary">45</Text>
            <Text className="mt-1 text-xs font-manrope-semi text-brand-secondary">Hours</Text>
          </View>
          <View className="w-[1px] h-full bg-gray-100" />
          <TouchableOpacity 
            className="items-center"
            onPress={() => router.push({ pathname: "/certificate/[id]", params: { id: '1' } })}
          >
            <Text className="text-2xl font-kumbh-bold text-brand-primary">3</Text>
            <Text className="mt-1 text-xs font-manrope-semi text-brand-secondary">Certificates</Text>
          </TouchableOpacity>
        </View>

        {/* Menu List */}
        <View className="px-6">
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => {
                if (item.route) {
                  router.push(item.route as any);
                }
              }}
              className="flex-row items-center p-4 mb-3 bg-white border shadow-sm rounded-2xl border-gray-50"
            >
              <View className="items-center justify-center w-10 h-10 mr-4 rounded-full bg-brand-light">
                <Ionicons name={item.icon as any} size={20} color="#285A48" />
              </View>
              <Text className="flex-1 text-base font-manrope-semi text-brand-dark">{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ))}

          {/* Logout Button */}
          <TouchableOpacity 
            onPress={() => router.replace('/(auth)/welcome')}
            className="flex-row items-center p-4 mt-2 mb-8 bg-red-50 rounded-2xl"
          >
            <View className="items-center justify-center w-10 h-10 mr-4 bg-red-100 rounded-full">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text className="flex-1 text-base text-red-500 font-manrope-semi">Log Out</Text>
          </TouchableOpacity>
          <View className="h-24" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}