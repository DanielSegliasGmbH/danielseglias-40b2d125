import { useState } from 'react';
import { ScreenHeader } from '@/components/ScreenHeader';
import { PageTransition } from '@/components/PageTransition';
import { ErrorState } from '@/components/ErrorState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { TaskCard } from '@/components/client-portal/TaskCard';

interface TaskRow {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
}

export default function ClientPortalTasks() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { awardPoints } = useGamification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [doneOpen, setDoneOpen] = useState(false);

  const { data: tasks = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['client-tasks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_tasks')
        .select('*')
        .eq('user_id', user!.id)
        .order('is_completed', { ascending: true })
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TaskRow[];
    },
    enabled: !!user?.id,
  });

  const addTask = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('client_tasks').insert({
        user_id: user!.id,
        title: title.trim(),
        notes: notes.trim() || null,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client-tasks'] });
      toast.success('Aufgabe hinzugefügt ✓');
      setTitle('');
      setNotes('');
      setDueDate(undefined);
      setDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from('client_tasks')
        .update({
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', id);
      if (error) throw error;
      return { id, completed };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['client-tasks'] });
      qc.invalidateQueries({ queryKey: ['monthly-completed-tasks'] });
      if (result.completed) {
        awardPoints('task_completed', `task_${result.id}`);
      }
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-tasks'] }),
  });

  const openTasks = tasks.filter(t => !t.is_completed);
  const doneTasks = tasks.filter(t => t.is_completed);

  const isOverdue = (task: TaskRow) => {
    if (!task.due_date || task.is_completed) return false;
    return new Date(task.due_date) < new Date();
  };

  return (
    <ClientPortalLayout>
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-5 px-4 pt-2 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-foreground">✅ Meine Aufgaben</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {openTasks.length > 0
                  ? `${openTasks.length} offene Aufgabe${openTasks.length !== 1 ? 'n' : ''}`
                  : 'Alle erledigt!'}
              </p>
            </div>
            <Button size="sm" className="gap-1.5 h-8 rounded-xl" onClick={() => setDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Aufgabe hinzufügen
            </Button>
          </div>

          {isError && <ErrorState onRetry={() => refetch()} />}

          {isLoading && (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">⚔️</span>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1">Keine offenen Aufgaben</h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                Erstelle deine erste Quest! +50 XP pro erledigter Aufgabe.
              </p>
              <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Neue Aufgabe
              </Button>
            </div>
          )}

          {/* Open Tasks */}
          {openTasks.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                Offen ({openTasks.length})
              </p>
              {openTasks.map((task, i) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={i}
                  overdue={isOverdue(task)}
                  onToggle={() => toggleTask.mutate({ id: task.id, completed: true })}
                  onDelete={() => deleteTask.mutate(task.id)}
                />
              ))}
            </div>
          )}

          {/* Done Tasks */}
          {doneTasks.length > 0 && (
            <Collapsible open={doneOpen} onOpenChange={setDoneOpen}>
              <CollapsibleTrigger className="flex items-center gap-2 px-1 w-full text-left">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Erledigt ({doneTasks.length})
                </p>
                <span className="text-xs text-muted-foreground">{doneOpen ? '▾' : '▸'}</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1.5 mt-2">
                {doneTasks.map((task, i) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={i}
                    overdue={false}
                    onToggle={() => toggleTask.mutate({ id: task.id, completed: false })}
                    onDelete={() => deleteTask.mutate(task.id)}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {/* Add Task Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Neue Aufgabe</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Titel *</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="z.B. 3a-Konto eröffnen" />
              </div>
              <div className="space-y-1.5">
                <Label>Fälligkeitsdatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, 'dd.MM.yyyy', { locale: de }) : 'Datum wählen'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label>Notizen (optional)</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Zusätzliche Details…" rows={3} />
              </div>
              <Button className="w-full" disabled={!title.trim() || addTask.isPending} onClick={() => addTask.mutate()}>
                Aufgabe speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </ClientPortalLayout>
  );
}
