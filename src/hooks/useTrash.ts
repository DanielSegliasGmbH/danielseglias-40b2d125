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

export interface DeletedClient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  deleted_at: string;
  deleted_by: string | null;
}

export interface DeletedCase {
  id: string;
  title: string;
  client_id: string;
  status: string;
  deleted_at: string;
  deleted_by: string | null;
}

export interface DeletedTask {
  id: string;
  title: string;
  case_id: string;
  priority: string;
  deleted_at: string;
  deleted_by: string | null;
}

// System Map Nodes
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

// System Map Edges
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

// Clients
export function useDeletedClients() {
  return useQuery({
    queryKey: ['trash', 'clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name, email, deleted_at, deleted_by')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return data as DeletedClient[];
    },
  });
}

// Cases
export function useDeletedCases() {
  return useQuery({
    queryKey: ['trash', 'cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cases')
        .select('id, title, client_id, status, deleted_at, deleted_by')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return data as DeletedCase[];
    },
  });
}

// Tasks
export function useDeletedTasks() {
  return useQuery({
    queryKey: ['trash', 'tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, case_id, priority, deleted_at, deleted_by')
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false });

      if (error) throw error;
      return data as DeletedTask[];
    },
  });
}

// Restore hooks
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

export function useRestoreClient() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success(t('trash.restored'));
    },
    onError: () => {
      toast.error(t('trash.restoreError'));
    },
  });
}

export function useRestoreCase() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cases')
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'cases'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      toast.success(t('trash.restored'));
    },
    onError: () => {
      toast.error(t('trash.restoreError'));
    },
  });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .update({ deleted_at: null, deleted_by: null })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success(t('trash.restored'));
    },
    onError: () => {
      toast.error(t('trash.restoreError'));
    },
  });
}

// Permanent delete hooks
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

export function usePermanentDeleteClient() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'clients'] });
      toast.success(t('trash.permanentlyDeleted'));
    },
    onError: () => {
      toast.error(t('trash.deleteError'));
    },
  });
}

export function usePermanentDeleteCase() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cases')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'cases'] });
      toast.success(t('trash.permanentlyDeleted'));
    },
    onError: () => {
      toast.error(t('trash.deleteError'));
    },
  });
}

export function usePermanentDeleteTask() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trash', 'tasks'] });
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
