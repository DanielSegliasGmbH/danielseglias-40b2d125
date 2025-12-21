import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCallback, useRef } from 'react';
import { SystemMapNode, SystemMapEdge, NodeFormData } from '@/components/system-map/types';

export type { SystemMapNode, SystemMapEdge } from '@/components/system-map/types';

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

export function useCreateNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (node: NodeFormData) => {
      const { data, error } = await supabase
        .from('system_map_nodes')
        .insert({
          key: node.key,
          label: node.label,
          category: node.category,
          description: node.description || null,
          is_active: node.is_active,
          importance: node.importance,
          phase: node.phase,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SystemMapNode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-map', 'nodes'] });
      toast.success('Node erstellt');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key') || error.message.includes('unique')) {
        toast.error('Ein Node mit diesem Key existiert bereits');
      } else {
        toast.error('Node konnte nicht erstellt werden');
      }
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, updates }: { key: string; updates: Partial<NodeFormData> }) => {
      const { error } = await supabase
        .from('system_map_nodes')
        .update({
          ...(updates.label !== undefined && { label: updates.label }),
          ...(updates.category !== undefined && { category: updates.category }),
          ...(updates.description !== undefined && { description: updates.description || null }),
          ...(updates.is_active !== undefined && { is_active: updates.is_active }),
          ...(updates.importance !== undefined && { importance: updates.importance }),
          ...(updates.phase !== undefined && { phase: updates.phase }),
        })
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

export function useDeleteNodeWithEdges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, deleteEdges }: { key: string; deleteEdges: boolean }) => {
      if (deleteEdges) {
        // First delete all connected edges
        const { error: edgeError } = await supabase
          .from('system_map_edges')
          .update({ is_active: false })
          .or(`source_key.eq.${key},target_key.eq.${key}`);

        if (edgeError) throw edgeError;
      }

      // Then delete the node
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

export function useNodeEdgeCount(nodeKey: string | null, edges: SystemMapEdge[] | undefined) {
  if (!nodeKey || !edges) return 0;
  return edges.filter(e => e.source_key === nodeKey || e.target_key === nodeKey).length;
}

export function useDebouncedPositionUpdate() {
  const queryClient = useQueryClient();
  const debounceTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  const lastSavedRef = useRef<Record<string, { x: number; y: number }>>({});

  const updatePosition = useMutation({
    mutationFn: async ({ key, position_x, position_y }: { key: string; position_x: number; position_y: number }) => {
      const { error } = await supabase
        .from('system_map_nodes')
        .update({ position_x, position_y })
        .eq('key', key);

      if (error) throw error;
      lastSavedRef.current[key] = { x: position_x, y: position_y };
    },
    onError: (_, variables) => {
      toast.error('Position konnte nicht gespeichert werden');
      // Revert to last saved position by invalidating
      queryClient.invalidateQueries({ queryKey: ['system-map', 'nodes'] });
    },
  });

  const debouncedUpdate = useCallback((key: string, x: number, y: number) => {
    // Clear existing timer for this key
    if (debounceTimerRef.current[key]) {
      clearTimeout(debounceTimerRef.current[key]);
    }

    // Set new timer
    debounceTimerRef.current[key] = setTimeout(() => {
      updatePosition.mutate({ key, position_x: x, position_y: y });
      delete debounceTimerRef.current[key];
    }, 500);
  }, [updatePosition]);

  return { debouncedUpdate, isPending: updatePosition.isPending };
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

// Check if key is unique
export function useCheckKeyUnique() {
  return useMutation({
    mutationFn: async (key: string) => {
      const { data, error } = await supabase
        .from('system_map_nodes')
        .select('key')
        .eq('key', key)
        .maybeSingle();

      if (error) throw error;
      return data === null; // true if unique
    },
  });
}
