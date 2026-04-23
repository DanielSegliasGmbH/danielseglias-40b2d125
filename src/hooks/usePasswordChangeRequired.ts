import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Reads the profiles.password_change_required flag for the current user.
 * Used by PasswordChangeGate to force admin-created accounts through
 * the /set-password screen on first login.
 */
export function usePasswordChangeRequired() {
  const { user } = useAuth();
  const queryKey = ['password-change-required', user?.id] as const;

  const query = useQuery({
    queryKey,
    enabled: !!user,
    queryFn: async (): Promise<boolean> => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('profiles')
        .select('password_change_required')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.error('[usePasswordChangeRequired] fetch error', error);
        return false;
      }
      return !!data?.password_change_required;
    },
  });

  return {
    required: !!user && (query.data ?? false),
    loading: !!user && query.isLoading,
    refetch: query.refetch,
  };
}
