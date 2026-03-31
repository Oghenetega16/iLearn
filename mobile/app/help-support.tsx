import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const FAQS = [
  "How do I reset my password?",
  "Can I download courses for offline viewing?",
  "How do I request a refund?",
  "Where are my certificates saved?"
];

export default function HelpSupportScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
        
        {/* Search */}
        <View className="flex-row items-center px-4 mb-8 bg-white border border-gray-100 shadow-sm h-14 rounded-2xl">
          <Ionicons name="search-outline" size={20} color="#8E8E93" />
          <TextInput 
            placeholder="Search for help..." 
            placeholderTextColor="#8E8E93"
            className="flex-1 ml-3 text-base font-manrope text-brand-dark"
          />
        </View>

        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Frequently Asked Questions</Text>
        
        <View className="mb-8 overflow-hidden bg-white border shadow-sm rounded-3xl border-gray-50">
          {FAQS.map((faq, index) => (
            <TouchableOpacity 
              key={index} 
              className={`flex-row items-center justify-between p-5 ${index !== FAQS.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <Text className="flex-1 pr-4 text-base font-manrope-bold text-brand-dark">{faq}</Text>
              <Ionicons name="chevron-down" size={20} color="#8E8E93" />
            </TouchableOpacity>
          ))}
        </View>

        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Contact Us</Text>

        <View className="flex-row justify-between mb-12">
          <TouchableOpacity className="items-center flex-1 p-5 mr-2 bg-white border shadow-sm rounded-3xl border-gray-50">
            <View className="items-center justify-center mb-3 rounded-full w-14 h-14 bg-brand-light">
              <Ionicons name="chatbubbles-outline" size={24} color="#285A48" />
            </View>
            <Text className="text-base font-manrope-bold text-brand-dark">Live Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center flex-1 p-5 ml-2 bg-white border shadow-sm rounded-3xl border-gray-50">
            <View className="items-center justify-center mb-3 rounded-full w-14 h-14 bg-brand-light">
              <Ionicons name="mail-outline" size={24} color="#285A48" />
            </View>
            <Text className="text-base font-manrope-bold text-brand-dark">Email Us</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}