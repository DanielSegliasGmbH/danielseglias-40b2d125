import { useState } from 'react';
import { useHabitTracker } from '@/hooks/useHabitTracker';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { PageHeader } from '@/components/client-portal/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Plus, Flame, Trash2, X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const EMOJI_PRESETS = ['💰', '📊', '🍳', '📝', '🚫', '🏋️', '📚', '🎯', '💪', '🧘', '🚶', '💡'];

export default function ClientPortalHabits() {
  const {
    habits,
    weekDates,
    isChecked,
    weekStats,
    streaks,
    toggleHabit,
    addHabit,
    deleteHabit,
    isLoading,
  } = useHabitTracker();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('💰');
  const [newFrequency, setNewFrequency] = useState('daily');

  const today = new Date().toISOString().slice(0, 10);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addHabit.mutate(
      { name: newName.trim(), emoji: newEmoji, frequency: newFrequency },
      { onSuccess: () => { setNewName(''); setShowAdd(false); } }
    );
  };

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
        <PageHeader title="🔁 Gewohnheiten" subtitle="Kleine Routinen mit grosser Wirkung" />
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setShowAdd(v => !v)}
          >
            {showAdd ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {showAdd ? 'Schliessen' : 'Neue'}
          </Button>
        </div>

        {/* Add custom habit */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold text-foreground">Eigene Gewohnheit</p>
                <div className="flex gap-2">
                  <div className="flex gap-1 flex-wrap">
                    {EMOJI_PRESETS.map(e => (
                      <button
                        key={e}
                        onClick={() => setNewEmoji(e)}
                        className={cn(
                          "w-8 h-8 rounded-lg text-base flex items-center justify-center transition-colors",
                          newEmoji === e ? "bg-primary/10 ring-2 ring-primary" : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="z.B. 10 Minuten Finanz-Podcast"
                  maxLength={80}
                  className="text-base"
                />
                <Select value={newFrequency} onValueChange={setNewFrequency}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekdays">Wochentags (Mo-Fr)</SelectItem>
                    <SelectItem value="weekly">Wöchentlich (Mo)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAdd}
                  disabled={!newName.trim() || addHabit.isPending}
                  className="w-full"
                >
                  Gewohnheit hinzufügen
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Weekly Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">Diese Woche</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {weekStats.checked}/{weekStats.total}
                </span>
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  weekStats.rate >= 80 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                  weekStats.rate >= 50 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                  "bg-muted text-muted-foreground"
                )}>
                  {weekStats.rate}%
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: `${weekStats.rate}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Habit Grid */}
        <Card>
          <CardContent className="p-4 space-y-1">
            {/* Day headers */}
            <div className="grid items-center gap-0.5" style={{ gridTemplateColumns: 'minmax(110px, 1.4fr) repeat(7, 30px) 28px' }}>
              <div />
              {DAYS_SHORT.map((d, i) => {
                const dateStr = weekDates[i];
                const isToday = dateStr === today;
                return (
                  <div key={d} className={cn(
                    "text-center text-[10px] font-medium py-1 rounded",
                    isToday ? "text-primary font-bold" : "text-muted-foreground"
                  )}>
                    <span>{d}</span>
                    <br />
                    <span className="text-[9px]">{new Date(dateStr).getDate()}</span>
                  </div>
                );
              })}
              <div />
            </div>

            {/* Habit rows */}
            {habits.map(habit => {
              const streak = streaks[habit.id] || 0;
              return (
                <div
                  key={habit.id}
                  className="grid items-center gap-0.5 py-1.5 border-t border-border/30"
                  style={{ gridTemplateColumns: 'minmax(110px, 1.4fr) repeat(7, 30px) 28px' }}
                >
                  {/* Label */}
                  <div className="min-w-0 pr-1.5">
                    <p className="text-xs font-medium text-foreground leading-tight break-words" title={`${habit.emoji} ${habit.name}`}>
                      <span className="mr-1">{habit.emoji}</span>{habit.name}
                    </p>
                    {streak > 0 && (
                      <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                        <Flame className="h-2.5 w-2.5 text-amber-500" />
                        {streak} {streak === 1 ? 'Tag' : 'Tage'}
                      </p>
                    )}
                  </div>

                  {/* Day cells */}
                  {weekDates.map((date, i) => {
                    const dow = new Date(date).getDay();
                    const disabled =
                      (habit.frequency === 'weekdays' && (dow === 0 || dow === 6)) ||
                      (habit.frequency === 'weekly' && dow !== 1);
                    const checked = isChecked(habit.id, date);
                    const isFuture = date > today;

                    return (
                      <button
                        key={date}
                        disabled={disabled || isFuture || toggleHabit.isPending}
                        onClick={() => toggleHabit.mutate({ habitId: habit.id, date })}
                        className={cn(
                          "w-[30px] h-9 rounded-md flex items-center justify-center transition-all",
                          disabled ? "bg-transparent" :
                          checked ? "bg-emerald-500/20" :
                          isFuture ? "bg-muted/20" :
                          "bg-muted/40 hover:bg-muted/60 active:scale-95"
                        )}
                      >
                        {disabled ? null :
                         checked ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> :
                         isFuture ? <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" /> :
                         <span className="w-4 h-4 rounded border-2 border-muted-foreground/20" />}
                      </button>
                    );
                  })}

                  {/* Delete */}
                  <button
                    onClick={() => deleteHabit.mutate(habit.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })}

            {habits.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                Keine aktiven Gewohnheiten. Erstelle deine erste!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Streaks */}
        {habits.some(h => (streaks[h.id] || 0) > 0) && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-500" /> Aktive Streaks
              </p>
              <div className="space-y-1.5">
                {habits
                  .filter(h => (streaks[h.id] || 0) > 0)
                  .sort((a, b) => (streaks[b.id] || 0) - (streaks[a.id] || 0))
                  .map(h => (
                    <div key={h.id} className="flex items-center justify-between py-1">
                      <span className="text-xs text-foreground">
                        {h.emoji} {h.name}
                      </span>
                      <span className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full",
                        (streaks[h.id] || 0) >= 30 ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                        (streaks[h.id] || 0) >= 7 ? "bg-primary/10 text-primary" :
                        "bg-muted text-muted-foreground"
                      )}>
                        🔥 {streaks[h.id]} Tage
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* XP Info */}
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">XP-Belohnungen:</strong>{' '}
              Gewohnheit abhaken +5 XP · Alle an einem Tag +10 XP Bonus ·
              7-Tage-Streak +25 XP · 30-Tage-Streak +100 XP
            </p>
          </CardContent>
        </Card>
      </div>
    </ClientPortalLayout>
  );
}
