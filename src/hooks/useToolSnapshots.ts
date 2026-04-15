import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ToolSnapshot {
  id: string;
  user_id: string;
  tool_slug: string;
  tool_name: string;
  snapshot_data: Record<string, unknown>;
  peak_score_effect: number | null;
  created_at: string;
}

interface UseToolSnapshotsOptions {
  toolSlug?: string;
  limit?: number;
}

export function useToolSnapshots(options: UseToolSnapshotsOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toolSlug, limit } = options;

  const query = useQuery({
    queryKey: ['tool-snapshots', user?.id, toolSlug, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      let q = supabase
        .from('tool_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (toolSlug) q = q.eq('tool_slug', toolSlug);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as ToolSnapshot[];
    },
    enabled: !!user?.id,
  });

  const saveSnapshot = useMutation({
    mutationFn: async (params: {
      toolSlug: string;
      toolName: string;
      snapshotData: Record<string, unknown>;
      peakScoreEffect?: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase.from('tool_snapshots').insert({
        user_id: user.id,
        tool_slug: params.toolSlug,
        tool_name: params.toolName,
        snapshot_data: params.snapshotData as any,
        peak_score_effect: params.peakScoreEffect ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-snapshots'] });
      toast.success('Ergebnis gespeichert ✓');
    },
    onError: () => {
      toast.error('Fehler beim Speichern');
    },
  });

  const deleteSnapshot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tool_snapshots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-snapshots'] });
      toast.success('Snapshot gelöscht');
    },
  });

  return {
    snapshots: query.data || [],
    isLoading: query.isLoading,
    saveSnapshot,
    deleteSnapshot,
  };
}

/** Get the latest snapshot for a specific tool */
export function useLatestToolSnapshot(toolSlug: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['tool-snapshots', 'latest', user?.id, toolSlug],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('tool_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .eq('tool_slug', toolSlug)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as ToolSnapshot | null;
    },
    enabled: !!user?.id && !!toolSlug,
  });
}
