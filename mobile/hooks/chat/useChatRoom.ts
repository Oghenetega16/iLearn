// mobile/hooks/chat/useChatRoom.ts
import { useState, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';

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

  // 1. INITIALIZATION & FETCHING
  useEffect(() => {
    let channel: any = null;

    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMyUserId(user.id);

      if (isAI) {
        // AI Welcome Message
        setMessages([{
          id: 'welcome_ai',
          text: "Hello! I'm your personal AI tutor. Need help understanding a concept?",
          isUser: false,
        }]);
        return; // Stop here, AI doesn't use the database
      }

      // Human Logic: Find if a room already exists
      const { data: myRooms } = await supabase
        .from('room_participants')
        .select('room_id')
        .eq('user_id', user.id);

      if (myRooms && myRooms.length > 0) {
        const roomIds = myRooms.map(r => r.room_id);
        
        // Find the specific room shared with the other user
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

    // Cleanup subscription on unmount
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
      .order('created_at', { ascending: true }); // Oldest first, so FlatList scrolls down

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
    return supabase.channel(`room_${currentRoomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${currentRoomId}` },
        (payload) => {
          const newMsg = payload.new;
          // Only add it if we didn't just send it (to avoid double rendering optimistic UI)
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
    if (!textToSend) return;

    setInputText(''); // Clear instantly for good UX

    // Optimistic UI Update
    const optimisticMsg: Message = { id: Date.now().toString(), text: textToSend, isUser: true };
    setMessages(prev => [...prev, optimisticMsg]);
    setIsTyping(true);

    if (isAI) {
      // Fake AI Network Delay
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: "That is a great question! I am ready to process this when connected to an LLM.",
          isUser: false,
        }]);
        setIsTyping(false);
      }, 1500);
      return;
    }

    // --- REAL DATABASE SEND ---
    
    // TypeScript Safety Check: If it's a human chat, we MUST have a myUserId
    if (!myUserId) {
      setIsTyping(false);
      return; 
    }

    try {
      let activeRoomId = roomId;

      // If no room exists yet (first time chatting), create it NOW
      if (!activeRoomId) {
        // 1. Create Room
        const { data: newRoom, error: roomErr } = await supabase.from('rooms').insert({}).select().single();
        if (roomErr || !newRoom) throw roomErr;
        
        activeRoomId = newRoom.id;
        setRoomId(activeRoomId);

        // 2. Add Both Participants
        await supabase.from('room_participants').insert([
          { room_id: activeRoomId as string, user_id: myUserId },
          { room_id: activeRoomId as string, user_id: otherUserId }
        ]);

        // 3. Start listening to this new room
        subscribeToRealtime(activeRoomId as string, myUserId);
      }

      // Insert the actual message
      await supabase.from('messages').insert({
        room_id: activeRoomId as string,
        sender_id: myUserId,
        content: textToSend
      });

    } catch (error) {
      console.error("Error sending message:", error);
      // Optional: Show an error icon next to the optimistic message
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