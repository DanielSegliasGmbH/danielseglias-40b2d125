import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  customer_id: string | null;
  participant_id: string | null;
  sender_id: string;
  sender_role: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatConversation {
  participant_id: string;
  participant_name: string;
  customer_id: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

async function fetchCustomerIdForUser(userId: string) {
  const { data, error } = await supabase.rpc('get_customer_id_for_user', {
    _user_id: userId,
  });
  if (error) throw error;
  return data ?? null;
}

function appendUniqueMessage(messages: ChatMessage[] | undefined, message: ChatMessage) {
  if (!messages) return [message];
  if (messages.some((entry) => entry.id === message.id)) return messages;
  return [...messages, message].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

// Get customer_id for the current client user
export function useClientCustomerId() {
  const { user, loading } = useAuth();
  return useQuery({
    queryKey: ['client-customer-id', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return fetchCustomerIdForUser(user.id);
    },
    enabled: !!user && !loading,
  });
}

// Messages for a specific participant conversation
export function useChatMessages(participantId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!participantId) return;
    const channel = supabase
      .channel(`chat-participant-${participantId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `participant_id=eq.${participantId}`,
        },
        (payload) => {
          queryClient.setQueryData<ChatMessage[]>(
            ['chat-messages', participantId],
            (old) => appendUniqueMessage(old, payload.new as ChatMessage)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `participant_id=eq.${participantId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', participantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [participantId, queryClient]);

  return useQuery({
    queryKey: ['chat-messages', participantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('participant_id', participantId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as ChatMessage[];
    },
    enabled: !!participantId,
  });
}

// Send a message (participantId = user id of non-admin participant)
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();

  return useMutation({
    mutationFn: async ({
      participantId,
      message,
      customerId,
    }: {
      participantId: string;
      message: string;
      customerId?: string | null;
    }) => {
      if (!user) {
        throw new Error('Du bist nicht angemeldet. Bitte melde dich erneut an.');
      }
      if (!role) {
        throw new Error('Dein Benutzerstatus wird noch geladen. Bitte versuche es gleich erneut.');
      }

      const normalizedMessage = message.trim();
      if (!normalizedMessage) {
        throw new Error('Bitte gib eine Nachricht ein.');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          participant_id: participantId,
          customer_id: customerId || null,
          sender_id: user.id,
          sender_role: role === 'admin' ? 'admin' : 'client',
          message: normalizedMessage,
        })
        .select('*')
        .single();

      if (error) throw error;
      return data as ChatMessage;
    },
    onSuccess: (createdMessage, { participantId }) => {
      queryClient.setQueryData<ChatMessage[]>(['chat-messages', participantId], (old) =>
        appendUniqueMessage(old, createdMessage)
      );
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
    },
  });
}

// Mark messages as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();

  return useMutation({
    mutationFn: async (participantId: string) => {
      if (!role) return;
      const targetRole = role === 'admin' ? 'client' : 'admin';
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('participant_id', participantId)
        .eq('sender_role', targetRole)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: (_, participantId) => {
      if (!role) return;
      const targetRole = role === 'admin' ? 'client' : 'admin';
      queryClient.setQueryData<ChatMessage[]>(['chat-messages', participantId], (old) =>
        old?.map((message) =>
          message.sender_role === targetRole ? { ...message, is_read: true } : message
        ) || old
      );
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });
}

// Unread count for the current user
export function useUnreadCount() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('chat-unread-global')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
          queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  return useQuery({
    queryKey: ['chat-unread-count', user?.id, role],
    queryFn: async () => {
      if (!user || !role) return 0;

      if (role === 'admin') {
        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_role', 'client')
          .eq('is_read', false);
        if (error) return 0;
        return count || 0;
      } else {
        // Client: count unread admin messages where I'm the participant
        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('participant_id', user.id)
          .eq('sender_role', 'admin')
          .eq('is_read', false);
        if (error) return 0;
        return count || 0;
      }
    },
    enabled: !!user && !!role,
    refetchInterval: 30000,
  });
}

// Admin: list all conversations
export function useChatConversations() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['chat-conversations'],
    queryFn: async () => {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('participant_id, customer_id, message, sender_role, is_read, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const participantMap = new Map<string, {
        customer_id: string | null;
        last_message: string;
        last_message_at: string;
        unread_count: number;
      }>();

      for (const msg of messages || []) {
        const pid = msg.participant_id;
        if (!pid) continue;
        if (!participantMap.has(pid)) {
          participantMap.set(pid, {
            customer_id: msg.customer_id,
            last_message: msg.message,
            last_message_at: msg.created_at,
            unread_count: 0,
          });
        }
        const entry = participantMap.get(pid)!;
        if (msg.sender_role === 'client' && !msg.is_read) {
          entry.unread_count++;
        }
      }

      if (participantMap.size === 0) return [];

      const participantIds = Array.from(participantMap.keys());

      // Get names from profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', participantIds);

      const nameMap = new Map<string, string>();
      for (const p of profiles || []) {
        const name = [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unbekannt';
        nameMap.set(p.id, name);
      }

      const conversations: ChatConversation[] = participantIds.map((pid) => {
        const entry = participantMap.get(pid)!;
        return {
          participant_id: pid,
          participant_name: nameMap.get(pid) || 'Unbekannt',
          customer_id: entry.customer_id,
          last_message: entry.last_message,
          last_message_at: entry.last_message_at,
          unread_count: entry.unread_count,
        };
      });

      conversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      return conversations;
    },
    enabled: role === 'admin',
  });
}
