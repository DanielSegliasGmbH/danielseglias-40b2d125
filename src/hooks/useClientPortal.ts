import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface CustomerPortalSettings {
  id: string;
  customer_id: string;
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
// For admins with previewCustomerId: get that customer's settings
export function useClientPortalSettings() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const previewCustomerId = searchParams.get('previewClientId') || searchParams.get('previewCustomerId');

  return useQuery({
    queryKey: ['customer-portal-settings', 'own', previewCustomerId],
    queryFn: async () => {
      // Admin preview mode with specific customer
      if (role === 'admin' && previewCustomerId) {
        const { data, error } = await supabase
          .from('customer_portal_settings')
          .select('*')
          .eq('customer_id', previewCustomerId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching customer portal settings for preview:', error);
          return null;
        }

        return data as CustomerPortalSettings | null;
      }

      // Admin without previewCustomerId - show all sections
      if (role === 'admin') {
        return null;
      }

      // Client role - get own settings via customer_users mapping (Phase 2)
      const { data: customerUser, error: customerError } = await supabase
        .from('customer_users')
        .select('customer_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (customerError || !customerUser) {
        return null;
      }

      const { data, error } = await supabase
        .from('customer_portal_settings')
        .select('*')
        .eq('customer_id', customerUser.customer_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching customer portal settings:', error);
        return null;
      }

      return data as CustomerPortalSettings | null;
    },
    enabled: !!user && (role === 'client' || role === 'admin'),
  });
}

// Helper to get preview customer id from URL
export function usePreviewClientId() {
  const [searchParams] = useSearchParams();
  return searchParams.get('previewClientId') || searchParams.get('previewCustomerId');
}

// For admins: get settings for a specific customer
export function useClientPortalSettingsForClient(customerId: string) {
  return useQuery({
    queryKey: ['customer-portal-settings', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_portal_settings')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching customer portal settings:', error);
        return null;
      }

      return data as CustomerPortalSettings | null;
    },
    enabled: !!customerId,
  });
}

// Alias for Phase 2 consistency
export const useCustomerPortalSettingsForCustomer = useClientPortalSettingsForClient;

// For admins: update settings for a customer
export function useUpdateClientPortalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clientId,
      settings,
    }: {
      clientId: string; // Actually customerId now
      settings: Partial<Omit<CustomerPortalSettings, 'id' | 'customer_id' | 'created_at' | 'updated_at'>>;
    }) => {
      // Check if settings exist
      const { data: existing } = await supabase
        .from('customer_portal_settings')
        .select('id')
        .eq('customer_id', clientId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('customer_portal_settings')
          .update(settings)
          .eq('customer_id', clientId);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('customer_portal_settings')
          .insert({ customer_id: clientId, ...settings });
        if (error) throw error;
      }

      return { success: true };
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-portal-settings', clientId] });
    },
  });
}

// Alias for Phase 2 consistency
export const useUpdateCustomerPortalSettings = useUpdateClientPortalSettings;
