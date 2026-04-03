import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCustomerPortalSettingsForCustomer,
  useUpdateCustomerPortalSettings,
  useDefaultPortalSettings,
  useCustomerToolAccess,
  useUpdateCustomerToolAccess,
} from '@/hooks/useClientPortal';
import { useAllTools } from '@/hooks/useTools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import {
  Shield,
  Target,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Wrench,
  Settings,
  EyeOff,
  Lock,
  GraduationCap,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CustomerPortalSettingsCardProps {
  customerId: string;
}

const sections = [
  { key: 'show_tools', icon: Wrench, label: 'Werkzeugkiste', color: 'text-slate-500' },
  { key: 'show_library', icon: BookOpen, label: 'Wissensbibliothek', color: 'text-amber-500' },
  { key: 'show_strategies', icon: TrendingUp, label: 'Anlagestrategien', color: 'text-purple-500' },
  { key: 'show_goals', icon: Target, label: 'Ziele', color: 'text-green-500' },
  { key: 'show_tasks', icon: ClipboardList, label: 'Aufgaben', color: 'text-orange-500' },
  { key: 'show_insurances', icon: Shield, label: 'Versicherungen', color: 'text-blue-500' },
  { key: 'show_courses', icon: GraduationCap, label: 'Videokurse', color: 'text-pink-500' },
] as const;

export function CustomerPortalSettingsCard({ customerId }: CustomerPortalSettingsCardProps) {
  const { t } = useTranslation();
  const { data: customerSettings, isLoading: loadingCustomer } = useCustomerPortalSettingsForCustomer(customerId);
  const { data: defaults, isLoading: loadingDefaults } = useDefaultPortalSettings();
  const { data: toolAccess, isLoading: loadingToolAccess } = useCustomerToolAccess(customerId);
  const { data: allTools } = useAllTools();
  const updateSettings = useUpdateCustomerPortalSettings();
  const updateToolAccess = useUpdateCustomerToolAccess();
  const [strategyPassword, setStrategyPassword] = useState('');

  useEffect(() => {
    if (customerSettings) {
      setStrategyPassword(customerSettings?.strategy_access_password || '');
    }
  }, [customerSettings]);

  const getDefaultValue = (key: string): boolean => {
    if (!defaults) return true;
    return (defaults as any)[key] ?? true;
  };

  const getEffectiveValue = (key: string): boolean => {
    if (customerSettings && key in customerSettings) {
      const val = (customerSettings as any)[key];
      if (typeof val === 'boolean') return val;
    }
    return getDefaultValue(key);
  };

  const isOverridden = (key: string): boolean => {
    if (!customerSettings) return false;
    const val = (customerSettings as any)[key];
    if (typeof val !== 'boolean') return false;
    return val !== getDefaultValue(key);
  };

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({ customerId, settings: { [key]: value } });
      toast.success('Freigabe aktualisiert');
    } catch {
      toast.error(t('app.error'));
    }
  };

  const handleResetToDefault = async (key: string) => {
    // Reset by setting value back to default
    const defaultVal = getDefaultValue(key);
    try {
      await updateSettings.mutateAsync({ customerId, settings: { [key]: defaultVal } });
      toast.success('Auf Standard zurückgesetzt');
    } catch {
      toast.error(t('app.error'));
    }
  };

  const handleToolToggle = async (toolId: string, isEnabled: boolean) => {
    try {
      await updateToolAccess.mutateAsync({ customerId, toolId, isEnabled });
      toast.success('Tool-Zugriff aktualisiert');
    } catch {
      toast.error(t('app.error'));
    }
  };

  const getToolOverride = (toolId: string): boolean | undefined => {
    if (!toolAccess) return undefined;
    const access = toolAccess.find(a => a.tool_id === toolId);
    return access?.is_enabled;
  };

  if (loadingCustomer || loadingDefaults) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent><Skeleton className="h-32 w-full" /></CardContent>
      </Card>
    );
  }

  const privacyActive = customerSettings?.show_strategy_privacy ?? false;
  const activeTools = allTools?.filter(t => t.status === 'active') || [];

  return (
    <div className="space-y-4">
      {/* Main sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Portalfreigaben
          </CardTitle>
          <CardDescription>Individuelle Sichtbarkeit für diesen Kunden. Abweichungen vom Standard sind markiert.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sections.map(section => {
              const effective = getEffectiveValue(section.key);
              const overridden = isOverridden(section.key);
              const defaultVal = getDefaultValue(section.key);

              return (
                <div key={section.key} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <section.icon className={`h-4 w-4 shrink-0 ${section.color}`} />
                    <div className="min-w-0">
                      <Label htmlFor={`cust-${section.key}`} className="cursor-pointer text-sm font-medium">
                        {section.label}
                      </Label>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {overridden ? (
                          <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600">
                            {effective ? 'individuell freigegeben' : 'individuell gesperrt'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            Standard {defaultVal ? '(sichtbar)' : '(verborgen)'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {overridden && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleResetToDefault(section.key)}
                        title="Auf Standard zurücksetzen"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                    )}
                    <Switch
                      id={`cust-${section.key}`}
                      checked={effective}
                      onCheckedChange={(val) => handleToggle(section.key, val)}
                      disabled={updateSettings.isPending}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Per-tool access */}
      <Accordion type="single" collapsible>
        <AccordionItem value="tools" className="border rounded-xl px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wrench className="h-4 w-4 text-slate-500" />
              Einzelne Tools steuern
              {toolAccess && toolAccess.length > 0 && (
                <Badge variant="outline" className="text-[10px] border-amber-400 text-amber-600 ml-1">
                  {toolAccess.filter(a => !a.is_enabled).length} gesperrt
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground mb-3">
              Hier kannst du einzelne Tools für diesen Kunden deaktivieren. Standardmässig sind alle aktiven Tools sichtbar.
            </p>
            {loadingToolAccess ? (
              <Skeleton className="h-20 w-full" />
            ) : activeTools.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine aktiven Tools vorhanden.</p>
            ) : (
              <div className="space-y-2">
                {activeTools.map(tool => {
                  const override = getToolOverride(tool.id);
                  const isEnabled = override !== false; // default: enabled
                  const hasOverride = override !== undefined;

                  return (
                    <div key={tool.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm truncate">{t(tool.name_key)}</span>
                        {hasOverride && !isEnabled && (
                          <Badge variant="outline" className="text-[10px] border-red-300 text-red-500">gesperrt</Badge>
                        )}
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(val) => handleToolToggle(tool.id, val)}
                        disabled={updateToolAccess.isPending}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Privacy & Password */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Privacy mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <EyeOff className="h-4 w-4 text-red-500" />
              <div>
                <Label htmlFor="show_strategy_privacy" className="cursor-pointer font-medium text-sm">
                  Privatsphäre aktiv
                </Label>
                {privacyActive && (
                  <p className="text-xs text-muted-foreground">
                    Marken, Allokationen und Detailgewichte verborgen.
                  </p>
                )}
              </div>
            </div>
            <Switch
              id="show_strategy_privacy"
              checked={privacyActive}
              onCheckedChange={(val) => handleToggle('show_strategy_privacy', val)}
              disabled={updateSettings.isPending}
            />
          </div>

          {/* Password protection */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="h-4 w-4 text-primary" />
              <Label className="font-medium text-sm">Passwortschutz Anlagestrategien</Label>
            </div>
            <Input
              type="text"
              placeholder="Passwort festlegen (leer = kein Schutz)"
              value={strategyPassword}
              onChange={(e) => setStrategyPassword(e.target.value)}
              onBlur={async () => {
                try {
                  await updateSettings.mutateAsync({
                    customerId,
                    settings: { strategy_access_password: strategyPassword.trim() || null } as any,
                  });
                  toast.success('Passwortschutz aktualisiert');
                } catch {
                  toast.error(t('app.error'));
                }
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Leer = kein Schutz. Der Kunde muss das Passwort eingeben, um auf Anlagestrategien zuzugreifen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
