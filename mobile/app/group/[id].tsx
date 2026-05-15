// mobile/app/group/[id].tsx
import {
  View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, FlatList, ActivityIndicator, Image, Modal, Pressable, Alert, Linking
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useGroupChat, GroupMessage, formatMessageTime, formatDateLabel, formatFileSize } from '../../hooks/chat/useGroupChat';
import { useGroups } from '../../hooks/chat/useGroups';

const HEADER_CONTENT_HEIGHT = 56;

const injectDateSeparators = (messages: GroupMessage[]) => {
  const result: (GroupMessage | { id: string; type: 'separator'; label: string })[] = [];
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

const isImageType = (mimeType?: string | null) => mimeType?.startsWith('image/') ?? false;

export default function GroupChatScreen() {
  const { id, name, joining } = useLocalSearchParams<{ id: string; name: string; joining?: string }>();
  const { state, setters, handlers } = useGroupChat(id);
  const { actions } = useGroups();
  const insets = useSafeAreaInsets();
  const keyboardVerticalOffset = insets.top + HEADER_CONTENT_HEIGHT;

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuMessage, setMenuMessage] = useState<GroupMessage | null>(null);
  const [attachMenuVisible, setAttachMenuVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesWithSeparators = injectDateSeparators(state.messages);

  useEffect(() => {
  if (joining === 'true') {
    actions.joinGroup(id);
  }
}, [joining]);

  const handleLongPress = (msg: GroupMessage) => {
    if (!msg.isUser) return;
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
    Alert.alert('Delete Message', 'This message will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => handlers.deleteMessage(menuMessage.id) }
    ]);
  };

  const renderFileBubble = (msg: GroupMessage) => {
    const isImage = isImageType(msg.file_type);
    if (isImage && msg.file_url) {
      return (
        <TouchableOpacity onPress={() => setPreviewImage(msg.file_url!)}>
          <Image source={{ uri: msg.file_url }} style={{ width: 200, height: 200, borderRadius: 12 }} resizeMode="cover" />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        onPress={() => msg.file_url && Linking.openURL(msg.file_url)}
        className={`flex-row items-center p-3 rounded-2xl ${msg.isUser ? 'bg-brand-primary/80' : 'bg-gray-100'}`}
        style={{ maxWidth: 220 }}
      >
        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${msg.isUser ? 'bg-white/20' : 'bg-brand-primary/10'}`}>
          <Ionicons name="document-text-outline" size={22} color={msg.isUser ? '#fff' : '#285A48'} />
        </View>
        <View className="flex-1">
          <Text className={`text-sm font-manrope-bold ${msg.isUser ? 'text-white' : 'text-brand-dark'}`} numberOfLines={2}>
            {msg.file_name}
          </Text>
          <Text className={`text-xs font-manrope mt-0.5 ${msg.isUser ? 'text-white/70' : 'text-brand-secondary'}`}>
            {formatFileSize(msg.file_size)}
          </Text>
        </View>
        <Ionicons name="download-outline" size={18} color={msg.isUser ? '#fff' : '#285A48'} />
      </TouchableOpacity>
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

    const msg = item as GroupMessage;
    const timeStr = formatMessageTime(msg.created_at);
    const hasFile = !!msg.file_url;
    const hasText = !!msg.text;

    if (msg.isUser) {
      return (
        <TouchableOpacity
          onLongPress={() => handleLongPress(msg)}
          activeOpacity={0.8}
          className="self-end max-w-[80%] mb-4 items-end"
        >
          {hasFile && renderFileBubble(msg)}
          {hasText && (
            <View className="p-4 mt-1 rounded-tr-sm shadow-sm bg-brand-primary rounded-3xl">
              <Text className="leading-5 text-white font-manrope">{msg.text}</Text>
            </View>
          )}
          <View className="flex-row items-center gap-1 mt-1 mr-1">
            {msg.is_edited && <Text className="text-[10px] font-manrope text-brand-secondary italic">edited</Text>}
            {timeStr && <Text className="text-[10px] font-manrope text-brand-secondary">{timeStr}</Text>}
          </View>
        </TouchableOpacity>
      );
    }

    // Other user's message — show avatar and name
    return (
      <View className="self-start max-w-[80%] mb-4 items-start flex-row">
        <View className="items-center justify-center w-8 h-8 mt-1 mr-2 overflow-hidden rounded-full bg-brand-light shrink-0">
          {msg.senderAvatar ? (
            <Image source={{ uri: msg.senderAvatar }} className="w-8 h-8 rounded-full" resizeMode="cover" />
          ) : (
            <Ionicons name="person" size={16} color="#285A48" />
          )}
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-xs font-manrope-bold text-brand-secondary">{msg.senderName}</Text>
          {hasFile && renderFileBubble(msg)}
          {hasText && (
            <View className="p-4 mt-1 bg-white border rounded-tl-sm shadow-sm rounded-3xl border-gray-50">
              <Text className="leading-5 font-manrope text-brand-dark">{msg.text}</Text>
            </View>
          )}
          <View className="flex-row items-center gap-1 mt-1 ml-1">
            {msg.is_edited && <Text className="text-[10px] font-manrope text-brand-secondary italic">edited</Text>}
            {timeStr && <Text className="text-[10px] font-manrope text-brand-secondary">{timeStr}</Text>}
          </View>
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
          <View className="items-center justify-center w-10 h-10 mr-3 overflow-hidden border border-gray-100 rounded-full shadow-sm bg-brand-light">
            {state.groupInfo?.avatar_url ? (
              <Image source={{ uri: state.groupInfo.avatar_url }} className="w-10 h-10 rounded-full" resizeMode="cover" />
            ) : (
              <Ionicons name="people" size={20} color="#285A48" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-kumbh-bold text-brand-dark" numberOfLines={1}>
              {state.groupInfo?.name || name || 'Group'}
            </Text>
            <Text className="text-xs font-manrope text-brand-secondary">
              {state.groupInfo?.member_count ?? 0} members
            </Text>
          </View>
          {/* Invite button */}
          <TouchableOpacity
            onPress={() => actions.shareInviteLink(id, state.groupInfo?.name || name)}
            className="items-center justify-center w-10 h-10 mr-2 rounded-full bg-brand-light"
          >
            <Ionicons name="person-add-outline" size={20} color="#285A48" />
          </TouchableOpacity>
          {/* Group call button */}
          {state.groupInfo?.call_room_id && (
            <TouchableOpacity
              onPress={() => router.push(`/call/${state.groupInfo!.call_room_id}`)}
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
            state.isTyping || state.isUploading ? (
              <View className="flex-row items-center self-start gap-2 px-4 py-3 mb-4 bg-white border rounded-tl-sm shadow-sm rounded-3xl border-gray-50">
                <ActivityIndicator size="small" color="#285A48" />
                {state.isUploading && <Text className="text-xs font-manrope text-brand-secondary">Uploading...</Text>}
              </View>
            ) : null
          }
        />

        {/* Input bar */}
        <View
          className="px-4 py-3 bg-white border-t border-gray-100"
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
            {!state.editingMessageId && (
              <TouchableOpacity
                onPress={() => setAttachMenuVisible(true)}
                className="items-center justify-center w-10 h-10 mr-2 bg-gray-100 rounded-full"
              >
                <Ionicons name="attach-outline" size={22} color="#285A48" />
              </TouchableOpacity>
            )}
            <TextInput
              value={state.editingMessageId ? state.editingText : state.inputText}
              onChangeText={state.editingMessageId ? setters.setEditingText : setters.setInputText}
              onSubmitEditing={state.editingMessageId ? handlers.saveEdit : handlers.sendMessage}
              placeholder={state.editingMessageId ? "Edit message..." : "Message group..."}
              placeholderTextColor="#8E8E93"
              className="flex-1 h-12 px-5 border border-gray-100 rounded-full bg-gray-50 font-manrope text-brand-dark"
            />
            <TouchableOpacity
              onPress={state.editingMessageId ? handlers.saveEdit : handlers.sendMessage}
              disabled={!(state.editingMessageId ? state.editingText.trim() : state.inputText.trim())}
              className={`w-12 h-12 rounded-full items-center justify-center ml-2 shadow-sm ${
                !(state.editingMessageId ? state.editingText.trim() : state.inputText.trim())
                  ? 'bg-gray-300' : 'bg-brand-primary'
              }`}
            >
              <Ionicons name={state.editingMessageId ? "checkmark" : "send"} size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Long-press menu */}
      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable className="justify-end flex-1 bg-black/40" onPress={() => setMenuVisible(false)}>
          <View className="px-6 pt-4 pb-10 bg-white rounded-t-3xl">
            <View className="self-center w-10 h-1 mb-4 bg-gray-200 rounded-full" />
            <TouchableOpacity onPress={handleEdit} className="flex-row items-center py-4 border-b border-gray-100">
              <Ionicons name="pencil-outline" size={22} color="#285A48" />
              <Text className="ml-4 text-base font-manrope text-brand-dark">Edit Message</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} className="flex-row items-center py-4">
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
              <Text className="ml-4 text-base text-red-500 font-manrope">Delete Message</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Attachment picker */}
      <Modal transparent visible={attachMenuVisible} animationType="fade" onRequestClose={() => setAttachMenuVisible(false)}>
        <Pressable className="justify-end flex-1 bg-black/40" onPress={() => setAttachMenuVisible(false)}>
          <View className="px-6 pt-4 pb-10 bg-white rounded-t-3xl">
            <View className="self-center w-10 h-1 mb-4 bg-gray-200 rounded-full" />
            <Text className="mb-4 text-base font-kumbh-bold text-brand-dark">Share a file</Text>
            <TouchableOpacity
              onPress={() => { setAttachMenuVisible(false); handlers.pickImage(); }}
              className="flex-row items-center py-4 border-b border-gray-100"
            >
              <View className="items-center justify-center w-10 h-10 mr-4 rounded-full bg-blue-50">
                <Ionicons name="image-outline" size={22} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-base font-manrope text-brand-dark">Photo</Text>
                <Text className="text-xs font-manrope text-brand-secondary">JPG, PNG, GIF, WEBP</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setAttachMenuVisible(false); handlers.pickDocument(); }}
              className="flex-row items-center py-4"
            >
              <View className="items-center justify-center w-10 h-10 mr-4 rounded-full bg-red-50">
                <Ionicons name="document-text-outline" size={22} color="#EF4444" />
              </View>
              <View>
                <Text className="text-base font-manrope text-brand-dark">Document</Text>
                <Text className="text-xs font-manrope text-brand-secondary">PDF, DOC, DOCX — max 10MB</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Image preview */}
      <Modal transparent visible={!!previewImage} animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <Pressable className="items-center justify-center flex-1 bg-black/95" onPress={() => setPreviewImage(null)}>
          {previewImage && (
            <Image source={{ uri: previewImage }} style={{ width: '90%', height: '70%', borderRadius: 12 }} resizeMode="contain" />
          )}
          <Text className="mt-4 text-sm text-white font-manrope opacity-60">Tap anywhere to close</Text>
        </Pressable>
      </Modal>
    </View>
  );
}