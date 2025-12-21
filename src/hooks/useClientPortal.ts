import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ClientPortalSettings {
  id: string;
  client_id: string;
  show_insurances: boolean;
  show_goals: boolean;
  show_tasks: boolean;
  show_strategies: boolean;
  show_library: boolean;
  show_tools: boolean;
  created_at: string;
  updated_at: string;
}

// For clients: get their own settings
export function useClientPortalSettings() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['client-portal-settings', 'own'],
    queryFn: async () => {
      if (role === 'admin') {
        // Admin viewing portal preview - return null to show all
        return null;
      }

      // Get client_id for current user
      const { data: clientUser, error: clientError } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (clientError || !clientUser) {
        return null;
      }

      const { data, error } = await supabase
        .from('client_portal_settings')
        .select('*')
        .eq('client_id', clientUser.client_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching client portal settings:', error);
        return null;
      }

      return data as ClientPortalSettings | null;
    },
    enabled: !!user && (role === 'client' || role === 'admin'),
  });
}

// For admins: get settings for a specific client
export function useClientPortalSettingsForClient(clientId: string) {
  return useQuery({
    queryKey: ['client-portal-settings', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_portal_settings')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching client portal settings:', error);
        return null;
      }

      return data as ClientPortalSettings | null;
    },
    enabled: !!clientId,
  });
}

// For admins: update settings for a client
export function useUpdateClientPortalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      settings,
    }: {
      clientId: string;
      settings: Partial<Omit<ClientPortalSettings, 'id' | 'client_id' | 'created_at' | 'updated_at'>>;
    }) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('client_portal_settings')
        .select('id')
        .eq('client_id', clientId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('client_portal_settings')
          .update(settings)
          .eq('client_id', clientId);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('client_portal_settings')
          .insert({ client_id: clientId, ...settings });
        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client-portal-settings', clientId] });
    },
  });
}