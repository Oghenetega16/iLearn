import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';

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
      isPinned: true
    };

    let dbChats: ChatItem[] = [];

    try {
      if (searchQuery.trim().length > 0) {
        const { data: searchResults, error } = await supabase
          .from('profiles')
          .select('id, full_name, role')
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
            isPinned: false
          }));
        }
      } else {
        const { data: myRooms } = await supabase
          .from('room_participants')
          .select('room_id')
          .eq('user_id', myId);

        if (myRooms && myRooms.length > 0) {
          const roomIds = myRooms.map(r => r.room_id);

          const { data: activeConversations, error: convError } = await supabase
            .from('room_participants')
            .select(`room_id, user_id, profiles!inner(id, full_name, role)`)
            .in('room_id', roomIds)
            .neq('user_id', myId);

          if (activeConversations) {
            dbChats = activeConversations.map(conv => {
              const profile: any = Array.isArray(conv.profiles)
                ? conv.profiles[0]
                : conv.profiles;
              return {
                id: profile?.id || conv.user_id,
                name: profile?.full_name || 'Anonymous User',
                role: profile?.role || 'student',
                lastMessage: 'Active Conversation',
                time: '',
                unread: 0,
                isOnline: false,
                icon: 'person',
                isPinned: false
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

  // Refetch whenever the tab comes into focus (e.g. returning from a new chat)
  useFocusEffect(
    useCallback(() => {
      fetchInbox();
    }, [fetchInbox])
  );

  // Also refetch when search query changes (debounced)
  useEffect(() => {
    const debounce = setTimeout(fetchInbox, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  return {
    state: { searchQuery, chats, loading },
    setters: { setSearchQuery }
  };
}