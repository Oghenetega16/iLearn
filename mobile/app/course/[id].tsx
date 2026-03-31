import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-brand-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        <View className="relative w-full h-72">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop' }} 
            className="w-full h-full"
          />
          <SafeAreaView className="absolute top-0 flex-row justify-between w-full px-6 pt-2">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-md"
            >
              <Ionicons name="arrow-back" size={20} color="#091413" />
            </TouchableOpacity>
            <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-md">
              <Ionicons name="heart-outline" size={20} color="#091413" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View className="px-6 pt-6 pb-24">
          <View className="flex-row items-center mb-3">
            <View className="px-3 py-1 mr-3 rounded-md bg-brand-light">
              <Text className="text-xs font-manrope-semi text-brand-primary">Development</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="ml-1 text-xs font-manrope-semi text-brand-dark">4.9 (1.2k reviews)</Text>
            </View>
          </View>

          <Text className="mb-2 text-2xl font-kumbh-bold text-brand-dark">React Native Mastery</Text>
          <Text className="mb-6 text-base leading-relaxed font-manrope text-brand-secondary">
            Master mobile app development using React Native, Expo, and Tailwind CSS. Build production-ready iOS and Android applications from scratch.
          </Text>

          <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Curriculum</Text>
          
          {[1, 2, 3, 4].map((lesson) => (
            <View key={lesson} className="flex-row items-center p-4 mb-3 bg-white border shadow-sm rounded-2xl border-gray-50">
              <View className="items-center justify-center w-10 h-10 mr-4 rounded-full bg-brand-light">
                <Text className="font-kumbh-bold text-brand-primary">{lesson}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-manrope-bold text-brand-dark">Introduction to Expo</Text>
                <Text className="text-xs font-manrope text-brand-secondary">12:30 mins</Text>
              </View>
              <Ionicons name="play-circle" size={28} color="#285A48" />
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 flex-row items-center justify-between w-full px-6 py-4 pb-8 bg-white border-t border-gray-100">
        <View>
          <Text className="text-xs font-manrope text-brand-secondary">Total Price</Text>
          <Text className="text-2xl font-kumbh-bold text-brand-primary">$90.00</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push({ pathname: "/checkout/[id]", params: { id: id as string } })}
          className="px-8 py-4 shadow-sm bg-brand-primary rounded-2xl"
        >
          <Text className="text-lg text-white font-manrope-bold">Enroll Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}