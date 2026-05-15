// mobile/hooks/chat/useInbox.ts
import { useState, useEffect, useCallback, useRef } from 'react';
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
  avatarUrl: string | null;
  isGroup?: boolean;
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

  const channelRef = useRef<any>(null);
  // Always points to the latest fetchInbox so realtime handler never uses stale closure
  const fetchInboxRef = useRef<() => void>(() => {});

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
          .select('id, full_name, role, avatar_url')
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
            .select(`room_id, user_id, profiles!inner(id, full_name, role, avatar_url)`)
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
              if (!lastMessageMap[msg.room_id]) lastMessageMap[msg.room_id] = msg;
            }
          }

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
                ? conv.profiles[0] : conv.profiles;
              const lastMsg = lastMessageMap[conv.room_id];
              return {
                id: profile?.id || conv.user_id,
                name: profile?.full_name || 'Anonymous User',
                role: profile?.role || 'student',
                lastMessage: lastMsg
                  ? (lastMsg.sender_id === myId ? `You: ${lastMsg.content}` : lastMsg.content)
                  : 'No messages yet',
                time: lastMsg ? formatInboxTime(lastMsg.created_at) : '',
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

    // Groups
    const { data: myGroupMemberships } = await supabase
      .from('group_members')
      .select(`groups!inner(id, name, avatar_url, last_message_at)`)
      .eq('user_id', myId);

    let groupChats: ChatItem[] = [];

    if (myGroupMemberships && myGroupMemberships.length > 0) {
      const groupIds = myGroupMemberships.map((m: any) => {
        const g = Array.isArray(m.groups) ? m.groups[0] : m.groups;
        return g.id;
      });

      const { data: lastGroupMessages } = await supabase
        .from('group_messages')
        .select('group_id, content, created_at, sender_id')
        .in('group_id', groupIds)
        .order('created_at', { ascending: false });

      const lastGroupMsgMap: Record<string, any> = {};
      if (lastGroupMessages) {
        for (const msg of lastGroupMessages) {
          if (!lastGroupMsgMap[msg.group_id]) lastGroupMsgMap[msg.group_id] = msg;
        }
      }

      groupChats = myGroupMemberships.map((m: any) => {
        const g = Array.isArray(m.groups) ? m.groups[0] : m.groups;
        const lastMsg = lastGroupMsgMap[g.id];
        return {
          id: g.id,
          name: g.name,
          role: 'group',
          lastMessage: lastMsg
            ? (lastMsg.sender_id === myId ? `You: ${lastMsg.content}` : lastMsg.content)
            : 'No messages yet',
          time: lastMsg ? formatInboxTime(lastMsg.created_at) : '',
          unread: 0,
          isOnline: false,
          icon: 'people',
          isPinned: false,
          avatarUrl: g.avatar_url ?? null,
          isGroup: true,
        };
      });
    }

    setChats([aiChat, ...dbChats, ...groupChats]);
    setLoading(false);
  }, [searchQuery]);

  // Keep ref always pointing to latest fetchInbox
  useEffect(() => {
    fetchInboxRef.current = fetchInbox;
  }, [fetchInbox]);

  // Realtime subscription — set up once, uses ref so always calls latest fetchInbox
  useEffect(() => {
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel(`inbox_${user.id}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            console.log("INBOX GOT NEW MESSAGE:", payload.new?.id);
            fetchInboxRef.current();
          }
        )
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'group_messages' },
          () => {
            fetchInboxRef.current();
          }
        )
        .subscribe((status) => {
          console.log("INBOX REALTIME:", status);
        });
    };

    setupRealtime();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []); // runs once only

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