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
  Target, Trash2, Plus, TrendingUp, Home, Heart, Shield, Star, CalendarIcon, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
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

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('client_goals')
        .update({ is_completed: completed })
        .eq('id', id);
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
        {/* Add Goal Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" /> Ziel hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
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
              <Button className="w-full" disabled={!title.trim() || addGoal.isPending} onClick={() => addGoal.mutate()}>
                Ziel speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loading */}
        {isLoading && [1, 2].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}

        {/* Empty state */}
        {!isLoading && goals.length === 0 && (
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">Noch keine Ziele definiert</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Klicke oben auf «Ziel hinzufügen», um dein erstes Finanzziel zu erstellen.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground px-1">Aktive Ziele ({activeGoals.length})</p>
            {activeGoals.map(goal => <GoalCard key={goal.id} goal={goal} onDelete={() => deleteGoal.mutate(goal.id)} onToggle={() => toggleComplete.mutate({ id: goal.id, completed: true })} />)}
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground px-1">Erreichte Ziele ({completedGoals.length})</p>
            {completedGoals.map(goal => <GoalCard key={goal.id} goal={goal} onDelete={() => deleteGoal.mutate(goal.id)} onToggle={() => toggleComplete.mutate({ id: goal.id, completed: false })} />)}
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}

function GoalCard({ goal, onDelete, onToggle }: { goal: GoalRow; onDelete: () => void; onToggle: () => void }) {
  const CatIcon = categoryIconMap[goal.category || ''] || Target;
  const progress = goal.target_amount && goal.target_amount > 0
    ? Math.min(100, Math.round((goal.current_amount / goal.target_amount) * 100))
    : null;

  return (
    <Card className={cn('transition-all', goal.is_completed && 'opacity-60')}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <button onClick={onToggle} className="mt-0.5 shrink-0">
              {goal.is_completed
                ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                : <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40" />}
            </button>
            <div className="min-w-0 flex-1">
              <h3 className={cn('font-semibold text-sm text-foreground', goal.is_completed && 'line-through')}>{goal.title}</h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {goal.category && (
                  <Badge variant="outline" className="text-[10px] gap-1">
                    <CatIcon className="h-3 w-3" /> {goal.category}
                  </Badge>
                )}
                {goal.target_amount != null && (
                  <span className="text-[10px] text-muted-foreground">
                    Ziel: CHF {Number(goal.target_amount).toLocaleString('de-CH')}
                  </span>
                )}
                {goal.target_date && (
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(goal.target_date).toLocaleDateString('de-CH')}
                  </span>
                )}
              </div>
              {progress !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={progress} className="flex-1 h-1.5" />
                  <span className="text-[10px] text-muted-foreground font-medium">{progress}%</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
