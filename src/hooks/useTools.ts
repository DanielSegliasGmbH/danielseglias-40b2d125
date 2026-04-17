import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ToolVisibility = 'public' | 'phase_locked' | 'hidden' | 'admin_only';

export interface Tool {
  id: string;
  key: string;
  name_key: string;
  description_key: string;
  icon: string;
  status: 'active' | 'planned' | 'deprecated';
  enabled_for_clients: boolean;
  enabled_for_public: boolean;
  visibility: ToolVisibility;
  unlock_phase: number | null;
  sort_order: number;
  slug: string | null;
  cta_mode: 'contact' | 'download' | 'booking' | null;
  created_at: string;
  updated_at: string;
}

// Hook for Admin: fetch all tools
export function useAllTools() {
  return useQuery({
    queryKey: ['tools', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Tool[];
    },
  });
}

// Hook for Client Portal: fetch client-enabled tools
export function useClientTools() {
  return useQuery({
    queryKey: ['tools', 'client'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('enabled_for_clients', true)
        .eq('status', 'active')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Tool[];
    },
  });
}

// Hook for Public: fetch only tools explicitly marked as public visibility
export function usePublicTools() {
  return useQuery({
    queryKey: ['tools', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('enabled_for_public', true)
        .eq('visibility', 'public')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Tool[];
    },
  });
}

// Hook for Admin: update tool settings (incl. visibility + unlock_phase)
export function useUpdateTool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<Tool, 'enabled_for_clients' | 'enabled_for_public' | 'status' | 'sort_order' | 'visibility' | 'unlock_phase'>>;
    }) => {
      const { data, error } = await supabase
        .from('tools')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Tool;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      queryClient.invalidateQueries({ queryKey: ['client-tools-filtered'] });
    },
  });
}
