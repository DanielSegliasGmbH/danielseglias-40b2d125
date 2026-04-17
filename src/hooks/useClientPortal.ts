import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface PortalVisibility {
  show_insurances: boolean;
  show_goals: boolean;
  show_tasks: boolean;
  show_strategies: boolean;
  show_library: boolean;
  show_tools: boolean;
  show_courses: boolean;
  show_strategy_privacy: boolean;
  strategy_access_password: string | null;
  has_strategy_password: boolean;
}

interface CustomerPortalSettings {
  id: string;
  customer_id: string;
  show_insurances: boolean;
  show_goals: boolean;
  show_tasks: boolean;
  show_strategies: boolean;
  show_library: boolean;
  show_tools: boolean;
  show_courses: boolean;
  show_strategy_privacy: boolean;
  strategy_access_password: string | null;
  created_at: string;
  updated_at: string;
}

interface DefaultPortalSettings {
  id: string;
  show_insurances: boolean;
  show_goals: boolean;
  show_tasks: boolean;
  show_strategies: boolean;
  show_library: boolean;
  show_tools: boolean;
  show_courses: boolean;
  created_at: string;
  updated_at: string;
}

const VISIBILITY_KEYS = [
  'show_insurances', 'show_goals', 'show_tasks', 'show_strategies',
  'show_library', 'show_tools', 'show_courses',
] as const;

// Fetch global default settings
export function useDefaultPortalSettings() {
  return useQuery({
    queryKey: ['default-portal-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('default_portal_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as DefaultPortalSettings | null;
    },
  });
}

// Update global default settings
export function useUpdateDefaultPortalSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: Partial<Omit<DefaultPortalSettings, 'id' | 'created_at' | 'updated_at'>>) => {
      // Get existing row
      const { data: existing } = await supabase
        .from('default_portal_settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('default_portal_settings')
          .update(settings)
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('default_portal_settings')
          .insert(settings);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['default-portal-settings'] });
      queryClient.invalidateQueries({ queryKey: ['customer-portal-settings'] });
    },
  });
}

/**
 * Merge default + customer-specific settings.
 * Customer settings override defaults when present.
 * If no customer settings exist, defaults are used.
 */
function mergeSettings(
  defaults: DefaultPortalSettings | null,
  customer: Partial<CustomerPortalSettings> | null
): PortalVisibility {
  const base: PortalVisibility = {
    show_insurances: defaults?.show_insurances ?? false,
    show_goals: defaults?.show_goals ?? true,
    show_tasks: defaults?.show_tasks ?? true,
    show_strategies: defaults?.show_strategies ?? true,
    show_library: defaults?.show_library ?? true,
    show_tools: defaults?.show_tools ?? true,
    show_courses: defaults?.show_courses ?? false,
    show_strategy_privacy: false,
    strategy_access_password: null,
    has_strategy_password: false,
  };

  if (!customer) return base;

  // Customer settings override defaults
  for (const key of VISIBILITY_KEYS) {
    if (key in customer) {
      (base as any)[key] = (customer as any)[key];
    }
  }
  base.show_strategy_privacy = customer.show_strategy_privacy ?? false;
  base.strategy_access_password = customer.strategy_access_password ?? null;
  base.has_strategy_password = (customer as any).has_strategy_password ?? !!customer.strategy_access_password;

  return base;
}

// For clients: get merged settings (default + own overrides)
// For admins with previewCustomerId: get merged settings for that customer
export function useCustomerPortalSettings() {
  const { user, role } = useAuth();
  const [searchParams] = useSearchParams();
  const previewCustomerId = searchParams.get('previewCustomerId');

  return useQuery({
    queryKey: ['customer-portal-settings', 'merged', previewCustomerId, role],
    queryFn: async (): Promise<PortalVisibility | null> => {
      // Fetch defaults
      const { data: defaults } = await supabase
        .from('default_portal_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      // Admin preview mode
      if (role === 'admin' && previewCustomerId) {
        const { data: customerSettings } = await supabase
          .from('customer_portal_settings')
          .select('*')
          .eq('customer_id', previewCustomerId)
          .maybeSingle();
        return mergeSettings(defaults, customerSettings);
      }

      // Admin without preview - show all
      if (role === 'admin') return null;

      // Client role - get own settings
      const { data: customerUser } = await supabase
        .from('customer_users')
        .select('customer_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!customerUser) {
        return mergeSettings(defaults, null);
      }

      const { data: customerSettings } = await supabase
        .from('customer_portal_settings')
        .select('id, customer_id, show_courses, show_goals, show_insurances, show_library, show_strategies, show_strategy_privacy, show_tasks, show_tools, created_at, updated_at')
        .eq('customer_id', customerUser.customer_id)
        .maybeSingle();

      return mergeSettings(defaults, customerSettings);
    },
    enabled: !!user && (role === 'client' || role === 'admin'),
  });
}

// Helper to get preview customer id from URL
export function usePreviewCustomerId() {
  const [searchParams] = useSearchParams();
  return searchParams.get('previewCustomerId');
}

// For admins: get raw settings for a specific customer (non-merged, for the settings form)
export function useCustomerPortalSettingsForCustomer(customerId: string) {
  return useQuery({
    queryKey: ['customer-portal-settings', 'raw', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_portal_settings')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
      if (error) throw error;
      return data as CustomerPortalSettings | null;
    },
    enabled: !!customerId,
  });
}

// For admins: update settings for a customer
export function useUpdateCustomerPortalSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      settings,
    }: {
      customerId: string;
      settings: Partial<Omit<CustomerPortalSettings, 'id' | 'customer_id' | 'created_at' | 'updated_at'>>;
    }) => {
      const { data: existing } = await supabase
        .from('customer_portal_settings')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('customer_portal_settings')
          .update(settings)
          .eq('customer_id', customerId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customer_portal_settings')
          .insert({ customer_id: customerId, ...settings });
        if (error) throw error;
      }
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-portal-settings'] });
    },
  });
}

// Per-customer tool access
export function useCustomerToolAccess(customerId: string) {
  return useQuery({
    queryKey: ['customer-tool-access', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_tool_access')
        .select('*')
        .eq('customer_id', customerId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });
}

export function useUpdateCustomerToolAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      customerId,
      toolId,
      isEnabled,
    }: {
      customerId: string;
      toolId: string;
      isEnabled: boolean;
    }) => {
      const { data: existing } = await supabase
        .from('customer_tool_access')
        .select('id')
        .eq('customer_id', customerId)
        .eq('tool_id', toolId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('customer_tool_access')
          .update({ is_enabled: isEnabled })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customer_tool_access')
          .insert({ customer_id: customerId, tool_id: toolId, is_enabled: isEnabled });
        if (error) throw error;
      }
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-tool-access', customerId] });
    },
  });
}

// For client portal: get tools filtered by visibility, journey phase, and per-customer overrides.
// Hidden / admin_only tools are never returned. Phase-locked tools are returned only when the
// user has reached the required journey phase.
export function useClientToolsFiltered() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client-tools-filtered', user?.id],
    queryFn: async () => {
      // 1. Determine the user's current journey phase (mirrors useFeatureUnlock logic).
      const [
        { data: journey },
        { data: profile },
        { data: peakRow },
        { count: tasksCompleted },
        { count: coachModules },
      ] = await Promise.all([
        supabase.from('user_journey').select('created_at').eq('user_id', user!.id).maybeSingle(),
        supabase.from('profiles').select('plan').eq('id', user!.id).maybeSingle(),
        supabase.from('financial_snapshots').select('peak_score').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('client_tasks').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('is_completed', true),
        supabase.from('coach_progress').select('id', { count: 'exact', head: true }).eq('user_id', user!.id).eq('status', 'completed'),
      ]);

      const isPremium = profile?.plan === 'premium';
      const anchorIso = journey?.created_at || user?.created_at;
      const days = anchorIso
        ? Math.max(0, Math.floor((Date.now() - new Date(anchorIso).getTime()) / 86400000))
        : 0;
      const peakScore = peakRow?.peak_score ?? null;
      const tDone = tasksCompleted ?? 0;
      const cDone = coachModules ?? 0;

      const { JOURNEY_PHASES } = await import('@/config/journeyPhases');
      let currentPhase = 0;
      if (isPremium) {
        currentPhase = 6;
      } else {
        for (const p of JOURNEY_PHASES) {
          const g = p.gate;
          const empty = !g.daysSinceSignup && !g.minPeakScore && !g.minTasksCompleted && !g.minCoachModulesCompleted;
          const met =
            empty ||
            (g.daysSinceSignup && days >= g.daysSinceSignup) ||
            (g.minPeakScore && peakScore !== null && peakScore >= g.minPeakScore) ||
            (g.minTasksCompleted && tDone >= g.minTasksCompleted) ||
            (g.minCoachModulesCompleted && cDone >= g.minCoachModulesCompleted);
          if (met) currentPhase = p.phase;
          else break;
        }
      }

      // 2. Per-customer overrides (admin can force-enable a hidden/locked tool).
      const { data: cu } = await supabase
        .from('customer_users')
        .select('customer_id')
        .eq('user_id', user!.id)
        .maybeSingle();

      let overrides = new Map<string, boolean>();
      if (cu) {
        const { data: access } = await supabase
          .from('customer_tool_access')
          .select('tool_id, is_enabled')
          .eq('customer_id', cu.customer_id);
        if (access) overrides = new Map(access.map(a => [a.tool_id, a.is_enabled]));
      }

      // 3. Fetch active tools and apply visibility rules.
      const { data: tools, error } = await supabase
        .from('tools')
        .select('*')
        .eq('enabled_for_clients', true)
        .eq('status', 'active')
        .order('sort_order', { ascending: true });
      if (error) throw error;

      return (tools || []).filter(tool => {
        const explicit = overrides.get(tool.id);
        if (explicit === true) return true;
        if (explicit === false) return false;

        switch ((tool as any).visibility) {
          case 'public':
            return true;
          case 'phase_locked':
            return ((tool as any).unlock_phase ?? 99) <= currentPhase;
          case 'hidden':
          case 'admin_only':
          default:
            return false;
        }
      });
    },
    enabled: !!user,
  });
}
