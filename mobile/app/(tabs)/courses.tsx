// mobile/app/(tabs)/courses.tsx
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

// Define the shape of our real data
interface EnrolledCourse {
  id: string; // Enrollment ID
  course_id: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  course: {
    title: string;
    thumbnail_url: string;
    tutor: {
      full_name: string;
    };
  };
}

export default function CoursesScreen() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');

  const fetchEnrolledCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Notice the simplified profiles query here
      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id,
          course_id,
          progress,
          completed_lessons,
          total_lessons,
          course:courses (
            title,
            thumbnail_url,
            profiles (
              full_name
            )
          )
        `)
        .eq('student_id', user.id);

      if (error) throw error;
      
      const formattedCourses = (data || []).map(item => {
        // Supabase returns related tables as an object or array. 
        // We safely extract the full_name here.
        const profileData = item.course?.profiles;
        const tutorName = Array.isArray(profileData) 
          ? profileData[0]?.full_name 
          : profileData?.full_name;

        return {
          ...item,
          course: {
            title: item.course?.title || 'Unknown Course',
            thumbnail_url: item.course?.thumbnail_url || 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=500&auto=format&fit=crop',
            tutor: {
              full_name: tutorName || 'iLearn Tutor'
            }
          }
        };
      });

      setCourses(formattedCourses as EnrolledCourse[]);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchEnrolledCourses();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEnrolledCourses();
  };

  // Filter courses based on the active tab
  const filteredCourses = courses.filter(c => 
    activeTab === 'ongoing' ? c.progress < 100 : c.progress === 100
  );

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
        <Text className="text-2xl font-kumbh-bold text-brand-dark">My Learning</Text>
        <TouchableOpacity 
          onPress={() => router.push('/search')} 
          className="items-center justify-center w-10 h-10 rounded-full bg-brand-light"
        >
          <Ionicons name="search" size={20} color="#285A48" />
        </TouchableOpacity>
      </View>

      {/* Custom Tabs */}
      <View className="flex-row p-1 mx-6 mb-6 bg-gray-100 rounded-xl">
        <TouchableOpacity 
          onPress={() => setActiveTab('ongoing')}
          className={`items-center flex-1 py-3 rounded-lg ${activeTab === 'ongoing' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`font-manrope-bold ${activeTab === 'ongoing' ? 'text-brand-dark' : 'text-brand-secondary'}`}>
            Ongoing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('completed')}
          className={`items-center flex-1 py-3 rounded-lg ${activeTab === 'completed' ? 'bg-white shadow-sm' : ''}`}
        >
          <Text className={`font-manrope-bold ${activeTab === 'completed' ? 'text-brand-dark' : 'text-brand-secondary'}`}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="items-center justify-center flex-1">
          <ActivityIndicator size="large" color="#285A48" />
        </View>
      ) : filteredCourses.length === 0 ? (
        // --- EMPTY STATE UI ---
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 80 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#285A48" />}
        >
          <View className="items-center justify-center w-32 h-32 mb-6 rounded-full bg-brand-light">
            <Ionicons name={activeTab === 'ongoing' ? "folder-open-outline" : "trophy-outline"} size={64} color="#285A48" />
          </View>
          <Text className="mb-2 text-xl text-center font-kumbh-bold text-brand-dark">
            {activeTab === 'ongoing' ? 'No Courses Yet' : 'None Completed'}
          </Text>
          <Text className="mb-8 leading-relaxed text-center font-manrope text-brand-secondary">
            {activeTab === 'ongoing' 
              ? "You haven't enrolled in any courses right now. Explore our catalog to start your learning journey!"
              : "You haven't finished any courses yet. Keep up the great work on your ongoing lessons!"}
          </Text>
          {activeTab === 'ongoing' && (
            <TouchableOpacity 
              onPress={() => router.push('/search')}
              className="px-8 py-4 shadow-sm bg-brand-primary rounded-2xl"
            >
              <Text className="text-base text-white font-manrope-bold">Explore Courses</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        // --- POPULATED UI ---
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          className="px-6"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#285A48" />}
        >
          {filteredCourses.map((enrollment) => (
            <TouchableOpacity 
              key={enrollment.id} 
              onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: enrollment.course_id } })}
              className="p-4 mb-4 bg-white border shadow-sm rounded-3xl border-gray-50"
            >
              <View className="flex-row">
                <Image source={{ uri: enrollment.course.thumbnail_url }} className="w-20 h-20 bg-gray-200 rounded-2xl" />
                <View className="justify-center flex-1 ml-4">
                  <Text className="mb-1 text-base font-kumbh-bold text-brand-dark">{enrollment.course.title}</Text>
                  <Text className="text-xs font-manrope text-brand-secondary">{enrollment.course.tutor.full_name}</Text>
                </View>
                <View className="items-center justify-center w-10 h-10 rounded-full bg-brand-light">
                  <Ionicons name="play" size={18} color="#285A48" className="ml-1" />
                </View>
              </View>
              
              <View className="mt-5">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-xs font-manrope-semi text-brand-secondary">
                    {enrollment.completed_lessons}/{enrollment.total_lessons} Lessons
                  </Text>
                  <Text className="text-xs font-manrope-bold text-brand-primary">{enrollment.progress}%</Text>
                </View>
                <View className="w-full h-2 overflow-hidden bg-gray-100 rounded-full">
                  <View className="h-full rounded-full bg-brand-primary" style={{ width: `${enrollment.progress}%` }} />
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