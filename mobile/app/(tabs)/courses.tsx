import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';

const ONGOING_COURSES = [
  { id: '1', title: 'Graphic Design Pro', author: 'Shahib Hussain', progress: 65, totalLessons: 24, completedLessons: 15, image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=500&auto=format&fit=crop' },
  { id: '2', title: 'React Native Mastery', author: 'Oghenetega', progress: 30, totalLessons: 40, completedLessons: 12, image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=500&auto=format&fit=crop' },
];

export default function CoursesScreen() {
  // TOGGLE THIS FALSE TO SEE THE EMPTY STATE!
  const [hasData, setHasData] = useState(false); 

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
        <Text className="text-3xl font-kumbh-bold text-brand-dark">My Learning</Text>
        {/* Dev toggle switch */}
        <TouchableOpacity onPress={() => setHasData(!hasData)} className="p-2 bg-gray-200 rounded-lg">
          <Text className="text-xs font-manrope">Toggle Data</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row p-1 mx-6 mb-6 bg-gray-100 rounded-xl">
        <TouchableOpacity className="items-center flex-1 py-3 bg-white rounded-lg shadow-sm">
          <Text className="font-manrope-bold text-brand-dark">Ongoing</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center flex-1 py-3 rounded-lg">
          <Text className="font-manrope-bold text-brand-secondary">Completed</Text>
        </TouchableOpacity>
      </View>

      {!hasData ? (
        // --- EMPTY STATE UI ---
        <View className="items-center justify-center flex-1 px-8 pb-20">
          <View className="items-center justify-center w-32 h-32 mb-6 rounded-full bg-brand-light">
            <Ionicons name="folder-open-outline" size={64} color="#285A48" />
          </View>
          <Text className="mb-2 text-xl text-center font-kumbh-bold text-brand-dark">No Courses Yet</Text>
          <Text className="mb-8 leading-relaxed text-center font-manrope text-brand-secondary">
            You haven&apos;t enrolled in any courses right now. Explore our catalog to start your learning journey!
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/search')}
            className="px-8 py-4 shadow-sm bg-brand-primary rounded-2xl"
          >
            <Text className="text-base text-white font-manrope-bold">Explore Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // --- POPULATED UI ---
        <ScrollView showsVerticalScrollIndicator={false} className="px-6">
          {ONGOING_COURSES.map((course) => (
            <TouchableOpacity key={course.id} className="p-4 mb-4 bg-white border shadow-sm rounded-3xl border-gray-50">
              <View className="flex-row">
                <Image source={{ uri: course.image }} className="w-20 h-20 bg-gray-200 rounded-2xl" />
                <View className="justify-center flex-1 ml-4">
                  <Text className="mb-1 text-base font-kumbh-bold text-brand-dark">{course.title}</Text>
                  <Text className="text-xs font-manrope text-brand-secondary">{course.author}</Text>
                </View>
                <TouchableOpacity onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: course.id } })} className="items-center justify-center w-10 h-10 rounded-full bg-brand-light">
                  <Ionicons name="play" size={18} color="#285A48" className="ml-1" />
                </TouchableOpacity>
              </View>
              
              <View className="mt-5">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs font-manrope-semi text-brand-secondary">{course.completedLessons}/{course.totalLessons} Lessons</Text>
                  <Text className="text-xs font-manrope-bold text-brand-primary">{course.progress}%</Text>
                </View>
                <View className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                  <View className="h-full rounded-full bg-brand-primary" style={{ width: `${course.progress}%` }} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View className="h-24" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}