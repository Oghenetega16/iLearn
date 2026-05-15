// mobile/app/create-group.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGroups } from '../hooks/chat/useGroups';

export default function CreateGroupScreen() {
  const { actions } = useGroups();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Group name required', 'Please enter a name for your group.');
      return;
    }
    setLoading(true);
    const groupId = await actions.createGroup(name, description);
    setLoading(false);
    if (groupId) {
      router.replace({
        pathname: '/group/[id]',
        params: { id: groupId, name: name.trim() }
      });
    } else {
      Alert.alert('Error', 'Failed to create group. Please try again.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#091413" />
        </TouchableOpacity>
        <Text className="text-lg font-kumbh-bold text-brand-dark">New Study Group</Text>
        <TouchableOpacity
          onPress={handleCreate}
          disabled={loading || !name.trim()}
          className={`px-4 py-2 rounded-xl ${name.trim() ? 'bg-brand-primary' : 'bg-gray-200'}`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className={`text-sm font-kumbh-bold ${name.trim() ? 'text-white' : 'text-gray-400'}`}>
              Create
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <View className="px-6 mt-6">
        {/* Group icon placeholder */}
        <View className="items-center mb-8">
          <View className="items-center justify-center w-24 h-24 mb-3 rounded-full bg-brand-light">
            <Ionicons name="people" size={40} color="#285A48" />
          </View>
          <Text className="text-xs font-manrope text-brand-secondary">Group icon (coming soon)</Text>
        </View>

        {/* Name input */}
        <Text className="mb-2 text-sm font-manrope-bold text-brand-dark">Group Name *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. React Native Study Group"
          placeholderTextColor="#8E8E93"
          maxLength={50}
          className="h-12 px-4 mb-1 bg-white border border-gray-200 rounded-2xl font-manrope text-brand-dark"
        />
        <Text className="mb-6 text-xs text-right font-manrope text-brand-secondary">{name.length}/50</Text>

        {/* Description input */}
        <Text className="mb-2 text-sm font-manrope-bold text-brand-dark">Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What is this group about?"
          placeholderTextColor="#8E8E93"
          multiline
          numberOfLines={4}
          maxLength={200}
          className="px-4 py-3 mb-1 bg-white border border-gray-200 rounded-2xl font-manrope text-brand-dark"
          style={{ height: 100, textAlignVertical: 'top' }}
        />
        <Text className="text-xs text-right font-manrope text-brand-secondary">{description.length}/200</Text>

        <View className="flex-row items-center p-4 mt-6 rounded-2xl bg-brand-light">
          <Ionicons name="information-circle-outline" size={20} color="#285A48" />
          <Text className="flex-1 ml-3 text-xs font-manrope text-brand-primary">
            You&apos;ll be the admin. Max 20 members. Share the invite link after creation.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}