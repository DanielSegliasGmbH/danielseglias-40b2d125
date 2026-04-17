import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingState {
  completed: boolean;
  completedAt: string | null;
  currentStep: number;
}

export const ONBOARDING_TOTAL_STEPS = 6;

const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  completed: false,
  completedAt: null,
  currentStep: 1,
};

/**
 * Reads + writes onboarding progress from the user's profile.
 * Source of truth: profiles.onboarding_completed / onboarding_current_step.
 */
export function useOnboardingState() {
  const { user, role } = useAuth();
  const qc = useQueryClient();

  // Admins/Staff are exempt from the mandatory client onboarding.
  const isExempt = role === 'admin' || role === 'staff';

  const query = useQuery({
    queryKey: ['onboarding-state', user?.id],
    enabled: !!user && !isExempt,
    queryFn: async (): Promise<OnboardingState> => {
      if (!user) return DEFAULT_ONBOARDING_STATE;

      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_completed_at, onboarding_current_step')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[useOnboardingState] fetch error', error);
        return DEFAULT_ONBOARDING_STATE;
      }

      if (!data) return DEFAULT_ONBOARDING_STATE;

      return {
        completed: !!data.onboarding_completed,
        completedAt: data.onboarding_completed_at,
        currentStep: data.onboarding_current_step ?? 1,
      };
    },
  });

  const setStep = useMutation({
    mutationFn: async (step: number) => {
      if (!user) throw new Error('not authenticated');
      const safe = Math.max(1, Math.min(ONBOARDING_TOTAL_STEPS, step));
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_current_step: safe })
        .eq('id', user.id);
      if (error) throw error;
      return safe;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding-state', user?.id] }),
  });

  const markComplete = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_current_step: ONBOARDING_TOTAL_STEPS,
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['onboarding-state', user?.id] }),
  });

  const state = !user || isExempt ? null : (query.data ?? DEFAULT_ONBOARDING_STATE);

  return {
    state,
    loading: !!user && !isExempt && query.isLoading,
    isExempt,
    needsOnboarding: !!user && !isExempt && !state?.completed,
    setStep: (n: number) => setStep.mutateAsync(n),
    markComplete: () => markComplete.mutateAsync(),
    refetch: query.refetch,
  };
}
