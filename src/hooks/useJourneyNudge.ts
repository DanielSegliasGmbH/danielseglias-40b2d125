import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFinanzType } from '@/hooks/useFinanzType';
import { getNudgeForDay, type JourneyNudge } from '@/config/journeySchedule';

interface UseJourneyNudgeReturn {
  currentNudge: JourneyNudge | null;
  daysSinceSignup: number;
  dismiss: () => void;
  complete: () => void;
  loading: boolean;
}

export function useJourneyNudge(): UseJourneyNudgeReturn {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { typeKey } = useFinanzType();
  const [dismissed, setDismissed] = useState(false);

  const daysSinceSignup = useMemo(() => {
    if (!user?.created_at) return 0;
    const signup = new Date(user.created_at);
    return Math.floor((Date.now() - signup.getTime()) / (1000 * 60 * 60 * 24));
  }, [user?.created_at]);

  // Fetch delivered nudges
  const { data: deliveredNudges = [], isLoading } = useQuery({
    queryKey: ['journey-nudges', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('journey_nudges')
        .select('nudge_key, completed_at, dismissed_at')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const deliveredKeys = useMemo(
    () => new Set(deliveredNudges.map(n => n.nudge_key)),
    [deliveredNudges],
  );

  const currentNudge = useMemo(() => {
    if (dismissed) return null;
    return getNudgeForDay(daysSinceSignup, deliveredKeys, typeKey);
  }, [daysSinceSignup, deliveredKeys, typeKey, dismissed]);

  // Mark nudge as shown (insert row)
  const markShown = useMutation({
    mutationFn: async (nudge: JourneyNudge) => {
      if (!user) return;
      await supabase.from('journey_nudges').upsert(
        { user_id: user.id, day_number: nudge.day, nudge_key: nudge.key },
        { onConflict: 'user_id,nudge_key' },
      );
    },
  });

  // Auto-mark as shown
  useEffect(() => {
    if (currentNudge && user && !deliveredKeys.has(currentNudge.key)) {
      markShown.mutate(currentNudge);
    }
  }, [currentNudge?.key, user?.id]);

  const dismiss = useCallback(async () => {
    if (!currentNudge || !user) return;
    setDismissed(true);
    await supabase
      .from('journey_nudges')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('nudge_key', currentNudge.key);
    queryClient.invalidateQueries({ queryKey: ['journey-nudges', user.id] });
  }, [currentNudge, user]);

  const complete = useCallback(async () => {
    if (!currentNudge || !user) return;
    setDismissed(true);
    await supabase
      .from('journey_nudges')
      .update({ completed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('nudge_key', currentNudge.key);
    queryClient.invalidateQueries({ queryKey: ['journey-nudges', user.id] });
  }, [currentNudge, user]);

  return {
    currentNudge,
    daysSinceSignup,
    dismiss,
    complete,
    loading: isLoading,
  };
}
