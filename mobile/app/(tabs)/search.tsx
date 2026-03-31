import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SEARCH_RESULTS = [
  { id: '1', title: 'UI/UX Design Masterclass', instructor: 'Sarah Jenkins', price: '$50.00', rating: '4.9', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=500&auto=format&fit=crop' },
  { id: '2', title: 'Advanced React Native', instructor: 'Oghenetega', price: '$85.00', rating: '4.8', image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=500&auto=format&fit=crop' },
  { id: '3', title: 'Figma Prototyping', instructor: 'Mike Ross', price: '$40.00', rating: '4.7', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=500&auto=format&fit=crop' },
];

export default function SearchScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="px-6 pt-4 pb-2">
        <Text className="font-kumbh-bold text-3xl text-brand-dark mb-4">Explore</Text>
        
        <View className="flex-row items-center bg-white h-14 rounded-2xl px-4 shadow-sm border border-gray-100">
          <Ionicons name="search-outline" size={20} color="#8E8E93" />
          <TextInput 
            placeholder="Search courses, tutors..." 
            placeholderTextColor="#8E8E93"
            className="flex-1 ml-3 font-manrope text-base text-brand-dark"
          />
          <TouchableOpacity className="bg-brand-light p-2 rounded-xl">
            <Ionicons name="options-outline" size={20} color="#285A48" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 pt-2 pb-4">
          {['All', 'Design', 'Development', 'Business', 'Marketing'].map((filter, i) => (
            <TouchableOpacity 
              key={filter} 
              className={`px-6 py-2.5 rounded-full mr-3 ${i === 0 ? 'bg-brand-primary' : 'bg-white border border-gray-200'}`}
            >
              <Text className={`font-manrope-semi ${i === 0 ? 'text-white' : 'text-brand-secondary'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        <Text className="font-kumbh-bold text-lg text-brand-dark mb-4">Top Results</Text>
        {SEARCH_RESULTS.map((course) => (
          <TouchableOpacity key={course.id} className="flex-row bg-white rounded-3xl p-3 mb-4 shadow-sm border border-gray-50">
            <Image source={{ uri: course.image }} className="w-24 h-24 rounded-2xl bg-gray-200" />
            <View className="flex-1 ml-4 justify-center">
              <Text className="font-kumbh-bold text-base text-brand-dark mb-1" numberOfLines={2}>{course.title}</Text>
              <Text className="font-manrope text-xs text-brand-secondary mb-2">{course.instructor}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="font-kumbh-bold text-brand-primary">{course.price}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text className="font-manrope-semi text-xs text-brand-dark ml-1">{course.rating}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}