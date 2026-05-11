// mobile/contexts/VideoContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StreamVideo, StreamVideoClient, Call } from '@stream-io/video-react-native-sdk';
import { supabase } from '../lib/supabase';

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY;

type VideoContextType = {
  activeCall: Call | null;
  isMinimized: boolean;
  joinCall: (roomId: string) => Promise<void>;
  leaveCall: () => void;
  minimizeCall: () => void;
  maximizeCall: () => void;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const joinCall = async (roomId: string) => {
    if (!STREAM_API_KEY) throw new Error("Missing Stream API Key");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to join.");

    const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
    const { data: tokenData } = await supabase.functions.invoke('video-token', { body: { userId: user.id } });

    if (!tokenData?.token) throw new Error("Failed to get token.");

    const client = StreamVideoClient.getOrCreateInstance({
      apiKey: STREAM_API_KEY,
      user: { id: user.id, name: profile?.full_name || 'iLearn User', image: profile?.avatar_url },
      token: tokenData.token,
    });

    const call = client.call('default', roomId);
    await call.join({ create: true });

    setVideoClient(client);
    setActiveCall(call);
    setIsMinimized(false); // Make sure it starts full screen
  };

  const leaveCall = () => {
    if (activeCall) activeCall.leave();
    if (videoClient) videoClient.disconnectUser();
    setActiveCall(null);
    setIsMinimized(false);
  };

  const minimizeCall = () => setIsMinimized(true);
  const maximizeCall = () => setIsMinimized(false);

  return (
    <VideoContext.Provider value={{ activeCall, isMinimized, joinCall, leaveCall, minimizeCall, maximizeCall }}>
      {/* Conditionally wrap the app in StreamVideo ONLY when a client exists */}
      {videoClient ? (
        <StreamVideo client={videoClient}>
          {children}
        </StreamVideo>
      ) : (
        children
      )}
    </VideoContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = useContext(VideoContext);
  if (!context) throw new Error('useVideoCall must be used within a VideoProvider');
  return context;
};