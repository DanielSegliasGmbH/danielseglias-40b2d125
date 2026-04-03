import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { ClipboardList, CheckCircle2, Circle, Brain, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoachTask {
  id: string;
  title: string;
  description: string;
  status: string;
  module: string;
  created_at: string;
}

const moduleIcons: Record<string, React.ElementType> = {
  mindset: Brain,
};

export default function ClientPortalTasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<CoachTask[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem('coach_tasks');
    if (raw) {
      try {
        setTasks(JSON.parse(raw));
      } catch { /* ignore */ }
    }
  }, []);

  const updateTasks = (updated: CoachTask[]) => {
    setTasks(updated);
    localStorage.setItem('coach_tasks', JSON.stringify(updated));
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, status: t.status === 'erledigt' ? 'offen' : 'erledigt' } : t
    );
    updateTasks(updated);
  };

  const deleteTask = (id: string) => {
    updateTasks(tasks.filter(t => t.id !== id));
  };

  const openTasks = tasks.filter(t => t.status !== 'erledigt');
  const doneTasks = tasks.filter(t => t.status === 'erledigt');

  if (tasks.length === 0) {
    return (
      <ClientPortalLayout>
        <div className="max-w-2xl mx-auto">
          <EmptyState
            icon={ClipboardList}
            title="Deine Aufgaben"
            description="Hier erscheinen deine nächsten Schritte aus dem Finanz-Coach – damit nichts vergessen geht."
          />
        </div>
      </ClientPortalLayout>
    );
  }

  const TaskCard = ({ task }: { task: CoachTask }) => {
    const isDone = task.status === 'erledigt';
    const ModIcon = moduleIcons[task.module] || ClipboardList;

    return (
      <Card className={cn('transition-all', isDone && 'opacity-60')}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => toggleTask(task.id)}
              className="mt-0.5 shrink-0 text-primary"
            >
              {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium text-foreground', isDone && 'line-through')}>{task.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="muted" className="text-[10px] gap-1">
                  <ModIcon className="h-3 w-3" />
                  {task.module}
                </Badge>
              </div>
            </div>
            <button
              onClick={() => deleteTask(task.id)}
              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ClientPortalLayout>
      <ScreenHeader title="Meine Aufgaben" showBack backTo="/app/client-portal" />
      <div className="max-w-2xl mx-auto space-y-4 p-4 pb-8">
        {openTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">
              Offen ({openTasks.length})
            </p>
            {openTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}

        {doneTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">
              Erledigt ({doneTasks.length})
            </p>
            {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}
