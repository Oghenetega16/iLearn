// mobile/app/lesson/[id].tsx
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useVideoPlayer, VideoView } from 'expo-video';
import { supabase } from '../../lib/supabase';

export default function LessonScreen() {
  const { id } = useLocalSearchParams(); // This is the course_id

  const [courseTitle, setCourseTitle] = useState('');
  const [lessons, setLessons] = useState<any[]>([]);
  const [activeLesson, setActiveLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- NEW EXPO-VIDEO API ---
  // We pass the URL, and when it's ready, we tell it to play automatically
  const player = useVideoPlayer(activeLesson?.video_url || null, player => {
    player.loop = false;
    player.play();
  });

  // Track the playing state so we can toggle the play/pause icon in the curriculum list
  useEffect(() => {
    if (!player) return;
    const subscription = player.addListener('playingChange', (event) => {
      setIsPlaying(event.isPlaying);
    });
    return () => {
      subscription.remove();
    };
  }, [player]);

  // --- FETCH METADATA ---
  useEffect(() => {
    const fetchCourseAndLessons = async () => {
      try {
        const { data: courseData } = await supabase
          .from('courses')
          .select('title')
          .eq('id', id)
          .single();
        
        if (courseData) setCourseTitle(courseData.title);

        const { data: lessonsData, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', id)
          .order('order_index', { ascending: true });

        if (error) throw error;

        if (lessonsData && lessonsData.length > 0) {
          setLessons(lessonsData);
          setActiveLesson(lessonsData[0]); 
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchCourseAndLessons();
  }, [id]);

  const handleLessonChange = (lesson: any) => {
    setActiveLesson(lesson);
  };

  const formatDuration = (durationStr: string) => {
    if (!durationStr) return "00:00";
    const parts = durationStr.split(':');
    if (parts.length >= 3) {
      return `${parts[1]}:${parts[2]}`;
    }
    return durationStr;
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1 bg-black">
        <ActivityIndicator size="large" color="#285A48" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background">
      
      {/* Video Player Section */}
      <SafeAreaView edges={['top']} className="bg-black">
        <View className="relative items-center justify-center w-full h-64 bg-black">
          
          <TouchableOpacity 
            onPress={() => router.back()}
            className="absolute z-20 items-center justify-center w-10 h-10 rounded-full top-4 left-4 bg-black/50"
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {activeLesson ? (
            // --- NEW VIDEOVIEW COMPONENT ---
            <VideoView
              player={player}
              style={{ width: '100%', height: '100%' }}
              nativeControls
              allowsFullscreen
              allowsPictureInPicture
            />
          ) : (
            <Text className="text-white font-manrope">No video available</Text>
          )}
        </View>
      </SafeAreaView>

      {/* Lesson Meta Data */}
      <View className="px-6 py-5 bg-white border-b border-gray-200">
        <Text className="mb-1 text-xl font-kumbh-bold text-brand-dark">
          {activeLesson ? `${activeLesson.order_index}. ${activeLesson.title}` : 'Loading...'}
        </Text>
        <Text className="text-sm font-manrope text-brand-secondary">
          {courseTitle} • Lesson {activeLesson?.order_index} of {lessons.length}
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        <TouchableOpacity className="items-center flex-1 py-4 border-b-2 border-brand-primary">
          <Text className="text-sm font-manrope-bold text-brand-primary">Curriculum</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center flex-1 py-4">
          <Text className="text-sm font-manrope-bold text-brand-secondary">Transcript</Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Curriculum List */}
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-4">
        {lessons.map((lesson) => {
          const isActive = activeLesson?.id === lesson.id;
          
          return (
            <TouchableOpacity 
              key={lesson.id} 
              onPress={() => handleLessonChange(lesson)}
              className={`flex-row items-center p-4 rounded-2xl mb-3 border ${isActive ? 'bg-brand-light border-brand-primary/30' : 'bg-white border-gray-50 shadow-sm'}`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${isActive ? 'bg-brand-primary' : 'bg-gray-100'}`}>
                {isActive ? (
                  <Ionicons name={isPlaying ? "pause" : "play"} size={18} color="#FFFFFF" className={isPlaying ? "" : "ml-1"} />
                ) : (
                  <Text className="font-kumbh-bold text-brand-secondary">{lesson.order_index}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className={`font-manrope-bold text-base ${isActive ? 'text-brand-primary' : 'text-brand-dark'}`}>
                  {lesson.title}
                </Text>
                <Text className="text-xs font-manrope text-brand-secondary">
                  {formatDuration(lesson.duration)} mins
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
        <View className="h-12" />
      </ScrollView>

    </View>
  );
}