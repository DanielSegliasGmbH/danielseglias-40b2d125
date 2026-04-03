import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// For clients: get visible notifications with read status
export function useClientNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-notifications', user?.id],
    queryFn: async () => {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

      if (error) throw error;

      // Get read status
      const { data: reads } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user!.id);

      const readIds = new Set(reads?.map(r => r.notification_id) || []);

      return (notifications || []).map(n => ({
        ...n,
        is_read: readIds.has(n.id),
      }));
    },
    enabled: !!user,
  });
}

export function useUnreadNotificationCount() {
  const { data: notifications } = useClientNotifications();
  return notifications?.filter(n => !n.is_read).length || 0;
}

export function useMarkNotificationRead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notification_reads')
        .upsert({
          notification_id: notificationId,
          user_id: user!.id,
        }, { onConflict: 'notification_id,user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
    },
  });
}

// Admin: get all notifications
export function useAdminNotifications() {
  return useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

// Admin: create notification
export function useCreateNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      body: string;
      link_url?: string;
      link_label?: string;
      target_role?: string;
      status?: string;
      published_at?: string;
      excluded_user_ids?: string[];
    }) => {
      const { excluded_user_ids, ...notifData } = data;
      
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          ...notifData,
          created_by: user!.id,
          published_at: data.status === 'published' ? (data.published_at || new Date().toISOString()) : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add exclusions
      if (excluded_user_ids?.length) {
        const exclusions = excluded_user_ids.map(uid => ({
          notification_id: notification.id,
          user_id: uid,
        }));
        await supabase.from('notification_exclusions').insert(exclusions);
      }

      return notification;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
}

// Admin: update notification
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      title?: string;
      body?: string;
      link_url?: string;
      link_label?: string;
      target_role?: string;
      status?: string;
      published_at?: string;
    }) => {
      const updateData: any = { ...data };
      if (data.status === 'published' && !data.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('notifications')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
}
