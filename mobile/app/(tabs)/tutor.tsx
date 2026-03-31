import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TutorScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 border-b border-gray-100 bg-white">
        <View className="w-10 h-10 rounded-full bg-brand-light items-center justify-center mr-3">
          <Ionicons name="hardware-chip" size={20} color="#285A48" />
        </View>
        <View>
          <Text className="font-kumbh-bold text-lg text-brand-dark">iLearn AI</Text>
          <Text className="font-manrope text-xs text-brand-primary">Online • Ready to help</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
          
          {/* AI Bubble */}
          <View className="self-start max-w-[80%] bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm mb-4 border border-gray-50">
            <Text className="font-manrope text-brand-dark leading-5">
              Hello Oghenetega! I&apos;m your personal AI tutor. Need help understanding a concept or stuck on an assignment?
            </Text>
          </View>

          {/* User Bubble */}
          <View className="self-end max-w-[80%] bg-brand-primary p-4 rounded-2xl rounded-tr-sm shadow-sm mb-4">
            <Text className="font-manrope text-white leading-5">
              Can you explain how React Native handles routing compared to React JS?
            </Text>
          </View>

        </ScrollView>

        {/* Input Area */}
        <View className="px-6 py-4 bg-white border-t border-gray-100 flex-row items-center mb-16">
          <TextInput 
            placeholder="Ask a question..." 
            placeholderTextColor="#8E8E93"
            className="flex-1 bg-gray-50 h-12 rounded-full px-5 font-manrope text-brand-dark border border-gray-100"
          />
          <TouchableOpacity className="w-12 h-12 rounded-full bg-brand-primary items-center justify-center ml-3 shadow-sm">
            <Ionicons name="send" size={18} color="#FFFFFF" className="ml-1" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}