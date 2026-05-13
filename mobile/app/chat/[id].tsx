// mobile/app/chat/[id].tsx
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, FlatList, ActivityIndicator, Image, Modal, Pressable, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useChatRoom, Message, formatMessageTime, formatDateLabel, formatPresence } from '../../hooks/chat/useChatRoom';

const HEADER_CONTENT_HEIGHT = 56;

const injectDateSeparators = (messages: Message[]) => {
  const result: (Message | { id: string; type: 'separator'; label: string })[] = [];
  let lastDateLabel = '';
  for (const msg of messages) {
    const label = formatDateLabel(msg.created_at);
    if (label && label !== lastDateLabel) {
      result.push({ id: `sep_${msg.id}`, type: 'separator', label });
      lastDateLabel = label;
    }
    result.push(msg);
  }
  return result;
};

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
  const { state, setters, handlers } = useChatRoom(id);
  const insets = useSafeAreaInsets();
  const keyboardVerticalOffset = insets.top + HEADER_CONTENT_HEIGHT;

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuMessage, setMenuMessage] = useState<Message | null>(null);
  const [avatarVisible, setAvatarVisible] = useState(false);

  const messagesWithSeparators = injectDateSeparators(state.messages);
  const presenceText = id === 'ai_tutor' ? 'Online' : formatPresence(state.otherUserPresence);
  const isOnline = id === 'ai_tutor' ? true : state.otherUserPresence.isOnline;

  const handleLongPress = (msg: Message) => {
    if (!msg.isUser) return; // Only own messages
    setMenuMessage(msg);
    setMenuVisible(true);
  };

  const handleEdit = () => {
    if (!menuMessage) return;
    setMenuVisible(false);
    handlers.startEdit(menuMessage.id, menuMessage.text);
  };

  const handleDelete = () => {
    if (!menuMessage) return;
    setMenuVisible(false);
    Alert.alert(
      'Delete Message',
      'This message will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handlers.deleteMessage(menuMessage.id) }
      ]
    );
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'separator') {
      return (
        <View className="items-center my-3">
          <View className="px-3 py-1 bg-gray-100 rounded-full">
            <Text className="text-xs font-manrope text-brand-secondary">{item.label}</Text>
          </View>
        </View>
      );
    }

    const msg = item as Message;
    const timeStr = formatMessageTime(msg.created_at);

    if (msg.isUser) {
      return (
        <TouchableOpacity
          onLongPress={() => handleLongPress(msg)}
          activeOpacity={0.8}
          className="self-end max-w-[80%] mb-4 items-end"
        >
          <View className="p-4 rounded-tr-sm shadow-sm bg-brand-primary rounded-3xl">
            <Text className="leading-5 text-white font-manrope">{msg.text}</Text>
          </View>
          <View className="flex-row items-center gap-1 mt-1 mr-1">
            {msg.is_edited && (
              <Text className="text-[10px] font-manrope text-brand-secondary italic">edited</Text>
            )}
            {timeStr ? (
              <Text className="text-[10px] font-manrope text-brand-secondary">{timeStr}</Text>
            ) : null}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View className="self-start max-w-[80%] mb-4 items-start">
        <View className="p-4 bg-white border rounded-tl-sm shadow-sm rounded-3xl border-gray-50">
          <Text className="leading-5 font-manrope text-brand-dark">{msg.text}</Text>
        </View>
        <View className="flex-row items-center gap-1 mt-1 ml-1">
          {msg.is_edited && (
            <Text className="text-[10px] font-manrope text-brand-secondary italic">edited</Text>
          )}
          {timeStr ? (
            <Text className="text-[10px] font-manrope text-brand-secondary">{timeStr}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-brand-background">

      {/* Header */}
      <View className="bg-white border-b border-gray-100" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
            <Ionicons name="chevron-back" size={28} color="#285A48" />
          </TouchableOpacity>

          {/* Avatar — tappable to view full image */}
          <TouchableOpacity
            onPress={() => { if (state.otherUserAvatarUrl) setAvatarVisible(true); }}
            className="relative mr-3"
          >
            <View className="items-center justify-center w-10 h-10 overflow-hidden border border-gray-100 rounded-full shadow-sm bg-brand-light">
              {state.otherUserAvatarUrl ? (
                <Image source={{ uri: state.otherUserAvatarUrl }} className="w-10 h-10 rounded-full" resizeMode="cover" />
              ) : (
                <Ionicons name={id === 'ai_tutor' ? "hardware-chip" : "person"} size={20} color="#285A48" />
              )}
            </View>
            <View className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-lg font-kumbh-bold text-brand-dark">{name || 'Chat'}</Text>
            <Text className={`text-xs font-manrope ${isOnline ? 'text-green-500' : 'text-brand-secondary'}`}>
              {presenceText}
            </Text>
          </View>

          {id !== 'ai_tutor' && (
            <TouchableOpacity
              onPress={() => router.push(`/call/${id}`)}
              className="items-center justify-center w-10 h-10 rounded-full bg-brand-light"
            >
              <Ionicons name="videocam-outline" size={22} color="#285A48" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardVerticalOffset : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={state.flatListRef}
          data={messagesWithSeparators}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 24, paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => state.flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => state.flatListRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={
            state.isTyping ? (
              <View className="self-start px-4 py-3 mb-4 bg-white border rounded-tl-sm shadow-sm rounded-3xl border-gray-50">
                <ActivityIndicator size="small" color="#285A48" />
              </View>
            ) : null
          }
        />

        {/* Input — switches to edit mode when editing */}
        <View
          className="px-6 py-3 bg-white border-t border-gray-100"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          {state.editingMessageId && (
            <View className="flex-row items-center px-1 mb-2">
              <Ionicons name="pencil" size={14} color="#285A48" />
              <Text className="flex-1 ml-1 text-xs font-manrope text-brand-primary">Editing message</Text>
              <TouchableOpacity onPress={handlers.cancelEdit}>
                <Ionicons name="close" size={18} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          )}
          <View className="flex-row items-center">
            <TextInput
              value={state.editingMessageId ? state.editingText : state.inputText}
              onChangeText={state.editingMessageId ? setters.setEditingText : setters.setInputText}
              onSubmitEditing={state.editingMessageId ? handlers.saveEdit : handlers.sendMessage}
              placeholder={state.editingMessageId ? "Edit message..." : "Type a message..."}
              placeholderTextColor="#8E8E93"
              className="flex-1 h-12 px-5 border border-gray-100 rounded-full bg-gray-50 font-manrope text-brand-dark"
            />
            <TouchableOpacity
              onPress={state.editingMessageId ? handlers.saveEdit : handlers.sendMessage}
              disabled={!(state.editingMessageId ? state.editingText.trim() : state.inputText.trim())}
              className={`w-12 h-12 rounded-full items-center justify-center ml-3 shadow-sm ${
                !(state.editingMessageId ? state.editingText.trim() : state.inputText.trim())
                  ? 'bg-gray-300' : 'bg-brand-primary'
              }`}
            >
              <Ionicons
                name={state.editingMessageId ? "checkmark" : "send"}
                size={18} color="#FFFFFF" className="ml-1"
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Long-press action menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable className="justify-end flex-1 bg-black/40" onPress={() => setMenuVisible(false)}>
          <View className="px-6 pt-4 pb-10 bg-white rounded-t-3xl">
            <View className="self-center w-10 h-1 mb-4 bg-gray-200 rounded-full" />
            <TouchableOpacity
              onPress={handleEdit}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <Ionicons name="pencil-outline" size={22} color="#285A48" />
              <Text className="ml-4 text-base font-manrope text-brand-dark">Edit Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              className="flex-row items-center py-4"
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
              <Text className="ml-4 text-base text-red-500 font-manrope">Delete Message</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Full-screen avatar viewer */}
      <Modal transparent visible={avatarVisible} animationType="fade" onRequestClose={() => setAvatarVisible(false)}>
        <Pressable className="items-center justify-center flex-1 bg-black/90" onPress={() => setAvatarVisible(false)}>
          {state.otherUserAvatarUrl && (
            <Image
              source={{ uri: state.otherUserAvatarUrl }}
              style={{ width: 300, height: 300, borderRadius: 12 }}
              resizeMode="cover"
            />
          )}
          <Text className="mt-4 text-sm text-white font-manrope opacity-60">Tap anywhere to close</Text>
        </Pressable>
      </Modal>

    </View>
  );
}