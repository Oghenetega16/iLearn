import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

const CATEGORIES = [
  'All', 
  'Development', 
  'Design', 
  'Business', 
  'Marketing', 
  'Finance & Accounting', 
  'IT & Software', 
  'Personal Development', 
  'Photography & Video', 
  'Health & Fitness', 
  'Music', 
  'Productivity', 
  'Teaching & Academics'
];

interface CourseResult {
  id: string;
  title: string;
  instructor: string;
  price: string;
  rating: string;
  image: string;
  category: string;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [results, setResults] = useState<CourseResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Debounced search fetch
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('courses')
          .select(`
            id,
            title,
            price,
            rating,
            thumbnail_url,
            category,
            tutor:profiles!courses_tutor_id_fkey (full_name)
          `);

        // Apply Search Filter
        if (searchQuery.trim()) {
          query = query.ilike('title', `%${searchQuery.trim()}%`);
        }

        // Apply Category Filter
        if (activeCategory !== 'All') {
          query = query.eq('category', activeCategory);
        }

        const { data, error } = await query.order('created_at', { ascending: false }).limit(20);

        if (error) throw error;

        // Format data safely
        const formattedResults = (data || []).map(course => {
          const profileData = course.tutor;
          const tutorName = Array.isArray(profileData) ? profileData[0]?.full_name : profileData?.full_name;

          return {
            id: course.id,
            title: course.title || 'Untitled Course',
            instructor: tutorName || 'iLearn Tutor',
            price: course.price === 0 ? 'Free' : `$${course.price}`,
            rating: course.rating?.toString() || 'New',
            image: course.thumbnail_url || 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=500&auto=format&fit=crop',
            category: course.category,
          };
        });

        setResults(formattedResults);
      } catch (error) {
        console.error('Search fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    // 300ms debounce to prevent spamming the database while typing
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeCategory]);

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header & Search Bar */}
      <View className="px-6 pt-4 pb-2">
        <Text className="mb-4 text-2xl font-kumbh-bold text-brand-dark">Explore</Text>
        
        <View className="flex-row items-center px-4 bg-white border border-gray-100 shadow-sm h-14 rounded-2xl">
          <Ionicons name="search-outline" size={20} color="#8E8E93" />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search courses, tutors..." 
            placeholderTextColor="#8E8E93"
            className="flex-1 ml-3 text-base font-manrope text-brand-dark"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} className="p-1 mr-2">
              <Ionicons name="close-circle" size={18} color="#8E8E93" />
            </TouchableOpacity>
          )}
          <TouchableOpacity className="p-2 bg-brand-light rounded-xl">
            <Ionicons name="options-outline" size={20} color="#285A48" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filters */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 pt-2 pb-4">
          {CATEGORIES.map((filter, i) => (
            <TouchableOpacity 
              key={filter} 
              onPress={() => setActiveCategory(filter)}
              className={`px-6 py-2.5 rounded-full mr-3 ${activeCategory === filter ? 'bg-brand-primary' : 'bg-white border border-gray-200 shadow-sm'}`}
            >
              <Text className={`font-manrope-semi ${activeCategory === filter ? 'text-white' : 'text-brand-secondary'}`}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results List */}
      <ScrollView showsVerticalScrollIndicator={false} className="px-6">
        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">
          {searchQuery ? 'Search Results' : 'Top Courses'}
        </Text>

        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#285A48" />
          </View>
        ) : results.length === 0 ? (
          <View className="items-center justify-center py-10">
            <Ionicons name="search-outline" size={48} color="#E5E7EB" />
            <Text className="mt-4 text-center font-manrope-semi text-brand-secondary">No courses found matching your criteria.</Text>
          </View>
        ) : (
          results.map((course) => (
            <TouchableOpacity 
              key={course.id} 
              // Route to a course preview/enrollment page 
              onPress={() => router.push(`/course-preview/${course.id}` as any)}
              className="flex-row p-3 mb-4 bg-white border shadow-sm border-gray-50 rounded-3xl"
            >
              <Image source={{ uri: course.image }} className="w-24 h-24 bg-gray-200 rounded-2xl" />
              <View className="justify-center flex-1 ml-4">
                <Text className="mb-1 text-base font-kumbh-bold text-brand-dark" numberOfLines={2}>{course.title}</Text>
                <Text className="mb-2 text-xs font-manrope text-brand-secondary">{course.instructor}</Text>
                <View className="flex-row items-center justify-between">
                  <Text className="font-kumbh-bold text-brand-primary">{course.price}</Text>
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={14} color="#F59E0B" />
                    <Text className="ml-1 text-xs font-manrope-semi text-brand-dark">{course.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}