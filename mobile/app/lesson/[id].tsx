import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LessonScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-brand-background">
      
      <SafeAreaView edges={['top']} className="bg-black">
        <View className="w-full h-56 bg-black justify-center items-center relative">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/50 items-center justify-center z-10"
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity className="w-16 h-16 rounded-full bg-brand-primary/90 items-center justify-center">
            <Ionicons name="play" size={32} color="#FFFFFF" className="ml-1" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View className="px-6 py-5 border-b border-gray-200 bg-white">
        <Text className="font-kumbh-bold text-xl text-brand-dark mb-1">1. Introduction to Expo Router</Text>
        <Text className="font-manrope text-sm text-brand-secondary">React Native Mastery • Lesson 1 of 40</Text>
      </View>

      <View className="flex-row border-b border-gray-200 bg-white">
        <TouchableOpacity className="flex-1 py-4 border-b-2 border-brand-primary items-center">
          <Text className="font-manrope-bold text-brand-primary text-sm">Curriculum</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 py-4 items-center">
          <Text className="font-manrope-bold text-brand-secondary text-sm">Transcript</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-4">
        {[1, 2, 3, 4, 5].map((lesson, index) => (
          <TouchableOpacity 
            key={lesson} 
            className={`flex-row items-center p-4 rounded-2xl mb-3 border ${index === 0 ? 'bg-brand-light border-brand-primary/30' : 'bg-white border-gray-50 shadow-sm'}`}
          >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${index === 0 ? 'bg-brand-primary' : 'bg-gray-100'}`}>
              {index === 0 ? (
                <Ionicons name="pause" size={18} color="#FFFFFF" />
              ) : (
                <Text className="font-kumbh-bold text-brand-secondary">{lesson}</Text>
              )}
            </View>
            <View className="flex-1">
              <Text className={`font-manrope-bold text-base ${index === 0 ? 'text-brand-primary' : 'text-brand-dark'}`}>
                {index === 0 ? 'Introduction to Expo Router' : 'Setting up the Environment'}
              </Text>
              <Text className="font-manrope text-xs text-brand-secondary">12:30 mins</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View className="h-12" />
      </ScrollView>

    </View>
  );
}