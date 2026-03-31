import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const NOTIFICATIONS = [
  { id: '1', title: 'New Course Available', desc: 'Advanced React Native animations is now live!', time: '2 hours ago', type: 'book', unread: true },
  { id: '2', title: 'AI Tutor Response', desc: 'I have an answer regarding your routing question.', time: '5 hours ago', type: 'chatbubbles', unread: true },
  { id: '3', title: 'Payment Successful', desc: 'Your receipt for Graphic Design Pro is ready.', time: '1 day ago', type: 'receipt', unread: false },
  { id: '4', title: 'Daily Reminder', desc: 'You are on a 3-day streak! Keep up the good work.', time: '2 days ago', type: 'flame', unread: false },
];

export default function NotificationsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="flex-1 text-xl font-kumbh-bold text-brand-dark">Notifications</Text>
        <TouchableOpacity>
          <Text className="text-sm font-manrope-semi text-brand-primary">Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-4">
        {NOTIFICATIONS.map((notif) => (
          <TouchableOpacity 
            key={notif.id} 
            className={`flex-row p-4 rounded-2xl mb-3 border ${notif.unread ? 'bg-white border-brand-primary/20 shadow-sm' : 'bg-gray-50 border-transparent'}`}
          >
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${notif.unread ? 'bg-brand-light' : 'bg-gray-200'}`}>
              <Ionicons name={notif.type as any} size={20} color={notif.unread ? '#285A48' : '#8E8E93'} />
            </View>
            <View className="flex-1">
              <View className="flex-row items-start justify-between mb-1">
                <Text className={`font-kumbh-bold text-base flex-1 mr-2 ${notif.unread ? 'text-brand-dark' : 'text-gray-500'}`}>
                  {notif.title}
                </Text>
                {notif.unread && <View className="w-2 h-2 rounded-full bg-brand-primary mt-1.5" />}
              </View>
              <Text className="mb-2 text-sm leading-relaxed font-manrope text-brand-secondary">
                {notif.desc}
              </Text>
              <Text className="text-xs text-gray-400 font-manrope-semi">
                {notif.time}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}