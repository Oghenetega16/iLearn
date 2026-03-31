import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function EditProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Edit Profile</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
          
          <View className="items-center mb-8">
            <View className="relative">
              <Image source={{ uri: 'https://i.pravatar.cc/150?img=11' }} className="border-4 border-white rounded-full shadow-sm w-28 h-28" />
              <TouchableOpacity className="absolute bottom-0 right-0 items-center justify-center w-8 h-8 border-2 border-white rounded-full bg-brand-primary">
                <Ionicons name="camera" size={14} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="gap-4 mb-8">
            <View>
              <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Full Name</Text>
              <View className="flex-row items-center px-4 py-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
                <Ionicons name="person-outline" size={20} color="#8E8E93" className="mr-3" />
                <TextInput 
                  defaultValue="Oghenetega"
                  placeholderTextColor="#8E8E93"
                  className="flex-1 text-base font-manrope text-brand-dark" 
                />
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Email Address</Text>
              <View className="flex-row items-center px-4 py-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
                <Ionicons name="mail-outline" size={20} color="#8E8E93" className="mr-3" />
                <TextInput 
                  defaultValue="hello@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#8E8E93"
                  className="flex-1 text-base font-manrope text-brand-dark" 
                />
              </View>
            </View>

            <View>
              <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Phone Number</Text>
              <View className="flex-row items-center px-4 py-4 bg-white border border-gray-200 shadow-sm rounded-2xl">
                <Ionicons name="call-outline" size={20} color="#8E8E93" className="mr-3" />
                <TextInput 
                  defaultValue="+234 800 000 0000"
                  keyboardType="phone-pad"
                  placeholderTextColor="#8E8E93"
                  className="flex-1 text-base font-manrope text-brand-dark" 
                />
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      <View className="px-6 pt-4 pb-8 bg-white border-t border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="items-center w-full py-4 shadow-sm bg-brand-primary rounded-2xl"
        >
          <Text className="text-lg text-white font-manrope-bold">Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}