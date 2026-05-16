// mobile/app/course-preview/[id].tsx
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export default function CourseDetailsScreen() {
  const { id } = useLocalSearchParams();
  
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);

      // --- ADD THIS SAFETY CHECK ---
      // Check if the ID is a valid UUID before hitting the database
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id as string)) {
        console.warn("Mock ID detected! Cannot fetch from Supabase:", id);
        setLoading(false);
        // You could also set a dummy course state here if you want mock data to still render
        return; 
      }
      // -----------------------------

      const { data: { user } } = await supabase.auth.getUser();
      
      // 1. Fetch Course Metadata
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          tutor:profiles!courses_tutor_id_fkey(full_name)
        `)
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      
      // Format tutor name safely
      const profileData = courseData.tutor;
      courseData.author_name = Array.isArray(profileData) ? profileData[0]?.full_name : profileData?.full_name || courseData.author_name || 'iLearn Official';
      setCourse(courseData);

      // 2. Fetch Lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', id)
        .order('order_index', { ascending: true });

      if (lessonsError) throw lessonsError;
      setLessons(lessonsData || []);

      // 3. Check Enrollment Status
      if (user) {
        const { data: enrollmentData } = await supabase
          .from('enrollments')
          .select('id')
          .eq('student_id', user.id)
          .eq('course_id', id)
          .single();

        if (enrollmentData) {
          setIsEnrolled(true);
        }
      }
    } catch (error) {
      console.error("Error fetching course details:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCourseDetails();
    }, [id])
  );

  const handleEnrollment = async () => {
    // If already enrolled, just go to the player!
    if (isEnrolled) {
      router.push({ pathname: "/lesson/[id]", params: { id: id as string } });
      return;
    }

    // If it's a paid course, route to checkout
    if (course.price > 0) {
      router.push({ pathname: "/checkout/[id]", params: { id: id as string } });
      return;
    }

    // If it's free, handle 1-click enrollment
    try {
      setEnrolling(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert("Login Required", "Please log in to enroll.");
        return;
      }

      const { error } = await supabase.from('enrollments').insert({
        student_id: user.id,
        course_id: id,
        progress: 0,
        completed_lessons: 0,
        total_lessons: lessons.length
      });

      if (error) throw error;
      
      setIsEnrolled(true);
      Alert.alert("Success!", "You are now enrolled. Let's start learning!");
      
      // Navigate straight to the player
      router.push({ pathname: "/lesson/[id]", params: { id: id as string } });
      
    } catch (error: any) {
      console.error("Enrollment failed:", error);
      Alert.alert("Error", "Could not enroll at this time.");
    } finally {
      setEnrolling(false);
    }
  };

  // Helper to format Postgres interval string "00:10:00" -> "10 mins"
  const formatDuration = (durationStr: string) => {
    if (!durationStr) return "10 mins";
    const parts = durationStr.split(':');
    if (parts.length >= 2) {
      const mins = parseInt(parts[1], 10);
      return `${mins} mins`;
    }
    return durationStr;
  };

  if (loading || !course) {
    return (
      <View className="items-center justify-center flex-1 bg-brand-background">
        <ActivityIndicator size="large" color="#285A48" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Header Image & Back Button */}
        <View className="relative w-full h-72">
          <Image 
            source={{ uri: course.image_url || course.thumbnail_url }} 
            className="w-full h-full bg-gray-200"
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

        {/* Course Info */}
        <View className="px-6 pt-6 pb-24">
          <View className="flex-row items-center mb-3">
            <View className="px-3 py-1 mr-3 rounded-md bg-brand-light">
              <Text className="text-xs font-manrope-semi text-brand-primary">{course.category}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text className="ml-1 text-xs font-manrope-semi text-brand-dark">{course.rating}</Text>
            </View>
          </View>

          <Text className="mb-2 text-2xl font-kumbh-bold text-brand-dark">{course.title}</Text>
          <Text className="mb-4 text-sm font-manrope-semi text-brand-primary">by {course.author_name}</Text>
          
          <Text className="mb-6 text-base leading-relaxed font-manrope text-brand-secondary">
            {course.description}
          </Text>

          <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Curriculum ({lessons.length} lessons)</Text>
          
          {lessons.map((lesson, index) => (
            <View key={lesson.id} className="flex-row items-center p-4 mb-3 bg-white border shadow-sm rounded-2xl border-gray-50">
              <View className="items-center justify-center w-10 h-10 mr-4 rounded-full bg-brand-light">
                <Text className="font-kumbh-bold text-brand-primary">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-manrope-bold text-brand-dark" numberOfLines={1}>
                  {lesson.title}
                </Text>
                <Text className="text-xs font-manrope text-brand-secondary">
                  {formatDuration(lesson.duration)}
                </Text>
              </View>
              <Ionicons 
                name={isEnrolled ? "play-circle" : "lock-closed"} 
                size={28} 
                color={isEnrolled ? "#285A48" : "#8E8E93"} 
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Footer */}
      <View className="absolute bottom-0 flex-row items-center justify-between w-full px-6 py-4 pb-8 bg-white border-t border-gray-100">
        <View>
          <Text className="text-xs font-manrope text-brand-secondary">
            {isEnrolled ? 'Status' : 'Total Price'}
          </Text>
          <Text className="text-2xl font-kumbh-bold text-brand-primary">
            {isEnrolled ? 'Enrolled' : (course.price === 0 ? 'Free' : `$${course.price}`)}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={handleEnrollment}
          disabled={enrolling}
          className={`px-8 py-4 shadow-sm rounded-2xl flex-row items-center ${enrolling ? 'bg-gray-400' : 'bg-brand-primary'}`}
        >
          {enrolling && <ActivityIndicator size="small" color="#FFFFFF" className="mr-2" />}
          <Text className="text-lg text-white font-manrope-bold">
            {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}