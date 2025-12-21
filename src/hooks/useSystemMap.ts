import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SystemMapNode {
  id: string;
  key: string;
  label: string;
  category: 'core' | 'module' | 'ui' | 'security' | 'automation' | 'integration';
  description: string | null;
  is_active: boolean;
  position_x: number | null;
  position_y: number | null;
  created_at: string;
  updated_at: string;
}

export interface SystemMapEdge {
  id: string;
  source_key: string;
  target_key: string;
  relation: 'owns' | 'depends_on' | 'uses' | 'contains' | 'manages' | 'creates';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useSystemMapNodes() {
  return useQuery({
    queryKey: ['system-map', 'nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_map_nodes')
        .select('*')
        .eq('is_active', true)
        .order('label');

      if (error) {
        toast.error('Fehler beim Laden der Nodes');
        throw error;
      }
      return data as SystemMapNode[];
    },
  });
}

export function useSystemMapEdges() {
  return useQuery({
    queryKey: ['system-map', 'edges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_map_edges')
        .select('*')
        .eq('is_active', true);

      if (error) {
        toast.error('Fehler beim Laden der Edges');
        throw error;
      }
      return data as SystemMapEdge[];
    },
  });
}

export function useUpdateNodePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, position_x, position_y }: { key: string; position_x: number; position_y: number }) => {
      const { error } = await supabase
        .from('system_map_nodes')
        .update({ position_x, position_y })
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-map', 'nodes'] });
    },
    onError: () => {
      toast.error('Position konnte nicht gespeichert werden');
    },
  });
}

export function useCreateNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (node: Omit<SystemMapNode, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('system_map_nodes')
        .insert(node);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-map', 'nodes'] });
      toast.success('Node erstellt');
    },
    onError: () => {
      toast.error('Node konnte nicht erstellt werden');
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, updates }: { key: string; updates: Partial<SystemMapNode> }) => {
      const { error } = await supabase
        .from('system_map_nodes')
        .update(updates)
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-map', 'nodes'] });
      toast.success('Node aktualisiert');
    },
    onError: () => {
      toast.error('Node konnte nicht aktualisiert werden');
    },
  });
}

export function useDeleteNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase
        .from('system_map_nodes')
        .update({ is_active: false })
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-map'] });
      toast.success('Node gelöscht');
    },
    onError: () => {
      toast.error('Node konnte nicht gelöscht werden');
    },
  });
}

export function useCreateEdge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (edge: Omit<SystemMapEdge, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('system_map_edges')
        .insert(edge);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-map', 'edges'] });
      toast.success('Verbindung erstellt');
    },
    onError: () => {
      toast.error('Verbindung konnte nicht erstellt werden');
    },
  });
}

export function useDeleteEdge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_map_edges')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-map', 'edges'] });
      toast.success('Verbindung gelöscht');
    },
    onError: () => {
      toast.error('Verbindung konnte nicht gelöscht werden');
    },
  });
}
