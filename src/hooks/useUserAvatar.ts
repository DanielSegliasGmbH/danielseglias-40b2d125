// ARCHIVED: Replaced by Hamster mascot system. Logic kept intact for data access.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserAvatar {
  id: string;
  user_id: string;
  future_self_name: string | null;
  future_self_name_category: string | null;
  future_self_age: number | null;
  future_self_defining_moment: string | null;
  current_avatar_data: Record<string, unknown>;
  avatar_completed: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserAvatar() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: avatar, isLoading } = useQuery({
    queryKey: ['user-avatar', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_avatars')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      return data as UserAvatar | null;
    },
    enabled: !!user,
  });

  const saveAvatar = useMutation({
    mutationFn: async (payload: {
      future_self_name: string;
      future_self_name_category: string;
      future_self_age: number;
      future_self_defining_moment: string;
    }) => {
      if (!user) throw new Error('Not authenticated');
      const row = {
        user_id: user.id,
        ...payload,
        avatar_completed: true,
      };
      const { data, error } = await supabase
        .from('user_avatars')
        .upsert(row, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-avatar', user?.id] });
    },
  });

  return {
    avatar,
    isLoading,
    saveAvatar,
    completed: avatar?.avatar_completed ?? false,
    futureSelfName: avatar?.future_self_name ?? null,
  };
}
