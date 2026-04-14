import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { EmptyState } from '@/components/EmptyState';
import {
  ClipboardList, CheckCircle2, Circle, Trash2, Plus, CalendarIcon, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();

  const { data: tasks = [], isLoading } = useQuery({
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
      toast.success('Aufgabe hinzugefügt ✓', { duration: 3000 });
      setTitle('');
      setNotes('');
      setDueDate(undefined);
      setDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern', { duration: 3000 }),
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
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-tasks'] }),
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
      <ScreenHeader title="Meine Aufgaben" showBack backTo="/app/client-portal" />
      <div className="max-w-2xl mx-auto space-y-4 p-4 pb-8">
        {/* Add Task Button */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2">
              <Plus className="h-4 w-4" /> Aufgabe hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
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

        {/* Loading */}
        {isLoading && [1, 2].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}

        {/* Empty state */}
        {!isLoading && tasks.length === 0 && (
          <EmptyState
            icon={ClipboardList}
            title="Noch keine Aufgaben"
            description="Erstelle deine erste Aufgabe mit dem Button oben."
          />
        )}

        {/* Open Tasks */}
        {openTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">Offen ({openTasks.length})</p>
            {openTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                overdue={isOverdue(task)}
                onToggle={() => toggleTask.mutate({ id: task.id, completed: true })}
                onDelete={() => deleteTask.mutate(task.id)}
              />
            ))}
          </div>
        )}

        {/* Done Tasks */}
        {doneTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">Erledigt ({doneTasks.length})</p>
            {doneTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                overdue={false}
                onToggle={() => toggleTask.mutate({ id: task.id, completed: false })}
                onDelete={() => deleteTask.mutate(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}

function TaskCard({
  task,
  overdue,
  onToggle,
  onDelete,
}: {
  task: TaskRow;
  overdue: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className={cn('transition-all', task.is_completed && 'opacity-60', overdue && 'border-destructive/40')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={onToggle} className="mt-0.5 shrink-0">
            {task.is_completed
              ? <CheckCircle2 className="h-5 w-5 text-green-600" />
              : <Circle className="h-5 w-5 text-muted-foreground" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className={cn('text-sm font-medium text-foreground', task.is_completed && 'line-through text-muted-foreground')}>
              {task.title}
            </p>
            {task.notes && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.notes}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {task.due_date && (
                <span className={cn('text-[10px] flex items-center gap-0.5', overdue ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                  <Clock className="h-3 w-3" />
                  {new Date(task.due_date).toLocaleDateString('de-CH')}
                  {overdue && ' (überfällig)'}
                </span>
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
