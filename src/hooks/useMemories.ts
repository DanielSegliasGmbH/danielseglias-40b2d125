import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useState } from 'react';

export interface Memory {
  id: string;
  user_id: string;
  tool_slug: string;
  action: string;
  title: string | null;
  input_data: Record<string, unknown>;
  output_data: Record<string, unknown>;
  created_at: string;
}

interface UseMemoriesOptions {
  toolFilter?: string;
  search?: string;
  pageSize?: number;
}

export function useMemories(options: UseMemoriesOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toolFilter, search, pageSize = 20 } = options;
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['memories', user?.id, toolFilter, search, page, pageSize],
    queryFn: async () => {
      if (!user?.id) return { data: [] as Memory[], count: 0 };

      let q = supabase
        .from('memories')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (toolFilter) {
        q = q.eq('tool_slug', toolFilter);
      }
      if (search) {
        q = q.or(`title.ilike.%${search}%,tool_slug.ilike.%${search}%,action.ilike.%${search}%`);
      }

      const { data, error, count } = await q;
      if (error) throw error;
      return { data: (data || []) as Memory[], count: count || 0 };
    },
    enabled: !!user?.id,
  });

  const deleteMemory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('memories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
    },
  });

  return {
    memories: query.data?.data || [],
    totalCount: query.data?.count || 0,
    isLoading: query.isLoading,
    page,
    setPage,
    pageSize,
    hasMore: (query.data?.count || 0) > (page + 1) * pageSize,
    deleteMemory,
  };
}

export function useMemorySnapshot() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const saveSnapshot = async (
    toolSlug: string,
    action: string,
    inputData: Record<string, unknown>,
    outputData: Record<string, unknown>,
    title?: string
  ) => {
    if (!user?.id) return;

    const autoTitle = title || `${toolSlug} – ${action}`;

    const { error } = await supabase.from('memories').insert([{
      user_id: user.id,
      tool_slug: toolSlug,
      action,
      title: autoTitle,
      input_data: inputData as any,
      output_data: outputData as any,
    }]);

    if (error) {
      console.error('Memory snapshot failed:', error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['memories'] });
  };

  return { saveSnapshot };
}
