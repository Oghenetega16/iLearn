import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';

const LEVELS = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
const PRICES = ['Any Price', 'Free', 'Paid'];
const RATINGS = ['4.5 & up', '4.0 & up', '3.5 & up', '3.0 & up'];

export default function FilterScreen() {
  const [activeLevel, setActiveLevel] = useState('All Levels');
  const [activePrice, setActivePrice] = useState('Any Price');
  const [activeRating, setActiveRating] = useState('4.5 & up');

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#091413" />
        </TouchableOpacity>
        <Text className="text-xl font-kumbh-bold text-brand-dark">Filter</Text>
        <TouchableOpacity onPress={() => {
          setActiveLevel('All Levels');
          setActivePrice('Any Price');
          setActiveRating('4.5 & up');
        }}>
          <Text className="text-base font-manrope-bold text-brand-primary">Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-6 pt-6">
        
        {/* Difficulty Level */}
        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Difficulty Level</Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {LEVELS.map((level) => (
            <TouchableOpacity 
              key={level}
              onPress={() => setActiveLevel(level)}
              className={`px-5 py-2.5 rounded-full border ${activeLevel === level ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-manrope-semi ${activeLevel === level ? 'text-white' : 'text-brand-secondary'}`}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pricing */}
        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Pricing</Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {PRICES.map((price) => (
            <TouchableOpacity 
              key={price}
              onPress={() => setActivePrice(price)}
              className={`px-5 py-2.5 rounded-full border ${activePrice === price ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-manrope-semi ${activePrice === price ? 'text-white' : 'text-brand-secondary'}`}>
                {price}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ratings */}
        <Text className="mb-4 text-lg font-kumbh-bold text-brand-dark">Minimum Rating</Text>
        <View className="flex-row flex-wrap gap-3 mb-8">
          {RATINGS.map((rating) => (
            <TouchableOpacity 
              key={rating}
              onPress={() => setActiveRating(rating)}
              className={`flex-row items-center px-5 py-2.5 rounded-full border ${activeRating === rating ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-200'}`}
            >
              <Ionicons name="star" size={14} color={activeRating === rating ? '#FFFFFF' : '#F59E0B'} className="mr-2" />
              <Text className={`font-manrope-semi ml-1 ${activeRating === rating ? 'text-white' : 'text-brand-secondary'}`}>
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Apply Button */}
      <View className="px-6 pt-4 pb-8 bg-white border-t border-gray-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="items-center w-full py-4 shadow-sm bg-brand-primary rounded-2xl"
        >
          <Text className="text-lg text-white font-manrope-bold">Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}