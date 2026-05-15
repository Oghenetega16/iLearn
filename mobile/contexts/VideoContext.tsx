// mobile/contexts/VideoContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { StreamVideo, StreamVideoClient, Call } from '@stream-io/video-react-native-sdk';
import { supabase } from '../lib/supabase';

const STREAM_API_KEY = process.env.EXPO_PUBLIC_STREAM_API_KEY;

type CallType = 'classroom' | 'direct';

type VideoContextType = {
  activeCall: Call | null;
  isMinimized: boolean;
  callType: CallType;
  joinCall: (roomId: string, type?: CallType) => Promise<void>;
  leaveCall: () => void;
  minimizeCall: () => void;
  maximizeCall: () => void;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [activeCall, setActiveCall] = useState<Call | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callType, setCallType] = useState<CallType>('classroom');

  const joinCall = async (roomId: string, type: CallType = 'classroom') => {
    if (!STREAM_API_KEY) throw new Error("Missing Stream API Key");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to join.");

    const { data: profile } = await supabase
      .from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
    const { data: tokenData } = await supabase.functions.invoke('video-token', {
      body: { userId: user.id }
    });

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
    setCallType(type);
    setIsMinimized(false);
  };

  const leaveCall = () => {
    if (activeCall) activeCall.leave();
    if (videoClient) videoClient.disconnectUser();
    setActiveCall(null);
    setIsMinimized(false);
    setCallType('classroom');
  };

  const minimizeCall = () => setIsMinimized(true);
  const maximizeCall = () => setIsMinimized(false);
  

  return (
    <VideoContext.Provider value={{ activeCall, isMinimized, callType, joinCall, leaveCall, minimizeCall, maximizeCall }}>
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