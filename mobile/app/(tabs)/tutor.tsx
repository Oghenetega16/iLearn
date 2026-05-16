// mobile/app/(tabs)/tutor.tsx
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useInbox, ChatItem } from '../../hooks/chat/useInbox';
import { useCallback } from 'react';
import { useUnread } from '../../contexts/UnreadContext';

export default function MessagesInboxScreen() {
  const { state, setters } = useInbox();

  const { refreshUnread } = useUnread();

  useFocusEffect(
    useCallback(() => {
      refreshUnread();
    }, [refreshUnread])
  );

  const handleNewChat = () => {
    router.push('/search-users');
  };

  const ChatRow = ({ chat }: { chat: ChatItem }) => (
    <TouchableOpacity
      onPress={() => router.push(
        chat.isGroup
          ? { pathname: '/group/[id]', params: { id: chat.id, name: chat.name } }
          : { pathname: '/chat/[id]', params: { id: chat.id, name: chat.name } }
      )}
      className={`flex-row items-center py-4 border-b ${chat.isPinned ? 'border-brand-primary/20' : 'border-gray-100'}`}
    >
      {/* Avatar */}
      <View className="relative mr-4">
        <View className={`items-center justify-center border rounded-full shadow-sm w-14 h-14 overflow-hidden ${chat.isPinned ? 'bg-brand-light border-brand-primary/30' : 'bg-white border-gray-100'}`}>
          {chat.avatarUrl ? (
            <Image
              source={{ uri: chat.avatarUrl }}
              className="rounded-full w-14 h-14"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name={chat.icon as any} size={24} color="#285A48" />
          )}
        </View>
        {chat.isOnline && (
          <View className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
        )}
      </View>

      {/* Message Preview */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1 pr-2">
            <Text className="text-base font-kumbh-bold text-brand-dark" numberOfLines={1}>
              {chat.name}
            </Text>
            {chat.isPinned && (
              <View className="px-2 py-0.5 ml-2 rounded bg-brand-primary/10">
                <Text className="text-[10px] uppercase font-kumbh-bold text-brand-primary">Pinned</Text>
              </View>
            )}
            {!chat.isPinned && chat.role === 'tutor' && (
              <View className="px-2 py-0.5 ml-2 rounded bg-amber-500/10">
                <Text className="text-[10px] uppercase font-kumbh-bold text-amber-600">Tutor</Text>
              </View>
            )}
          </View>
          <Text className={`text-xs font-manrope-semi ${chat.unread > 0 ? 'text-brand-primary' : 'text-gray-400'}`}>
            {chat.time}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text
            className={`flex-1 pr-4 text-sm font-manrope ${chat.unread > 0 ? 'text-brand-dark font-manrope-bold' : 'text-brand-secondary'}`}
            numberOfLines={1}
          >
            {chat.lastMessage}
          </Text>
          {chat.unread > 0 && (
            <View className="items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-brand-primary">
              <Text className="text-xs text-white font-manrope-bold">
                {chat.unread > 99 ? '99+' : chat.unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-kumbh-bold text-brand-dark">Messages</Text>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => router.push('/create-group')}
            className="items-center justify-center w-10 h-10 rounded-full bg-brand-light"
          >
            <Ionicons name="people-outline" size={20} color="#285A48" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNewChat}
            className="items-center justify-center w-10 h-10 rounded-full bg-brand-light"
          >
            <Ionicons name="create-outline" size={20} color="#285A48" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        
        {/* Active Database Search */}
        <View className="px-6 py-4">
          <View className="flex-row items-center h-12 px-4 bg-white border border-gray-100 shadow-sm rounded-2xl">
            <Ionicons name="search-outline" size={20} color="#8E8E93" />
            <TextInput 
              value={state.searchQuery}
              onChangeText={setters.setSearchQuery}
              placeholder="Search users..." 
              placeholderTextColor="#8E8E93"
              className="flex-1 ml-3 text-base font-manrope text-brand-dark"
            />
            {state.loading && (
              <ActivityIndicator size="small" color="#285A48" />
            )}
          </View>
        </View>

        {/* Chat List */}
        <View className="px-6 mb-8">
          {state.chats.map((chat) => (
            <ChatRow key={chat.id} chat={chat} />
          ))}
          
          {!state.loading && state.chats.length === 1 && state.searchQuery && (
            <Text className="mt-8 text-center font-manrope text-brand-secondary">
              No users found matching &ldquo;{state.searchQuery}&rdquo;
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}