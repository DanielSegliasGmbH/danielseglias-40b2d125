import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { JOURNEY_PHASES, type JourneyPhase, type PhaseGate } from '@/config/journeyPhases';

interface UserJourney {
  current_phase: number;
  milestones_completed: Record<string, boolean>;
  last_checked_at: string;
  created_at: string;
}

interface FeatureUnlockState {
  /** Current journey phase (0-6) */
  currentPhase: number;
  /** Days since user signed up */
  daysSinceSignup: number;
  /** Whether a specific feature is unlocked */
  isUnlocked: (featureKey: string) => boolean;
  /** Get all unlocked feature keys */
  unlockedFeatures: Set<string>;
  /** Get newly unlocked features since last check */
  newlyUnlocked: string[];
  /** Clear newly unlocked (after showing celebration) */
  clearNewlyUnlocked: () => void;
  /** Current phase info */
  currentPhaseInfo: JourneyPhase;
  /** Next phase info */
  nextPhaseInfo: JourneyPhase | null;
  /** Loading state */
  loading: boolean;
  /** Whether user is premium (all unlocked) */
  isPremium: boolean;
}

function meetsGate(
  gate: PhaseGate,
  days: number,
  peakScore: number | null,
  tasksCompleted: number,
  coachModules: number,
): boolean {
  // Empty gate = always unlocked
  if (!gate.daysSinceSignup && !gate.minPeakScore && !gate.minTasksCompleted && !gate.minCoachModulesCompleted) {
    return true;
  }
  // OR-based: any condition met unlocks the phase
  if (gate.daysSinceSignup && days >= gate.daysSinceSignup) return true;
  if (gate.minPeakScore && peakScore !== null && peakScore >= gate.minPeakScore) return true;
  if (gate.minTasksCompleted && tasksCompleted >= gate.minTasksCompleted) return true;
  if (gate.minCoachModulesCompleted && coachModules >= gate.minCoachModulesCompleted) return true;
  return false;
}

export function useFeatureUnlock(): FeatureUnlockState {
  // ARCHIVED: Journey phase unlocking disabled for v1.0
  // All tools show based only on visibility field in DB.
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  // Fetch user journey
  const { data: journey, isLoading: journeyLoading } = useQuery({
    queryKey: ['user-journey', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_journey')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as UserJourney | null;
    },
    enabled: !!user,
  });

  // Fetch existing unlocks
  const { data: existingUnlocks = [] } = useQuery({
    queryKey: ['feature-unlocks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('feature_unlocks')
        .select('feature_key, phase')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
  });

  // Fetch PeakScore
  const { data: peakScore = null } = useQuery({
    queryKey: ['journey-peakscore', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('peak_scores')
        .select('score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      return data?.score ?? null;
    },
    enabled: !!user,
  });

  // Fetch completed tasks count
  const { data: tasksCompleted = 0 } = useQuery({
    queryKey: ['journey-tasks', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('client_tasks')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true);
      return count || 0;
    },
    enabled: !!user,
  });

  // Fetch completed coach modules count
  const { data: coachModules = 0 } = useQuery({
    queryKey: ['journey-coach', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count } = await supabase
        .from('coach_progress')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'completed');
      return count || 0;
    },
    enabled: !!user,
  });

  // Check premium status
  const { data: isPremium = false } = useQuery({
    queryKey: ['journey-premium', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();
      return data?.plan === 'premium';
    },
    enabled: !!user,
  });

  // Calculate days since journey start.
  // Anchor to user_journey.created_at when present (handles users who signed up
  // before the journey system existed, and supports admin resets).
  // Falls back to user.created_at otherwise.
  const daysSinceSignup = useMemo(() => {
    const anchorIso = journey?.created_at || user?.created_at;
    if (!anchorIso) return 0;
    const anchor = new Date(anchorIso);
    const now = new Date();
    return Math.max(0, Math.floor((now.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24)));
  }, [journey?.created_at, user?.created_at]);

  // Determine current max phase
  const currentPhase = useMemo(() => {
    if (isPremium) return 6;
    let maxPhase = 0;
    for (const phase of JOURNEY_PHASES) {
      if (meetsGate(phase.gate, daysSinceSignup, peakScore, tasksCompleted, coachModules)) {
        maxPhase = phase.phase;
      } else {
        break;
      }
    }
    return maxPhase;
  }, [isPremium, daysSinceSignup, peakScore, tasksCompleted, coachModules]);

  // Build unlocked features set
  const unlockedFeatures = useMemo(() => {
    const set = new Set<string>();
    if (isPremium) {
      JOURNEY_PHASES.forEach(p => p.featureKeys.forEach(k => set.add(k)));
      return set;
    }
    for (const phase of JOURNEY_PHASES) {
      if (phase.phase <= currentPhase) {
        phase.featureKeys.forEach(k => set.add(k));
      }
    }
    // Also include any individually unlocked features
    existingUnlocks.forEach(u => set.add(u.feature_key));
    return set;
  }, [currentPhase, isPremium, existingUnlocks]);

  // Ensure journey row exists and detect new unlocks
  const saveJourney = useMutation({
    mutationFn: async (phase: number) => {
      if (!user) return;
      const { data: existing } = await supabase
        .from('user_journey')
        .select('current_phase')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from('user_journey').insert({
          user_id: user.id,
          current_phase: phase,
          milestones_completed: {},
        });
      } else if (existing.current_phase < phase) {
        await supabase
          .from('user_journey')
          .update({ current_phase: phase, last_checked_at: new Date().toISOString() })
          .eq('user_id', user.id);
      }
    },
  });

  // Persist new unlocks
  const saveUnlocks = useMutation({
    mutationFn: async (keys: string[]) => {
      if (!user || keys.length === 0) return;
      const rows = keys.map(k => ({
        user_id: user.id,
        feature_key: k,
        phase: currentPhase,
      }));
      await supabase.from('feature_unlocks').upsert(rows, { onConflict: 'user_id,feature_key' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-unlocks', user?.id] });
    },
  });

  // Check for new unlocks on phase change
  useEffect(() => {
    if (!user || journeyLoading) return;

    // Save journey
    saveJourney.mutate(currentPhase);

    // Detect newly unlocked features
    const existingKeys = new Set(existingUnlocks.map(u => u.feature_key));
    const newKeys = Array.from(unlockedFeatures).filter(k => !existingKeys.has(k));
    
    if (newKeys.length > 0) {
      // Only show celebration for features beyond phase 0 and 1
      const celebrationKeys = newKeys.filter(k => {
        const phase = JOURNEY_PHASES.find(p => p.featureKeys.includes(k));
        return phase && phase.phase >= 2;
      });
      if (celebrationKeys.length > 0) {
        setNewlyUnlocked(celebrationKeys);
      }
      saveUnlocks.mutate(newKeys);
    }
  }, [currentPhase, user?.id, journeyLoading]);

  // ARCHIVED for v1.0: always return true; visibility is controlled by DB field only.
  const isUnlocked = useCallback(
    (_featureKey: string) => true,
    [],
  );

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked([]), []);

  const currentPhaseInfo = JOURNEY_PHASES[currentPhase] || JOURNEY_PHASES[0];
  const nextPhaseInfo = currentPhase < 6 ? JOURNEY_PHASES[currentPhase + 1] : null;

  return {
    currentPhase,
    daysSinceSignup,
    isUnlocked,
    unlockedFeatures,
    newlyUnlocked,
    clearNewlyUnlocked,
    currentPhaseInfo,
    nextPhaseInfo,
    loading: journeyLoading,
    isPremium,
  };
}
