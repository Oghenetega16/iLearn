import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Duplicating a few to fill out the grid
const COURSES = [
  { id: '1', title: 'Graphic Design Pro', author: 'Shahib Hussain', price: '$75.00', rating: '4.8', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=500&auto=format&fit=crop' },
  { id: '2', title: 'React Native', author: 'Oghenetega', price: '$90.00', rating: '4.9', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=500&auto=format&fit=crop' },
  { id: '3', title: 'Figma Prototyping', author: 'Mike Ross', price: '$40.00', rating: '4.7', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=500&auto=format&fit=crop' },
  { id: '4', title: 'Business Strategy', author: 'Sarah Jenkins', price: '$120.00', rating: '4.9', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=500&auto=format&fit=crop' },
];

export default function AllCoursesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Popular Courses</Text>
        <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full bg-brand-light">
          <Ionicons name="options" size={20} color="#285A48" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
        <View className="flex-row flex-wrap justify-between pb-12">
          {COURSES.map((course) => (
            <TouchableOpacity 
              key={course.id} 
              onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } })}
              className="w-[48%] bg-white rounded-3xl p-3 shadow-sm border border-gray-50 mb-4"
            >
              <Image source={{ uri: course.image }} className="w-full mb-3 bg-gray-200 h-28 rounded-2xl" />
              <Text className="mb-1 text-sm font-kumbh-bold text-brand-dark" numberOfLines={2}>
                {course.title}
              </Text>
              <Text className="mb-2 text-xs font-manrope text-brand-secondary" numberOfLines={1}>
                {course.author}
              </Text>
              <View className="flex-row items-center justify-between mt-auto">
                <Text className="text-sm font-kumbh-bold text-brand-primary">{course.price}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text className="ml-1 text-xs font-manrope-semi text-brand-dark">{course.rating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}