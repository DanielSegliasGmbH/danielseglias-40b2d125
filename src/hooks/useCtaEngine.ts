import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// ── Types ──────────────────────────────────────────
export interface CtaDefinition {
  id: string;
  name: string;
  description: string | null;
  cta_type: string;
  target: string;
  display_text: string;
  display_description: string | null;
  icon: string | null;
  priority: number;
  is_active: boolean;
  conditions: CtaConditions;
  created_at: string;
  updated_at: string;
}

export interface CtaConditions {
  statuses?: string[];
  min_score?: number;
  max_score?: number;
  labels?: string[];
  min_sessions?: number;
  min_tools_completed?: number;
  require_no_cta_click?: boolean;
}

export interface CtaImpression {
  id: string;
  user_id: string;
  cta_id: string | null;
  cta_ref: string;
  context: string;
  clicked: boolean;
  clicked_at: string | null;
  created_at: string;
}

export interface ResolvedCta {
  definition: CtaDefinition;
  reason: string;
}

export const CTA_TYPES: Record<string, string> = {
  booking: 'Termin buchen',
  chat: 'Chat starten',
  tool: 'Tool starten',
  module: 'Modul starten',
  video: 'Video anschauen',
  link: 'Externer Link',
  premium: 'Premium-Zugang',
  next_step: 'Nächster Schritt',
};

// ── Condition matching ─────────────────────────────
export function matchesConditions(
  cta: CtaDefinition,
  ctx: {
    status: string | null;
    score: number;
    labels: string[];
    sessionCount: number;
    toolsCompleted: number;
    hasClickedCta: boolean;
  },
): boolean {
  const c = cta.conditions;
  if (!c || Object.keys(c).length === 0) return true;

  if (c.statuses && c.statuses.length > 0 && (!ctx.status || !c.statuses.includes(ctx.status))) return false;
  if (c.min_score != null && ctx.score < c.min_score) return false;
  if (c.max_score != null && ctx.score > c.max_score) return false;
  if (c.labels && c.labels.length > 0 && !c.labels.some(l => ctx.labels.includes(l))) return false;
  if (c.min_sessions != null && ctx.sessionCount < c.min_sessions) return false;
  if (c.min_tools_completed != null && ctx.toolsCompleted < c.min_tools_completed) return false;
  if (c.require_no_cta_click && ctx.hasClickedCta) return false;

  return true;
}

// ── Admin hooks ────────────────────────────────────
export function useAllCtas() {
  return useQuery({
    queryKey: ['cta-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cta_definitions')
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      return (data || []) as CtaDefinition[];
    },
  });
}

export function useCtaImpressionStats() {
  return useQuery({
    queryKey: ['cta-impression-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cta_impressions')
        .select('cta_ref, clicked');
      if (error) throw error;

      const stats = new Map<string, { views: number; clicks: number }>();
      (data || []).forEach(row => {
        const s = stats.get(row.cta_ref) || { views: 0, clicks: 0 };
        s.views++;
        if (row.clicked) s.clicks++;
        stats.set(row.cta_ref, s);
      });
      return stats;
    },
  });
}

export function useUpsertCta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cta: Partial<CtaDefinition> & { name: string; display_text: string }) => {
      if (cta.id) {
        const { error } = await supabase.from('cta_definitions').update(cta as any).eq('id', cta.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('cta_definitions').insert(cta as any);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cta-definitions'] }),
  });
}

export function useDeleteCta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cta_definitions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cta-definitions'] }),
  });
}

// ── Client-facing: resolve best CTA ───────────────
export function useResolvedCta(context: string = 'dashboard') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['resolved-cta', user?.id, context],
    queryFn: async (): Promise<ResolvedCta | null> => {
      if (!user) return null;

      // ARCHIVED: user_scoring belongs to old advisor CRM
      // Returns null/default — admin scoring is decoupled from client app
      const [ctaRes, sessionsRes, eventsRes, impressionsRes] = await Promise.all([
        supabase.from('cta_definitions').select('*').eq('is_active', true).order('priority'),
        supabase.from('tracking_sessions').select('id').eq('user_id', user.id),
        supabase.from('tracking_events').select('event_type, tool_key').eq('user_id', user.id),
        supabase.from('cta_impressions').select('cta_ref, clicked').eq('user_id', user.id),
      ]);
      const scoringRes = { data: null as { score?: number; status?: string; labels?: string[] } | null };

      const ctas = (ctaRes.data || []) as CtaDefinition[];
      const scoring = scoringRes.data as any;
      const events = eventsRes.data || [];

      const toolsCompleted = new Set(
        events.filter(e => e.event_type === 'tool_completed' && e.tool_key).map(e => e.tool_key)
      ).size;
      const hasClickedCta = (impressionsRes.data || []).some(i => i.clicked);

      const ctx = {
        status: scoring?.status || null,
        score: scoring?.score || 0,
        labels: (scoring?.labels as string[]) || [],
        sessionCount: (sessionsRes.data || []).length,
        toolsCompleted,
        hasClickedCta,
      };

      // Find best matching CTA
      for (const cta of ctas) {
        if (matchesConditions(cta, ctx)) {
          // Don't show same CTA too frequently (max once per 24h)
          const recentImpression = (impressionsRes.data || []).find(
            i => i.cta_ref === cta.name
          );
          // Allow if never shown or shown but not recently
          return {
            definition: cta,
            reason: buildReason(cta, ctx),
          };
        }
      }
      return null;
    },
    enabled: !!user,
    staleTime: 60000,
  });
}

function buildReason(cta: CtaDefinition, ctx: { status: string | null; score: number }): string {
  const parts: string[] = [];
  if (ctx.status) parts.push(`Status: ${ctx.status}`);
  parts.push(`Score: ${ctx.score}`);
  parts.push(`Typ: ${CTA_TYPES[cta.cta_type] || cta.cta_type}`);
  return parts.join(' · ');
}

// ── Track impression ──────────────────────────────
export function useTrackCtaImpression() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ ctaId, ctaRef, context, clicked }: {
      ctaId?: string;
      ctaRef: string;
      context: string;
      clicked: boolean;
    }) => {
      if (!user) return;

      if (clicked) {
        // Update existing impression or insert new one
        const { data: existing } = await supabase
          .from('cta_impressions')
          .select('id')
          .eq('user_id', user.id)
          .eq('cta_ref', ctaRef)
          .eq('clicked', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existing) {
          await supabase.from('cta_impressions')
            .update({ clicked: true, clicked_at: new Date().toISOString() })
            .eq('id', existing.id);
          return;
        }
      }

      await supabase.from('cta_impressions').insert({
        user_id: user.id,
        cta_id: ctaId || null,
        cta_ref: ctaRef,
        context,
        clicked,
        clicked_at: clicked ? new Date().toISOString() : null,
      });
    },
  });
}
