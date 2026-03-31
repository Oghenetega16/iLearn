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
    <Stack screenOptions={{ headerShown: false }}>
      {/* Explicitly define your route groups */}
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" />

      <Stack.Screen name="payment-success" options={{ presentation: 'modal' }} />
      <Stack.Screen name="booking-success" options={{ presentation: 'modal' }} />
      
      {/* Set the filter screen to slide up like a true modal */}
      <Stack.Screen name="filter" options={{ presentation: 'modal' }} />
    </Stack>
  );
}