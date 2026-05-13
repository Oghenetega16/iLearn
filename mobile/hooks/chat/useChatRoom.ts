// mobile/hooks/chat/useChatRoom.ts
import { useState, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // --- AUTO-SAVE AI CHAT TO DEVICE ---
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

      // Force session hydration
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }

      if (isAI) {
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
      // Check if we already have a shared room with this participant
      const { data: sharedRoom, error: rpcError } = await supabase.rpc('get_shared_room', {
        user_a: user.id,
        user_b: otherUserId
      });

      if (!rpcError && sharedRoom && sharedRoom[0]) {
        const activeId = sharedRoom[0].room_id;
        setRoomId(activeId);
        fetchMessages(activeId, user.id);
        channel = subscribeToRealtime(activeId, user.id);
      }
    };

    initChat();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [otherUserId]);

  // 2. FETCH EXISTING MESSAGES
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

  // 3. REALTIME SUBSCRIPTION
  const subscribeToRealtime = (currentRoomId: string, currentMyId: string) => {
    const channelName = `room_${currentRoomId}_${Date.now()}`;
    
    return supabase.channel(channelName)
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

  // 4. SEND MESSAGE LOGIC
  const sendMessage = async () => {

    const textToSend = inputText.trim();
    if (!textToSend || !myUserId) return;

    // Force the session onto the client before any DB calls
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }

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
        console.error("AI Error:", e.message);
      } finally {
        setIsTyping(false);
      }
      return; 
    }

    // --- HUMAN MESSAGE FLOW ---
    try {
      let activeRoomId = roomId;

      // STEP 1 & 2: Dynamic Creation
      if (!activeRoomId) {
        // Create the Room (Allowed by the new SQL INSERT policy)
        const { data: { session } } = await supabase.auth.getSession();
        const { data: newRoom, error: roomErr } = await supabase
          .from('rooms')
          .insert({})
          .select()
          .single();

          console.log("ROOM INSERT RESULT:", JSON.stringify({ data: newRoom, error: roomErr }));
        
        if (roomErr) throw roomErr;
        activeRoomId = newRoom.id;

        // Add Participants (Creator + Recipient)
        const { error: partErr } = await supabase.from('room_participants').insert([
          { room_id: activeRoomId, user_id: myUserId },
          { room_id: activeRoomId, user_id: otherUserId }
        ]);
        
        if (partErr) throw partErr;

        setRoomId(activeRoomId);
        subscribeToRealtime(activeRoomId, myUserId);
      }

      // STEP 3: Update metadata
      await supabase
        .from('rooms')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', activeRoomId);

      // STEP 4: Send the message
      const { error: msgErr } = await supabase.from('messages').insert({
        room_id: activeRoomId,
        sender_id: myUserId,
        content: textToSend
      });

      if (msgErr) throw msgErr;

    } catch (error) {
      console.error("Critical Chat Error:", error);
      // Optional: Remove optimistic message if error occurs
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