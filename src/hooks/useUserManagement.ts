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
  customer_id: string | null;
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

      // Fetch customer_users mappings
      const { data: customerUsers, error: customerUsersError } = await supabase
        .from('customer_users')
        .select('user_id, customer_id');

      if (customerUsersError) throw customerUsersError;

      // Combine data
      const users: UserWithRole[] = profiles.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        const customerUser = customerUsers?.find((cu) => cu.user_id === profile.id);
        return {
          id: profile.id,
          email: '',
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          role: userRole?.role || null,
          customer_id: customerUser?.customer_id || null,
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

// Link customer to user
export function useLinkCustomerToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, customerId }: { userId: string; customerId: string }) => {
      // Check if user already has a customer link
      const { data: existing } = await supabase
        .from('customer_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('customer_users')
          .update({ customer_id: customerId })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new
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
