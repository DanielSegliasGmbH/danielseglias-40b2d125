import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ────────────────────────────────────────────
export type UserStatus =
  | 'neu'
  | 'inaktiv'
  | 'aktiv'
  | 'engagiert'
  | 'hoher_intent'
  | 'festhängend'
  | 'reaktivieren'
  | 'premium_relevant';

export interface ScoreBreakdown {
  login: number;
  sessions: number;
  tools_opened: number;
  tools_completed: number;
  chat: number;
  cta: number;
  recurrence: number;
  inactivity_penalty: number;
  total: number;
}

export interface UserScoringRow {
  id: string;
  user_id: string;
  score: number;
  status: UserStatus;
  labels: string[];
  score_breakdown: ScoreBreakdown;
  is_manual_override: boolean;
  last_computed_at: string;
}

// ── Status config ────────────────────────────────────
export const STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  neu: { label: 'Neu', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400' },
  inaktiv: { label: 'Inaktiv', color: 'bg-muted text-muted-foreground' },
  aktiv: { label: 'Aktiv', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  engagiert: { label: 'Engagiert', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' },
  hoher_intent: { label: 'Hoher Intent', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  festhängend: { label: 'Festhängend', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  reaktivieren: { label: 'Reaktivieren', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  premium_relevant: { label: 'Premium-relevant', color: 'bg-primary/10 text-primary' },
};

export const LABEL_PRESETS = [
  'viel Chat-Nutzung',
  'hat CTA geklickt',
  'hat Tool abgeschlossen',
  'lange inaktiv',
  'mehrfach zurückgekehrt',
  'hohe Aktivität',
  'nur oberflächliche Nutzung',
  'Onboarding abgeschlossen',
  'Potenzial für Beratung',
  'unsicher / nicht abgeschlossen',
] as const;

// ── Score computation (pure function) ────────────────
export function computeScore(stats: {
  loginCount: number;
  sessionCount: number;
  toolsOpened: number;
  toolsCompleted: number;
  chatMessages: number;
  ctaClicks: number;
  distinctDays: number;
  daysSinceLastActivity: number;
}): ScoreBreakdown {
  const login = Math.min(stats.loginCount > 0 ? 5 : 0, 5);
  const sessions = Math.min(stats.sessionCount * 2, 20);
  const tools_opened = Math.min(stats.toolsOpened * 3, 15);
  const tools_completed = Math.min(stats.toolsCompleted * 5, 25);
  const chat = Math.min(stats.chatMessages * 2, 10);
  const cta = Math.min(stats.ctaClicks * 5, 10);
  const recurrence = Math.min(stats.distinctDays * 2, 15);

  let inactivity_penalty = 0;
  if (stats.daysSinceLastActivity > 30) inactivity_penalty = -20;
  else if (stats.daysSinceLastActivity > 14) inactivity_penalty = -10;
  else if (stats.daysSinceLastActivity > 7) inactivity_penalty = -5;

  const raw = login + sessions + tools_opened + tools_completed + chat + cta + recurrence + inactivity_penalty;
  const total = Math.max(0, Math.min(100, raw));

  return { login, sessions, tools_opened, tools_completed, chat, cta, recurrence, inactivity_penalty, total };
}

// ── Status derivation ────────────────────────────────
export function deriveStatus(score: number, stats: {
  loginCount: number;
  sessionCount: number;
  toolsOpened: number;
  toolsCompleted: number;
  chatMessages: number;
  ctaClicks: number;
  daysSinceLastActivity: number;
  daysSinceCreation: number;
}): UserStatus {
  const { daysSinceLastActivity, daysSinceCreation, loginCount, toolsOpened, toolsCompleted, ctaClicks } = stats;

  // New user (< 3 days, no login)
  if (daysSinceCreation <= 3 && loginCount === 0) return 'neu';

  // Reactivation needed (had activity but gone > 30d)
  if (loginCount > 0 && daysSinceLastActivity > 30) return 'reaktivieren';

  // Inactive (> 14d no activity)
  if (daysSinceLastActivity > 14) return 'inaktiv';

  // Stuck (opened tools but never completed, multiple sessions)
  if (toolsOpened >= 2 && toolsCompleted === 0 && stats.sessionCount >= 3) return 'festhängend';

  // High intent
  if (score >= 60 && toolsCompleted >= 1 && (ctaClicks > 0 || stats.chatMessages > 0)) return 'hoher_intent';

  // Premium relevant
  if (score >= 70 && toolsCompleted >= 2 && ctaClicks >= 1) return 'premium_relevant';

  // Engaged
  if (score >= 35 && stats.sessionCount >= 3) return 'engagiert';

  // Active
  if (score >= 10 && loginCount > 0) return 'aktiv';

  // New fallback
  if (daysSinceCreation <= 7) return 'neu';

  return 'inaktiv';
}

// ── Auto-labels ──────────────────────────────────────
export function deriveLabels(stats: {
  loginCount: number;
  sessionCount: number;
  toolsOpened: number;
  toolsCompleted: number;
  chatMessages: number;
  ctaClicks: number;
  distinctDays: number;
  daysSinceLastActivity: number;
}): string[] {
  const labels: string[] = [];

  if (stats.chatMessages >= 3) labels.push('viel Chat-Nutzung');
  if (stats.ctaClicks > 0) labels.push('hat CTA geklickt');
  if (stats.toolsCompleted > 0) labels.push('hat Tool abgeschlossen');
  if (stats.daysSinceLastActivity > 14) labels.push('lange inaktiv');
  if (stats.distinctDays >= 5) labels.push('mehrfach zurückgekehrt');
  if (stats.sessionCount >= 10) labels.push('hohe Aktivität');
  if (stats.loginCount >= 2 && stats.toolsOpened === 0) labels.push('nur oberflächliche Nutzung');
  if (stats.toolsCompleted >= 2 && stats.ctaClicks > 0) labels.push('Potenzial für Beratung');
  if (stats.toolsOpened >= 2 && stats.toolsCompleted === 0) labels.push('unsicher / nicht abgeschlossen');

  return labels;
}

// ── Hook: fetch all scores ───────────────────────────
export function useAllUserScoring() {
  return useQuery({
    queryKey: ['user-scoring-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_scoring')
        .select('*');
      if (error) throw error;
      return (data || []) as UserScoringRow[];
    },
    staleTime: 30000,
  });
}

// ── Hook: single user score ─────────────────────────
export function useUserScoring(userId: string | undefined) {
  return useQuery({
    queryKey: ['user-scoring', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_scoring')
        .select('*')
        .eq('user_id', userId!)
        .maybeSingle();
      if (error) throw error;
      return data as UserScoringRow | null;
    },
    enabled: !!userId,
    staleTime: 30000,
  });
}

// ── Hook: recompute & upsert scores for all users ───
export function useRecomputeScores() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Fetch all relevant data in parallel
      const [profilesRes, eventsRes, sessionsRes] = await Promise.all([
        supabase.from('profiles').select('id, created_at'),
        supabase.from('tracking_events').select('user_id, event_type, created_at').limit(10000),
        supabase.from('tracking_sessions').select('user_id, started_at'),
      ]);

      const profiles = profilesRes.data || [];
      const events = eventsRes.data || [];
      const sessions = sessionsRes.data || [];

      // Existing manual overrides
      const { data: existingScoring } = await supabase.from('user_scoring').select('user_id, is_manual_override, labels');
      const overrideMap = new Map(existingScoring?.map(s => [s.user_id, s]) || []);

      const now = Date.now();
      const upserts: Array<Record<string, unknown>> = [];

      for (const profile of profiles) {
        const existing = overrideMap.get(profile.id);
        // Skip manual overrides
        if (existing?.is_manual_override) continue;

        const userEvents = events.filter(e => e.user_id === profile.id);
        const userSessions = sessions.filter(s => s.user_id === profile.id);

        const loginCount = userEvents.filter(e => e.event_type === 'login').length;
        const toolsOpened = userEvents.filter(e => e.event_type === 'tool_opened').length;
        const toolsCompleted = userEvents.filter(e => e.event_type === 'tool_completed').length;
        const chatMessages = userEvents.filter(e => e.event_type === 'chat_message_sent').length;
        const ctaClicks = userEvents.filter(e => e.event_type === 'cta_clicked').length;

        const eventDates = userEvents.map(e => e.created_at.substring(0, 10));
        const sessionDates = userSessions.map(s => s.started_at.substring(0, 10));
        const distinctDays = new Set([...eventDates, ...sessionDates]).size;

        const allDates = [...userEvents.map(e => e.created_at), ...userSessions.map(s => s.started_at)];
        const lastActivity = allDates.length > 0 ? Math.max(...allDates.map(d => new Date(d).getTime())) : 0;
        const daysSinceLastActivity = lastActivity > 0 ? Math.floor((now - lastActivity) / 86400000) : 999;
        const daysSinceCreation = Math.floor((now - new Date(profile.created_at).getTime()) / 86400000);

        const statsForScore = {
          loginCount,
          sessionCount: userSessions.length,
          toolsOpened,
          toolsCompleted,
          chatMessages,
          ctaClicks,
          distinctDays,
          daysSinceLastActivity,
        };

        const breakdown = computeScore(statsForScore);
        const status = deriveStatus(breakdown.total, { ...statsForScore, daysSinceCreation });
        const labels = deriveLabels(statsForScore);

        upserts.push({
          user_id: profile.id,
          score: breakdown.total,
          status,
          labels,
          score_breakdown: breakdown,
          is_manual_override: false,
          last_computed_at: new Date().toISOString(),
        });
      }

      // Batch upsert (Supabase handles ON CONFLICT)
      if (upserts.length > 0) {
        const { error } = await supabase
          .from('user_scoring')
          .upsert(upserts as any, { onConflict: 'user_id' });
        if (error) throw error;
      }

      return upserts.length;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-scoring-all'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard-users'] });
    },
  });
}

// ── Hook: manual override ────────────────────────────
export function useUpdateUserScoring() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      status?: UserStatus;
      labels?: string[];
      isManualOverride?: boolean;
    }) => {
      const update: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (params.status !== undefined) update.status = params.status;
      if (params.labels !== undefined) update.labels = params.labels;
      if (params.isManualOverride !== undefined) update.is_manual_override = params.isManualOverride;

      const { error } = await supabase
        .from('user_scoring')
        .upsert({
          user_id: params.userId,
          ...update,
          is_manual_override: params.isManualOverride ?? true,
        } as any, { onConflict: 'user_id' });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['user-scoring', vars.userId] });
      qc.invalidateQueries({ queryKey: ['user-scoring-all'] });
    },
  });
}
