// mobile/app/index.tsx
import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Matching the 3 screens from your UI design
const ONBOARDING_SLIDES = [
  {
    id: '1',
    title: 'Choosing the right online course for growth',
    subtitle: 'Learn from the best tutors and advance your career with our top-rated online courses.',
    // Using a placeholder image until you add your custom illustrations to the assets folder
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop', 
  },
  {
    id: '2',
    title: 'Easy learning, wherever & whenever you want',
    subtitle: 'Download lessons for offline viewing and learn at your own pace, anywhere in the world.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    title: 'Start your path to mastery with a teacher',
    subtitle: 'Get 1-on-1 guidance, AI tutor assistance, and real-time feedback on your progress.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop',
  }
];

export default function OnboardingScreen() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (currentSlideIndex < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      // If it's the last slide, move to the Auth flow
      router.push('/(auth)/welcome');
    }
  };

  const handleSkip = () => {
    router.push('/(auth)/welcome');
  };

  const currentSlide = ONBOARDING_SLIDES[currentSlideIndex];

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* SKIP BUTTON */}
      <View className="flex-row justify-end px-6 py-4">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="font-manrope-semi text-brand-secondary">Skip</Text>
        </TouchableOpacity>
      </View>

      {/* ILLUSTRATION */}
      <View className="items-center justify-center flex-1 px-6">
        <Image 
          source={{ uri: currentSlide.image }} 
          className="w-full mb-12 h-72 rounded-3xl"
          resizeMode="cover"
        />
        
        {/* TEXT CONTENT */}
        <View className="w-full">
          <Text className="mb-4 text-3xl text-left font-kumbh-bold text-brand-dark">
            {currentSlide.title}
          </Text>
          <Text className="text-base leading-relaxed text-left font-manrope text-brand-secondary">
            {currentSlide.subtitle}
          </Text>
        </View>
      </View>

      {/* FOOTER: PAGINATION & NEXT BUTTON */}
      <View className="flex-row items-center justify-between px-6 pt-6 pb-12">
        
        {/* Pagination Dots */}
        <View className="flex-row space-x-2">
          {ONBOARDING_SLIDES.map((_, index) => (
            <View 
              key={index}
              className={`h-2 rounded-full ${
                currentSlideIndex === index 
                  ? 'w-6 bg-brand-primary' 
                  : 'w-2 bg-brand-light'
              }`}
            />
          ))}
        </View>

        {/* Next/Start Button */}
        <TouchableOpacity 
          onPress={handleNext}
          className="items-center justify-center rounded-full shadow-md w-14 h-14 bg-brand-primary"
        >
          <Ionicons 
            name={currentSlideIndex === ONBOARDING_SLIDES.length - 1 ? "checkmark" : "arrow-forward"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}