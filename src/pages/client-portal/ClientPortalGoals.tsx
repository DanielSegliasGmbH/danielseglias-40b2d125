import { useState } from 'react';
import { PageTransition } from '@/components/PageTransition';
import { ErrorState } from '@/components/ErrorState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Target, Trash2, Plus, TrendingUp, Home, Heart, Shield, Star, CalendarIcon, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { usePeakScore } from '@/hooks/usePeakScore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const CATEGORIES = [
  { value: 'Vermögensaufbau', icon: TrendingUp },
  { value: 'Wohnen', icon: Home },
  { value: 'Familie', icon: Heart },
  { value: 'Sicherheit', icon: Shield },
  { value: 'Freiheit', icon: Star },
  { value: 'Sonstiges', icon: Target },
];

const categoryIconMap: Record<string, React.ElementType> = Object.fromEntries(
  CATEGORIES.map(c => [c.value, c.icon])
);

function getProgressEmoji(pct: number): string {
  if (pct >= 100) return '🏆';
  if (pct >= 75) return '🌳';
  if (pct >= 50) return '🌿';
  return '🌱';
}

interface GoalRow {
  id: string;
  title: string;
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
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>();
  const [category, setCategory] = useState('Sonstiges');

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
        target_amount: targetAmount ? Number(targetAmount) : null,
        target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null,
        category,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-goals'] });
      toast.success('Ziel hinzugefügt ✓');
      awardPoints('goal_added', `goal_${Date.now()}`);
      setTitle('');
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
      <ScreenHeader title="Deine Ziele" showBack backTo="/app/client-portal" />
      <PageTransition>
      <div className="max-w-2xl mx-auto space-y-4 p-4 pb-8">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" /> Ziel hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Neues Ziel erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Titel *</Label>
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
              {/* Projected PeakScore impact */}
              {targetAmount && monthlyExpenses > 0 && (
                <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 px-1">
                  <Shield className="h-3 w-3" />
                  <span>Wenn du dieses Ziel erreichst: PeakScore +{(Number(targetAmount) / monthlyExpenses).toFixed(1)}</span>
                </div>
              )}
              <Button className="w-full" disabled={!title.trim() || addGoal.isPending} onClick={() => addGoal.mutate()}>
                Ziel speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {isError && <ErrorState onRetry={() => refetch()} />}
        {isLoading && [1, 2].map(i => <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />)}

        {!isLoading && !isError && goals.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">Noch keine Ziele definiert</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Klicke oben auf «Ziel hinzufügen», um dein erstes Finanzziel zu erstellen.
              </p>
            </CardContent>
          </Card>
        )}

        {activeGoals.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">Aktive Ziele ({activeGoals.length})</p>
            {activeGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onDelete={() => deleteGoal.mutate(goal.id)} />
            ))}
          </div>
        )}

        {completedGoals.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">Erreichte Ziele ({completedGoals.length})</p>
            {completedGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onDelete={() => deleteGoal.mutate(goal.id)} />
            ))}
          </div>
        )}
      </div>
      </PageTransition>
    </ClientPortalLayout>
  );
}

function GoalCard({ goal, onDelete }: { goal: GoalRow; onDelete: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const CatIcon = categoryIconMap[goal.category || ''] || Target;
  const progress = goal.target_amount && goal.target_amount > 0
    ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
    : null;

  const [updateOpen, setUpdateOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');

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
    <Card className={cn(
      'overflow-hidden border-0 shadow-sm transition-all',
      goal.is_completed && 'opacity-60'
    )} style={{
      background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(60 10% 96%) 100%)',
    }}>
      <CardContent className="p-5">
        {/* Top row: emoji + title + delete */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {progress !== null && (
              <span className="text-2xl leading-none mt-0.5">{getProgressEmoji(progress)}</span>
            )}
            <div className="min-w-0 flex-1">
              <h3 className={cn('font-bold text-base text-foreground leading-tight', goal.is_completed && 'line-through')}>
                {goal.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {goal.category && (
                  <Badge variant="secondary" className="text-[11px] gap-1 font-medium">
                    <CatIcon className="h-3 w-3" /> {goal.category}
                  </Badge>
                )}
                {goal.target_date && (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(goal.target_date).toLocaleDateString('de-CH')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>

        {/* Target amount prominent */}
        {goal.target_amount != null && (
          <div className="mb-3">
            <p className="text-2xl font-bold text-foreground tracking-tight">
              CHF {Number(goal.target_amount).toLocaleString('de-CH')}
            </p>
            <p className="text-xs text-muted-foreground">
              Aktuell: CHF {Number(goal.current_amount).toLocaleString('de-CH')}
            </p>
          </div>
        )}

        {/* Progress bar */}
        {progress !== null && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">Fortschritt</span>
              <span className="text-lg font-bold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2.5 rounded-full" />
          </div>
        )}

        {/* Update amount button */}
        {goal.target_amount != null && !goal.is_completed && (
          <>
            {!updateOpen ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 mt-1"
                onClick={() => { setNewAmount(String(goal.current_amount)); setUpdateOpen(true); }}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Betrag aktualisieren
              </Button>
            ) : (
              <div className="flex gap-2 mt-1">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  placeholder="Neuer Betrag"
                  className="flex-1"
                  autoFocus
                />
                <Button size="sm" onClick={() => updateAmount.mutate()} disabled={updateAmount.isPending}>
                  OK
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setUpdateOpen(false)}>
                  ✕
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
