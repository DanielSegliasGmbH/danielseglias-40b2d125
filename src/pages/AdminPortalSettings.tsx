import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Shield,
  Target,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Wrench,
  Settings,
  GraduationCap,
  Info,
} from 'lucide-react';
import { useDefaultPortalSettings, useUpdateDefaultPortalSettings } from '@/hooks/useClientPortal';

const sections = [
  { key: 'show_tools', icon: Wrench, label: 'Werkzeugkiste', color: 'text-slate-500', desc: 'Rechner und Analysetools' },
  { key: 'show_library', icon: BookOpen, label: 'Wissensbibliothek', color: 'text-amber-500', desc: 'Lernmodule und Inhalte' },
  { key: 'show_strategies', icon: TrendingUp, label: 'Anlagestrategien', color: 'text-purple-500', desc: 'Strategieübersichten' },
  { key: 'show_goals', icon: Target, label: 'Ziele', color: 'text-green-500', desc: 'Kundenziele und Meilensteine' },
  { key: 'show_tasks', icon: ClipboardList, label: 'Aufgaben', color: 'text-orange-500', desc: 'Offene Aufgaben' },
  { key: 'show_insurances', icon: Shield, label: 'Versicherungen', color: 'text-blue-500', desc: 'Versicherungsübersicht' },
  { key: 'show_courses', icon: GraduationCap, label: 'Videokurse', color: 'text-pink-500', desc: 'Online-Kurse und Module' },
] as const;

export default function AdminPortalSettings() {
  const { t } = useTranslation();
  const { data: defaults, isLoading } = useDefaultPortalSettings();
  const updateDefaults = useUpdateDefaultPortalSettings();

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updateDefaults.mutateAsync({ [key]: value });
      toast.success('Standardfreigabe aktualisiert');
    } catch {
      toast.error(t('app.error'));
    }
  };

  const getValue = (key: string): boolean => {
    if (!defaults) return true;
    return (defaults as any)[key] ?? true;
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-transition max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Kundenportal – Standardfreigaben</h1>
            <p className="text-sm text-muted-foreground">Diese Einstellungen gelten für alle Kunden als Basis.</p>
          </div>
        </div>

        {/* Info Box */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-medium mb-1">So funktioniert die Freigabelogik</p>
              <p className="text-muted-foreground">
                Hier legst du fest, welche Bereiche <strong>alle Kunden standardmässig</strong> sehen. 
                Für einzelne Kunden kannst du individuell Bereiche zusätzlich freischalten oder sperren — 
                diese Ausnahmen überschreiben den Standard.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Sichtbare Bereiche</CardTitle>
            <CardDescription>Aktivierte Bereiche erscheinen im Kundenportal für alle Kunden.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sections.map(section => {
                const active = getValue(section.key);
                return (
                  <div key={section.key} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                        <section.icon className={`h-4 w-4 ${section.color}`} />
                      </div>
                      <div>
                        <Label htmlFor={section.key} className="cursor-pointer font-medium">
                          {section.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{section.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {active && (
                        <Badge variant="secondary" className="text-[10px]">Standard</Badge>
                      )}
                      <Switch
                        id={section.key}
                        checked={active}
                        onCheckedChange={(val) => handleToggle(section.key, val)}
                        disabled={updateDefaults.isPending}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Hint */}
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Individuelle Ausnahmen</strong> pro Kunde findest du im jeweiligen Kundenprofil unter dem Tab «Steuerung».
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
