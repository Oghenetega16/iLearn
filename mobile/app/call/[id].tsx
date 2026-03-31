import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen() {
  const { id } = useLocalSearchParams();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <View className="flex-1 bg-black">
      {/* 1. MAIN VIDEO FEED (The Tutor) */}
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop' }} 
        className="absolute inset-0 w-full h-full opacity-90"
        resizeMode="cover"
      />

      {/* 2. HEADER */}
      <SafeAreaView className="absolute top-0 z-10 flex-row items-start justify-between w-full px-6 pt-4">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-md"
        >
          <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View className="items-center px-4 py-2 rounded-full bg-black/50 backdrop-blur-md">
          <Text className="text-sm text-white font-kumbh-bold">Sarah Jenkins</Text>
          <Text className="text-xs font-manrope text-white/80">12:04</Text>
        </View>

        <TouchableOpacity className="items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-md">
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* 3. PIP LOCAL VIDEO FEED (The User) */}
      {!isVideoOff && (
        <View className="absolute z-10 h-40 overflow-hidden bg-gray-800 border-2 shadow-lg top-32 right-6 w-28 rounded-2xl border-white/20">
          <Image 
            source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      )}

      {/* 4. CALL CONTROLS */}
      <SafeAreaView className="absolute bottom-0 z-10 w-full px-8 pb-8">
        <View className="flex-row items-center justify-between px-6 py-4 border rounded-full bg-black/60 backdrop-blur-lg border-white/10">
          
          {/* Mute/Unmute */}
          <TouchableOpacity 
            onPress={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full items-center justify-center ${isMuted ? 'bg-white' : 'bg-white/20'}`}
          >
            <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color={isMuted ? "#000" : "#FFF"} />
          </TouchableOpacity>

          {/* Video On/Off */}
          <TouchableOpacity 
            onPress={() => setIsVideoOff(!isVideoOff)}
            className={`w-12 h-12 rounded-full items-center justify-center ${isVideoOff ? 'bg-white' : 'bg-white/20'}`}
          >
            <Ionicons name={isVideoOff ? "videocam-off" : "videocam"} size={24} color={isVideoOff ? "#000" : "#FFF"} />
          </TouchableOpacity>

          {/* Share Screen (Optional) */}
          <TouchableOpacity className="items-center justify-center w-12 h-12 rounded-full bg-white/20">
            <Ionicons name="share-outline" size={24} color="#FFF" />
          </TouchableOpacity>

          {/* End Call */}
          <TouchableOpacity 
            onPress={() => router.back()}
            className="items-center justify-center bg-red-500 rounded-full shadow-lg w-14 h-14"
          >
            <Ionicons name="call" size={24} color="#FFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </View>
  );
}