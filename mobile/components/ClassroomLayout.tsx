import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Share, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { 
  useCall, 
  useCallStateHooks, 
  ParticipantView 
} from '@stream-io/video-react-native-sdk';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// 1. Global tracker: Remembers which rooms have already shown the invite UI
const dismissedInvites = new Set<string>();

export const ClassroomLayout = () => {
  const call = useCall();
  const { 
    useLocalParticipant,
    useRemoteParticipants, 
    useIsCallRecordingInProgress, 
    useMicrophoneState, 
    useCameraState,
  } = useCallStateHooks();

  const localParticipant = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  
  const isRecording = useIsCallRecordingInProgress();
  const { status: micStatus } = useMicrophoneState();
  const { status: camStatus } = useCameraState();

  const [isRecordingLoading, setIsRecordingLoading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // 2. State checks if we should show the invite (defaults to false if already dismissed)
  const [showInvite, setShowInvite] = useState(call ? !dismissedInvites.has(call.id) : false);

  // --- AUTO-HIDE INVITE TIMER ---
  useEffect(() => {
    if (showInvite && call) {
      const hideTimer = setTimeout(() => {
        setShowInvite(false);
        dismissedInvites.add(call.id); // Mark as permanently dismissed
      }, 15000); 

      return () => clearTimeout(hideTimer);
    }
  }, [showInvite, call]);

  // --- RECORDING TIMER ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!call) return null;

  // --- ACTIONS ---
  const handleRaiseHand = async () => {
    await call.sendReaction({ type: 'raised-hand', emoji_code: '✋' });
  };

  const toggleRecording = async () => {
    if (isRecordingLoading) return;
    setIsRecordingLoading(true);
    try {
      if (isRecording) {
        await call.stopRecording();
      } else {
        await call.startRecording();
      }
    } catch (err) {
      console.warn("Recording toggle failed:", err);
    } finally {
      setIsRecordingLoading(false);
    }
  };

  const shareMeetingLink = async () => {
    try {
      await Share.share({
        message: `Join my iLearn Live Class!\n\nTap to join: ilearn://call/${call.id}\nOr enter Room ID: ${call.id}`,
      });
    } catch (error) {
      console.error("Error sharing link:", error);
    }
  };

  const toggleMic = () => call.microphone.toggle();
  const toggleCamera = () => call.camera.toggle();

  return (
    <View className="flex-1 bg-[#111114]">
      {/* TOP HEADER */}
      <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between p-4 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-[#282A2D]/80 items-center justify-center">
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          {isRecording && (
            <View className="flex-row items-center px-3 py-1.5 bg-red-500/80 rounded-2xl mr-2">
              <View className="w-2 h-2 mr-2 bg-white rounded-full" />
              <Text className="text-sm font-bold text-white tabular-nums">{formatTime(recordingTime)}</Text>
            </View>
          )}

          {/* Share icon appears when big UI hides OR when someone joins */}
          {(!showInvite || remoteParticipants.length > 0) && (
            <TouchableOpacity onPress={shareMeetingLink} className="w-10 h-10 rounded-full bg-[#282A2D]/80 items-center justify-center">
              <MaterialCommunityIcons name="share-variant" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* MAIN CONTENT AREA */}
      {remoteParticipants.length === 0 ? (
        <View className="flex-1 bg-black">
          {/* 3. Meet Behavior: Local video is FULL SCREEN when you are alone */}
          {localParticipant && (
            <ParticipantView participant={localParticipant} style={StyleSheet.absoluteFill} />
          )}

          {/* 4. Floating Glass Invite Card */}
          {showInvite && (
            <View className="absolute z-20 p-5 bg-[#202124]/95 rounded-2xl bottom-32 left-4 right-4 border border-white/10">
              <Text className="mb-2 text-xl font-semibold text-white">You&apos;re the only one here</Text>
              <Text className="mb-6 text-sm text-gray-300">
                Share this meeting link with others that you want in the meeting
              </Text>
              
              <TouchableOpacity onPress={shareMeetingLink} className="bg-[#3C4043] flex-row justify-between items-center p-4 rounded-xl mb-6">
                <Text className="text-base text-gray-200">{call.id}</Text>
                <MaterialCommunityIcons name="content-copy" size={20} color="white" />
              </TouchableOpacity>

              <TouchableOpacity onPress={shareMeetingLink} className="bg-[#A8C7FA] self-start flex-row items-center px-5 py-2.5 rounded-full">
                <MaterialCommunityIcons name="share-variant" size={20} color="#000" />
                <Text className="ml-2 text-base font-semibold text-black">Share invite</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 8, paddingTop: 100, paddingBottom: 140 }}>
          {remoteParticipants.map((participant) => (
            <View 
              key={participant.sessionId} 
              className={`m-1 overflow-hidden bg-[#3C4043] rounded-xl ${
                remoteParticipants.length === 1 ? 'w-[96%] h-[95%]' : 'w-[46%] h-[250px]'
              }`}
            >
              <ParticipantView participant={participant} style={StyleSheet.absoluteFill} />
            </View>
          ))}
        </ScrollView>
      )}

      {/* FLOATING LOCAL VIDEO (PIP) - ONLY show if there is someone else in the room */}
      {localParticipant && remoteParticipants.length > 0 && (
        <View className="absolute bottom-28 right-4 w-[110px] h-[160px] rounded-xl overflow-hidden bg-[#3C4043] shadow-lg shadow-black/50 z-30">
          <ParticipantView participant={localParticipant} style={StyleSheet.absoluteFill} />
        </View>
      )}

      {/* GOOGLE MEET BOTTOM CONTROL BAR */}
      <View className="absolute z-40 left-2 right-2 bottom-6">
        <View className="flex-row items-center justify-evenly px-2 py-3 bg-[#1E1F22] rounded-3xl">
          <TouchableOpacity 
            className={`w-12 h-12 rounded-full justify-center items-center ${camStatus === 'enabled' ? 'bg-[#333537]' : 'bg-[#EA4335]'}`}
            onPress={toggleCamera}
          >
            <MaterialCommunityIcons name={camStatus === 'enabled' ? "video-outline" : "video-off"} size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            className={`w-12 h-12 rounded-full justify-center items-center ${micStatus === 'enabled' ? 'bg-[#333537]' : 'bg-[#EA4335]'}`}
            onPress={toggleMic}
          >
            <MaterialCommunityIcons name={micStatus === 'enabled' ? "microphone-outline" : "microphone-off"} size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity className="w-12 h-12 rounded-full justify-center items-center bg-[#333537]" onPress={handleRaiseHand}>
            <MaterialCommunityIcons name="hand-back-right-outline" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            className={`w-12 h-12 rounded-full justify-center items-center ${isRecording ? 'bg-[#EA4335]' : 'bg-[#333537]'} ${isRecordingLoading ? 'opacity-50' : ''}`}
            onPress={toggleRecording}
            disabled={isRecordingLoading}
          >
            <MaterialCommunityIcons name="record-circle-outline" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity className="h-12 w-20 bg-[#EA4335] rounded-full justify-center items-center" onPress={() => router.back()}>
            <MaterialCommunityIcons name="phone-hangup" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};