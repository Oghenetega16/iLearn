import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function BookingSuccessScreen() {
  return (
    <SafeAreaView className="items-center justify-center flex-1 px-6 bg-brand-background">
      
      <View className="items-center w-full p-8 mt-12 mb-8 bg-white border shadow-sm rounded-3xl border-gray-50">
        <View className="absolute -top-12">
          <View className="p-2 bg-white rounded-full">
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} className="w-20 h-20 rounded-full" />
            <View className="absolute items-center justify-center w-6 h-6 border-2 border-white rounded-full bottom-2 right-2 bg-brand-primary">
              <Ionicons name="checkmark" size={12} color="#FFF" />
            </View>
          </View>
        </View>

        <View className="h-10" />
        
        <Text className="mb-2 text-2xl text-center font-kumbh-bold text-brand-dark">Session Confirmed!</Text>
        <Text className="mb-6 leading-relaxed text-center font-manrope text-brand-secondary">
          Your 1-on-1 session with Oghenetega has been successfully scheduled.
        </Text>

        <View className="flex-row items-center justify-center px-6 py-3 mb-4 rounded-full bg-brand-light/50">
          <Ionicons name="calendar-outline" size={20} color="#285A48" />
          <Text className="ml-2 text-base font-manrope-bold text-brand-primary">Thu, 15th • 10:30 AM</Text>
        </View>
      </View>

      <TouchableOpacity 
        className="flex-row items-center justify-center w-full py-4 mb-4 shadow-sm bg-brand-primary rounded-2xl"
      >
        <Ionicons name="calendar" size={20} color="#FFF" />
        <Text className="ml-2 text-lg text-white font-manrope-bold">Add to Calendar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/')}>
        <Text className="text-base font-manrope-bold text-brand-secondary">Back to Home</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}