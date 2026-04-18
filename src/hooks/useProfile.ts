/**
 * useProfile() — UNIFIED user identity hook.
 *
 * SINGLE SOURCE OF TRUTH for user identity, profile, financial estimates,
 * settings, and gamification snapshot data across the entire app.
 *
 * Replaces all direct reads of:
 *   - supabase.from('profiles')   (in components)
 *   - supabase.from('meta_profiles')  (DEPRECATED post-SST-1)
 *
 * Combines:
 *   - Auth user (useAuth)
 *   - profiles row (single fetch, 5min staleTime)
 *   - Hamster + PeakScore + Gamification (delegated to existing hooks)
 *
 * Usage:
 *   import { useProfile } from '@/hooks/useProfile';
 *   const { profile, isLoading, updateProfile } = useProfile();
 */
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useHamster } from '@/hooks/useHamster';
import { usePeakScore } from '@/hooks/usePeakScore';
import { useGamification } from '@/hooks/useGamification';

export interface UserProfile {
  // Identity
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;

  // Personal
  age: number | null;
  occupation: string | null;
  professionalStatus: string | null;
  canton: string | null;

  // Financial estimates (from profiles)
  monthlyIncome: number | null;
  fixedCosts: number | null;
  savingsRate: number | null;
  wealth: number | null;
  debts: number | null;
  financialGoal: string | null;
  taxBurden: number | null;
  riskTolerance: number | null;

  // Freedom planning
  freedomTargetAge: number | null;
  freedomLifeExpectancy: number | null;
  lastConfirmedAt: string | null;

  // App status
  plan: string;
  accountStatus: string;
  onboardingCompleted: boolean;
  memberSince: string;

  // Gamification snapshot
  peakScore: number | null;
  rank: number;
  rankName: string;
  rankEmoji: string;
  coins: number;
  goldNuts: number;
  xp: number;
  streakDays: number;

  // Settings
  theme: string;
  voiceBriefEnabled: boolean;
  weeklyRitualEnabled: boolean;
  moodCheckinEnabled: boolean;
  payDay: number;
}

const PROFILE_STALE_MS = 5 * 60 * 1000; // 5 minutes

// ── Internal field-name mapping (camelCase → snake_case columns) ──
function toDbPayload(fields: Partial<UserProfile>): Record<string, unknown> {
  const map: Record<keyof UserProfile, string> = {
    id: 'id',
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email', // not on profiles; ignored below
    phone: 'phone',
    age: 'age',
    occupation: 'occupation',
    professionalStatus: 'professional_status',
    canton: 'canton', // not on profiles yet; safely ignored if column missing
    monthlyIncome: 'monthly_income',
    fixedCosts: 'fixed_costs',
    savingsRate: 'savings_rate',
    wealth: 'wealth',
    debts: 'debts',
    financialGoal: 'financial_goal',
    taxBurden: 'tax_burden',
    riskTolerance: 'risk_tolerance',
    freedomTargetAge: 'freedom_target_age',
    freedomLifeExpectancy: 'freedom_life_expectancy',
    lastConfirmedAt: 'last_confirmed_at',
    plan: 'plan',
    accountStatus: 'account_status',
    onboardingCompleted: 'onboarding_completed',
    memberSince: 'created_at',
    peakScore: '__skip__',
    rank: '__skip__',
    rankName: '__skip__',
    rankEmoji: '__skip__',
    coins: '__skip__',
    goldNuts: '__skip__',
    xp: '__skip__',
    streakDays: '__skip__',
    theme: 'theme_preference',
    voiceBriefEnabled: 'voice_brief_enabled',
    weeklyRitualEnabled: 'weekly_ritual_enabled',
    moodCheckinEnabled: 'mood_checkin_enabled',
    payDay: 'payday_date',
  };
  const payload: Record<string, unknown> = {};
  (Object.keys(fields) as (keyof UserProfile)[]).forEach((k) => {
    const col = map[k];
    if (!col || col === '__skip__' || col === 'id' || col === 'email' || col === 'created_at') return;
    payload[col] = fields[k] as unknown;
  });
  return payload;
}

export function useProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { rank, rankName, rankEmoji, coins, goldNuts } = useHamster();
  const { score: peakScore } = usePeakScore();
  const { points: xp, streakDays } = useGamification();

  const { data: row, isLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.error('[useProfile] Failed to load profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user,
    staleTime: PROFILE_STALE_MS,
  });

  const updateProfile = useMutation({
    mutationFn: async (fields: Partial<UserProfile>) => {
      if (!user) throw new Error('Not authenticated');
      const payload = toDbPayload(fields);
      if (Object.keys(payload).length === 0) return;
      payload.updated_at = new Date().toISOString();
      const { error } = await supabase.from('profiles').update(payload).eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-profile', user?.id] });
    },
  });

  const profile: UserProfile | null = useMemo(() => {
    if (!user) return null;
    const r: any = row ?? {};
    const meta: any = user.user_metadata ?? {};
    return {
      id: user.id,
      firstName: r.first_name ?? meta.first_name ?? '',
      lastName: r.last_name ?? meta.last_name ?? '',
      email: user.email ?? '',
      phone: r.phone ?? null,

      age: r.age ?? null,
      occupation: r.occupation ?? null,
      professionalStatus: r.professional_status ?? null,
      canton: r.canton ?? null,

      monthlyIncome: r.monthly_income ?? null,
      fixedCosts: r.fixed_costs ?? null,
      savingsRate: r.savings_rate ?? null,
      wealth: r.wealth ?? null,
      debts: r.debts ?? null,
      financialGoal: r.financial_goal ?? null,
      taxBurden: r.tax_burden ?? null,
      riskTolerance: r.risk_tolerance ?? null,

      freedomTargetAge: r.freedom_target_age ?? null,
      freedomLifeExpectancy: r.freedom_life_expectancy ?? null,
      lastConfirmedAt: r.last_confirmed_at ?? null,

      plan: r.plan ?? 'default',
      accountStatus: r.account_status ?? 'active',
      onboardingCompleted: !!r.onboarding_completed,
      memberSince: r.created_at ?? user.created_at ?? '',

      peakScore: peakScore ?? null,
      rank,
      rankName,
      rankEmoji,
      coins,
      goldNuts,
      xp,
      streakDays,

      theme: r.theme_preference ?? 'system',
      voiceBriefEnabled: !!r.voice_brief_enabled,
      weeklyRitualEnabled: !!r.weekly_ritual_enabled,
      moodCheckinEnabled: !!r.mood_checkin_enabled,
      payDay: r.payday_date ?? 25,
    };
  }, [user, row, peakScore, rank, rankName, rankEmoji, coins, goldNuts, xp, streakDays]);

  return {
    profile,
    isLoading: isLoading || !user,
    updateProfile: (fields: Partial<UserProfile>) => updateProfile.mutateAsync(fields),
    isUpdating: updateProfile.isPending,
  };
}
