import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGamification } from '@/hooks/useGamification';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  CalendarDays, Clock, AlertTriangle, ArrowRight,
  ChevronLeft, ChevronRight, CheckCircle2,
} from 'lucide-react';
import { useEffect, useRef } from 'react';

// ── Swiss financial calendar ──
interface CalendarEvent {
  month: number; // 1-12
  day: number;
  title: string;
  description: string;
  type: 'deadline' | 'opportunity' | 'reminder';
  cta?: { label: string; path: string };
}

const SWISS_EVENTS: CalendarEvent[] = [
  { month: 3, day: 31, title: 'Steuererklärung Frist', description: 'Prüfe die Frist in deinem Kanton. Verlängerung beantragen ist meist kostenlos.', type: 'deadline' },
  { month: 9, day: 30, title: 'KK-Prämien werden kommuniziert', description: 'Die Krankenkassen-Prämien für nächstes Jahr werden veröffentlicht. Vergleiche jetzt.', type: 'reminder' },
  { month: 11, day: 30, title: 'Krankenkasse wechseln', description: 'Letzte Möglichkeit, die Krankenkasse für nächstes Jahr zu wechseln.', type: 'deadline' },
  { month: 12, day: 31, title: 'Säule 3a Einzahlung', description: 'Letzte Möglichkeit für Einzahlungen in die Säule 3a dieses Jahr.', type: 'opportunity', cta: { label: 'Jetzt handeln', path: '/app/client-portal/tools/vergleichsrechner-3a' } },
  { month: 12, day: 31, title: 'PK-Einkauf für Steuerabzug', description: 'Letzter Tag für freiwillige Pensionskassen-Einkäufe mit Steuerabzug.', type: 'opportunity' },
  { month: 1, day: 1, title: 'Neue KK-Prämien gelten', description: 'Die neuen Krankenkassen-Prämien treten in Kraft.', type: 'reminder' },
];

// Quarterly reminders
const QUARTERLY_EVENTS: CalendarEvent[] = [
  { month: 3, day: 31, title: 'Budget-Review Q1', description: 'Quartals-Check: Wie steht dein Budget?', type: 'reminder', cta: { label: 'Budget öffnen', path: '/app/client-portal/budget' } },
  { month: 6, day: 30, title: 'Budget-Review Q2', description: 'Quartals-Check: Wie steht dein Budget?', type: 'reminder', cta: { label: 'Budget öffnen', path: '/app/client-portal/budget' } },
  { month: 9, day: 30, title: 'Budget-Review Q3', description: 'Quartals-Check: Wie steht dein Budget?', type: 'reminder', cta: { label: 'Budget öffnen', path: '/app/client-portal/budget' } },
  { month: 12, day: 31, title: 'Budget-Review Q4', description: 'Quartals-Check: Wie steht dein Budget?', type: 'reminder', cta: { label: 'Budget öffnen', path: '/app/client-portal/budget' } },
  { month: 3, day: 15, title: 'Snapshot-Erinnerung', description: 'Erstelle einen neuen Finanz-Snapshot.', type: 'reminder', cta: { label: 'Snapshot', path: '/app/client-portal/snapshot' } },
  { month: 6, day: 15, title: 'Snapshot-Erinnerung', description: 'Erstelle einen neuen Finanz-Snapshot.', type: 'reminder', cta: { label: 'Snapshot', path: '/app/client-portal/snapshot' } },
  { month: 9, day: 15, title: 'Snapshot-Erinnerung', description: 'Erstelle einen neuen Finanz-Snapshot.', type: 'reminder', cta: { label: 'Snapshot', path: '/app/client-portal/snapshot' } },
  { month: 12, day: 15, title: 'Snapshot-Erinnerung', description: 'Erstelle einen neuen Finanz-Snapshot.', type: 'reminder', cta: { label: 'Snapshot', path: '/app/client-portal/snapshot' } },
];

const ALL_SWISS = [...SWISS_EVENTS, ...QUARTERLY_EVENTS];

interface PersonalEvent {
  date: Date;
  title: string;
  type: 'task' | 'goal' | 'plan';
  path?: string;
}

const MONTHS_DE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
const DAYS_DE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function getDaysUntil(targetMonth: number, targetDay: number): number {
  const now = new Date();
  const year = now.getFullYear();
  let target = new Date(year, targetMonth - 1, targetDay);
  if (target < now) target = new Date(year + 1, targetMonth - 1, targetDay);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getNextOccurrence(month: number, day: number): Date {
  const now = new Date();
  const year = now.getFullYear();
  let d = new Date(year, month - 1, day);
  if (d < now) d = new Date(year + 1, month - 1, day);
  return d;
}

const typeColors = {
  deadline: { dot: 'bg-destructive', text: 'text-destructive', bg: 'bg-destructive/10' },
  opportunity: { dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  reminder: { dot: 'bg-primary', text: 'text-primary', bg: 'bg-primary/10' },
  task: { dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-500/10' },
  goal: { dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-500/10' },
  plan: { dot: 'bg-blue-500', text: 'text-blue-600', bg: 'bg-blue-500/10' },
};

export default function ClientPortalCalendar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const { profile } = useMetaProfile();
  const xpAwarded = useRef(false);

  // Award XP on first view
  useEffect(() => {
    if (user && !xpAwarded.current) {
      xpAwarded.current = true;
      const key = `calendar_viewed_${user.id}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, 'true');
        awardPoints('tool_used', 'finanz-kalender');
      }
    }
  }, [user]);

  // Personal events: tasks with due dates
  const { data: tasks = [] } = useQuery({
    queryKey: ['calendar-tasks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('client_tasks')
        .select('id, title, due_date')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .not('due_date', 'is', null)
        .order('due_date');
      return data || [];
    },
    enabled: !!user,
  });

  // Goals with target dates
  const { data: goals = [] } = useQuery({
    queryKey: ['calendar-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('client_goals')
        .select('id, title, target_date')
        .eq('user_id', user.id)
        .eq('is_completed', false)
        .not('target_date', 'is', null);
      return data || [];
    },
    enabled: !!user,
  });

  const personalEvents: PersonalEvent[] = useMemo(() => {
    const events: PersonalEvent[] = [];
    tasks.forEach(t => {
      if (t.due_date) events.push({ date: new Date(t.due_date), title: t.title, type: 'task', path: '/app/client-portal/tasks' });
    });
    goals.forEach(g => {
      if (g.target_date) events.push({ date: new Date(g.target_date), title: g.title, type: 'goal', path: '/app/client-portal/goals' });
    });
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [tasks, goals]);

  // Calendar month navigation
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // Convert to Mon=0

    const days: { day: number; events: { type: string }[] }[] = [];
    // Padding
    for (let i = 0; i < startDow; i++) days.push({ day: 0, events: [] });

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const evts: { type: string }[] = [];
      // Swiss events
      ALL_SWISS.forEach(e => {
        if (e.month === viewMonth + 1 && e.day === d) evts.push({ type: e.type });
      });
      // Personal events
      personalEvents.forEach(pe => {
        if (pe.date.getMonth() === viewMonth && pe.date.getFullYear() === viewYear && pe.date.getDate() === d) {
          evts.push({ type: pe.type });
        }
      });
      days.push({ day: d, events: evts });
    }
    return days;
  }, [viewMonth, viewYear, personalEvents]);

  // All upcoming events sorted
  const upcomingEvents = useMemo(() => {
    const items: { date: Date; title: string; description: string; type: string; cta?: { label: string; path: string }; daysUntil: number }[] = [];

    ALL_SWISS.forEach(e => {
      const d = getDaysUntil(e.month, e.day);
      const date = getNextOccurrence(e.month, e.day);
      items.push({ date, title: e.title, description: e.description, type: e.type, cta: e.cta, daysUntil: d });
    });

    personalEvents.forEach(pe => {
      const d = Math.ceil((pe.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (d >= 0) {
        items.push({ date: pe.date, title: pe.title, description: '', type: pe.type, cta: pe.path ? { label: 'Öffnen', path: pe.path } : undefined, daysUntil: d });
      }
    });

    return items.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [personalEvents]);

  const nextDeadline = upcomingEvents[0];

  // 3a remaining amount
    const maxSaeule3a = 7056;
    const remaining3a = maxSaeule3a;

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Finanz-Kalender
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Wichtige Termine & Fristen im Überblick</p>
        </div>

        {/* SECTION 1: Next deadline */}
        {nextDeadline && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={cn(
              "border-2 overflow-hidden",
              nextDeadline.daysUntil <= 7 ? "border-destructive/50 bg-destructive/5" :
              nextDeadline.daysUntil <= 30 ? "border-amber-500/50 bg-amber-500/5" :
              "border-primary/30 bg-primary/5"
            )}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nächste Deadline</p>
                    <h2 className="text-lg font-bold text-foreground">{nextDeadline.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {nextDeadline.title.includes('3a') ? (
                        <>Letzte Möglichkeit für dieses Jahr. Du hast noch CHF {remaining3a.toLocaleString('de-CH')} Potenzial.</>
                      ) : nextDeadline.description}
                    </p>
                  </div>
                  <div className={cn(
                    "text-center px-3 py-2 rounded-xl shrink-0",
                    nextDeadline.daysUntil <= 7 ? "bg-destructive/10" :
                    nextDeadline.daysUntil <= 30 ? "bg-amber-500/10" : "bg-primary/10"
                  )}>
                    <p className={cn(
                      "text-2xl font-black",
                      nextDeadline.daysUntil <= 7 ? "text-destructive" :
                      nextDeadline.daysUntil <= 30 ? "text-amber-600 dark:text-amber-400" : "text-primary"
                    )}>
                      {nextDeadline.daysUntil}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Tage</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {nextDeadline.date.toLocaleDateString('de-CH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {nextDeadline.cta && (
                  <Button size="sm" className="gap-1.5" onClick={() => navigate(nextDeadline.cta!.path)}>
                    {nextDeadline.cta.label} <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* MONTH VIEW */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-semibold text-foreground">
                {MONTHS_DE[viewMonth]} {viewYear}
              </p>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1">
              {DAYS_DE.map(d => (
                <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
              ))}
              {calendarDays.map((cell, i) => {
                const isToday = cell.day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
                return (
                  <div
                    key={i}
                    className={cn(
                      "relative text-center py-1.5 rounded-lg text-xs",
                      cell.day === 0 && "invisible",
                      isToday && "bg-primary/10 font-bold text-primary",
                      !isToday && "text-foreground",
                    )}
                  >
                    {cell.day > 0 && cell.day}
                    {cell.events.length > 0 && (
                      <div className="flex gap-0.5 justify-center mt-0.5">
                        {cell.events.slice(0, 3).map((e, j) => (
                          <span key={j} className={cn("w-1 h-1 rounded-full", typeColors[e.type as keyof typeof typeColors]?.dot || 'bg-muted-foreground')} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 justify-center pt-1">
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Fristen</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Chancen</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Persönlich</span>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> Erinnerung</span>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Upcoming events */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Kommende Termine</p>
          {upcomingEvents.slice(0, 12).map((evt, i) => {
            const colors = typeColors[evt.type as keyof typeof typeColors] || typeColors.reminder;
            return (
              <motion.div
                key={`${evt.title}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card className="hover:bg-accent/30 transition-colors">
                  <CardContent className="p-3 flex items-start gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", colors.bg)}>
                      {evt.type === 'deadline' ? <AlertTriangle className={cn("h-4 w-4", colors.text)} /> :
                       evt.type === 'opportunity' ? <CheckCircle2 className={cn("h-4 w-4", colors.text)} /> :
                       <Clock className={cn("h-4 w-4", colors.text)} />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground truncate">{evt.title}</p>
                        <span className={cn(
                          "text-xs font-medium shrink-0 px-2 py-0.5 rounded-full",
                          evt.daysUntil <= 7 ? "bg-destructive/10 text-destructive" :
                          evt.daysUntil <= 30 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {evt.daysUntil === 0 ? 'Heute!' : `${evt.daysUntil} Tage`}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {evt.date.toLocaleDateString('de-CH', { day: 'numeric', month: 'long' })}
                      </p>
                      {evt.description && (
                        <p className="text-xs text-muted-foreground/70 line-clamp-2 mt-0.5">{evt.description}</p>
                      )}
                      {evt.cta && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs px-2 mt-1 gap-1"
                          onClick={() => navigate(evt.cta!.path)}
                        >
                          {evt.cta.label} <ArrowRight className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ClientPortalLayout>
  );
}
