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
  if (days < 0) return { label: `${Math.abs(days)}d überfällig`, color: 'bg-destructive text-destructive-foreground' };
  if (days === 0) return { label: 'Heute fällig', color: 'bg-destructive text-destructive-foreground' };
  if (days <= 3) return { label: `${days}d übrig`, color: 'bg-orange-500 text-white' };
  if (days <= 7) return { label: `${days}d übrig`, color: 'bg-orange-400 text-white' };
  return { label: `${days}d übrig`, color: 'bg-primary/15 text-primary' };
}

export function TaskCard({
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
    <Card className={cn(
      'transition-all relative overflow-hidden border-0 shadow-sm',
      task.is_completed && 'opacity-50',
      overdue && !task.is_completed && 'ring-1 ring-destructive/30'
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
            <span className="text-base font-bold text-primary">+50 XP ✨</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Large checkbox */}
          <button
            onClick={handleToggle}
            className="mt-0.5 shrink-0 h-7 w-7 flex items-center justify-center"
          >
            {task.is_completed ? (
              <motion.div
                initial={justCompleted ? { scale: 0.3 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </motion.div>
            ) : (
              <div className="h-6 w-6 rounded-full border-[2.5px] border-muted-foreground/30 transition-colors hover:border-primary/60" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-bold text-foreground transition-all',
              task.is_completed && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </p>

            {task.notes && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.notes}</p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {task.due_date && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3" />
                  {new Date(task.due_date).toLocaleDateString('de-CH')}
                </span>
              )}
              {daysBadge && (
                <Badge className={cn('text-[10px] px-1.5 py-0 h-4 font-semibold border-0', daysBadge.color)}>
                  {daysBadge.label}
                </Badge>
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
