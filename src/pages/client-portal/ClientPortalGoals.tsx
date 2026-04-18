import { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { PageHeader } from '@/components/client-portal/PageHeader';
import { ErrorState } from '@/components/ErrorState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Target, Trash2, Plus, TrendingUp, Home, Heart, Shield, Star, CalendarIcon, RefreshCw,
} from 'lucide-react';
import { formatGoalImpact } from '@/lib/peakScoreFormat';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { usePeakScore } from '@/hooks/usePeakScore';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { motion } from 'framer-motion';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';

const CATEGORIES = [
  { value: 'Vermögensaufbau', icon: TrendingUp },
  { value: 'Wohnen', icon: Home },
  { value: 'Familie', icon: Heart },
  { value: 'Sicherheit', icon: Shield },
  { value: 'Freiheit', icon: Star },
  { value: 'Sonstiges', icon: Target },
];

const MISSION_PREFIXES = [
  { emoji: '🎯', label: 'Projekt' },
  { emoji: '🚀', label: 'Mission' },
  { emoji: '🌟', label: 'Operation' },
  { emoji: '💎', label: 'Vision' },
  { emoji: '🔥', label: 'Quest' },
];

const MISSION_EXAMPLES = [
  'Projekt Sabbatical',
  'Mission: Eigener Hof',
  'Operation Frühpension',
  'Vision Familienhaus',
  'Quest: CHF 100\'000',
];

function getProgressEmoji(pct: number): string {
  if (pct >= 100) return '🏆';
  if (pct >= 75) return '🌳';
  if (pct >= 50) return '🌿';
  return '🌱';
}

function getDaysRemainingBadge(targetDate: string | null) {
  if (!targetDate) return null;
  const days = differenceInDays(new Date(targetDate), new Date());
  if (days < 0) return <Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive">Überfällig</Badge>;
  if (days <= 7) return <Badge variant="secondary" className="text-[10px] bg-destructive/10 text-destructive">{days}d übrig</Badge>;
  if (days <= 30) return <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">{days}d übrig</Badge>;
  return <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">{days}d übrig</Badge>;
}

interface GoalRow {
  id: string;
  title: string;
  mission_name: string | null;
  target_amount: number | null;
  current_amount: number;
  target_date: string | null;
  category: string | null;
  is_completed: boolean;
  created_at: string;
}

export default function ClientPortalGoals() {
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const { monthlyExpenses } = usePeakScore();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [missionName, setMissionName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [category, setCategory] = useState('Sonstiges');
  const [completedOpen, setCompletedOpen] = useState(false);

  const { data: goals = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['client-goals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GoalRow[];
    },
    enabled: !!user?.id,
  });

  const addGoal = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('client_goals').insert({
        user_id: user!.id,
        title: title.trim(),
        mission_name: missionName.trim() || null,
        target_amount: targetAmount ? Number(targetAmount) : null,
        target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null,
        category,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-goals'] });
      const displayName = missionName.trim() || title.trim();
      toast.success(`${displayName} — Ziel hinzugefügt ✓`);
      awardPoints('goal_added', `goal_${Date.now()}`);
      setTitle('');
      setMissionName('');
      setTargetAmount('');
      setTargetDate(undefined);
      setCategory('Sonstiges');
      setDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_goals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-goals'] }),
  });

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  return (
    <ClientPortalLayout>
      <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
        <PageHeader
          title="🎯 Meine Ziele"
          subtitle="Wofür du sparst und was du erreichen willst"
          rightAction={
            <Button size="sm" className="gap-1.5 h-8 rounded-xl" onClick={() => setDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Ziel
            </Button>
          }
        />
        <PageTransition>
          <div className="space-y-5">

          {isError && <ErrorState onRetry={() => refetch()} />}

          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />)}
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && goals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Wofür lohnt es sich, heute auf etwas zu verzichten?</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Dein erstes Ziel macht den Unterschied sichtbar.
              </p>
              <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Erstes Ziel setzen
              </Button>
            </div>
          )}

          {/* Active goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Aktive Ziele ({activeGoals.length})
              </p>
              {activeGoals.map((goal, i) => (
                <GoalCard key={goal.id} goal={goal} index={i} onDelete={() => deleteGoal.mutate(goal.id)} monthlyExpenses={monthlyExpenses} />
              ))}
            </div>
          )}

          {/* Completed goals */}
          {completedGoals.length > 0 && (
            <Collapsible open={completedOpen} onOpenChange={setCompletedOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 px-1 w-full text-left">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Erreichte Ziele ({completedGoals.length})
                </p>
                <span className="text-xs text-muted-foreground">{completedOpen ? '▾' : '▸'}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {completedGoals.map((goal, i) => (
                  <GoalCard key={goal.id} goal={goal} index={i} onDelete={() => deleteGoal.mutate(goal.id)} monthlyExpenses={monthlyExpenses} completed />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Neues Ziel erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              {/* Mission Name */}
              <div className="space-y-2">
                <Label>Mission-Name <span className="text-muted-foreground text-xs font-normal">(optional)</span></Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gib dieser Mission einen Namen, der dich inspiriert. Nicht nur «Auto kaufen». Sondern «Operation Freiheit» oder «Projekt Traumauto».
                </p>
                <div className="flex flex-wrap gap-1.5 mb-1">
                  {MISSION_PREFIXES.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setMissionName(prev => {
                        const stripped = prev.replace(/^(Projekt|Mission|Operation|Vision|Quest):?\s*/i, '').trim();
                        return `${p.label} ${stripped}`;
                      })}
                      className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                        missionName.startsWith(p.label)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/50 text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {p.emoji} {p.label}
                    </button>
                  ))}
                </div>
                <Input
                  value={missionName}
                  onChange={e => setMissionName(e.target.value)}
                  placeholder="z.B. Operation Freiheit"
                  className="text-base"
                />
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {MISSION_EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setMissionName(ex)}
                      className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Titel / Beschreibung *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. Notgroschen aufbauen" />
              </div>
              <div className="space-y-1.5">
                <Label>Zielbetrag (CHF)</Label>
                <Input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder="10000" />
              </div>
              <div className="space-y-1.5">
                <Label>Zieldatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !targetDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {targetDate ? format(targetDate, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={targetDate} onSelect={setTargetDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label>Kategorie</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {targetAmount && monthlyExpenses > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-2 rounded-lg">
                  <Shield className="h-3.5 w-3.5 shrink-0" />
                  <span>{formatGoalImpact(Number(targetAmount) / monthlyExpenses)}</span>
                </div>
              )}
              <Button className="w-full" disabled={!title.trim() || addGoal.isPending} onClick={() => addGoal.mutate()}>
                Ziel speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </PageTransition>
      </div>
    </ClientPortalLayout>
  );
}

function GoalCard({ goal, index, onDelete, monthlyExpenses, completed }: {
  goal: GoalRow;
  index: number;
  onDelete: () => void;
  monthlyExpenses: number;
  completed?: boolean;
}) {
  const qc = useQueryClient();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');

  const progress = goal.target_amount && goal.target_amount > 0
    ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
    : null;

  const displayName = goal.mission_name || goal.title;
  const subtitle = goal.mission_name ? goal.title : null;

  const updateAmount = useMutation({
    mutationFn: async () => {
      const val = parseFloat(newAmount);
      if (isNaN(val) || val < 0) throw new Error('Invalid');
      const { error } = await supabase
        .from('client_goals')
        .update({ current_amount: val })
        .eq('id', goal.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-goals'] });
      toast.success('Betrag aktualisiert ✓');
      setUpdateOpen(false);
      setNewAmount('');
    },
    onError: () => toast.error('Fehler'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
    >
      <Card className={cn(
        "border border-border/50 rounded-xl overflow-hidden transition-all",
        completed && "opacity-60"
      )}>
        <CardContent className="p-4">
          {/* Top row: title + date badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {progress !== null && (
                  <span className="text-lg leading-none shrink-0">{getProgressEmoji(progress)}</span>
                )}
                <h3 className={cn(
                  "text-lg font-bold text-foreground leading-tight truncate",
                  completed && "line-through text-muted-foreground"
                )}>
                  {displayName}
                </h3>
              </div>
              {subtitle && (
                <p className="text-[13px] text-muted-foreground mt-0.5 truncate pl-7">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {getDaysRemainingBadge(goal.target_date)}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
                <Trash2 className="h-3 w-3 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          {progress !== null && (
            <div className="mb-2 mt-2">
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, delay: index * 0.04 + 0.15, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Bottom row: amounts + percentage */}
          {goal.target_amount != null && (
            <div className="flex items-center justify-between">
              <PrivateValue className="text-[13px] text-muted-foreground">
                CHF {Number(goal.current_amount).toLocaleString('de-CH')} / CHF {Number(goal.target_amount).toLocaleString('de-CH')}
              </PrivateValue>
              {progress !== null && (
                <span className="text-[13px] font-bold text-primary">{progress}%</span>
              )}
            </div>
          )}

          {/* Update amount inline */}
          {goal.target_amount != null && !completed && (
            <>
              {!updateOpen ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full gap-1.5 mt-2 h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setNewAmount(String(goal.current_amount)); setUpdateOpen(true); }}
                >
                  <RefreshCw className="h-3 w-3" /> Betrag aktualisieren
                </Button>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    placeholder="Neuer Betrag"
                    className="flex-1 h-8 text-sm"
                    autoFocus
                  />
                  <Button size="sm" className="h-8" onClick={() => updateAmount.mutate()} disabled={updateAmount.isPending}>
                    OK
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => setUpdateOpen(false)}>
                    ✕
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
