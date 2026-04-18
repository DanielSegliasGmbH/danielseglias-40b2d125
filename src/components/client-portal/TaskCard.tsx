import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, CalendarIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskRow {
  id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  source?: string | null;
}

function getDaysRemaining(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getDaysBadge(dueDateStr: string) {
  const days = getDaysRemaining(dueDateStr);
  if (days < 0) return { label: 'Überfällig!', variant: 'destructive' as const };
  if (days === 0) return { label: 'Heute fällig', variant: 'destructive' as const };
  if (days <= 3) return { label: `${days}d übrig`, variant: 'orange' as const };
  if (days <= 7) return { label: `${days}d übrig`, variant: 'orange' as const };
  return { label: `${days}d übrig`, variant: 'green' as const };
}

const badgeStyles = {
  destructive: 'bg-destructive/10 text-destructive',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export function TaskCard({
  task,
  index = 0,
  overdue,
  onToggle,
  onDelete,
}: {
  task: TaskRow;
  index?: number;
  overdue: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [showXP, setShowXP] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const handleToggle = () => {
    if (!task.is_completed) {
      setJustCompleted(true);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1800);
      setTimeout(() => setJustCompleted(false), 600);
    }
    onToggle();
  };

  const daysBadge = task.due_date && !task.is_completed ? getDaysBadge(task.due_date) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Card className={cn(
        'border border-border/50 rounded-xl overflow-hidden relative transition-all',
        task.is_completed && 'opacity-50',
        overdue && !task.is_completed && 'border-destructive/30'
      )}>
        {/* Floating +XP */}
        <AnimatePresence>
          {showXP && (
            <motion.div
              className="absolute top-2 right-12 z-10 pointer-events-none"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            >
              <span className="text-sm font-bold text-primary">+50 XP ✨</span>
            </motion.div>
          )}
        </AnimatePresence>

        <CardContent className="p-3.5">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <button
              onClick={handleToggle}
              className="mt-0.5 shrink-0 h-7 w-7 flex items-center justify-center"
              aria-label={task.is_completed ? 'Als offen markieren' : 'Als erledigt markieren'}
            >
              {task.is_completed || justCompleted ? (
                <motion.div
                  initial={justCompleted ? { scale: 0.3 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </motion.div>
              ) : (
                <div className="h-6 w-6 rounded-full border-[2.5px] border-muted-foreground/30 transition-colors hover:border-primary/60 active:scale-90" />
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <p className={cn(
                  'text-[15px] font-bold text-foreground leading-tight transition-all',
                  task.is_completed && 'line-through text-muted-foreground font-medium'
                )}>
                  {task.title}
                </p>
                {task.source === 'advisor' && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0 h-4 font-semibold border-0 bg-[hsl(60_15%_35%/0.15)] text-[hsl(60_15%_30%)] dark:text-[hsl(60_20%_70%)]"
                  >
                    Von Berater
                  </Badge>
                )}
              </div>

              {task.notes && !task.is_completed && (
                <p className="text-[13px] text-muted-foreground mt-0.5 line-clamp-1">{task.notes}</p>
              )}

              {(task.due_date || daysBadge) && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {task.due_date && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {new Date(task.due_date).toLocaleDateString('de-CH')}
                    </span>
                  )}
                  {daysBadge && (
                    <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0 h-4 font-semibold border-0', badgeStyles[daysBadge.variant])}>
                      {daysBadge.label}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Delete */}
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onDelete}>
              <Trash2 className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
