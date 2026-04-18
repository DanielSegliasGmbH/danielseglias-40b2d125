import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface AdvisorTaskRow {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  is_completed: boolean;
  created_at: string;
  source: string | null;
  priority: string | null;
  created_by: string | null;
}

const PRIORITY_LABELS: Record<string, string> = {
  normal: 'Normal',
  important: 'Wichtig',
  urgent: 'Dringend',
};

const PRIORITY_BADGE: Record<string, string> = {
  normal: 'bg-muted text-muted-foreground',
  important: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  urgent: 'bg-destructive/15 text-destructive',
};

interface Props {
  customerId: string;
  customerName: string;
}

export function CustomerTasksTab({ customerId, customerName }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Resolve client user_id from customer_users mapping
  const { data: portalUserId, isLoading: loadingMapping } = useQuery({
    queryKey: ['customer-portal-user', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_users')
        .select('user_id')
        .eq('customer_id', customerId)
        .maybeSingle();
      if (error) throw error;
      return data?.user_id ?? null;
    },
  });

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['advisor-client-tasks', portalUserId],
    queryFn: async () => {
      if (!portalUserId) return [];
      const { data, error } = await supabase
        .from('client_tasks')
        .select('id, title, notes, due_date, is_completed, created_at, source, priority, created_by')
        .eq('user_id', portalUserId)
        .eq('source', 'advisor')
        .order('is_completed', { ascending: true })
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdvisorTaskRow[];
    },
    enabled: !!portalUserId,
  });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<'normal' | 'important' | 'urgent'>('normal');

  const reset = () => {
    setTitle('');
    setNotes('');
    setDueDate(undefined);
    setPriority('normal');
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!portalUserId) throw new Error('Kein Portal-Benutzer verknüpft');
      const { error } = await supabase.from('client_tasks').insert({
        user_id: portalUserId,
        title: title.trim(),
        notes: notes.trim() || null,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
        created_by: user?.id ?? null,
        source: 'advisor',
        priority,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisor-client-tasks', portalUserId] });
      toast.success('Aufgabe für Kunden erstellt ✓');
      reset();
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message || 'Fehler beim Speichern'),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('client_tasks')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['advisor-client-tasks', portalUserId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisor-client-tasks', portalUserId] });
      toast.success('Aufgabe gelöscht');
    },
  });

  if (loadingMapping) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!portalUserId) {
    return (
      <Card>
        <CardContent className="py-10 text-center space-y-2">
          <p className="text-sm font-medium text-foreground">
            Kein Portal-Benutzer verknüpft
          </p>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Damit du Aufgaben für diesen Kunden erstellen kannst, muss ein Portal-Konto
            verknüpft sein (Tab «Portal»).
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Aufgaben für {customerName}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Diese Aufgaben erscheinen direkt in der Aufgabenliste deines Kunden.
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Neue Aufgabe
        </Button>
      </div>

      {loadingTasks ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Noch keine Aufgaben vergeben. Erstelle die erste mit «Neue Aufgabe».
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <Card key={task.id} className={cn(task.is_completed && 'opacity-60')}>
              <CardContent className="p-3.5">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      toggle.mutate({ id: task.id, completed: !task.is_completed })
                    }
                    className="mt-0.5 shrink-0"
                    aria-label={
                      task.is_completed ? 'Als offen markieren' : 'Als erledigt markieren'
                    }
                  >
                    {task.is_completed ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-[2.5px] border-muted-foreground/30 hover:border-primary/60" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        'text-sm font-semibold text-foreground',
                        task.is_completed && 'line-through text-muted-foreground',
                      )}
                    >
                      {task.title}
                    </p>
                    {task.notes && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {task.notes}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {task.due_date && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString('de-CH')}
                        </span>
                      )}
                      {task.priority && task.priority !== 'normal' && (
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px] px-1.5 py-0 h-4 font-semibold border-0',
                            PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.normal,
                          )}
                        >
                          {PRIORITY_LABELS[task.priority] ?? task.priority}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => remove.mutate(task.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Neue Aufgabe für {customerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Titel *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z. B. Säule 3a einrichten"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Beschreibung (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Zusätzliche Details für deinen Kunden…"
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Fälligkeitsdatum (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dueDate && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate
                      ? format(dueDate, 'dd.MM.yyyy', { locale: de })
                      : 'Datum wählen'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Priorität</Label>
              <RadioGroup
                value={priority}
                onValueChange={(v) => setPriority(v as typeof priority)}
                className="grid grid-cols-3 gap-2"
              >
                {(['normal', 'important', 'urgent'] as const).map((p) => (
                  <label
                    key={p}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border px-2 py-2 text-sm cursor-pointer transition-colors',
                      priority === p
                        ? 'border-primary bg-primary/5 text-foreground font-semibold'
                        : 'border-border text-muted-foreground hover:bg-muted/50',
                    )}
                  >
                    <RadioGroupItem value={p} className="sr-only" />
                    {PRIORITY_LABELS[p]}
                  </label>
                ))}
              </RadioGroup>
            </div>

            <Button
              className="w-full"
              disabled={!title.trim() || create.isPending}
              onClick={() => create.mutate()}
            >
              {create.isPending ? 'Speichern…' : 'Aufgabe speichern'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
