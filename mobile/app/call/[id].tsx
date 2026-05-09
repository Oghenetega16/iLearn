// mobile/app/call/[id].tsx
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  Call,
  CallContent,
} from '@stream-io/video-react-native-sdk';

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY;

export default function VideoCallScreen() {
  const { id: roomId } = useLocalSearchParams<{ id: string }>();
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!STREAM_API_KEY) {
      setError("Stream API Key is missing in .env");
      return;
    }

    let isMounted = true;
    let client: StreamVideoClient;

    const setupVideo = async () => {
      try {
        // 1. Get current logged-in user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be logged in to join a call.");

        // 2. Fetch profile data (optional, but makes the video UI look great)
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();

        // 3. Ask our Edge Function for the secure Stream Token
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke('video-token', {
          body: { userId: user.id }
        });

        if (tokenError || !tokenData?.token) {
          throw new Error("Failed to secure video token from server.");
        }

        // 4. Initialize the Stream Video Client
        client = StreamVideoClient.getOrCreateInstance({
          apiKey: STREAM_API_KEY,
          user: { 
            id: user.id, 
            name: profile?.full_name || 'iLearn Student', 
            image: profile?.avatar_url 
          },
          token: tokenData.token,
        });

        // 5. Create or Join the specific room ID
        const call = client.call('default', roomId);
        await call.join({ create: true });

        // THE FIX: Check if the user navigated away during the async requests
        if (!isMounted) {
          call.leave();
          client.disconnectUser();
          return;
        }

        // If still mounted, safely update the UI state
        setVideoClient(client);
        setActiveCall(call);
        
      } catch (err: any) {
        // The previously missing catch block
        console.error("Video Setup Error:", err);
        if (isMounted) setError(err.message);
      }
    };

    setupVideo();

    // Cleanup: Leave the call and disconnect when the user hits the back button
    return () => {
      isMounted = false;
      if (activeCall) activeCall.leave();
      if (client) client.disconnectUser();
    };
  }, [roomId]);

  // --- UI STATES ---
  if (error) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-brand-background">
        <Text className="px-6 mb-4 text-center text-red-500 font-kumbh-bold">{error}</Text>
        <Text onPress={() => router.back()} className="text-brand-primary font-manrope-bold">Go Back</Text>
      </SafeAreaView>
    );
  }

  if (!videoClient || !activeCall) {
    return (
      <SafeAreaView className="items-center justify-center flex-1 bg-brand-background">
        <ActivityIndicator size="large" color="#285A48" />
        <Text className="mt-4 text-brand-dark font-manrope">Securing connection...</Text>
      </SafeAreaView>
    );
  }

  // --- THE GOOGLE MEET UI ---
  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'bottom']}>
      <StreamVideo client={videoClient}>
        <StreamCall call={activeCall}>
          <View style={StyleSheet.absoluteFill}>
            <CallContent 
              onHangupCallHandler={() => router.back()} 
            />
          </View>
        </StreamCall>
      </StreamVideo>
    </SafeAreaView>
  );
}