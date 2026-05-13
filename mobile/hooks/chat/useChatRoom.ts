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
  is_edited?: boolean;
}

export interface OtherUserPresence {
  isOnline: boolean;
  lastSeen: string | null;
}

export const formatMessageTime = (isoString?: string): string => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateLabel = (isoString?: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};

export const formatPresence = (presence: OtherUserPresence): string => {
  if (presence.isOnline) return 'Online';
  if (!presence.lastSeen) return 'Offline';
  const diff = Date.now() - new Date(presence.lastSeen).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Last seen just now';
  if (mins < 60) return `Last seen ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Last seen ${hrs}h ago`;
  return `Last seen ${Math.floor(hrs / 24)}d ago`;
};

export function useChatRoom(otherUserId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [otherUserPresence, setOtherUserPresence] = useState<OtherUserPresence>({ isOnline: false, lastSeen: null });
  const [otherUserAvatarUrl, setOtherUserAvatarUrl] = useState<string | null>(null);

  // Edit state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const flatListRef = useRef<FlatList>(null);
  const isAI = otherUserId === 'ai_tutor';

  useEffect(() => {
    if (isAI && messages.length > 0) {
      AsyncStorage.setItem('ai_chat_history', JSON.stringify(messages));
    }
  }, [messages, isAI]);

  const updateMyPresence = async (myId: string) => {
    await supabase.from('profiles').update({ last_seen: new Date().toISOString() }).eq('id', myId);
  };

  const fetchOtherUserPresence = async () => {
    if (isAI) return;
    const { data } = await supabase
      .from('profiles')
      .select('last_seen, avatar_url')
      .eq('id', otherUserId)
      .single();

    if (data) {
      if (data.avatar_url) setOtherUserAvatarUrl(data.avatar_url);
      if (data.last_seen) {
        const diff = Date.now() - new Date(data.last_seen).getTime();
        setOtherUserPresence({ isOnline: diff < 2 * 60 * 1000, lastSeen: data.last_seen });
      }
    }
  };

  useEffect(() => {
    let channel: any = null;
    let presenceInterval: ReturnType<typeof setInterval> | null = null;

    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMyUserId(user.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.auth.setSession({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });
      }

      await updateMyPresence(user.id);

      if (isAI) {
        const savedHistory = await AsyncStorage.getItem('ai_chat_history');
        if (savedHistory) {
          setMessages(JSON.parse(savedHistory));
        } else {
          setMessages([{ id: 'welcome_ai', text: "Hello! I'm your personal AI tutor. Need help understanding a concept?", isUser: false }]);
        }
        return;
      }

      await fetchOtherUserPresence();
      presenceInterval = setInterval(fetchOtherUserPresence, 30000);

      const { data: sharedRoom, error: rpcError } = await supabase.rpc('get_shared_room', {
        user_a: user.id,
        user_b: otherUserId
      });

      let activeRoomId: string | null = null;

      if (!rpcError && sharedRoom && sharedRoom[0]) {
        activeRoomId = sharedRoom[0].room_id;
      } else {
        const { data: newRoom, error: roomErr } = await supabase
          .from('rooms').insert({}).select().single();
        if (roomErr) { console.error("Failed to create room:", roomErr); return; }
        activeRoomId = newRoom.id;
        const { error: partErr } = await supabase.from('room_participants').insert([
          { room_id: activeRoomId, user_id: user.id },
          { room_id: activeRoomId, user_id: otherUserId }
        ]);
        if (partErr) { console.error("Failed to add participants:", partErr); return; }
      }

      setRoomId(activeRoomId);
      fetchMessages(activeRoomId, user.id);
      channel = subscribeToRealtime(activeRoomId, user.id);
    };

    initChat();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (presenceInterval) clearInterval(presenceInterval);
    };
  }, [otherUserId]);

  const fetchMessages = async (currentRoomId: string, currentMyId: string) => {
    const { data, error } = await supabase
      .from('messages').select('*').eq('room_id', currentRoomId).order('created_at', { ascending: true });

    if (data && !error) {
      setMessages(data.map(msg => ({
        id: msg.id,
        text: msg.content,
        isUser: msg.sender_id === currentMyId,
        created_at: msg.created_at,
        is_edited: msg.is_edited ?? false,
      })));
      await supabase.from('messages').update({ is_read: true })
        .eq('room_id', currentRoomId).neq('sender_id', currentMyId).eq('is_read', false);
    }
  };

  const subscribeToRealtime = (currentRoomId: string, currentMyId: string) => {
    const channelName = `room_${currentRoomId}_${Date.now()}`;

    return supabase.channel(channelName)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${currentRoomId}` },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.sender_id !== currentMyId) {
            setMessages(prev => [...prev, {
              id: newMsg.id, text: newMsg.content, isUser: false,
              created_at: newMsg.created_at, is_edited: false,
            }]);
            // Mark incoming message as read immediately
            supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id);
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `room_id=eq.${currentRoomId}` },
        (payload) => {
          const updated = payload.new;
          setMessages(prev => prev.map(msg =>
            msg.id === updated.id
              ? { ...msg, text: updated.content, is_edited: updated.is_edited }
              : msg
          ));
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `room_id=eq.${currentRoomId}` },
        (payload) => {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();
  };

  // Start editing a message
  const startEdit = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  // Save edited message
  const saveEdit = async () => {
    if (!editingMessageId || !editingText.trim()) return;
    const { error } = await supabase
      .from('messages')
      .update({ content: editingText.trim(), is_edited: true })
      .eq('id', editingMessageId);

    if (!error) {
      setMessages(prev => prev.map(msg =>
        msg.id === editingMessageId
          ? { ...msg, text: editingText.trim(), is_edited: true }
          : msg
      ));
    }
    cancelEdit();
  };

  // Delete a message
  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    if (!error) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const sendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || !myUserId) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
    }

    setInputText('');
    const optimisticMsg: Message = {
      id: Date.now().toString(), text: textToSend, isUser: true,
      created_at: new Date().toISOString(), is_edited: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setIsTyping(true);

    if (isAI) {
      try {
        const { data, error } = await supabase.functions.invoke('chat-ai', { body: { message: textToSend, history: messages } });
        if (error) throw error;
        setMessages(prev => [...prev, {
          id: Date.now().toString(), text: data.reply, isUser: false,
          created_at: new Date().toISOString(), is_edited: false,
        }]);
      } catch (e: any) {
        console.error("AI Error:", e.message);
      } finally {
        setIsTyping(false);
      }
      return;
    }

    try {
      if (!roomId) { console.error("Room not ready yet"); return; }
      await supabase.from('rooms').update({ last_message_at: new Date().toISOString() }).eq('id', roomId);
      const { error: msgErr } = await supabase.from('messages').insert({
        room_id: roomId, sender_id: myUserId, content: textToSend
      });
      if (msgErr) throw msgErr;
    } catch (error) {
      console.error("Critical Chat Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return {
    state: { messages, inputText, isTyping, flatListRef, otherUserPresence, otherUserAvatarUrl, editingMessageId, editingText },
    setters: { setInputText, setEditingText },
    handlers: { sendMessage, startEdit, cancelEdit, saveEdit, deleteMessage }
  };
}