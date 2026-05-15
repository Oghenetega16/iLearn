// mobile/app/direct-call/[id].tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StreamCall } from '@stream-io/video-react-native-sdk';
import { useVideoCall } from '@/contexts/VideoContext';
import { DirectCallLayout } from '@/components/DirectCallLayout';

export default function DirectCallScreen() {
  const { id: roomId, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { activeCall, joinCall, minimizeCall } = useVideoCall();

  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        if (activeCall?.id !== roomId) {
          await joinCall(roomId, 'direct'); // ← pass 'direct' type
        }
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsJoining(false);
      }
    };

    setup();

    return () => {
      isMounted = false;
      if (activeCall) minimizeCall();
    };
  }, [roomId]);

  if (error) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-[#111114]">
        <Text className="px-6 mb-4 text-center text-red-500 font-kumbh-bold">{error}</Text>
        <Text onPress={() => router.back()} className="text-white font-manrope-bold">Go Back</Text>
      </SafeAreaView>
    );
  }

  if (isJoining || !activeCall) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-[#111114]">
        <ActivityIndicator size="large" color="#A8C7FA" />
        <Text className="mt-4 text-gray-300 font-manrope">Connecting...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      <StreamCall call={activeCall}>
        <DirectCallLayout otherUserName={name} />
      </StreamCall>
    </SafeAreaView>
  );
}