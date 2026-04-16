import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface LastPlanData {
  id: string;
  user_id: string;
  opted_in: boolean;
  opted_in_at: string | null;
  dismissed_until: string | null;
  vorsorgeauftrag: Record<string, boolean>;
  patientenverfuegung: Record<string, boolean>;
  testament: Record<string, boolean>;
  todesfall_dokumente: Record<string, boolean>;
  beguenstigte: Record<string, boolean>;
}

export function useLastPlan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['last-plan', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('last_plan_progress')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as LastPlanData | null;
    },
    enabled: !!user,
  });
}

export function useOptInLastPlan() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('last_plan_progress')
        .upsert({
          user_id: user.id,
          opted_in: true,
          opted_in_at: new Date().toISOString(),
        } as any, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['last-plan'] });
    },
  });
}

export function useDismissLastPlan() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const threeMonths = new Date();
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      const { error } = await supabase
        .from('last_plan_progress')
        .upsert({
          user_id: user.id,
          opted_in: false,
          dismissed_until: threeMonths.toISOString(),
        } as any, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['last-plan'] });
    },
  });
}

export function useUpdateLastPlanSection() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ section, data }: { section: string; data: Record<string, boolean> }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('last_plan_progress')
        .update({ [section]: data } as any)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['last-plan'] });
      toast.success('Gespeichert');
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });
}

// Calculate overall completion percentage
export function calculateCompleteness(plan: LastPlanData | null): number {
  if (!plan) return 0;
  const sections = [
    plan.vorsorgeauftrag,
    plan.patientenverfuegung,
    plan.testament,
    plan.todesfall_dokumente,
    plan.beguenstigte,
  ];

  const EXPECTED_ITEMS = [4, 5, 4, 10, 1]; // items per section
  let total = 0;
  let checked = 0;

  sections.forEach((sec, i) => {
    const expected = EXPECTED_ITEMS[i];
    total += expected;
    const values = Object.values(sec || {});
    checked += values.filter(Boolean).length;
  });

  return total > 0 ? Math.round((checked / total) * 100) : 0;
}
