import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChatMessage {
  id: string;
  customer_id: string;
  sender_id: string;
  sender_role: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatConversation {
  customer_id: string;
  customer_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

// Get customer_id for the current client user
export function useClientCustomerId() {
  const { user, role } = useAuth();
  return useQuery({
    queryKey: ['client-customer-id', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_users')
        .select('customer_id')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error || !data) return null;
      return data.customer_id;
    },
    enabled: !!user && role === 'client',
  });
}

// Messages for a specific customer conversation
export function useChatMessages(customerId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!customerId) return;
    const channel = supabase
      .channel(`chat-${customerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          queryClient.setQueryData<ChatMessage[]>(
            ['chat-messages', customerId],
            (old) => [...(old || []), payload.new as ChatMessage]
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `customer_id=eq.${customerId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['chat-messages', customerId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId, queryClient]);

  return useQuery({
    queryKey: ['chat-messages', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('customer_id', customerId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as ChatMessage[];
    },
    enabled: !!customerId,
  });
}

// Send a message
export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();

  return useMutation({
    mutationFn: async ({ customerId, message }: { customerId: string; message: string }) => {
      const { error } = await supabase.from('chat_messages').insert({
        customer_id: customerId,
        sender_id: user!.id,
        sender_role: role === 'admin' ? 'admin' : 'client',
        message: message.trim(),
      });
      if (error) throw error;
    },
    onSuccess: (_, { customerId }) => {
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
    mutationFn: async (customerId: string) => {
      // Clients mark admin messages as read; admins mark client messages as read
      const targetRole = role === 'admin' ? 'client' : 'admin';
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('customer_id', customerId)
        .eq('sender_role', targetRole)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['chat-conversations'] });
    },
  });
}

// Unread count for the current user
export function useUnreadCount() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  // Subscribe to realtime for unread badge updates
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
      if (role === 'admin') {
        // Admin: count unread client messages across all customers
        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_role', 'client')
          .eq('is_read', false);
        if (error) return 0;
        return count || 0;
      } else {
        // Client: count unread admin messages for own customer
        const { data: cu } = await supabase
          .from('customer_users')
          .select('customer_id')
          .eq('user_id', user!.id)
          .maybeSingle();
        if (!cu) return 0;
        const { count, error } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', cu.customer_id)
          .eq('sender_role', 'admin')
          .eq('is_read', false);
        if (error) return 0;
        return count || 0;
      }
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
}

// Admin: list all conversations with customers
export function useChatConversations() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['chat-conversations'],
    queryFn: async () => {
      // Get all customers who have chat messages
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('customer_id, message, sender_role, is_read, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get unique customer ids
      const customerMap = new Map<string, {
        last_message: string;
        last_message_at: string;
        unread_count: number;
      }>();

      for (const msg of messages || []) {
        if (!customerMap.has(msg.customer_id)) {
          customerMap.set(msg.customer_id, {
            last_message: msg.message,
            last_message_at: msg.created_at,
            unread_count: 0,
          });
        }
        const entry = customerMap.get(msg.customer_id)!;
        if (msg.sender_role === 'client' && !msg.is_read) {
          entry.unread_count++;
        }
      }

      if (customerMap.size === 0) return [];

      // Fetch customer names
      const customerIds = Array.from(customerMap.keys());
      const { data: customers } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .in('id', customerIds);

      const nameMap = new Map<string, string>();
      for (const c of customers || []) {
        nameMap.set(c.id, `${c.first_name} ${c.last_name}`);
      }

      const conversations: ChatConversation[] = customerIds.map((cid) => {
        const entry = customerMap.get(cid)!;
        return {
          customer_id: cid,
          customer_name: nameMap.get(cid) || 'Unbekannt',
          last_message: entry.last_message,
          last_message_at: entry.last_message_at,
          unread_count: entry.unread_count,
        };
      });

      // Sort by last message time desc
      conversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
      return conversations;
    },
    enabled: role === 'admin',
  });
}
