import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export interface UserWithRole {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: AppRole | null;
  client_id: string | null;
}

export function useAllUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('last_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch all roles (admin can see all)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch client_users mappings
      const { data: clientUsers, error: clientUsersError } = await supabase
        .from('client_users')
        .select('user_id, client_id');

      if (clientUsersError) throw clientUsersError;

      // Combine data
      const users: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        const clientUser = clientUsers?.find((cu) => cu.user_id === profile.id);
        return {
          id: profile.id,
          email: '', // We'll need to get this from auth, but profiles don't have it
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          role: userRole?.role || null,
          client_id: clientUser?.client_id || null,
        };
      });

      return users;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole | null }) => {
      // First, delete existing role
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // If new role is set, insert it
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

export function useLinkClientToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, clientId }: { userId: string; clientId: string }) => {
      // Check if user already has a client link
      const { data: existing } = await supabase
        .from('client_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('client_users')
          .update({ client_id: clientId })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('client_users')
          .insert({ user_id: userId, client_id: clientId });

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
      clientId?: string;
    }) => {
      const { data: result, error } = await supabase.functions.invoke('admin-create-user', {
        body: data,
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
