// mobile/app/(tabs)/index.tsx
import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

// --- MOCK DATA ---
const CATEGORIES = [
  { id: '1', name: 'IT & Software', icon: 'laptop-outline' },
  { id: '2', name: 'Development', icon: 'code-slash-outline' },
  { id: '3', name: 'Business', icon: 'briefcase-outline' },
  { id: '4', name: 'Finance', icon: 'cash-outline' },
  { id: '5', name: 'Productivity', icon: 'document-text-outline' },
  { id: '6', name: 'Personal Dev', icon: 'trending-up-outline' },
  { id: '7', name: 'Design', icon: 'color-palette-outline' },
  { id: '8', name: 'Marketing', icon: 'megaphone-outline' },
];

const COURSES = [
  { id: '1', title: 'Graphic Design Pro', author: 'Shahib Hussain', price: '$75.00', rating: '4.8', image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=500&auto=format&fit=crop' },
  { id: '2', title: 'React Native Mastery', author: 'Oghenetega', price: '$90.00', rating: '4.9', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=500&auto=format&fit=crop' },
  { id: '3', title: 'Business Strategy 101', author: 'Sarah Jenkins', price: '$45.00', rating: '4.7', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=500&auto=format&fit=crop' },
  { id: '4', title: 'Financial Modeling', author: 'Michael Chen', price: '$120.00', rating: '4.9', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=500&auto=format&fit=crop' },
  { id: '5', title: 'Digital Marketing Pro', author: 'Emma Watson', price: '$60.00', rating: '4.6', image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=500&auto=format&fit=crop' },
];

// Removed bgColor properties
const PROMOTIONS = [
  {
    id: '1',
    header: "TODAY'S SPECIAL",
    subHeader: "75% OFF",
    desc: "Hurry! Today's your last chance for a discount.",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: '2',
    header: "NEW ARRIVALS",
    subHeader: "AI & Data",
    desc: "Explore the future of tech with our new courses.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: '3',
    header: "UPGRADE SKILLS",
    subHeader: "UI/UX Pro",
    desc: "Master design thinking and Figma today.",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800&auto=format&fit=crop"
  }
];

// --- REUSABLE COMPONENTS ---

// 1. The Dynamic Auto-Scrolling Promo Banner
const PromoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= PROMOTIONS.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  return (
    <View className="mt-4">
      <FlatList
        ref={flatListRef}
        data={PROMOTIONS}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ width: width }} className="px-6">
            <View className="relative justify-center overflow-hidden rounded-3xl h-44">
              {/* Full opacity image filling the background */}
              <Image 
                source={{ uri: item.image }} 
                className="absolute inset-0 w-full h-full" 
                resizeMode="cover"
              />
              {/* Semi-transparent dark overlay for text readability */}
              <View className="absolute inset-0 bg-black/40" />
              <View className="pl-6">
                <Text className="z-10 w-full text-2xl text-white font-kumbh-bold">{item.header}</Text>
                <Text className="z-10 mt-1 text-3xl text-white font-manrope-bold">{item.subHeader}</Text>
                <Text className="z-10 w-5/6 mt-1 text-sm text-white/90 font-manrope">{item.desc}</Text>
              </View>
            </View>
          </View>
        )}
      />
      {/* Pagination Dots */}
      <View className="flex-row justify-center mt-4">
        {PROMOTIONS.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 transition-all ${
              index === currentIndex ? 'w-6 bg-brand-primary' : 'w-2 bg-gray-300'
            }`}
          />
        ))}
      </View>
    </View>
  );
};

// 2. Helper component to render standard horizontal course lists
const CourseSection = ({ title, courses }: { title: string, courses: typeof COURSES }) => (
  <View className="mt-8">
    <View className="flex-row items-center justify-between px-6 mb-4">
      <Text className="text-lg font-kumbh-bold text-brand-dark">{title}</Text>
      <TouchableOpacity onPress={() => router.push('/all-courses')}>
        <Text className="text-sm font-manrope-semi text-brand-secondary">View all</Text>
      </TouchableOpacity>
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
      {courses.map((course, index) => (
        <TouchableOpacity 
          key={course.id + title} 
          onPress={() => router.push({ pathname: "/course/[id]", params: { id: course.id } })}
          className={`w-60 bg-white rounded-3xl p-3 shadow-sm mr-4 ${index === courses.length - 1 ? 'mr-12' : ''}`}
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}
        >
          <Image source={{ uri: course.image }} className="w-full h-32 mb-3 bg-gray-200 rounded-2xl" />
          <View className="px-1">
            <Text className="mb-1 text-base font-kumbh-bold text-brand-dark" numberOfLines={1}>{course.title}</Text>
            <Text className="mb-3 text-xs font-manrope text-brand-secondary">{course.author}</Text>
            <View className="flex-row items-center justify-between">
              <Text className="font-kumbh-bold text-brand-primary">{course.price}</Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text className="ml-1 text-xs font-manrope-semi text-brand-dark">{course.rating}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// --- MAIN SCREEN ---
export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* 1. HEADER SECTION */}
        <View className="flex-row items-center justify-between px-6 py-4">
          <View className="flex-row items-center">
            <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} className="w-12 h-12 mr-3 rounded-full" />
            <View>
              <Text className="text-xs font-manrope text-brand-secondary">Good Morning</Text>
              <Text className="text-lg font-kumbh-bold text-brand-dark">Oghenetega</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            {/* Replaced Search with Video Call */}
            <TouchableOpacity onPress={() => router.push('/book-session')} className="items-center justify-center w-10 h-10 rounded-full bg-brand-light">
              <Ionicons name="videocam-outline" size={20} color="#285A48" />
            </TouchableOpacity>
            <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full bg-brand-light" onPress={() => router.push('/notifications')}>
              <Ionicons name="notifications-outline" size={20} color="#285A48" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. DYNAMIC PROMO CAROUSEL */}
        <PromoCarousel />

        {/* 3. SCROLLABLE CATEGORIES */}
        <View className="mt-8">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-lg font-kumbh-bold text-brand-dark">Categories</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text className="text-sm font-manrope-semi text-brand-secondary">View all</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
            {CATEGORIES.map((cat, index) => (
              <TouchableOpacity key={cat.id} onPress={() => router.push('/search')} className={`items-center mr-6 ${index === CATEGORIES.length - 1 ? 'mr-12' : ''}`}>
                <View className="items-center justify-center w-16 h-16 mb-2 rounded-2xl bg-brand-light">
                  <Ionicons name={cat.icon as any} size={28} color="#285A48" />
                </View>
                <Text className="w-16 text-xs text-center font-manrope-semi text-brand-dark" numberOfLines={2}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 4. OUR TOP PICK FOR YOU (Highlighted Large Card) */}
        <View className="px-6 mt-8">
          <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Our Top Pick For You</Text>
          <TouchableOpacity 
            onPress={() => router.push({ pathname: "/course/[id]", params: { id: COURSES[1].id } })}
            className="p-4 bg-white border shadow-sm rounded-3xl border-gray-50"
          >
            <Image source={{ uri: COURSES[1].image }} className="w-full h-48 mb-4 bg-gray-200 rounded-2xl" />
            <View className="flex-row items-start justify-between mb-2">
              <View className="flex-1 pr-4">
                <Text className="mb-1 text-xl font-kumbh-bold text-brand-dark">{COURSES[1].title}</Text>
                <Text className="text-sm font-manrope text-brand-secondary">{COURSES[1].author}</Text>
              </View>
              <View className="bg-brand-light px-3 py-1.5 rounded-lg">
                <Text className="font-kumbh-bold text-brand-primary">Bestseller</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between pt-4 mt-2 border-t border-gray-100">
              <View className="flex-row items-center">
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text className="ml-1 font-manrope-bold text-brand-dark">{COURSES[1].rating}</Text>
                <Text className="ml-1 font-manrope text-brand-secondary">(2.4k reviews)</Text>
              </View>
              <Text className="text-lg font-kumbh-bold text-brand-primary">{COURSES[1].price}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. MULTIPLE DYNAMIC SECTIONS */}
        <CourseSection title="Featured Courses" courses={COURSES.slice(0, 3)} />
        <CourseSection title="Trending Now" courses={COURSES.slice(2, 5).reverse()} />
        <CourseSection title="Newest Courses" courses={[COURSES[4], COURSES[0], COURSES[2]]} />
        <CourseSection title="Recommended For You" courses={COURSES.slice(1, 4)} />

      </ScrollView>
    </SafeAreaView>
  );
}