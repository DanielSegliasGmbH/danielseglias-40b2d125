import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Shield, Download, Trash2, AlertTriangle, Eye, Swords, FileBarChart, Loader2, Lightbulb, CalendarDays, Flame, MessageCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface PrivacySettings {
  leaderboard_visible: boolean;
  peak_score_visible: boolean;
  challenges_allowed: boolean;
  auto_monthly_report: boolean;
  show_truth_moments: boolean;
}

const PRIVACY_TOGGLES: {
  key: keyof PrivacySettings;
  label: string;
  description: string;
  icon: typeof Eye;
}[] = [
  {
    key: 'leaderboard_visible',
    label: 'In Rangliste sichtbar',
    description: 'Dein Name und Rang erscheinen in der Freunde-Rangliste',
    icon: Eye,
  },
  {
    key: 'peak_score_visible',
    label: 'PeakScore für Freunde sichtbar',
    description: 'Freunde können deinen PeakScore sehen',
    icon: Shield,
  },
  {
    key: 'challenges_allowed',
    label: 'Challenges erlauben',
    description: 'Du kannst Challenges senden und empfangen',
    icon: Swords,
  },
  {
    key: 'auto_monthly_report',
    label: 'Monatsbericht automatisch erstellen',
    description: 'Am Monatsanfang wird ein Rückblick erstellt',
    icon: FileBarChart,
  },
  {
    key: 'show_truth_moments',
    label: 'Wahrheits-Momente anzeigen',
    description: 'Gelegentliche Erkenntnisse basierend auf deinen Daten',
    icon: Lightbulb,
  },
];

export default function ClientPortalSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [exporting, setExporting] = useState(false);

  // Fetch privacy settings from profile
  const { data: settings, isLoading } = useQuery({
    queryKey: ['privacy-settings', user?.id],
    queryFn: async (): Promise<PrivacySettings> => {
      if (!user) return { leaderboard_visible: true, peak_score_visible: true, challenges_allowed: true, auto_monthly_report: true, show_truth_moments: true };
      const { data } = await supabase
        .from('profiles')
        .select('leaderboard_visible, peak_score_visible, challenges_allowed, auto_monthly_report, show_truth_moments')
        .eq('id', user.id)
        .maybeSingle();
      return {
        leaderboard_visible: data?.leaderboard_visible ?? true,
        peak_score_visible: data?.peak_score_visible ?? true,
        challenges_allowed: data?.challenges_allowed ?? true,
        auto_monthly_report: data?.auto_monthly_report ?? true,
        show_truth_moments: (data as any)?.show_truth_moments ?? true,
      };
    },
    enabled: !!user,
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: keyof PrivacySettings; value: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('id', user.id);
      if (error) throw error;
    },
    onMutate: async ({ key, value }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['privacy-settings', user?.id] });
      const prev = queryClient.getQueryData<PrivacySettings>(['privacy-settings', user?.id]);
      queryClient.setQueryData(['privacy-settings', user?.id], (old: PrivacySettings | undefined) => ({
        ...old,
        [key]: value,
      }));
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) queryClient.setQueryData(['privacy-settings', user?.id], context.prev);
      toast.error('Einstellung konnte nicht gespeichert werden');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings', user?.id] });
    },
  });

  // Data export
  const handleExport = useCallback(async () => {
    if (!user) return;
    setExporting(true);
    try {
      // Fetch all user data in parallel
      const [
        { data: profile },
        { data: metaProfile },
        { data: goals },
        { data: tasks },
        { data: budgetCats },
        { data: budgetExp },
        { data: memories },
        { data: peakScores },
        { data: gamification },
        { data: coachProgress },
        { data: lifeFilm },
        { data: finanzType },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
        supabase.from('meta_profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('client_goals').select('*').eq('user_id', user.id),
        supabase.from('client_tasks').select('*').eq('user_id', user.id),
        supabase.from('budget_categories').select('*').eq('user_id', user.id),
        supabase.from('budget_expenses').select('*').eq('user_id', user.id),
        supabase.from('memories').select('*').eq('user_id', user.id),
        supabase.from('peak_scores').select('*').eq('user_id', user.id),
        supabase.from('gamification_actions').select('*').eq('user_id', user.id),
        supabase.from('coach_progress').select('*').eq('user_id', user.id),
        supabase.from('life_film_data').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('finanz_type_results').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      const exportData = {
        exportedAt: new Date().toISOString(),
        profile,
        metaProfile,
        goals: goals || [],
        tasks: tasks || [],
        budgetCategories: budgetCats || [],
        budgetExpenses: budgetExp || [],
        memories: memories || [],
        peakScores: peakScores || [],
        gamificationActions: gamification || [],
        coachProgress: coachProgress || [],
        lifeFilmData: lifeFilm,
        finanzType,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finlife-daten-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Daten exportiert');
    } catch {
      toast.error('Export fehlgeschlagen');
    } finally {
      setExporting(false);
    }
  }, [user]);

  // Account deletion
  const requestDeletion = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ deletion_requested_at: new Date().toISOString() })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Löschanfrage eingereicht. Dein Account wird innerhalb von 30 Tagen gelöscht.');
      setDeleteOpen(false);
      setDeleteConfirm('');
    },
    onError: () => toast.error('Anfrage fehlgeschlagen'),
  });

  if (isLoading || !settings) {
    return (
      <ClientPortalLayout>
        <div className="max-w-2xl mx-auto p-4">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <ScreenHeader title="Einstellungen" backTo="/app/client-portal" />

        {/* Darstellung */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-1">Darstellung</p>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Theme & Sprache</span>
              <div className="flex items-center gap-1.5">
                <ThemeSwitcher />
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Privatsphäre */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-1">Privatsphäre</p>
          <div className="space-y-2">
            {PRIVACY_TOGGLES.map(toggle => {
              const Icon = toggle.icon;
              return (
                <Card key={toggle.key}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                      <p className="text-[11px] text-muted-foreground leading-tight">{toggle.description}</p>
                    </div>
                    <Switch
                      checked={settings[toggle.key]}
                      onCheckedChange={(checked) => updateSetting.mutate({ key: toggle.key, value: checked })}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Rituale */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-1">Rituale & Engagement</p>
          <RitualSettingsSection userId={user?.id} />
        </div>

        <Separator />

        {/* Daten */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-1">Daten</p>

          <Card>
            <CardContent className="p-4 space-y-3">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Meine Daten exportieren
              </Button>

              <Button
                variant="ghost"
                className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Account löschen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-center">Account löschen</DialogTitle>
            <DialogDescription className="text-center">
              Achtung: Alle deine Daten werden unwiderruflich gelöscht. Dieser Vorgang kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Tippe <span className="font-bold text-destructive">LÖSCHEN</span> ein, um zu bestätigen:
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="LÖSCHEN"
              className="text-center font-mono"
              maxLength={10}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => { setDeleteOpen(false); setDeleteConfirm(''); }}
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deleteConfirm !== 'LÖSCHEN' || requestDeletion.isPending}
              onClick={() => requestDeletion.mutate()}
            >
              {requestDeletion.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Endgültig löschen'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ClientPortalLayout>
  );
}

function RitualSettingsSection({ userId }: { userId?: string }) {
  const queryClient = useQueryClient();

  const { data: ritualSettings } = useQuery({
    queryKey: ['ritual-settings', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from('profiles')
        .select('payday_date, weekly_ritual_enabled, streak_rescue_enabled, future_self_messages_enabled')
        .eq('id', userId)
        .maybeSingle();
      return {
        payday_date: (data as any)?.payday_date ?? 25,
        weekly_ritual_enabled: (data as any)?.weekly_ritual_enabled ?? true,
        streak_rescue_enabled: (data as any)?.streak_rescue_enabled ?? true,
        future_self_messages_enabled: (data as any)?.future_self_messages_enabled ?? true,
      };
    },
    enabled: !!userId,
  });

  const updateRitual = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: boolean | number }) => {
      if (!userId) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ [key]: value })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ritual-settings', userId] });
    },
    onError: () => toast.error('Einstellung konnte nicht gespeichert werden'),
  });

  if (!ritualSettings) return null;

  const RITUAL_TOGGLES = [
    {
      key: 'weekly_ritual_enabled',
      label: 'Wochenritual (Sonntag)',
      description: 'Wöchentlicher Rückblick jeden Sonntag',
      icon: CalendarDays,
      value: ritualSettings.weekly_ritual_enabled,
    },
    {
      key: 'streak_rescue_enabled',
      label: 'Streak-Rescue',
      description: '1× pro Monat den Streak retten',
      icon: Flame,
      value: ritualSettings.streak_rescue_enabled,
    },
    {
      key: 'future_self_messages_enabled',
      label: 'Zukunfts-Ich Nachrichten',
      description: 'Motivierende Nachrichten von deinem Zukunfts-Ich',
      icon: MessageCircle,
      value: ritualSettings.future_self_messages_enabled,
    },
  ];

  return (
    <div className="space-y-2">
      {/* Payday date */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <CalendarDays className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">Payday-Datum</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Tag des monatlichen Rituals</p>
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={1}
              max={31}
              value={ritualSettings.payday_date}
              onChange={e => {
                const val = Math.min(31, Math.max(1, Number(e.target.value) || 25));
                updateRitual.mutate({ key: 'payday_date', value: val });
              }}
              className="w-16 h-8 text-sm text-center"
            />
            <span className="text-xs text-muted-foreground">.</span>
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      {RITUAL_TOGGLES.map(toggle => {
        const Icon = toggle.icon;
        return (
          <Card key={toggle.key}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{toggle.label}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{toggle.description}</p>
              </div>
              <Switch
                checked={toggle.value}
                onCheckedChange={(checked) => updateRitual.mutate({ key: toggle.key, value: checked })}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
