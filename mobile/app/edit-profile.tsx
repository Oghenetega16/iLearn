// mobile/app/(auth)/edit-profile.tsx
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import CountryPicker from 'react-native-country-picker-modal';
import { useEditProfile } from '@/hooks/profile/useEditProfile';

export default function EditProfileScreen() {
  const { state, setters, handlers } = useEditProfile();

  if (state.loading && !state.uploading) {
    return (
      <View className="items-center justify-center flex-1 bg-brand-background">
        <ActivityIndicator size="large" color="#285A48" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Navbar Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Edit Profile</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
          
          {/* Profile Image Circle Selector */}
          <View className="items-center mb-8">
            <View className="relative">
              <Image 
                source={{ 
                  uri: state.avatarUrl || 
                  `https://ui-avatars.com/api/?name=${state.fullName || 'User'}&background=9BFD7B&color=091413` 
                }} 
                className="bg-gray-100 border-4 border-white rounded-full shadow-sm w-28 h-28" 
              />
              <TouchableOpacity 
                onPress={handlers.pickImage}
                disabled={state.uploading}
                className="absolute bottom-0 right-0 items-center justify-center w-8 h-8 border-2 border-white rounded-full bg-brand-primary"
              >
                {state.uploading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="camera" size={14} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Fields Content */}
          <View className="gap-4 mb-8">
            {/* Full Name Input */}
            <View>
              <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Full Name</Text>
              <View className="flex-row items-center px-4 py-2 bg-white border border-gray-200 shadow-sm h-14 rounded-2xl">
                <Ionicons name="person-outline" size={20} color="#8E8E93" className="mr-3" />
                <TextInput 
                  value={state.fullName}
                  onChangeText={setters.setFullName}
                  placeholder="Your Name"
                  placeholderTextColor="#8E8E93"
                  className="flex-1 ml-3 text-base font-manrope text-brand-dark" 
                />
              </View>
            </View>

            {/* Bio / Professional Role Input */}
            <View>
              <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Professional Role</Text>
              <View className="flex-row items-center px-4 py-2 bg-white border border-gray-200 shadow-sm h-14 rounded-2xl">
                <Ionicons name="briefcase-outline" size={20} color="#8E8E93" className="mr-3" />
                <TextInput 
                  value={state.role}
                  onChangeText={setters.setRole}
                  placeholder="e.g. Frontend Developer, Designer"
                  placeholderTextColor="#8E8E93"
                  className="flex-1 ml-3 text-base font-manrope text-brand-dark" 
                />
              </View>
            </View>

            {/* Email Input */}
            <View>
              <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Email Address</Text>
              <View className="flex-row items-center px-4 py-2 border border-gray-200 shadow-none h-14 bg-gray-50 rounded-2xl opacity-60">
                <Ionicons name="mail-outline" size={20} color="#8E8E93" className="mr-3" />
                <TextInput 
                  value={state.email}
                  editable={false}
                  placeholder="hello@example.com"
                  placeholderTextColor="#8E8E93"
                  className="flex-1 ml-3 text-base font-manrope text-brand-secondary" 
                />
              </View>
            </View>

            {/* Country Picker */}
            <View>
              <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Country</Text>
              <TouchableOpacity 
                onPress={() => setters.setShowPicker(true)}
                className="flex-row items-center px-4 py-2 bg-white border border-gray-200 shadow-sm h-14 rounded-2xl"
              >
                <View className="mr-3">
                  <CountryPicker
                    countryCode={state.countryCode}
                    withFilter withFlag withEmoji
                    onSelect={handlers.onSelectCountry}
                    visible={state.showPicker}
                    onClose={() => setters.setShowPicker(false)}
                  />
                </View>
                <Text className="flex-1 text-base font-manrope text-brand-dark">{state.country}</Text>
                <Ionicons name="chevron-down" size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {/* Phone Input field */}
            <View>
              <Text className="mb-2 text-sm font-manrope-semi text-brand-dark">Phone Number</Text>
              <View className="flex-row items-center px-4 py-2 bg-white border border-gray-200 shadow-sm h-14 rounded-2xl">
                <Ionicons name="call-outline" size={20} color="#8E8E93" className="mr-3" />
                {/* Dialing Code Prefix */}
                <Text className="mr-2 text-base font-manrope-bold text-brand-dark">
                  +{state.callingCode}
                </Text>
                <TextInput 
                  value={state.phone}
                  onChangeText={setters.setPhone}
                  placeholder="800 000 0000"
                  keyboardType="phone-pad"
                  placeholderTextColor="#8E8E93"
                  className="flex-1 text-base font-manrope text-brand-dark" 
                />
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Persistent Bottom Layout Container */}
      <View className="px-6 pt-4 pb-8 bg-white border-t border-gray-100">
        <TouchableOpacity 
          onPress={handlers.handleSaveChanges}
          disabled={state.loading || state.uploading}
          className="items-center justify-center w-full shadow-sm h-14 bg-brand-primary rounded-2xl"
        >
          {state.loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-lg text-white font-manrope-bold">Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}