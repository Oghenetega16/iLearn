// mobile/hooks/chat/useGroupChat.ts
import { useState, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { formatMessageTime, formatDateLabel, formatFileSize } from './useChatRoom';

export interface GroupMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  isUser: boolean;
  created_at?: string;
  is_edited?: boolean;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  file_size?: number | null;
}

export interface GroupInfo {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  member_count: number;
  my_role: string;
  call_room_id: string | null;
}

export { formatMessageTime, formatDateLabel, formatFileSize };

export function useGroupChat(groupId: string) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    let channel: any = null;

    const init = async () => {
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

      // Fetch group info
      const { data: groupData } = await supabase
        .from('groups')
        .select('id, name, description, avatar_url, call_room_id')
        .eq('id', groupId)
        .single();

      const { count: memberCount } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupId);

      const { data: myMembership } = await supabase
        .from('group_members')
        .select('role')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (groupData) {
        setGroupInfo({
          ...groupData,
          member_count: memberCount ?? 0,
          my_role: myMembership?.role ?? 'member',
        });
      }

      await fetchMessages(user.id);
      channel = subscribeToRealtime(user.id);
    };

    init();
    return () => { if (channel) supabase.removeChannel(channel); };
  }, [groupId]);

  const fetchMessages = async (currentMyId: string) => {
    const { data, error } = await supabase
      .from('group_messages')
      .select(`
        id, content, sender_id, created_at, is_edited,
        file_url, file_name, file_type, file_size,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true });

    if (data && !error) {
      setMessages(data.map((msg: any) => {
        const profile = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
        return {
          id: msg.id,
          text: msg.content,
          senderId: msg.sender_id,
          senderName: profile?.full_name ?? 'Unknown',
          senderAvatar: profile?.avatar_url ?? null,
          isUser: msg.sender_id === currentMyId,
          created_at: msg.created_at,
          is_edited: msg.is_edited ?? false,
          file_url: msg.file_url ?? null,
          file_name: msg.file_name ?? null,
          file_type: msg.file_type ?? null,
          file_size: msg.file_size ?? null,
        };
      }));
    }
  };

  const subscribeToRealtime = (currentMyId: string) => {
    const channelName = `group_${groupId}_${Date.now()}`;
    return supabase.channel(channelName)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        async (payload) => {
          const newMsg = payload.new;
          if (newMsg.sender_id === currentMyId) return;
          // Fetch sender profile
          const { data: profile } = await supabase
            .from('profiles').select('full_name, avatar_url').eq('id', newMsg.sender_id).single();
          setMessages(prev => [...prev, {
            id: newMsg.id,
            text: newMsg.content,
            senderId: newMsg.sender_id,
            senderName: profile?.full_name ?? 'Unknown',
            senderAvatar: profile?.avatar_url ?? null,
            isUser: false,
            created_at: newMsg.created_at,
            is_edited: false,
            file_url: newMsg.file_url ?? null,
            file_name: newMsg.file_name ?? null,
            file_type: newMsg.file_type ?? null,
            file_size: newMsg.file_size ?? null,
          }]);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
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
        { event: 'DELETE', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` },
        (payload) => {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe();
  };

  const sendMessage = async () => {
    const textToSend = inputText.trim();
    if (!textToSend || !myUserId) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    }

    setInputText('');
    const optimisticMsg: GroupMessage = {
      id: Date.now().toString(),
      text: textToSend,
      senderId: myUserId,
      senderName: 'You',
      senderAvatar: null,
      isUser: true,
      created_at: new Date().toISOString(),
      is_edited: false,
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setIsTyping(true);

    try {
      const { error } = await supabase.from('group_messages').insert({
        group_id: groupId,
        sender_id: myUserId,
        content: textToSend,
      });
      if (error) throw error;
      await supabase.from('groups')
        .update({ last_message_at: new Date().toISOString() }).eq('id', groupId);
    } catch (error) {
      console.error("Group message error:", error);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setIsTyping(false);
    }
  };

  const uploadFile = async (uri: string, fileName: string, mimeType: string): Promise<string> => {
    const ext = fileName.split('.').pop() ?? 'bin';
    const path = `${myUserId}/groups/${Date.now()}.${ext}`;
    const formData = new FormData();
    formData.append('file', { uri, name: fileName, type: mimeType } as any);
    const { error } = await supabase.storage
      .from('chat-files').upload(path, formData, { contentType: mimeType, upsert: false });
    if (error) throw error;
    const { data: { publicUrl } } = supabase.storage.from('chat-files').getPublicUrl(path);
    return publicUrl;
  };

  const sendFile = async (uri: string, fileName: string, mimeType: string, fileSize: number) => {
    if (!myUserId) return;
    setIsUploading(true);
    const optimisticId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: optimisticId, text: '', senderId: myUserId,
      senderName: 'You', senderAvatar: null, isUser: true,
      created_at: new Date().toISOString(),
      file_name: fileName, file_type: mimeType, file_size: fileSize, file_url: uri,
    }]);
    try {
      const publicUrl = await uploadFile(uri, fileName, mimeType);
      const { data: inserted, error } = await supabase.from('group_messages').insert({
        group_id: groupId, sender_id: myUserId, content: '',
        file_url: publicUrl, file_name: fileName, file_type: mimeType, file_size: fileSize,
      }).select().single();
      if (error) throw error;
      setMessages(prev => prev.map(m =>
        m.id === optimisticId ? { ...m, id: inserted.id, file_url: publicUrl } : m
      ));
      await supabase.from('groups')
        .update({ last_message_at: new Date().toISOString() }).eq('id', groupId);
    } catch (e) {
      console.error("Group file error:", e);
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8, allowsEditing: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await sendFile(asset.uri, asset.uri.split('/').pop() ?? 'image.jpg',
      asset.mimeType ?? 'image/jpeg', asset.fileSize ?? 0);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    await sendFile(asset.uri, asset.name, asset.mimeType ?? 'application/octet-stream', asset.size ?? 0);
  };

  const startEdit = (messageId: string, currentText: string) => {
    setEditingMessageId(messageId);
    setEditingText(currentText);
  };

  const cancelEdit = () => { setEditingMessageId(null); setEditingText(''); };

  const saveEdit = async () => {
    if (!editingMessageId || !editingText.trim()) return;
    const { error } = await supabase.from('group_messages')
      .update({ content: editingText.trim(), is_edited: true }).eq('id', editingMessageId);
    if (!error) {
      setMessages(prev => prev.map(msg =>
        msg.id === editingMessageId
          ? { ...msg, text: editingText.trim(), is_edited: true } : msg
      ));
    }
    cancelEdit();
  };

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase.from('group_messages').delete().eq('id', messageId);
    if (!error) setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  return {
    state: { messages, inputText, isTyping, isUploading, flatListRef, groupInfo, editingMessageId, editingText },
    setters: { setInputText, setEditingText },
    handlers: { sendMessage, startEdit, cancelEdit, saveEdit, deleteMessage, pickImage, pickDocument }
  };
}