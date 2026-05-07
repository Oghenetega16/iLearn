// mobile/app/(tabs)/help-support.tsx
import { View, Text, ScrollView, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

// 1. Upgrade the static array to include answers and unique IDs
const FAQS = [
  {
    id: 1,
    question: "How do I reset my password?",
    answer: "Go to your Profile, tap 'Security', and select 'Change Password'. If you are logged out, use the 'Forgot Password' link on the login screen."
  },
  {
    id: 2,
    question: "Can I download courses for offline viewing?",
    answer: "Yes! iLearn Pro members can download courses by tapping the download icon next to any video lesson."
  },
  {
    id: 3,
    question: "How do I request a refund?",
    answer: "Refunds can be requested within 14 days of purchase. Please use the Email Support button below to contact our billing team with your receipt."
  },
  {
    id: 4,
    question: "Where are my certificates saved?",
    answer: "All completed certificates are automatically saved to the 'Certificates' tab inside your Profile dashboard."
  }
];

export default function HelpSupportScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 2. Filter the FAQs based on the search query
  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Handle Native Actions
  const handleEmailSupport = async () => {
    const email = 'support@ilearn.com'; // Replace with your actual support email
    const subject = encodeURIComponent('App Support Request');
    const mailtoUrl = `mailto:${email}?subject=${subject}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Error', 'No email client configured on this device.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email client.');
    }
  };

  const handleLiveChat = () => {
    // In the future, this would open an Intercom/Zendesk SDK or a custom WebSocket chat screen.
    Alert.alert('Live Chat', 'Our agents are currently offline. Please send us an email and we will respond within 24 hours.');
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Help & Support</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
        
        {/* Active Search */}
        <View className="flex-row items-center px-4 mb-8 bg-white border border-gray-100 shadow-sm h-14 rounded-2xl">
          <Ionicons name="search-outline" size={20} color="#8E8E93" />
          <TextInput 
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for help..." 
            placeholderTextColor="#8E8E93"
            className="flex-1 ml-3 text-base font-manrope text-brand-dark"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#8E8E93" />
            </TouchableOpacity>
          )}
        </View>

        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">
          {searchQuery ? 'Search Results' : 'Frequently Asked Questions'}
        </Text>
        
        <View className="mb-8 overflow-hidden bg-white border shadow-sm rounded-3xl border-gray-50">
          {filteredFaqs.length === 0 ? (
            <View className="items-center justify-center p-8">
              <Text className="text-base text-center text-brand-secondary font-manrope">
                No articles found for "{searchQuery}". Try using different keywords or contact us below.
              </Text>
            </View>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isExpanded = expandedId === faq.id;
              
              return (
                <View key={faq.id} className={index !== filteredFaqs.length - 1 ? 'border-b border-gray-100' : ''}>
                  <TouchableOpacity 
                    onPress={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="flex-row items-center justify-between p-5"
                  >
                    <Text className={`flex-1 pr-4 text-base ${isExpanded ? 'font-kumbh-bold text-brand-primary' : 'font-manrope-bold text-brand-dark'}`}>
                      {faq.question}
                    </Text>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={isExpanded ? "#285A48" : "#8E8E93"} 
                    />
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View className="px-5 pt-1 pb-5 bg-brand-light/10">
                      <Text className="text-sm leading-relaxed font-manrope text-brand-secondary">
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Contact Us</Text>

        <View className="flex-row justify-between mb-12">
          <TouchableOpacity 
            onPress={handleLiveChat}
            className="items-center flex-1 p-5 mr-2 bg-white border shadow-sm rounded-3xl border-gray-50"
          >
            <View className="items-center justify-center mb-3 rounded-full w-14 h-14 bg-brand-light">
              <Ionicons name="chatbubbles-outline" size={24} color="#285A48" />
            </View>
            <Text className="text-base font-manrope-bold text-brand-dark">Live Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleEmailSupport}
            className="items-center flex-1 p-5 ml-2 bg-white border shadow-sm rounded-3xl border-gray-50"
          >
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