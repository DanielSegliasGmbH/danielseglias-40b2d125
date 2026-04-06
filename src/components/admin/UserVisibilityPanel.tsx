import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAllTools, Tool } from '@/hooks/useTools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Shield, Wrench, BookOpen, Target, ClipboardList, TrendingUp,
  GraduationCap, Eye, EyeOff, Lock, Info,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Types ───────────────────────────────────────────────
interface PortalSectionDef {
  key: string;
  label: string;
  icon: typeof Wrench;
}

const PORTAL_SECTIONS: PortalSectionDef[] = [
  { key: 'show_tools', label: 'Werkzeugkiste', icon: Wrench },
  { key: 'show_library', label: 'Wissensbibliothek', icon: BookOpen },
  { key: 'show_strategies', label: 'Anlagestrategien', icon: TrendingUp },
  { key: 'show_goals', label: 'Ziele', icon: Target },
  { key: 'show_tasks', label: 'Aufgaben', icon: ClipboardList },
  { key: 'show_insurances', label: 'Versicherungen', icon: Shield },
  { key: 'show_courses', label: 'Videokurse', icon: GraduationCap },
];

type EffectiveStatus = 'visible' | 'hidden' | 'locked';

function resolveEffective(globalDefault: boolean, override: boolean | null): { effective: EffectiveStatus; source: string } {
  if (override === null) {
    return {
      effective: globalDefault ? 'visible' : 'hidden',
      source: 'Standard',
    };
  }
  return {
    effective: override ? 'visible' : 'hidden',
    source: 'Individuell',
  };
}

function StatusBadge({ status, source }: { status: EffectiveStatus; source: string }) {
  const config = {
    visible: { label: 'Sichtbar', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: Eye },
    hidden: { label: 'Verborgen', className: 'bg-muted text-muted-foreground', icon: EyeOff },
    locked: { label: 'Gesperrt', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400', icon: Lock },
  }[status];
  const Icon = config.icon;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${config.className}`}>
        <Icon className="h-3 w-3" /> {config.label}
      </span>
      <span className="text-[10px] text-muted-foreground">({source})</span>
    </div>
  );
}

// ── Component ───────────────────────────────────────────
export function UserVisibilityPanel({ userId, customerId }: { userId: string; customerId: string | null }) {
  const queryClient = useQueryClient();

  // Fetch global defaults
  const { data: defaults, isLoading: defaultsLoading } = useQuery({
    queryKey: ['default-portal-settings'],
    queryFn: async () => {
      const { data } = await supabase.from('default_portal_settings').select('*').limit(1).maybeSingle();
      return data;
    },
  });

  // Fetch customer portal settings
  const { data: customerSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['customer-portal-settings', 'raw', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const { data } = await supabase
        .from('customer_portal_settings')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();
      return data;
    },
    enabled: !!customerId,
  });

  // Fetch tools
  const { data: tools } = useAllTools();

  // Fetch customer tool access overrides
  const { data: toolAccess } = useQuery({
    queryKey: ['customer-tool-access', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data } = await supabase
        .from('customer_tool_access')
        .select('*')
        .eq('customer_id', customerId);
      return data || [];
    },
    enabled: !!customerId,
  });

  // Fetch course modules
  const { data: modules } = useQuery({
    queryKey: ['course-modules-all'],
    queryFn: async () => {
      const { data } = await supabase.from('course_modules').select('*').order('sort_order');
      return data || [];
    },
  });

  // Fetch customer module access overrides
  const { data: moduleAccess } = useQuery({
    queryKey: ['customer-module-access', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data } = await supabase
        .from('customer_module_access')
        .select('*')
        .eq('customer_id', customerId);
      return data || [];
    },
    enabled: !!customerId,
  });

  // ── Mutations ───────────────────────────────────────
  const updateSection = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean | null }) => {
      if (!customerId) throw new Error('Kein Kunde verknüpft');
      const { data: existing } = await supabase
        .from('customer_portal_settings')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (value === null) {
        // Remove override → delete row if it was the only setting, or reset field
        if (existing) {
          await supabase
            .from('customer_portal_settings')
            .update({ [key]: defaults?.[key as keyof typeof defaults] ?? true })
            .eq('customer_id', customerId);
        }
      } else {
        if (existing) {
          await supabase
            .from('customer_portal_settings')
            .update({ [key]: value })
            .eq('customer_id', customerId);
        } else {
          await supabase
            .from('customer_portal_settings')
            .insert({ customer_id: customerId, [key]: value });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-portal-settings'] });
      toast.success('Sichtbarkeit aktualisiert');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateToolAccess = useMutation({
    mutationFn: async ({ toolId, isEnabled }: { toolId: string; isEnabled: boolean | null }) => {
      if (!customerId) throw new Error('Kein Kunde verknüpft');
      if (isEnabled === null) {
        // Remove override
        await supabase
          .from('customer_tool_access')
          .delete()
          .eq('customer_id', customerId)
          .eq('tool_id', toolId);
      } else {
        const { data: existing } = await supabase
          .from('customer_tool_access')
          .select('id')
          .eq('customer_id', customerId)
          .eq('tool_id', toolId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('customer_tool_access')
            .update({ is_enabled: isEnabled })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('customer_tool_access')
            .insert({ customer_id: customerId, tool_id: toolId, is_enabled: isEnabled });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-tool-access', customerId] });
      toast.success('Tool-Zugriff aktualisiert');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateModuleAccess = useMutation({
    mutationFn: async ({ moduleId, isUnlocked }: { moduleId: string; isUnlocked: boolean | null }) => {
      if (!customerId) throw new Error('Kein Kunde verknüpft');
      if (isUnlocked === null) {
        await supabase
          .from('customer_module_access')
          .delete()
          .eq('customer_id', customerId)
          .eq('module_id', moduleId);
      } else {
        const { data: existing } = await supabase
          .from('customer_module_access')
          .select('id')
          .eq('customer_id', customerId)
          .eq('module_id', moduleId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('customer_module_access')
            .update({ is_unlocked: isUnlocked })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('customer_module_access')
            .insert({ customer_id: customerId, module_id: moduleId, is_unlocked: isUnlocked });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-module-access', customerId] });
      toast.success('Modul-Zugriff aktualisiert');
    },
    onError: (e: any) => toast.error(e.message),
  });

  const isLoading = defaultsLoading || settingsLoading;

  if (!customerId) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Freigaben & Sichtbarkeit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Dieser Nutzer ist noch keinem Kunden zugeordnet. Freigaben werden über die Kundenverknüpfung gesteuert.
              Bitte zuerst in der Benutzerverwaltung einen Kunden zuweisen.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" /> Freigaben & Sichtbarkeit
          </CardTitle>
        </CardHeader>
        <CardContent><Skeleton className="h-40 w-full rounded-lg" /></CardContent>
      </Card>
    );
  }

  // Build tool access map
  const toolAccessMap = new Map((toolAccess || []).map((a) => [a.tool_id, a.is_enabled]));
  const moduleAccessMap = new Map((moduleAccess || []).map((a) => [a.module_id, a.is_unlocked]));
  const clientTools = (tools || []).filter((t) => t.status === 'active');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" /> Freigaben & Sichtbarkeit
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ── Portal Sections ──────────────────────── */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Portal-Bereiche</h4>
          <div className="space-y-2">
            {PORTAL_SECTIONS.map((section) => {
              const globalVal = defaults?.[section.key as keyof typeof defaults] as boolean ?? true;
              const hasOverride = customerSettings && section.key in customerSettings;
              const overrideVal = hasOverride ? (customerSettings as any)[section.key] as boolean : null;
              const { effective, source } = resolveEffective(globalVal, hasOverride ? overrideVal : null);
              const Icon = section.icon;

              return (
                <div key={section.key} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{section.label}</p>
                      <StatusBadge status={effective} source={source} />
                    </div>
                  </div>
                  <Select
                    value={hasOverride ? (overrideVal ? 'visible' : 'hidden') : 'default'}
                    onValueChange={(v) => {
                      if (v === 'default') {
                        updateSection.mutate({ key: section.key, value: null });
                      } else {
                        updateSection.mutate({ key: section.key, value: v === 'visible' });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[130px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Standard {globalVal ? '(sichtbar)' : '(verborgen)'}</SelectItem>
                      <SelectItem value="visible">Sichtbar</SelectItem>
                      <SelectItem value="hidden">Verborgen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* ── Tools ────────────────────────────────── */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Tools (individuell)</h4>
          {clientTools.length === 0 ? (
            <p className="text-xs text-muted-foreground">Keine aktiven Tools vorhanden.</p>
          ) : (
            <div className="space-y-1">
              {clientTools.map((tool) => {
                const globalEnabled = tool.enabled_for_clients;
                const override = toolAccessMap.get(tool.id) ?? null;
                const { effective, source } = resolveEffective(globalEnabled, override);

                return (
                  <div key={tool.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{tool.key}</p>
                      <StatusBadge status={effective} source={source} />
                    </div>
                    <Select
                      value={override !== null ? (override ? 'visible' : 'hidden') : 'default'}
                      onValueChange={(v) => {
                        if (v === 'default') {
                          updateToolAccess.mutate({ toolId: tool.id, isEnabled: null });
                        } else {
                          updateToolAccess.mutate({ toolId: tool.id, isEnabled: v === 'visible' });
                        }
                      }}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Standard {globalEnabled ? '(sichtbar)' : '(verborgen)'}</SelectItem>
                        <SelectItem value="visible">Sichtbar</SelectItem>
                        <SelectItem value="hidden">Verborgen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Modules ──────────────────────────────── */}
        {modules && modules.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">Kursmodule (individuell)</h4>
              <div className="space-y-1">
                {modules.map((mod) => {
                  const override = moduleAccessMap.get(mod.id) ?? null;
                  const globalVal = mod.is_active;
                  const { effective, source } = resolveEffective(globalVal, override);

                  return (
                    <div key={mod.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm text-foreground">{mod.icon_emoji} {mod.title}</p>
                        <StatusBadge status={effective} source={source} />
                      </div>
                      <Select
                        value={override !== null ? (override ? 'visible' : 'hidden') : 'default'}
                        onValueChange={(v) => {
                          if (v === 'default') {
                            updateModuleAccess.mutate({ moduleId: mod.id, isUnlocked: null });
                          } else {
                            updateModuleAccess.mutate({ moduleId: mod.id, isUnlocked: v === 'visible' });
                          }
                        }}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">Standard {globalVal ? '(aktiv)' : '(inaktiv)'}</SelectItem>
                          <SelectItem value="visible">Freigeschaltet</SelectItem>
                          <SelectItem value="hidden">Gesperrt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ── Legend ────────────────────────────────── */}
        <Separator />
        <div className="text-[11px] text-muted-foreground space-y-1">
          <p className="font-medium">Prioritätslogik:</p>
          <p>1. Individuelle Überschreibung hat Vorrang vor dem Standard</p>
          <p>2. «Standard» = globale Einstellung aus den Portal-Einstellungen</p>
          <p>3. Bedingte Freigaben (z. B. nach Login, Kursfortschritt) werden in einer späteren Version unterstützt</p>
        </div>
      </CardContent>
    </Card>
  );
}
