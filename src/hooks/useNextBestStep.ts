import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// ── Types ────────────────────────────────────────────
export interface NextStep {
  id: string;
  type: 'tool' | 'module' | 'coach' | 'chat' | 'cta' | 'library' | 'profile';
  /** Slug or identifier */
  ref: string;
  /** Path to navigate */
  path: string;
  /** Display title */
  title: string;
  /** Why this step is recommended */
  reason: string;
  /** Priority (lower = more important) */
  priority: number;
}

export interface NextBestStepResult {
  primary: NextStep | null;
  secondary: NextStep | null;
  /** Short debug string for admin view */
  reasoning: string;
}

// ── Journey definition (ordered progression) ─────────
const TOOL_JOURNEY: { slug: string; title: string; reason: string }[] = [
  { slug: 'finanzcheck', title: 'Finanzcheck', reason: 'Verschaffe dir einen Überblick über deine Finanzen.' },
  { slug: 'vorsorgecheck-3a', title: 'Vorsorgecheck 3a', reason: 'Prüfe, wie gut deine Vorsorge aufgestellt ist.' },
  { slug: 'mini-3a-kurzcheck', title: 'Mini-3A-Kurzcheck', reason: 'Bewerte deine aktuelle 3a-Lösung.' },
  { slug: 'kosten-impact-simulator', title: 'Kosten-Impact-Simulator', reason: 'Verstehe, wie versteckte Kosten dich langfristig betreffen.' },
  { slug: 'inflationsrechner', title: 'Inflationsrechner', reason: 'Sieh, wie Inflation dein Geld beeinflusst.' },
  { slug: 'rendite-risiko-simulation', title: 'Rendite-Risiko-Simulation', reason: 'Simuliere verschiedene Anlagestrategien.' },
  { slug: 'vergleichsrechner-3a', title: '3a-Vergleichsrechner', reason: 'Vergleiche verschiedene 3a-Anbieter.' },
  { slug: 'verlustrechner-3a', title: 'Verlustrechner 3a', reason: 'Berechne, was dich Nichtstun kostet.' },
  { slug: 'tragbarkeitsrechner', title: 'Tragbarkeitsrechner', reason: 'Prüfe die Tragbarkeit deines Eigenheims.' },
  { slug: 'rolex-rechner', title: 'Rolex-Rechner', reason: 'Was kosten deine Gewohnheiten langfristig?' },
];

// ── Core engine (pure function for testability) ──────
export function computeNextBestStep(params: {
  hasOnboarded: boolean;
  hasLogin: boolean;
  hasProfile: boolean;
  completedTools: string[];
  openedTools: string[];
  hasChat: boolean;
  hasCta: boolean;
  sessionCount: number;
  status: string | null;
  score: number;
  daysSinceLastActivity: number;
  visibleSections: string[];
}): NextBestStepResult {
  const {
    hasOnboarded, hasLogin, hasProfile,
    completedTools, openedTools,
    hasChat, hasCta, sessionCount,
    status, score, daysSinceLastActivity,
    visibleSections,
  } = params;

  const steps: NextStep[] = [];
  const reasons: string[] = [];

  // ── Priority 1: Onboarding ─────────────────────────
  if (!hasOnboarded) {
    reasons.push('Onboarding nicht abgeschlossen');
    steps.push({
      id: 'onboarding',
      type: 'profile',
      ref: 'onboarding',
      path: '/app/client-portal',
      title: 'Starte dein Onboarding',
      reason: 'Lerne die Plattform kennen – dauert nur 2 Minuten.',
      priority: 1,
    });
  }

  // ── Priority 2: Profile incomplete ─────────────────
  if (!hasProfile && hasLogin) {
    reasons.push('Profil nicht ausgefüllt');
    steps.push({
      id: 'profile',
      type: 'profile',
      ref: 'profile',
      path: '/app/client-portal/profile-data',
      title: 'Vervollständige dein Profil',
      reason: 'Damit können wir deine Analysen personalisieren.',
      priority: 2,
    });
  }

  // ── Priority 3: Started but not completed tools ────
  const startedNotCompleted = openedTools.filter(t => !completedTools.includes(t));
  if (startedNotCompleted.length > 0) {
    const slug = startedNotCompleted[0];
    const journeyItem = TOOL_JOURNEY.find(j => j.slug === slug);
    reasons.push(`Tool "${slug}" gestartet, aber nicht abgeschlossen`);
    steps.push({
      id: `resume-${slug}`,
      type: 'tool',
      ref: slug,
      path: `/app/client-portal/tools/${slug}`,
      title: journeyItem?.title || slug,
      reason: 'Du hast dieses Tool begonnen – schliesse es ab.',
      priority: 3,
    });
  }

  // ── Priority 4: Next tool in journey ───────────────
  const completedSet = new Set(completedTools);
  const nextJourneyTool = TOOL_JOURNEY.find(j => !completedSet.has(j.slug));
  if (nextJourneyTool && visibleSections.includes('tools')) {
    reasons.push(`Nächstes Tool in der Journey: ${nextJourneyTool.slug}`);
    steps.push({
      id: `journey-${nextJourneyTool.slug}`,
      type: 'tool',
      ref: nextJourneyTool.slug,
      path: `/app/client-portal/tools/${nextJourneyTool.slug}`,
      title: nextJourneyTool.title,
      reason: nextJourneyTool.reason,
      priority: 10,
    });
  }

  // ── Priority 5: Coach module ───────────────────────
  if (completedTools.length === 0 && sessionCount <= 2 && visibleSections.includes('coach')) {
    reasons.push('Kein Tool abgeschlossen, Coach empfohlen');
    steps.push({
      id: 'coach-start',
      type: 'coach',
      ref: 'coach',
      path: '/app/client-portal/coach',
      title: 'Starte deinen Finanz-Coach',
      reason: 'Dein persönlicher Einstieg in finanzielle Klarheit.',
      priority: 5,
    });
  }

  // ── Priority 6: Chat for stuck users ───────────────
  if ((status === 'festhängend' || (openedTools.length >= 3 && completedTools.length === 0)) && !hasChat) {
    reasons.push('Nutzer hängt fest, Chat empfohlen');
    steps.push({
      id: 'chat-help',
      type: 'chat',
      ref: 'chat',
      path: '/app/client-portal',
      title: 'Schreib uns im Chat',
      reason: 'Wir helfen dir weiter – keine Frage ist zu klein.',
      priority: 6,
    });
  }

  // ── Priority 7: CTA for high intent ────────────────
  if ((status === 'hoher_intent' || status === 'premium_relevant' || score >= 50) && !hasCta) {
    reasons.push('Hoher Intent, CTA empfohlen');
    steps.push({
      id: 'cta-booking',
      type: 'cta',
      ref: 'booking',
      path: '/app/client-portal',
      title: 'Buche dein Erstgespräch',
      reason: 'Du bist bereit für den nächsten Schritt – lass uns sprechen.',
      priority: 7,
    });
  }

  // ── Priority 8: Library for inactive/reactivation ──
  if ((status === 'reaktivieren' || status === 'inaktiv' || daysSinceLastActivity > 7) && visibleSections.includes('library')) {
    reasons.push('Inaktiver Nutzer, leichter Wiedereinstieg');
    steps.push({
      id: 'library-browse',
      type: 'library',
      ref: 'library',
      path: '/app/client-portal/library',
      title: 'Entdecke die Wissensbibliothek',
      reason: 'Kurze Artikel für schnellen Wiedereinstieg.',
      priority: 15,
    });
  }

  // Sort by priority
  steps.sort((a, b) => a.priority - b.priority);

  // Deduplicate by type (don't show two tools next to each other if possible)
  const primary = steps[0] || null;
  const secondary = steps.find(s => s.id !== primary?.id && s.type !== primary?.type) || steps[1] || null;

  return {
    primary,
    secondary: secondary?.id !== primary?.id ? secondary : null,
    reasoning: reasons.slice(0, 3).join(' → '),
  };
}

// ── React hook ───────────────────────────────────────
export function useNextBestStep() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['next-best-step', user?.id],
    queryFn: async (): Promise<NextBestStepResult> => {
      if (!user) return { primary: null, secondary: null, reasoning: 'Kein User' };

      // Fetch data in parallel
      const [eventsRes, sessionsRes, scoringRes, settingsRes, metaRes] = await Promise.all([
        supabase.from('tracking_events').select('event_type, tool_key').eq('user_id', user.id),
        supabase.from('tracking_sessions').select('id, started_at').eq('user_id', user.id),
        supabase.from('user_scoring').select('score, status, labels').eq('user_id', user.id).maybeSingle(),
        supabase.from('customer_users').select('customer_id').eq('user_id', user.id).maybeSingle(),
        supabase.from('meta_profiles').select('id').eq('user_id', user.id).maybeSingle(),
      ]);

      const events = eventsRes.data || [];
      const sessions = sessionsRes.data || [];

      const completedTools = [...new Set(events.filter(e => e.event_type === 'tool_completed' && e.tool_key).map(e => e.tool_key!))];
      const openedTools = [...new Set(events.filter(e => e.event_type === 'tool_opened' && e.tool_key).map(e => e.tool_key!))];
      const hasChat = events.some(e => e.event_type === 'chat_message_sent');
      const hasCta = events.some(e => e.event_type === 'cta_clicked');
      const hasLogin = events.some(e => e.event_type === 'login');
      const hasOnboarded = !!localStorage.getItem('client_onboarding_complete');

      // Compute days since last activity
      const allDates = sessions.map(s => new Date(s.started_at).getTime());
      const lastActivity = allDates.length > 0 ? Math.max(...allDates) : 0;
      const daysSinceLastActivity = lastActivity > 0 ? Math.floor((Date.now() - lastActivity) / 86400000) : 999;

      // Get visible sections (simplified – assume all visible if no customer link)
      const visibleSections = ['coach', 'tools', 'library', 'strategies', 'goals', 'tasks', 'courses', 'insurances'];

      return computeNextBestStep({
        hasOnboarded,
        hasLogin,
        hasProfile: !!metaRes.data,
        completedTools,
        openedTools,
        hasChat,
        hasCta,
        sessionCount: sessions.length,
        status: (scoringRes.data as any)?.status || null,
        score: (scoringRes.data as any)?.score || 0,
        daysSinceLastActivity,
        visibleSections,
      });
    },
    enabled: !!user,
    staleTime: 60000,
  });
}

// ── Admin hook: compute for a specific user ──────────
export function useNextBestStepForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['next-best-step-admin', userId],
    queryFn: async (): Promise<NextBestStepResult> => {
      if (!userId) return { primary: null, secondary: null, reasoning: 'Kein User' };

      const [eventsRes, sessionsRes, scoringRes, metaRes] = await Promise.all([
        supabase.from('tracking_events').select('event_type, tool_key').eq('user_id', userId),
        supabase.from('tracking_sessions').select('id, started_at').eq('user_id', userId),
        supabase.from('user_scoring').select('score, status, labels').eq('user_id', userId).maybeSingle(),
        supabase.from('meta_profiles').select('id').eq('user_id', userId).maybeSingle(),
      ]);

      const events = eventsRes.data || [];
      const sessions = sessionsRes.data || [];

      const completedTools = [...new Set(events.filter(e => e.event_type === 'tool_completed' && e.tool_key).map(e => e.tool_key!))];
      const openedTools = [...new Set(events.filter(e => e.event_type === 'tool_opened' && e.tool_key).map(e => e.tool_key!))];
      const hasChat = events.some(e => e.event_type === 'chat_message_sent');
      const hasCta = events.some(e => e.event_type === 'cta_clicked');
      const hasLogin = events.some(e => e.event_type === 'login');

      const allDates = sessions.map(s => new Date(s.started_at).getTime());
      const lastActivity = allDates.length > 0 ? Math.max(...allDates) : 0;
      const daysSinceLastActivity = lastActivity > 0 ? Math.floor((Date.now() - lastActivity) / 86400000) : 999;

      const visibleSections = ['coach', 'tools', 'library', 'strategies', 'goals', 'tasks', 'courses', 'insurances'];

      return computeNextBestStep({
        hasOnboarded: true, // assume yes for admin view
        hasLogin,
        hasProfile: !!metaRes.data,
        completedTools,
        openedTools,
        hasChat,
        hasCta,
        sessionCount: sessions.length,
        status: (scoringRes.data as any)?.status || null,
        score: (scoringRes.data as any)?.score || 0,
        daysSinceLastActivity,
        visibleSections,
      });
    },
    enabled: !!userId,
    staleTime: 60000,
  });
}
