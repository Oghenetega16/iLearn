// mobile/components/DirectCallLayout.tsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import {
  useCall,
  useCallStateHooks,
  ParticipantView,
} from '@stream-io/video-react-native-sdk';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useVideoCall } from '../contexts/VideoContext';

export const DirectCallLayout = ({ otherUserName }: { otherUserName?: string }) => {
  const call = useCall();
  const { minimizeCall, leaveCall } = useVideoCall();
  const {
    useLocalParticipant,
    useRemoteParticipants,
    useMicrophoneState,
    useCameraState,
  } = useCallStateHooks();

  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const { status: micStatus } = useMicrophoneState();
  const { status: camStatus } = useCameraState();

  const [isSpeaker, setIsSpeaker] = useState(false);

  if (!call) return null;

  const toggleMic = () => call.microphone.toggle();
  const toggleCamera = () => call.camera.toggle();

  const handleMinimize = () => {
    minimizeCall();
    router.back();
  };

  const handleHangup = () => {
    leaveCall();
    router.back();
  };

  const handleAddParticipant = async () => {
    try {
      await Share.share({
        message: `Join my iLearn call!\n\nTap to join: ilearn://direct-call/${call.id}\nOr enter Room ID: ${call.id}`,
      });
    } catch (error) {
      console.error("Error sharing link:", error);
    }
  };

  return (
    <View className="flex-1 bg-[#111114]">

      {/* TOP BAR */}
      <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between p-4 pt-12">
        {/* Minimize button */}
        <TouchableOpacity
          onPress={handleMinimize}
          className="w-10 h-10 rounded-full bg-[#282A2D]/80 items-center justify-center"
        >
          <MaterialCommunityIcons name="chevron-down" size={24} color="white" />
        </TouchableOpacity>

        {/* Name + status */}
        <View className="items-center">
          <Text className="text-base text-white font-kumbh-bold">
            {otherUserName || 'Direct Call'}
          </Text>
          <Text className="text-green-400 text-xs font-manrope mt-0.5">
            {remoteParticipants.length > 0 ? 'Connected' : 'Calling...'}
          </Text>
        </View>

        {/* Add participant */}
        <TouchableOpacity
          onPress={handleAddParticipant}
          className="w-10 h-10 rounded-full bg-[#282A2D]/80 items-center justify-center"
        >
          <MaterialCommunityIcons name="account-plus-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {/* MAIN VIDEO AREA */}
      {remoteParticipants.length === 0 ? (
        // Waiting — show local full screen with calling indicator
        <View className="items-center justify-center flex-1 bg-black">
          {localParticipant && (
            <ParticipantView participant={localParticipant} style={StyleSheet.absoluteFill} />
          )}
          <View className="absolute items-center bottom-40">
            <View className="items-center justify-center w-16 h-16 mb-3 rounded-full bg-white/10">
              <MaterialCommunityIcons name="phone-outline" size={28} color="white" />
            </View>
            <Text className="text-sm text-white/70 font-manrope">Waiting for {otherUserName || 'the other person'}...</Text>
          </View>
        </View>
      ) : (
        // Connected — remote full screen, local PIP
        <View className="flex-1 bg-black">
          <ParticipantView
            participant={remoteParticipants[0]}
            style={StyleSheet.absoluteFill}
          />
          {/* Local PIP */}
          {localParticipant && (
            <View className="absolute top-24 right-4 w-[100px] h-[140px] rounded-xl overflow-hidden bg-[#3C4043] z-20">
              <ParticipantView participant={localParticipant} style={StyleSheet.absoluteFill} />
            </View>
          )}
          {/* Extra participants if added */}
          {remoteParticipants.length > 1 && (
            <View className="absolute top-24 left-4 bg-black/60 px-3 py-1.5 rounded-full z-20">
              <Text className="text-xs text-white font-manrope">
                +{remoteParticipants.length - 1} more
              </Text>
            </View>
          )}
        </View>
      )}

      {/* BOTTOM CONTROLS */}
      <View className="absolute z-40 left-2 right-2 bottom-6">
        <View className="flex-row items-center justify-evenly px-2 py-3 bg-[#1E1F22] rounded-3xl">

          {/* Camera */}
          <TouchableOpacity
            className={`w-12 h-12 rounded-full justify-center items-center ${camStatus === 'enabled' ? 'bg-[#333537]' : 'bg-[#EA4335]'}`}
            onPress={toggleCamera}
          >
            <MaterialCommunityIcons
              name={camStatus === 'enabled' ? "video-outline" : "video-off"}
              size={24} color="white"
            />
          </TouchableOpacity>

          {/* Mic */}
          <TouchableOpacity
            className={`w-12 h-12 rounded-full justify-center items-center ${micStatus === 'enabled' ? 'bg-[#333537]' : 'bg-[#EA4335]'}`}
            onPress={toggleMic}
          >
            <MaterialCommunityIcons
              name={micStatus === 'enabled' ? "microphone-outline" : "microphone-off"}
              size={24} color="white"
            />
          </TouchableOpacity>

          {/* Speaker toggle */}
          <TouchableOpacity
            className={`w-12 h-12 rounded-full justify-center items-center ${isSpeaker ? 'bg-brand-primary' : 'bg-[#333537]'}`}
            onPress={() => setIsSpeaker(prev => !prev)}
          >
            <MaterialCommunityIcons
              name={isSpeaker ? "volume-high" : "volume-medium"}
              size={24} color="white"
            />
          </TouchableOpacity>

          {/* Hangup */}
          <TouchableOpacity
            className="h-12 w-20 bg-[#EA4335] rounded-full justify-center items-center"
            onPress={handleHangup}
          >
            <MaterialCommunityIcons name="phone-hangup" size={26} color="white" />
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
};