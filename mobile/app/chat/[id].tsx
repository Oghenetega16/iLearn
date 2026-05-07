// mobile/app/chat/[id].tsx
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useChatRoom, Message } from '../../hooks/chat/useChatRoom'; // <-- Updated import

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
  // Pass the ID to the hook so it knows who to fetch!
  const { state, setters, handlers } = useChatRoom(id);

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
    <SafeAreaView className="flex-1 bg-brand-background">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100">
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
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

        {/* Input Area */}
        <View className="flex-row items-center px-6 py-4 bg-white border-t border-gray-100">
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
    </SafeAreaView>
  );
}