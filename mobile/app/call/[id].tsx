// mobile/app/call/[id].tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClassroomLayout } from '@/components/ClassroomLayout';
import { useVideoCall } from '@/contexts/VideoContext';
import { StreamCall } from '@stream-io/video-react-native-sdk';

export default function VideoCallScreen() {
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const { activeCall, joinCall, minimizeCall } = useVideoCall();
  
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(true);

  // --- 1. Join the Call via the Global Context ---
  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        // Only join if we aren't already in this specific room
        if (activeCall?.id !== roomId) {
          await joinCall(roomId);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsJoining(false);
      }
    };

    setup();

    // --- 2. The Minimize Cleanup ---
    // When the user hits the hardware back button or navigates away,
    // we DO NOT disconnect. We minimize the call to trigger the floating UI!
    return () => {
      isMounted = false;
      // We only minimize if there's an active call. The actual hangup logic
      // is now handled by the big red button in your ClassroomLayout or MiniPlayer.
      if (activeCall) {
        minimizeCall();
      }
    };
  }, [roomId, activeCall]);

  // --- UI STATES ---
  if (error) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-[#111114]">
        <Text className="px-6 mb-4 text-center text-red-500 font-kumbh-bold">{error}</Text>
        <Text onPress={() => router.back()} className="text-white font-manrope-bold">Go Back</Text>
      </SafeAreaView>
    );
  }

  // Show a loader while the Context negotiates the backend tokens
  if (isJoining || !activeCall) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-[#111114]">
        <ActivityIndicator size="large" color="#A8C7FA" />
        <Text className="mt-4 text-gray-300 font-manrope">Securing connection...</Text>
      </SafeAreaView>
    );
  }

  // --- THE GOOGLE MEET UI ---
  // Notice we removed <StreamVideo> here because it now wraps the entire app in _layout.tsx!
  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      <StreamCall call={activeCall}>
        <ClassroomLayout />
      </StreamCall>
    </SafeAreaView>
  );
}