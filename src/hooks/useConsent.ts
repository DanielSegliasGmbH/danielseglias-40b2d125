import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CURRENT_TERMS_VERSION = 'v1.0';
export const CURRENT_PRIVACY_VERSION = 'v1.0';

export interface ConsentRecord {
  id: string;
  user_id: string;
  terms_accepted: boolean;
  privacy_accepted: boolean;
  terms_version: string;
  privacy_version: string;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export function useUserConsent(userId: string | undefined) {
  return useQuery({
    queryKey: ['consent', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consent_records')
        .select('*')
        .eq('user_id', userId!)
        .order('accepted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as ConsentRecord | null;
    },
    enabled: !!userId,
  });
}

export function useHasValidConsent(userId: string | undefined) {
  const { data, isLoading } = useUserConsent(userId);
  const hasValid = !!data
    && data.terms_accepted
    && data.privacy_accepted
    && data.terms_version === CURRENT_TERMS_VERSION
    && data.privacy_version === CURRENT_PRIVACY_VERSION;
  return { hasValidConsent: hasValid, isLoading, latestConsent: data };
}

export function useSaveConsent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const { error } = await supabase
        .from('consent_records')
        .insert({
          user_id: userId,
          terms_accepted: true,
          privacy_accepted: true,
          terms_version: CURRENT_TERMS_VERSION,
          privacy_version: CURRENT_PRIVACY_VERSION,
          user_agent: navigator.userAgent,
        });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['consent', vars.userId] });
    },
  });
}

export function useAdminUserConsent(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'consent', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consent_records')
        .select('*')
        .eq('user_id', userId!)
        .order('accepted_at', { ascending: false });
      if (error) throw error;
      return (data || []) as ConsentRecord[];
    },
    enabled: !!userId,
  });
}
