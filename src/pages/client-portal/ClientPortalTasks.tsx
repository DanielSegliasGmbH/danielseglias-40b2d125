import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ClipboardList, CheckCircle2, Circle, Brain, Trash2, BookOpen, Trophy, Clock,
  Loader2, Calendar, Eye, Target, LayoutGrid, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoachTask {
  id: string;
  title: string;
  description: string;
  status: string;
  module: string;
  created_at: string;
  deadline?: string | null;
}

interface CoachInsight {
  id: string;
  title: string;
  description: string;
  module: string;
  created_at: string;
}

const moduleIcons: Record<string, React.ElementType> = {
  mindset: Brain,
  klarheit: Eye,
  ziele: Target,
  struktur: LayoutGrid,
  absicherung: Shield,
};

function useLocalList<T>(key: string) {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) try { setItems(JSON.parse(raw)); } catch { /* ignore */ }
  }, [key]);
  const update = (next: T[]) => { setItems(next); localStorage.setItem(key, JSON.stringify(next)); };
  return { items, update };
}

export default function ClientPortalTasks() {
  const { t } = useTranslation();
  const { items: tasks, update: updateTasks } = useLocalList<CoachTask>('coach_tasks');
  const { items: insights, update: updateInsights } = useLocalList<CoachInsight>('coach_insights');
  const { items: achievements, update: updateAchievements } = useLocalList<CoachInsight>('coach_achievements');

  const toggleTask = (id: string) => {
    updateTasks(tasks.map(t =>
      t.id === id
        ? { ...t, status: t.status === 'erledigt' ? 'offen' : t.status === 'in Bearbeitung' ? 'erledigt' : 'in Bearbeitung' }
        : t
    ));
  };

  const cycleStatus = (id: string) => {
    const order = ['offen', 'in Bearbeitung', 'erledigt'];
    updateTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const idx = order.indexOf(t.status);
      return { ...t, status: order[(idx + 1) % order.length] };
    }));
  };

  const deleteTask = (id: string) => updateTasks(tasks.filter(t => t.id !== id));
  const deleteInsight = (id: string) => updateInsights(insights.filter(i => i.id !== id));
  const deleteAchievement = (id: string) => updateAchievements(achievements.filter(a => a.id !== id));

  const openTasks = tasks.filter(t => t.status !== 'erledigt');
  const inProgressTasks = tasks.filter(t => t.status === 'in Bearbeitung');
  const doneTasks = tasks.filter(t => t.status === 'erledigt');

  const statusColor = (s: string) => {
    if (s === 'erledigt') return 'text-green-600';
    if (s === 'in Bearbeitung') return 'text-amber-600';
    return 'text-muted-foreground';
  };

  const statusIcon = (s: string) => {
    if (s === 'erledigt') return <CheckCircle2 className="h-5 w-5" />;
    if (s === 'in Bearbeitung') return <Loader2 className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
  };

  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
  };

  const isOverdue = (task: CoachTask) => {
    if (!task.deadline || task.status === 'erledigt') return false;
    return new Date(task.deadline) < new Date();
  };

  const TaskCard = ({ task }: { task: CoachTask }) => {
    const isDone = task.status === 'erledigt';
    const ModIcon = moduleIcons[task.module] || ClipboardList;
    const overdue = isOverdue(task);

    return (
      <Card className={cn('transition-all', isDone && 'opacity-60', overdue && 'border-destructive/40')}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <button onClick={() => cycleStatus(task.id)} className={cn('mt-0.5 shrink-0', statusColor(task.status))}>
              {statusIcon(task.status)}
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm font-medium text-foreground', isDone && 'line-through')}>{task.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="muted" className="text-[10px] gap-1">
                  <ModIcon className="h-3 w-3" /> {task.module}
                </Badge>
                <span className={cn('text-[10px]', statusColor(task.status))}>{task.status}</span>
                {task.deadline && (
                  <span className={cn('text-[10px] flex items-center gap-0.5', overdue ? 'text-destructive' : 'text-muted-foreground')}>
                    <Calendar className="h-3 w-3" /> {formatDate(task.deadline)}
                  </span>
                )}
              </div>
            </div>
            <button onClick={() => deleteTask(task.id)} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const InsightCard = ({ item, onDelete }: { item: CoachInsight; onDelete: () => void }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{item.description}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{formatDate(item.created_at)}</p>
          </div>
          <button onClick={onDelete} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const AchievementCard = ({ item, onDelete }: { item: CoachInsight; onDelete: () => void }) => (
    <Card className="border-primary/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Trophy className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-3">{item.description}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{formatDate(item.created_at)}</p>
          </div>
          <button onClick={onDelete} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors p-1">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );

  const totalItems = tasks.length + insights.length + achievements.length;

  if (totalItems === 0) {
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

  return (
    <ClientPortalLayout>
      <ScreenHeader title="Meine Aufgaben" showBack backTo="/app/client-portal" />
      <div className="max-w-2xl mx-auto p-4 pb-8">
        <Tabs defaultValue="tasks">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="tasks" className="flex-1 text-xs">
              Aufgaben {tasks.length > 0 && `(${tasks.length})`}
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex-1 text-xs">
              Erkenntnisse {insights.length > 0 && `(${insights.length})`}
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex-1 text-xs">
              Erfolge {achievements.length > 0 && `(${achievements.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            {openTasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Offen ({openTasks.length})</p>
                {openTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            )}
            {doneTasks.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Erledigt ({doneTasks.length})</p>
                {doneTasks.map(task => <TaskCard key={task.id} task={task} />)}
              </div>
            )}
            {tasks.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">Noch keine Aufgaben vorhanden.</p>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-3">
            {insights.length > 0 ? (
              insights.map(item => <InsightCard key={item.id} item={item} onDelete={() => deleteInsight(item.id)} />)
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Speichere Erkenntnisse aus deinen Coach-Analysen.</p>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-3">
            {achievements.length > 0 ? (
              achievements.map(item => <AchievementCard key={item.id} item={item} onDelete={() => deleteAchievement(item.id)} />)
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Hier erscheinen deine Erfolge aus den Reflexionen.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientPortalLayout>
  );
}
