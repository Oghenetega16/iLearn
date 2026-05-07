// mobile/hooks/profile/useNotifications.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns'; // Great for "2 hours ago" formatting

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();

    // Set up Realtime Subscription for new notifications
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            setNotifications((current) => [payload.new as Notification, ...current]);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    setupRealtime();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Optimistic UI update
      setNotifications(current => current.map(n => ({ ...n, is_read: true })));

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(current => current.map(n => n.id === id ? { ...n, is_read: true } : n));
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    } catch (error) {
      console.error('Error marking single notification read:', error);
    }
  };

  return {
    state: { notifications, loading },
    handlers: { markAllAsRead, markAsRead }
  };
}