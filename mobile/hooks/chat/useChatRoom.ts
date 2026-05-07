// mobile/hooks/chat/useChatRoom.ts
import { useState, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <-- NEW IMPORT

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  created_at?: string;
}

export function useChatRoom(otherUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList>(null);
  const isAI = otherUserId === 'ai_tutor';

  // --- NEW: AUTO-SAVE AI CHAT TO DEVICE ---
  useEffect(() => {
    if (isAI && messages.length > 0) {
      AsyncStorage.setItem('ai_chat_history', JSON.stringify(messages));
    }
  }, [messages, isAI]);

  // 1. INITIALIZATION & FETCHING
  useEffect(() => {
    let channel: any = null;

    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMyUserId(user.id);

      if (isAI) {
        // --- LOAD AI CHAT FROM DEVICE MEMORY ---
        const savedHistory = await AsyncStorage.getItem('ai_chat_history');
        if (savedHistory) {
          setMessages(JSON.parse(savedHistory));
        } else {
          setMessages([{
            id: 'welcome_ai',
            text: "Hello! I'm your personal AI tutor. Need help understanding a concept?",
            isUser: false,
          }]);
        }
        return; 
      }

      // --- HUMAN ROOM LOGIC ---
      const { data: myRooms } = await supabase
        .from('room_participants')
        .select('room_id')
        .eq('user_id', user.id);

      if (myRooms && myRooms.length > 0) {
        const roomIds = myRooms.map(r => r.room_id);
        
        const { data: sharedRoom } = await supabase
          .from('room_participants')
          .select('room_id')
          .in('room_id', roomIds)
          .eq('user_id', otherUserId)
          .single();

        if (sharedRoom) {
          setRoomId(sharedRoom.room_id);
          fetchMessages(sharedRoom.room_id, user.id);
          channel = subscribeToRealtime(sharedRoom.room_id, user.id);
        }
      }
    };

    initChat();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [otherUserId]);

  // 2. FETCH EXISTING MESSAGES (Humans Only)
  const fetchMessages = async (currentRoomId: string, currentMyId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', currentRoomId)
      .order('created_at', { ascending: true });

    if (data && !error) {
      const formattedMessages = data.map(msg => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.sender_id === currentMyId,
        created_at: msg.created_at
      }));
      setMessages(formattedMessages);
    }
  };

  // 3. REALTIME SUBSCRIPTION (Humans Only)
  const subscribeToRealtime = (currentRoomId: string, currentMyId: string) => {
    return supabase.channel(`room_${currentRoomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${currentRoomId}` },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.sender_id !== currentMyId) {
            setMessages(prev => [...prev, {
              id: newMsg.id,
              text: newMsg.content,
              isUser: false,
              created_at: newMsg.created_at
            }]);
          }
        }
      ).subscribe();
  };

  // 4. SEND MESSAGE LOGIC (Handles both AI and Humans)
  const sendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend) return;

    setInputText(''); 

    const optimisticMsg: Message = { id: Date.now().toString(), text: textToSend, isUser: true };
    setMessages(prev => [...prev, optimisticMsg]);
    setIsTyping(true);

    if (isAI) {
      try {
        const { data, error } = await supabase.functions.invoke('chat-ai', {
          body: { message: textToSend, history: messages }
        });

        if (error) throw error; 

        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data.reply,
          isUser: false,
        }]);

      } catch (e: any) {
        console.error("🔥 REAL AI ERROR DETAILS:", e.message || e);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: "I'm having trouble connecting to my servers right now. Please try again in a moment.",
          isUser: false,
        }]);
      } finally {
        setIsTyping(false);
      }
      return; 
    }

    if (!myUserId) {
      setIsTyping(false);
      return; 
    }

    try {
      let activeRoomId = roomId;

      if (!activeRoomId) {
        const { data: newRoom, error: roomErr } = await supabase.from('rooms').insert({}).select().single();
        if (roomErr || !newRoom) throw roomErr;
        
        activeRoomId = newRoom.id;
        setRoomId(activeRoomId);

        await supabase.from('room_participants').insert([
          { room_id: activeRoomId as string, user_id: myUserId },
          { room_id: activeRoomId as string, user_id: otherUserId }
        ]);

        subscribeToRealtime(activeRoomId as string, myUserId);
      }

      await supabase.from('messages').insert({
        room_id: activeRoomId as string,
        sender_id: myUserId,
        content: textToSend
      });

    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    state: { messages, inputText, isTyping, flatListRef },
    setters: { setInputText },
    handlers: { sendMessage }
  };
}