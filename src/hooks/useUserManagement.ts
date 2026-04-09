import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export type AccountStatus = 'active' | 'suspended' | 'deleted';

export interface UserWithRole {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: AppRole | null;
  customer_id: string | null;
  user_type: 'user' | 'customer';
  plan: 'free' | 'premium';
  has_strategy_access: boolean;
  account_status: AccountStatus;
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  invited_at: string | null;
  confirmed_at: string | null;
  is_confirmed: boolean;
  is_banned: boolean;
}

export type UserStatus = 'active' | 'invited' | 'not_activated' | 'no_role';

export function getUserStatus(user: UserWithRole): UserStatus {
  if (!user.role) return 'no_role';
  if (!user.is_confirmed) return 'invited';
  if (!user.last_sign_in_at) return 'not_activated';
  return 'active';
}

export function getUserStatusLabel(status: UserStatus): string {
  switch (status) {
    case 'active': return 'Aktiv';
    case 'invited': return 'Einladung offen';
    case 'not_activated': return 'Noch nicht eingeloggt';
    case 'no_role': return 'Keine Rolle';
  }
}

export function getUserStatusColor(status: UserStatus): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'invited': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    case 'not_activated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'no_role': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-list-users');
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.users || []) as UserWithRole[];
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole | null }) => {
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      if (role) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (insertError) throw insertError;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useLinkCustomerToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, customerId }: { userId: string; customerId: string }) => {
      const { data: existing } = await supabase
        .from('customer_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('customer_users')
          .update({ customer_id: customerId })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customer_users')
          .insert({ user_id: userId, customer_id: customerId });
        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      role: AppRole;
      customerId?: string;
    }) => {
      const { data: result, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          ...data,
          customerId: data.customerId,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useResendInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data: result, error } = await supabase.functions.invoke('admin-resend-invite', {
        body: { userId },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUpdateUserAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      user_type,
      plan,
      has_strategy_access,
    }: {
      userId: string;
      user_type?: 'user' | 'customer';
      plan?: 'free' | 'premium';
      has_strategy_access?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (user_type !== undefined) updates.user_type = user_type;
      if (plan !== undefined) updates.plan = plan;
      if (has_strategy_access !== undefined) updates.has_strategy_access = has_strategy_access;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

/** Hook for the current user's profile (user_type, plan, has_strategy_access) */
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('user_type, plan, has_strategy_access')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as { user_type: string; plan: string; has_strategy_access: boolean } | null;
    },
  });
}

export type ManageUserAction = 'suspend' | 'reactivate' | 'soft_delete' | 'hard_delete';

export function useManageUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetUserId, action }: { targetUserId: string; action: ManageUserAction }) => {
      const { data, error } = await supabase.functions.invoke('admin-manage-user', {
        body: { targetUserId, action },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    },
  });
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  target_user_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export function useAuditLogs(targetUserId?: string) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', targetUserId],
    queryFn: async () => {
      let query = supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (targetUserId) {
        query = query.eq('target_user_id', targetUserId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AuditLogEntry[];
    },
    enabled: true,
  });
}

export const ACCOUNT_STATUS_CONFIG: Record<AccountStatus, { label: string; color: string }> = {
  active: { label: 'Aktiv', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  suspended: { label: 'Gesperrt', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  deleted: { label: 'Gelöscht', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  suspend: 'Zugang gesperrt',
  reactivate: 'Zugang reaktiviert',
  soft_delete: 'Soft Delete',
  hard_delete: 'Endgültig gelöscht',
};
