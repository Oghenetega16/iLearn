import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CertificateScreen() {
  return (
    <SafeAreaView className="flex-1 px-6 pt-4 bg-brand-background">
      <View className="flex-row items-center justify-between mb-8">
        <TouchableOpacity onPress={() => router.back()} className="items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm">
          <Ionicons name="close" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="text-lg font-kumbh-bold text-brand-dark">Certificate</Text>
        <View className="w-10" />
      </View>

      {/* The Certificate Card */}
      <View className="relative items-center justify-center p-6 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-3xl h-96">
        {/* Decorative elements */}
        <View className="absolute top-0 left-0 w-24 h-24 rounded-br-full opacity-50 bg-brand-light" />
        <View className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-full bg-brand-primary/10" />
        
        <Ionicons name="ribbon" size={64} color="#F59E0B" className="mb-4" />
        
        <Text className="mb-2 text-xs tracking-widest uppercase font-manrope-bold text-brand-secondary">Certificate of Completion</Text>
        <Text className="mb-6 text-2xl text-center font-kumbh-bold text-brand-dark">React Native Mastery</Text>
        
        <Text className="mb-1 text-xs text-center font-manrope text-brand-secondary">Proudly awarded to</Text>
        <Text className="px-4 pb-1 mb-8 text-xl border-b border-gray-200 font-kumbh-bold text-brand-primary">Oghenetega</Text>
        
        <View className="flex-row justify-between w-full px-4">
          <View className="items-center">
            <Text className="px-2 pb-1 border-b border-gray-200 font-manrope-bold text-brand-dark">Sarah J.</Text>
            <Text className="font-manrope text-gray-400 text-[10px] mt-1">Instructor</Text>
          </View>
          <View className="items-center">
            <Text className="px-2 pb-1 border-b border-gray-200 font-manrope-bold text-brand-dark">Mar 31, 2026</Text>
            <Text className="font-manrope text-gray-400 text-[10px] mt-1">Date</Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between gap-4 mt-12">
        <TouchableOpacity className="flex-row items-center justify-center flex-1 py-4 border bg-brand-light rounded-2xl border-brand-primary/20">
          <Ionicons name="download-outline" size={20} color="#285A48" className="mr-2" />
          <Text className="text-base font-manrope-bold text-brand-primary">Download</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row items-center justify-center flex-1 py-4 shadow-sm bg-brand-primary rounded-2xl">
          <Ionicons name="share-social-outline" size={20} color="#FFF" className="mr-2" />
          <Text className="text-base text-white font-manrope-bold">Share</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}