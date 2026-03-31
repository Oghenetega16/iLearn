import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const TUTORS = [
  { id: '1', name: 'Sarah Jenkins', role: 'UI/UX Design', rating: '4.9', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop' },
  { id: '2', name: 'Oghenetega', role: 'React Native', rating: '5.0', image: 'https://i.pravatar.cc/150?img=11' },
  { id: '3', name: 'Michael Chen', role: 'Finance', rating: '4.8', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
];

const DATES = [
  { day: 'Wed', date: '14' }, { day: 'Thu', date: '15' }, { day: 'Fri', date: '16' }, { day: 'Sat', date: '17' }, { day: 'Sun', date: '18' }
];

const TIMES = ['09:00 AM', '10:30 AM', '01:00 PM', '03:00 PM', '05:30 PM'];

export default function BookSessionScreen() {
  const [activeTutor, setActiveTutor] = useState(TUTORS[0].id);
  const [activeDate, setActiveDate] = useState(DATES[0].date);
  const [activeTime, setActiveTime] = useState(TIMES[1]);

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="text-xl font-kumbh-bold text-brand-dark">Book a Session</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
          
          {/* 1. Select Tutor */}
          <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Select Tutor</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 overflow-visible">
            {TUTORS.map((tutor) => (
              <TouchableOpacity 
                key={tutor.id} 
                onPress={() => setActiveTutor(tutor.id)}
                className={`p-4 rounded-3xl mr-4 items-center w-36 border ${activeTutor === tutor.id ? 'bg-brand-light border-brand-primary' : 'bg-white border-gray-100 shadow-sm'}`}
              >
                <Image source={{ uri: tutor.image }} className="w-16 h-16 mb-3 bg-gray-200 rounded-full" />
                <Text className="mb-1 text-center font-kumbh-bold text-brand-dark">{tutor.name}</Text>
                <Text className="mb-2 text-xs text-center font-manrope text-brand-secondary">{tutor.role}</Text>
                <View className="flex-row items-center">
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text className="ml-1 text-xs font-manrope-bold text-brand-dark">{tutor.rating}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 2. Select Date */}
          <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Select Date</Text>
          <View className="flex-row justify-between mb-8">
            {DATES.map((item) => (
              <TouchableOpacity 
                key={item.date}
                onPress={() => setActiveDate(item.date)}
                className={`items-center justify-center py-4 px-3 rounded-2xl border ${activeDate === item.date ? 'bg-brand-primary border-brand-primary shadow-sm' : 'bg-white border-gray-100'}`}
              >
                <Text className={`font-manrope text-xs mb-1 ${activeDate === item.date ? 'text-white/80' : 'text-brand-secondary'}`}>{item.day}</Text>
                <Text className={`font-kumbh-bold text-lg ${activeDate === item.date ? 'text-white' : 'text-brand-dark'}`}>{item.date}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. Select Time */}
          <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Available Time</Text>
          <View className="flex-row flex-wrap gap-3 mb-8">
            {TIMES.map((time) => (
              <TouchableOpacity 
                key={time}
                onPress={() => setActiveTime(time)}
                className={`px-5 py-3 rounded-full border ${activeTime === time ? 'bg-brand-light border-brand-primary' : 'bg-white border-gray-100 shadow-sm'}`}
              >
                <Text className={`font-manrope-bold ${activeTime === time ? 'text-brand-primary' : 'text-brand-dark'}`}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 4. Session Topic */}
          <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">What do you want to learn?</Text>
          <View className="p-4 mb-12 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <TextInput 
              placeholder="E.g., I need help understanding React Navigation..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={4}
              className="h-24 text-base text-left font-manrope text-brand-dark"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Button */}
      <View className="px-6 pt-4 pb-8 bg-white border-t border-gray-100">
        <TouchableOpacity 
          // For the prototype, this jumps straight to the call screen so you can demo it!
          onPress={() => router.replace('/booking-success')}
          className="items-center w-full py-4 shadow-sm bg-brand-primary rounded-2xl"
        >
          <Text className="text-lg text-white font-manrope-bold">Request Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}