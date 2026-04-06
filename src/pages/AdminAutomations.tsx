import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Zap, Clock, Target, ArrowRight, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  useAutomationRules,
  useToggleRule,
  CONDITION_LABELS,
  ACTION_LABELS,
} from '@/hooks/useAutomationEngine';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

function conditionSummary(rule: { condition_type: string; condition_config: Record<string, any> }): string {
  const label = CONDITION_LABELS[rule.condition_type] || rule.condition_type;
  const cfg = rule.condition_config;
  if (cfg.tool_key) return `${label}: ${cfg.tool_key}`;
  if (cfg.module_key) return `${label}: ${cfg.module_key}`;
  if (cfg.count) return `${label} (≥ ${cfg.count})`;
  if (cfg.days) return `${label} (≥ ${cfg.days} Tage)`;
  return label;
}

function actionSummary(rule: { action_type: string; action_config: Record<string, any> }): string {
  const label = ACTION_LABELS[rule.action_type] || rule.action_type;
  const cfg = rule.action_config;
  if (cfg.tool_key) return `${label}: ${cfg.tool_key}`;
  if (cfg.module_key) return `${label}: ${cfg.module_key}`;
  if (cfg.flag_key) return `${label}: ${cfg.flag_key}`;
  return label;
}

export default function AdminAutomations() {
  const { data: rules, isLoading } = useAutomationRules();
  const toggleRule = useToggleRule();

  return (
    <AppLayout>
      <div className="space-y-6">
        <ScreenHeader title="Automationen" />

        {/* Info */}
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="pt-4">
            <div className="flex gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-foreground mb-1">Prioritätslogik</p>
                <ol className="list-decimal list-inside space-y-0.5 text-xs">
                  <li>Manuelle Admin-Overrides haben <strong>immer</strong> Vorrang</li>
                  <li>Automationen wirken nur, wenn kein manueller Override existiert</li>
                  <li>Bei mehreren Regeln: niedrigere Prioritätszahl = höherer Vorrang</li>
                  <li>Jede Regel wird pro Nutzer nur einmal ausgelöst</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" /> Regeln
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
              </div>
            ) : !rules || rules.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Noch keine Automationsregeln vorhanden.
              </p>
            ) : (
              <div className="space-y-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    {/* Toggle */}
                    <div className="pt-1">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={(checked) => {
                          toggleRule.mutate({ id: rule.id, is_active: checked }, {
                            onSuccess: () => toast.success(checked ? 'Regel aktiviert' : 'Regel deaktiviert'),
                          });
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground">{rule.name}</p>
                        <Badge variant={rule.is_active ? 'default' : 'secondary'} className="text-[10px]">
                          {rule.is_active ? 'Aktiv' : 'Inaktiv'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Priorität {rule.priority}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {rule.scope}
                        </Badge>
                      </div>

                      {rule.description && (
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                      )}

                      {/* Condition → Action */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          <Target className="h-3 w-3" /> {conditionSummary(rule)}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/10 text-primary">
                          <Zap className="h-3 w-3" /> {actionSummary(rule)}
                        </span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rule.last_triggered_at
                            ? `Letzte Ausführung: ${format(new Date(rule.last_triggered_at), 'dd.MM.yy HH:mm', { locale: de })}`
                            : 'Noch nie ausgeführt'}
                        </span>
                        <span>·</span>
                        <span>{rule.trigger_count}× ausgelöst</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Unterstützte Bedingungen</p>
                <div className="space-y-1">
                  {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                    <p key={key} className="text-[11px] text-muted-foreground">• {label}</p>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground mb-2">Unterstützte Aktionen</p>
                <div className="space-y-1">
                  {Object.entries(ACTION_LABELS).map(([key, label]) => (
                    <p key={key} className="text-[11px] text-muted-foreground">• {label}</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
