// mobile/hooks/chat/useInbox.ts
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

export interface ChatItem {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  icon: string;
  isPinned: boolean;
  avatarUrl: string | null; // ← new
}

const formatInboxTime = (isoString: string): string => {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export function useInbox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = useCallback(async () => {
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const myId = user.id;

    const aiChat: ChatItem = {
      id: 'ai_tutor',
      name: 'iLearn AI',
      role: 'AI Assistant',
      lastMessage: 'Ready to help you learn!',
      time: 'Now',
      unread: 0,
      isOnline: true,
      icon: 'hardware-chip',
      isPinned: true,
      avatarUrl: null,
    };

    let dbChats: ChatItem[] = [];

    try {
      if (searchQuery.trim().length > 0) {
        const { data: searchResults, error } = await supabase
          .from('profiles')
          .select('id, full_name, role, avatar_url') // ← added avatar_url
          .ilike('full_name', `%${searchQuery.trim()}%`)
          .neq('id', myId)
          .limit(10);

        if (!error && searchResults) {
          dbChats = searchResults.map(profile => ({
            id: profile.id,
            name: profile.full_name || 'Anonymous',
            role: profile.role || 'student',
            lastMessage: 'Tap to start chatting',
            time: '',
            unread: 0,
            isOnline: false,
            icon: 'person',
            isPinned: false,
            avatarUrl: profile.avatar_url || null,
          }));
        }
      } else {
        const { data: myRooms } = await supabase
          .from('room_participants')
          .select('room_id')
          .eq('user_id', myId);

        if (myRooms && myRooms.length > 0) {
          const roomIds = myRooms.map(r => r.room_id);

          const { data: activeConversations } = await supabase
            .from('room_participants')
            .select(`room_id, user_id, profiles!inner(id, full_name, role, avatar_url)`) // ← added avatar_url
            .in('room_id', roomIds)
            .neq('user_id', myId);

          const { data: lastMessages } = await supabase
            .from('messages')
            .select('room_id, content, created_at, sender_id')
            .in('room_id', roomIds)
            .order('created_at', { ascending: false });

          const lastMessageMap: Record<string, { content: string; created_at: string; sender_id: string }> = {};
          if (lastMessages) {
            for (const msg of lastMessages) {
              if (!lastMessageMap[msg.room_id]) {
                lastMessageMap[msg.room_id] = msg;
              }
            }
          }

          // Count unread messages per room (messages not sent by me and not read)
          const { data: unreadCounts } = await supabase
            .from('messages')
            .select('room_id, id')
            .in('room_id', roomIds)
            .neq('sender_id', myId)
            .eq('is_read', false);

          const unreadMap: Record<string, number> = {};
          if (unreadCounts) {
            for (const msg of unreadCounts) {
              unreadMap[msg.room_id] = (unreadMap[msg.room_id] || 0) + 1;
            }
          }

          if (activeConversations) {
            dbChats = activeConversations.map(conv => {
              const profile: any = Array.isArray(conv.profiles)
                ? conv.profiles[0]
                : conv.profiles;

              const lastMsg = lastMessageMap[conv.room_id];
              const lastMessageText = lastMsg
                ? (lastMsg.sender_id === myId ? `You: ${lastMsg.content}` : lastMsg.content)
                : 'No messages yet';
              const lastMessageTime = lastMsg ? formatInboxTime(lastMsg.created_at) : '';

              return {
                id: profile?.id || conv.user_id,
                name: profile?.full_name || 'Anonymous User',
                role: profile?.role || 'student',
                lastMessage: lastMessageText,
                time: lastMessageTime,
                unread: unreadMap[conv.room_id] || 0,
                isOnline: false,
                icon: 'person',
                isPinned: false,
                avatarUrl: profile?.avatar_url || null,
              };
            });
          }
        }
      }
    } catch (e) {
      console.error("Inbox fetch error:", e);
    }

    setChats([aiChat, ...dbChats]);
    setLoading(false);
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchInbox();
    }, [fetchInbox])
  );

  useEffect(() => {
    const debounce = setTimeout(fetchInbox, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return {
    state: { searchQuery, chats, loading },
    setters: { setSearchQuery }
  };
}