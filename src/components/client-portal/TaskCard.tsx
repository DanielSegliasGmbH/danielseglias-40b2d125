import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Trash2, Clock } from 'lucide-react';
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

  return (
    <Card className={cn(
      'transition-all relative overflow-hidden',
      task.is_completed && 'opacity-60',
      overdue && 'border-destructive/40'
    )}>
      {/* Floating +XP */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            className="absolute top-2 right-12 z-10 pointer-events-none"
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <span className="text-sm font-bold text-primary">+50 XP</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button onClick={handleToggle} className="mt-0.5 shrink-0">
            {task.is_completed ? (
              <motion.div
                initial={justCompleted ? { scale: 0.5 } : false}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </motion.div>
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
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
