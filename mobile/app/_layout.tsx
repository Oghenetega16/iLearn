// mobile/app/_layout.tsx
import { useEffect } from 'react';
import { SplashScreen, Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { 
  Manrope_400Regular, 
  Manrope_600SemiBold, 
  Manrope_700Bold 
} from '@expo-google-fonts/manrope';
import { 
  KumbhSans_400Regular, 
  KumbhSans_700Bold 
} from '@expo-google-fonts/kumbh-sans';

// Import our new global video architecture
import { VideoProvider } from '../contexts/VideoContext';
import { MiniVideoPlayer } from '../components/MiniVideoPlayer';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
    KumbhSans_400Regular,
    KumbhSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <VideoProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Explicitly define your route groups */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />

        <Stack.Screen name="payment-success" options={{ presentation: 'modal' }} />
        <Stack.Screen name="booking-success" options={{ presentation: 'modal' }} />
        
        {/* Set the filter screen to slide up like a true modal */}
        <Stack.Screen name="filter" options={{ presentation: 'modal' }} />
        {/* Add this specific line for the Modal */}
        <Stack.Screen 
          name="search-users" 
          options={{ 
            presentation: 'modal', 
            headerShown: false 
          }} 
        />
      </Stack>
      
      {/* The Floating Mini Player that appears when minimized */}
      <MiniVideoPlayer />
    </VideoProvider>
  );
}