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
    const fetchUsers = async () => {
      setLoading(true);
      
      // 1. Get current user so we don't show ourselves in the search results
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      // 2. Start the database query
      let query = supabase
        .from('profiles')
        .select('id, full_name, role') // Note: Add 'bio' here if you add a bio column to your DB
        .neq('id', currentUser.id);

      // 3. Apply Name Search
      if (searchQuery.trim().length > 0) {
        query = query.ilike('full_name', `%${searchQuery.trim()}%`);
      }

      // 4. Apply Role Filter
      if (activeTab !== 'all') {
        const roleFilter = activeTab === 'students' ? 'student' : 'tutor';
        query = query.eq('role', roleFilter);
      }

      // 5. Limit results to keep it fast
      query = query.limit(20);

      const { data, error } = await query;

      if (!error && data) {
        const formattedUsers: PlatformUser[] = data.map(u => ({
          id: u.id,
          name: u.full_name || 'Anonymous User',
          role: (u.role === 'tutor' ? 'tutor' : 'student'),
          bio: u.role === 'tutor' ? 'Platform Tutor' : 'Platform Student', // Fallback bio
          icon: 'person'
        }));
        setUsers(formattedUsers);
      } else {
        setUsers([]);
      }
      
      setLoading(false);
    };

    // Debounce: Wait 300ms after the user stops typing before making the DB call
    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeTab]);

  return {
    state: { searchQuery, activeTab, users, loading },
    setters: { setSearchQuery, setActiveTab }
  };
}