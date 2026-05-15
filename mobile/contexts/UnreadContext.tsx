// mobile/contexts/UnreadContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from 'expo-router';

type UnreadContextType = {
  unreadCount: number;
  refreshUnread: () => void;
};

const UnreadContext = createContext<UnreadContextType>({
  unreadCount: 0,
  refreshUnread: () => {},
});

export const UnreadProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const channelRef = useRef<any>(null);

  const refreshUnread = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all rooms user is part of
    const { data: myRooms } = await supabase
      .from('room_participants')
      .select('room_id')
      .eq('user_id', user.id);

    if (!myRooms || myRooms.length === 0) {
      setUnreadCount(0);
      return;
    }

    const roomIds = myRooms.map(r => r.room_id);

    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('room_id', roomIds)
      .neq('sender_id', user.id)
      .eq('is_read', false);

    setUnreadCount(count ?? 0);
  }, []);

  // Set up realtime subscription once
  React.useEffect(() => {
    const setup = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await refreshUnread();

      if (channelRef.current) supabase.removeChannel(channelRef.current);

      channelRef.current = supabase
        .channel(`unread_${user.id}_${Math.random().toString(36).substring(2, 7)}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          () => refreshUnread()
        )
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages' },
          () => refreshUnread()
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return (
    <UnreadContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </UnreadContext.Provider>
  );
};

export const useUnread = () => useContext(UnreadContext);