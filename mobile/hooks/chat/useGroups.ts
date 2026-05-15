// mobile/hooks/chat/useGroups.ts
import { useState, useCallback } from 'react';
import { Share } from 'react-native';
import { supabase } from '../../lib/supabase';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  created_by: string;
  max_members: number;
  call_room_id: string | null;
  created_at: string;
  last_message_at: string;
  member_count?: number;
  my_role?: string;
}

const hydrateSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await supabase.auth.setSession({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  }
};

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMyGroups = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('group_members')
      .select(`
        role,
        groups!inner(
          id, name, description, avatar_url, created_by,
          max_members, call_room_id, created_at, last_message_at
        )
      `)
      .eq('user_id', user.id);

    if (!error && data) {
      setGroups(data.map((row: any) => {
        const g = Array.isArray(row.groups) ? row.groups[0] : row.groups;
        return { ...g, my_role: row.role };
      }));
    }
    setLoading(false);
  }, []);

  const createGroup = async (name: string, description: string): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase.rpc('create_group', {
        p_name: name.trim(),
        p_description: description.trim() || null,
        p_user_id: user.id,
    });

    if (error) {
        console.error("Failed to create group:", error);
        return null;
    }

    await fetchMyGroups();
    return data as string;
  };

  const joinGroup = async (groupId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    await hydrateSession();

    const { count } = await supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId);

    const { data: group } = await supabase
      .from('groups')
      .select('max_members')
      .eq('id', groupId)
      .single();

    if (count && group && count >= group.max_members) {
      console.error("Group is full");
      return false;
    }

    const { data: existing } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single();

    if (existing) return true;

    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: user.id, role: 'member' });

    if (error) { console.error("Failed to join group:", error); return false; }

    await fetchMyGroups();
    return true;
  };

  const shareInviteLink = async (groupId: string, groupName: string) => {
    await Share.share({
      message: `Join my "${groupName}" study group on iLearn!\n\nTap to join: ilearn://group/join/${groupId}`,
    });
  };

  const leaveGroup = async (groupId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await hydrateSession();

    await supabase.from('group_members')
      .delete().eq('group_id', groupId).eq('user_id', user.id);
    setGroups(prev => prev.filter(g => g.id !== groupId));
  };

  return {
    state: { groups, loading },
    actions: { fetchMyGroups, createGroup, joinGroup, shareInviteLink, leaveGroup }
  };
}