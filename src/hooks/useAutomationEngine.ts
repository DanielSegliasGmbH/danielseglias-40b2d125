import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ────────────────────────────────────────────
export interface AutomationRule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  condition_type: string;
  condition_config: Record<string, any>;
  action_type: string;
  action_config: Record<string, any>;
  priority: number;
  scope: string;
  created_by: string | null;
  last_triggered_at: string | null;
  trigger_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AutomationRuleLog {
  id: string;
  rule_id: string;
  user_id: string;
  customer_id: string | null;
  condition_snapshot: Record<string, any>;
  action_executed: string;
  result: Record<string, any>;
  created_at: string;
  automation_rules?: { name: string } | null;
}

// ── Condition Labels ──────────────────────────────────
export const CONDITION_LABELS: Record<string, string> = {
  first_login: 'Erster Login',
  event_count_reached: 'Event-Anzahl erreicht',
  tool_opened: 'Tool geöffnet',
  tool_completed: 'Tool abgeschlossen',
  sessions_reached: 'Sessions erreicht',
  days_inactive: 'Tage inaktiv',
  module_opened: 'Modul geöffnet',
  module_completed: 'Modul abgeschlossen',
  chat_opened: 'Chat geöffnet',
  cta_clicked: 'CTA geklickt',
  manual_admin: 'Admin-Freigabe',
};

export const ACTION_LABELS: Record<string, string> = {
  unlock_tool: 'Tool freischalten',
  lock_tool: 'Tool sperren',
  unlock_module: 'Modul freischalten',
  lock_module: 'Modul sperren',
  set_flag: 'Flag setzen',
  set_portal_section: 'Portal-Bereich setzen',
};

// ── Hooks ─────────────────────────────────────────────
export function useAutomationRules() {
  return useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: true });
      if (error) throw error;
      return (data || []) as AutomationRule[];
    },
  });
}

export function useToggleRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('automation_rules')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['automation-rules'] }),
  });
}

export function useUserRuleLogs(userId: string | undefined) {
  return useQuery({
    queryKey: ['automation-rule-logs', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('automation_rule_logs')
        .select('*, automation_rules(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data || []) as AutomationRuleLog[];
    },
    enabled: !!userId,
  });
}

// ── Engine: evaluate rules for a user ─────────────────
export function useEvaluateRules() {
  const qc = useQueryClient();

  const evaluate = useCallback(async (userId: string, customerId: string | null) => {
    // 1. Fetch active rules
    const { data: rules } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });
    if (!rules || rules.length === 0) return;

    // 2. Fetch user events for condition checks
    const { data: events } = await supabase
      .from('tracking_events')
      .select('event_type, tool_key, module_key, metadata, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500);

    const { data: sessions } = await supabase
      .from('tracking_sessions')
      .select('id')
      .eq('user_id', userId);

    // 3. Fetch existing overrides (manual admin overrides take precedence)
    const existingToolAccess = customerId
      ? (await supabase.from('customer_tool_access').select('*').eq('customer_id', customerId)).data || []
      : [];
    const existingModuleAccess = customerId
      ? (await supabase.from('customer_module_access').select('*').eq('customer_id', customerId)).data || []
      : [];

    // 4. Check already-triggered rules for this user (avoid re-triggering)
    const { data: existingLogs } = await supabase
      .from('automation_rule_logs')
      .select('rule_id')
      .eq('user_id', userId);
    const triggeredRuleIds = new Set((existingLogs || []).map((l: any) => l.rule_id));

    const eventList = events || [];
    const sessionCount = sessions?.length || 0;

    for (const rule of rules as AutomationRule[]) {
      // Skip if already triggered for this user
      if (triggeredRuleIds.has(rule.id)) continue;

      // 5. Check condition
      const conditionMet = checkCondition(rule, eventList, sessionCount);
      if (!conditionMet) continue;

      // 6. Check if manual override exists (admin override takes precedence)
      if (hasManualOverride(rule, existingToolAccess, existingModuleAccess)) continue;

      // 7. Execute action
      await executeAction(rule, userId, customerId);

      // 8. Log the execution
      await supabase.from('automation_rule_logs').insert({
        rule_id: rule.id,
        user_id: userId,
        customer_id: customerId,
        condition_snapshot: { condition_type: rule.condition_type, ...rule.condition_config },
        action_executed: rule.action_type,
        result: { action_config: rule.action_config, status: 'executed' },
      });

      // 9. Update rule stats
      await supabase
        .from('automation_rules')
        .update({
          last_triggered_at: new Date().toISOString(),
          trigger_count: (rule.trigger_count || 0) + 1,
        })
        .eq('id', rule.id);
    }

    qc.invalidateQueries({ queryKey: ['automation-rule-logs'] });
  }, [qc]);

  return { evaluate };
}

// ── Condition checker ─────────────────────────────────
function checkCondition(
  rule: AutomationRule,
  events: any[],
  sessionCount: number
): boolean {
  const cfg = rule.condition_config;

  switch (rule.condition_type) {
    case 'first_login': {
      const logins = events.filter((e) => e.event_type === 'login');
      return logins.length >= 1;
    }
    case 'tool_opened': {
      return events.some(
        (e) => e.event_type === 'tool_opened' && e.tool_key === cfg.tool_key
      );
    }
    case 'tool_completed': {
      return events.some(
        (e) => e.event_type === 'tool_completed' && e.tool_key === cfg.tool_key
      );
    }
    case 'module_opened': {
      return events.some(
        (e) => e.event_type === 'module_opened' && e.module_key === cfg.module_key
      );
    }
    case 'module_completed': {
      return events.some(
        (e) => e.event_type === 'module_completed' && e.module_key === cfg.module_key
      );
    }
    case 'sessions_reached': {
      return sessionCount >= (cfg.count || 5);
    }
    case 'event_count_reached': {
      const matching = events.filter((e) => e.event_type === cfg.event_type);
      return matching.length >= (cfg.count || 1);
    }
    case 'days_inactive': {
      if (events.length === 0) return false;
      const lastEvent = new Date(events[0].created_at);
      const daysSince = (Date.now() - lastEvent.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= (cfg.days || 7);
    }
    case 'chat_opened': {
      return events.some((e) => e.event_type === 'chat_opened');
    }
    case 'cta_clicked': {
      return events.some(
        (e) => e.event_type === 'cta_clicked' && (!cfg.cta_key || e.metadata?.cta_key === cfg.cta_key)
      );
    }
    default:
      return false;
  }
}

// ── Check if admin has manually set an override ───────
function hasManualOverride(
  rule: AutomationRule,
  toolAccess: any[],
  moduleAccess: any[]
): boolean {
  const cfg = rule.action_config;
  if (rule.action_type === 'unlock_tool' || rule.action_type === 'lock_tool') {
    return toolAccess.some((a) => a.tool_id === cfg.tool_id);
  }
  if (rule.action_type === 'unlock_module' || rule.action_type === 'lock_module') {
    return moduleAccess.some((a) => a.module_id === cfg.module_id);
  }
  return false;
}

// ── Execute action ────────────────────────────────────
async function executeAction(rule: AutomationRule, userId: string, customerId: string | null) {
  const cfg = rule.action_config;

  switch (rule.action_type) {
    case 'unlock_tool': {
      if (!customerId || !cfg.tool_id) return;
      await supabase.from('customer_tool_access').upsert(
        { customer_id: customerId, tool_id: cfg.tool_id, is_enabled: true },
        { onConflict: 'customer_id,tool_id' }
      );
      break;
    }
    case 'lock_tool': {
      if (!customerId || !cfg.tool_id) return;
      await supabase.from('customer_tool_access').upsert(
        { customer_id: customerId, tool_id: cfg.tool_id, is_enabled: false },
        { onConflict: 'customer_id,tool_id' }
      );
      break;
    }
    case 'unlock_module': {
      if (!customerId || !cfg.module_id) return;
      await supabase.from('customer_module_access').upsert(
        { customer_id: customerId, module_id: cfg.module_id, is_unlocked: true },
        { onConflict: 'customer_id,module_id' }
      );
      break;
    }
    case 'lock_module': {
      if (!customerId || !cfg.module_id) return;
      await supabase.from('customer_module_access').upsert(
        { customer_id: customerId, module_id: cfg.module_id, is_unlocked: false },
        { onConflict: 'customer_id,module_id' }
      );
      break;
    }
    case 'set_flag': {
      // Flag is stored as a log entry — no additional table needed
      break;
    }
    default:
      break;
  }
}
