// mobile/app/(auth)/welcome.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="justify-end flex-1 px-6 pb-12 bg-brand-background">
      <View className="items-center justify-center flex-1 mt-12">
        <Text className="mb-2 text-4xl font-kumbh-bold text-brand-primary">iLearn</Text>
        <Text className="px-4 text-base text-center font-manrope text-brand-secondary">
          Discover the best courses and level up your skills today.
        </Text>
      </View>

      <View className="w-full gap-4">
        <TouchableOpacity 
          onPress={() => router.push('/(auth)/signup')}
          className="items-center w-full py-4 shadow-sm bg-brand-primary rounded-2xl"
        >
          <Text className="text-lg text-white font-manrope-bold">Create an account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/(auth)/login')}
          className="items-center w-full py-4 bg-brand-light rounded-2xl"
        >
          <Text className="text-lg font-manrope-bold text-brand-primary">Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}