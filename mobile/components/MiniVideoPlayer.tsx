// mobile/components/MiniVideoPlayer.tsx
import { View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { StreamCall, useCallStateHooks, ParticipantView } from '@stream-io/video-react-native-sdk';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVideoCall } from '../contexts/VideoContext';

const MiniPlayerUI = () => {
  const { activeCall, callType, maximizeCall, leaveCall } = useVideoCall();
  const { useRemoteParticipants, useLocalParticipant } = useCallStateHooks();

  const remoteParticipants = useRemoteParticipants();
  const localParticipant = useLocalParticipant();
  const displayParticipant = remoteParticipants.length > 0 ? remoteParticipants[0] : localParticipant;

  const handleTap = () => {
    maximizeCall();
    if (activeCall) {
      // Navigate to the correct screen based on call type
      if (callType === 'direct') {
        router.push(`/direct-call/${activeCall.id}`);
      } else {
        router.push(`/call/${activeCall.id}`);
      }
    }
  };

  return (
    <View className="absolute bottom-24 right-4 z-50 w-32 h-44 bg-[#282A2D] rounded-xl overflow-hidden shadow-xl shadow-black/50 border border-white/10">
      <TouchableOpacity activeOpacity={0.9} onPress={handleTap} className="flex-1">
        {displayParticipant ? (
          <ParticipantView participant={displayParticipant} style={StyleSheet.absoluteFill} />
        ) : (
          <View className="items-center justify-center flex-1 bg-black">
            <ActivityIndicator color="white" />
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={leaveCall}
        className="absolute items-center justify-center w-10 h-10 bg-red-500 rounded-full bottom-2 right-2"
      >
        <MaterialCommunityIcons name="phone-hangup" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export const MiniVideoPlayer = () => {
  const { activeCall, isMinimized } = useVideoCall();
  if (!activeCall || !isMinimized) return null;
  return (
    <StreamCall call={activeCall}>
      <MiniPlayerUI />
    </StreamCall>
  );
};