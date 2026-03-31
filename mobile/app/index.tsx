// mobile/app/index.tsx
import { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { router } from 'expo-router';

export default function SplashScreen() {
  // 1. Create an animated value starting at 1 (fully opaque)
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 2. Hold the screen for 1.5 seconds, then begin the fade
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,           // Target value: 0 (invisible)
        duration: 500,        // Fade duration: 500 milliseconds
        useNativeDriver: true // Offloads the animation to the native UI thread for buttery smooth 60fps
      }).start(() => {
        // 3. The exact moment the fade finishes, swap the route silently
        router.replace('/(auth)/onboarding');
      });
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [fadeAnim]);

  return (
    // 4. Use Animated.View instead of View, and bind our fadeAnim to the style property
    <Animated.View 
      className="items-center justify-center flex-1 bg-brand-primary"
      style={{ opacity: fadeAnim }}
    >
      <Text className="text-5xl tracking-widest text-white font-kumbh-bold">
        iLearn
      </Text>
    </Animated.View>
  );
}