// mobile/hooks/chat/useUserSearch.ts
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface PlatformUser {
  id: string;
  name: string;
  role: 'student' | 'tutor';
  bio: string;
  icon: string;
}

export function useUserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'tutors'>('all');
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Don't fetch anything until the user has typed something
    if (searchQuery.trim().length === 0 && activeTab === 'all') {
      setUsers([]);
      setLoading(false);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      let query = supabase
        .from('profiles')
        .select('id, full_name, role')
        .neq('id', currentUser.id);

      if (searchQuery.trim().length > 0) {
        query = query.ilike('full_name', `%${searchQuery.trim()}%`);
      }

      if (activeTab !== 'all') {
        query = query.eq('role', activeTab === 'students' ? 'student' : 'tutor');
      }

      query = query.limit(20);

      const { data, error } = await query;

      if (!error && data) {
        setUsers(data.map(u => ({
          id: u.id,
          name: u.full_name || 'Anonymous User',
          role: (u.role === 'tutor' ? 'tutor' : 'student') as 'student' | 'tutor',
          bio: u.role === 'tutor' ? 'Platform Tutor' : 'Platform Student',
          icon: 'person'
        })));
      } else {
        setUsers([]);
      }

      setLoading(false);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeTab]);

  return {
    state: { searchQuery, activeTab, users, loading },
    setters: { setSearchQuery, setActiveTab }
  };
}