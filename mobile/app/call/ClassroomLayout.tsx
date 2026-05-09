import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { 
  useCall, 
  useCallStateHooks, 
  ParticipantView 
} from '@stream-io/video-react-native-sdk';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Assuming you use Expo icons

export const ClassroomLayout = () => {
  // 1. Grab the active call instance for actions (mutations)
  const call = useCall();

  // 2. Grab the specific state hooks we need for the UI
  const { 
    useParticipants, 
    useIsCallRecordingInProgress, 
    useMicrophoneState, 
    useCameraState,
    useHasOngoingScreenShare
  } = useCallStateHooks();

  // 3. Subscribe to real-time state changes
  const participants = useParticipants(); // The live array of everyone in the room
  const isRecording = useIsCallRecordingInProgress();
  const { status: micStatus } = useMicrophoneState();
  const { status: camStatus } = useCameraState();
  const isScreenSharing = useHasOngoingScreenShare();

  if (!call) return null;

  // --- INTERACTIVE FEATURES ---

  // Raise Hand (Sends a reaction to everyone in the room)
  const handleRaiseHand = async () => {
    await call.sendReaction({ type: 'raise-hand', emoji_code: ':hand:' });
  };

  // Record Session
  const toggleRecording = async () => {
    if (isRecording) {
      await call.stopRecording();
    } else {
      await call.startRecording();
    }
  };

  // Basic Toggles
  const toggleMic = () => call.microphone.toggle();
  const toggleCamera = () => call.camera.toggle();
  const toggleScreenShare = () => call.screenShare.toggle(); // Triggers native OS screen sharing

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>iLearn Live Classroom</Text>
        {isRecording && (
          <View style={styles.recordingBadge}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>REC</Text>
          </View>
        )}
      </View>

      {/* PARTICIPANT GRID (See Everyone) */}
      <ScrollView style={styles.grid}>
        <View style={styles.participantWrapper}>
          {participants.map((participant) => (
            <View key={participant.sessionId} style={styles.videoTile}>
              {/* ParticipantView handles the actual WebRTC rendering and pinning automatically! */}
              <ParticipantView 
                participant={participant} 
                style={StyleSheet.absoluteFill}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* CUSTOM CONTROL BAR */}
      <View style={styles.controlBar}>
        <TouchableOpacity style={styles.controlButton} onPress={toggleMic}>
          <MaterialCommunityIcons 
            name={micStatus === 'enabled' ? "microphone" : "microphone-off"} 
            size={24} color="white" 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
          <MaterialCommunityIcons 
            name={camStatus === 'enabled' ? "video" : "video-off"} 
            size={24} color="white" 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={toggleScreenShare}>
          <MaterialCommunityIcons 
            name="monitor-share" 
            size={24} color={isScreenSharing ? "#4CAF50" : "white"} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlButton} onPress={handleRaiseHand}>
          <MaterialCommunityIcons name="hand-back-right" size={24} color="#FFC107" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, isRecording && styles.recordingActive]} onPress={toggleRecording}>
          <MaterialCommunityIcons name="record-circle" size={24} color={isRecording ? "white" : "#F44336"} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.hangupButton} onPress={() => call.leave()}>
          <MaterialCommunityIcons name="phone-hangup" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingTop: 40 },
  headerText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  recordingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(244, 67, 54, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F44336', marginRight: 6 },
  recordingText: { color: '#F44336', fontSize: 12, fontWeight: 'bold' },
  grid: { flex: 1, padding: 8 },
  participantWrapper: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  videoTile: { width: '48%', height: 200, margin: '1%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#2C2C2C' },
  controlBar: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', padding: 20, paddingBottom: 40, backgroundColor: '#000' },
  controlButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
  recordingActive: { backgroundColor: '#F44336' },
  hangupButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F44336', justifyContent: 'center', alignItems: 'center' },
});