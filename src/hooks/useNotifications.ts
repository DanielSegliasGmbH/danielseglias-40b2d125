import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const NOTIFICATION_CATEGORIES = [
  { value: 'general', label: 'Allgemeine Info' },
  { value: 'new_tool', label: 'Neues Tool' },
  { value: 'new_content', label: 'Neue Inhalte' },
  { value: 'library', label: 'Wissensbibliothek' },
  { value: 'strategies', label: 'Anlagestrategien' },
  { value: 'update', label: 'Update / Wartung' },
  { value: 'personal', label: 'Persönlicher Hinweis' },
  { value: 'other', label: 'Sonstiges' },
] as const;

export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[number]['value'];

export function getCategoryLabel(cat: string): string {
  return NOTIFICATION_CATEGORIES.find(c => c.value === cat)?.label || cat;
}

// Client: visible notifications (published, not expired, not excluded, matching role)
export function useClientNotifications() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-notifications', user?.id],
    queryFn: async () => {
      const now = new Date().toISOString();

      // Get exclusions for this user
      const { data: exclusions } = await supabase
        .from('notification_exclusions')
        .select('notification_id')
        .eq('user_id', user!.id);
      const excludedIds = new Set(exclusions?.map(e => e.notification_id) || []);

      // Get published notifications
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('status', 'published')
        .not('published_at', 'is', null)
        .lte('published_at', now)
        .order('published_at', { ascending: false });

      const { data: notifications, error } = await query;
      if (error) throw error;

      // Get user's role for target_role filtering
      const { data: userRoleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .maybeSingle();
      const userRole = userRoleData?.role || 'client';

      // Filter: not expired, not excluded, matching target_role
      const visible = (notifications || []).filter(n => {
        if (excludedIds.has(n.id)) return false;
        if (n.expires_at && new Date(n.expires_at) < new Date()) return false;
        // target_role filtering
        const target = n.target_role || 'client';
        if (target === 'client' && userRole !== 'client') return false;
        if (target === 'staff' && userRole !== 'staff' && userRole !== 'admin') return false;
        // 'all' = everyone sees it
        return true;
      });

      // Get read status
      const { data: reads } = await supabase
        .from('notification_reads')
        .select('notification_id')
        .eq('user_id', user!.id);
      const readIds = new Set(reads?.map(r => r.notification_id) || []);

      return visible.map(n => ({
        ...n,
        category: (n as any).category || 'general',
        description: (n as any).description || null,
        expires_at: (n as any).expires_at || null,
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

export function useMarkAllNotificationsRead() {
  const { user } = useAuth();
  const { data: notifications } = useClientNotifications();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const unread = notifications?.filter(n => !n.is_read) || [];
      if (!unread.length) return;

      const rows = unread.map(n => ({
        notification_id: n.id,
        user_id: user!.id,
      }));

      const { error } = await supabase
        .from('notification_reads')
        .upsert(rows, { onConflict: 'notification_id,user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
    },
  });
}

// Admin: all notifications with exclusion counts
export function useAdminNotifications() {
  return useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get exclusion counts
      const { data: exclusions } = await supabase
        .from('notification_exclusions')
        .select('notification_id');

      const exclusionCounts: Record<string, number> = {};
      exclusions?.forEach(e => {
        exclusionCounts[e.notification_id] = (exclusionCounts[e.notification_id] || 0) + 1;
      });

      return (data || []).map(n => ({
        ...n,
        category: (n as any).category || 'general',
        description: (n as any).description || null,
        expires_at: (n as any).expires_at || null,
        scheduled_at: (n as any).scheduled_at || null,
        exclusion_count: exclusionCounts[n.id] || 0,
      }));
    },
  });
}

// Admin: get exclusions for a notification
export function useNotificationExclusions(notificationId: string | null) {
  return useQuery({
    queryKey: ['notification-exclusions', notificationId],
    queryFn: async () => {
      if (!notificationId) return [];
      const { data, error } = await supabase
        .from('notification_exclusions')
        .select('user_id')
        .eq('notification_id', notificationId);
      if (error) throw error;
      return data?.map(d => d.user_id) || [];
    },
    enabled: !!notificationId,
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
      description?: string;
      category?: string;
      link_url?: string;
      link_label?: string;
      target_role?: string;
      status?: string;
      published_at?: string;
      scheduled_at?: string;
      expires_at?: string;
      excluded_user_ids?: string[];
    }) => {
      const { excluded_user_ids, ...rest } = data;

      const insertData: any = {
        ...rest,
        created_by: user!.id,
      };

      if (data.status === 'published') {
        insertData.published_at = data.published_at || new Date().toISOString();
      }

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

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
    mutationFn: async ({ id, excluded_user_ids, ...data }: {
      id: string;
      title?: string;
      body?: string;
      description?: string;
      category?: string;
      link_url?: string;
      link_label?: string;
      target_role?: string;
      status?: string;
      published_at?: string;
      scheduled_at?: string;
      expires_at?: string;
      excluded_user_ids?: string[];
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

      // Update exclusions if provided
      if (excluded_user_ids !== undefined) {
        // Remove old
        await supabase.from('notification_exclusions').delete().eq('notification_id', id);
        // Insert new
        if (excluded_user_ids.length) {
          await supabase.from('notification_exclusions').insert(
            excluded_user_ids.map(uid => ({ notification_id: id, user_id: uid }))
          );
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-exclusions'] });
    },
  });
}

// Admin: duplicate notification
export function useDuplicateNotification() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      // Get source
      const { data: source, error: fetchErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', sourceId)
        .single();
      if (fetchErr) throw fetchErr;

      const { data: newNotif, error } = await supabase
        .from('notifications')
        .insert({
          title: `${source.title} (Kopie)`,
          body: source.body,
          link_url: source.link_url,
          link_label: source.link_label,
          target_role: source.target_role,
          category: (source as any).category || 'general',
          description: (source as any).description,
          status: 'draft',
          created_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return newNotif;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });
}
