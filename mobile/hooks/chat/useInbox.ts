// mobile/hooks/chat/useInbox.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface ChatItem {
  id: string; // The OTHER user's ID
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline: boolean;
  icon: string;
  isPinned: boolean;
}

export function useInbox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInbox = async () => {
      setLoading(true);
      
      // 1. Get the current logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const myId = user.id;

      // The AI is permanent, so we always prep it
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
          // --- SCENARIO A: USER IS SEARCHING ---
          // Search globally, but EXCLUDE myself (!= myId)
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
          // --- SCENARIO B: DEFAULT INBOX ---
          // Only show people I have an active room with.
          
          // Step 1: Find all rooms I am a part of
          const { data: myRooms } = await supabase
            .from('room_participants')
            .select('room_id')
            .eq('user_id', myId);

          if (myRooms && myRooms.length > 0) {
            const roomIds = myRooms.map(r => r.room_id);

            // Step 2: Find the OTHER people in those exact rooms
            const { data: activeConversations } = await supabase
              .from('room_participants')
              .select(`
                room_id,
                user_id,
                profiles!inner(id, full_name, role)
              `)
              .in('room_id', roomIds)
              .neq('user_id', myId); // Don't fetch myself!

            if (activeConversations) {
              dbChats = activeConversations.map(conv => {
                // Safely handle the joined profile whether TS thinks it's an array or an object
                const profile: any = Array.isArray(conv.profiles) ? conv.profiles[0] : conv.profiles;

                return {
                  id: profile?.id || conv.user_id, // Fallback to user_id if profile is missing
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
    };

    const delayDebounceFn = setTimeout(() => {
      fetchInbox();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return {
    state: { searchQuery, chats, loading },
    setters: { setSearchQuery }
  };
}