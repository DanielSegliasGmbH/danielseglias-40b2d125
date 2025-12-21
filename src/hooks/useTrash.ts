import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export interface DeletedNode {
  id: string;
  key: string;
  label: string;
  category: string;
  deleted_at: string;
  deleted_by: string | null;
}

export interface DeletedEdge {
  id: string;
  source_key: string;
  target_key: string;
  relation: string;
  deleted_at: string;
  deleted_by: string | null;
}

export function useDeletedNodes() {
  return useQuery({
    queryKey: ['trash', 'nodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_map_nodes')
        .select('id, key, label, category, deleted_at, deleted_by')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return data as DeletedNode[];
    },
  });
}

export function useDeletedEdges() {
  return useQuery({
    queryKey: ['trash', 'edges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_map_edges')
        .select('id, source_key, target_key, relation, deleted_at, deleted_by')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return data as DeletedEdge[];
    },
  });
}

export function useRestoreNode() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase
        .from('system_map_nodes')
        .update({ deleted_at: null, deleted_by: null })
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'nodes'] });
      queryClient.invalidateQueries({ queryKey: ['system-map', 'nodes'] });
      toast.success(t('trash.restored'));
    },
    onError: () => {
      toast.error(t('trash.restoreError'));
    },
  });
}

export function useRestoreEdge() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_map_edges')
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'edges'] });
      queryClient.invalidateQueries({ queryKey: ['system-map', 'edges'] });
      toast.success(t('trash.restored'));
    },
    onError: () => {
      toast.error(t('trash.restoreError'));
    },
  });
}

export function usePermanentDeleteNode() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (key: string) => {
      const { error } = await supabase
        .from('system_map_nodes')
        .delete()
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'nodes'] });
      toast.success(t('trash.permanentlyDeleted'));
    },
    onError: () => {
      toast.error(t('trash.deleteError'));
    },
  });
}

export function usePermanentDeleteEdge() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_map_edges')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'edges'] });
      toast.success(t('trash.permanentlyDeleted'));
    },
    onError: () => {
      toast.error(t('trash.deleteError'));
    },
  });
}

export function useCleanupTrash() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('cleanup_deleted_items');
      if (error) throw error;
      return data as number;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ['trash'] });
      toast.success(t('trash.cleanupSuccess', { count }));
    },
    onError: () => {
      toast.error(t('trash.cleanupError'));
    },
  });
}
