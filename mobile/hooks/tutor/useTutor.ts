// mobile/hooks/tutor/useTutor.ts
import { useState, useRef } from 'react';
import { FlatList } from 'react-native';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export function useTutor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello Oghenetega! I'm your personal AI tutor. Need help understanding a concept or stuck on an assignment?",
      isUser: false,
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Reference to auto-scroll the FlatList
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // 1. Instantly add the user's message to the UI
    const newUserMsg: Message = { 
      id: Date.now().toString(), 
      text: inputText.trim(), 
      isUser: true 
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputText('');
    setIsTyping(true);

    // 2. Simulate network delay / AI processing
    // NOTE: This is where you will eventually `fetch()` your Supabase Edge Function
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "That is a great question! In React Native, routing is typically handled natively using libraries like React Navigation (which Expo Router wraps), whereas React JS uses web history APIs.",
        isUser: false,
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  return {
    state: { messages, inputText, isTyping, flatListRef },
    setters: { setInputText },
    handlers: { sendMessage }
  };
}