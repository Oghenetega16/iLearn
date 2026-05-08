// mobile/app/chat/[id].tsx
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useChatRoom, Message } from '../../hooks/chat/useChatRoom';

// Standard header height (nav bar content area)
const HEADER_CONTENT_HEIGHT = 56; // py-3 (12px top + 12px bottom) + icon height (32px) = ~56px

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
  const { state, setters, handlers } = useChatRoom(id);

  const insets = useSafeAreaInsets();

  // Total height the KAV needs to offset on iOS:
  // the manual header = status bar (insets.top) + the nav row itself
  const keyboardVerticalOffset = insets.top + HEADER_CONTENT_HEIGHT;

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.isUser) {
      return (
        <View className="self-end max-w-[80%] bg-brand-primary p-4 rounded-3xl rounded-tr-sm shadow-sm mb-4">
          <Text className="leading-5 text-white font-manrope">
            {item.text}
          </Text>
        </View>
      );
    }

    return (
      <View className="self-start max-w-[80%] bg-white p-4 rounded-3xl rounded-tl-sm shadow-sm mb-4 border border-gray-50">
        <Text className="leading-5 font-manrope text-brand-dark">
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-brand-background">

      {/* Header sits outside KAV — manually offset by notch height */}
      <View className="bg-white border-b border-gray-100" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center px-4 py-3">
          <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
            <Ionicons name="chevron-back" size={28} color="#285A48" />
          </TouchableOpacity>
          <View className="items-center justify-center w-10 h-10 mr-3 border border-gray-100 rounded-full shadow-sm bg-brand-light">
            <Ionicons name={id === 'ai_tutor' ? "hardware-chip" : "person"} size={20} color="#285A48" />
          </View>
          <View className="flex-1">
            <Text className="text-lg font-kumbh-bold text-brand-dark">{name || 'Chat'}</Text>
            <Text className="text-xs font-manrope text-brand-primary">Online</Text>
          </View>
        </View>
      </View>

      {/* 
        KEY CHANGES vs original:
        - iOS: keyboardVerticalOffset tells KAV exactly how tall the manual header is,
          so it knows how much to slide the content up — input lands flush on the keyboard.
        - Android: behavior='height' shrinks the KAV's total height as the keyboard rises,
          which is the most reliable Android pattern (avoids double-offset issues).
      */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? keyboardVerticalOffset : 0}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={state.flatListRef}
          data={state.messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
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

        <View
          className="flex-row items-center px-6 py-3 bg-white border-t border-gray-100"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TextInput
            value={state.inputText}
            onChangeText={setters.setInputText}
            onSubmitEditing={handlers.sendMessage}
            placeholder="Type a message..."
            placeholderTextColor="#8E8E93"
            className="flex-1 h-12 px-5 border border-gray-100 rounded-full bg-gray-50 font-manrope text-brand-dark"
          />
          <TouchableOpacity
            onPress={handlers.sendMessage}
            disabled={!state.inputText.trim()}
            className={`w-12 h-12 rounded-full items-center justify-center ml-3 shadow-sm ${!state.inputText.trim() ? 'bg-gray-300' : 'bg-brand-primary'}`}
          >
            <Ionicons name="send" size={18} color="#FFFFFF" className="ml-1" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}