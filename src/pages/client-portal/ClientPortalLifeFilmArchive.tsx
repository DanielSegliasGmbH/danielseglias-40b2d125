import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Film, Plus, Calendar, TrendingUp, ChevronRight, GitCompare } from 'lucide-react';
import { PrivateValue } from '@/components/client-portal/PrivateValue';
import { Json } from '@/integrations/supabase/types';

interface FilmData {
  age: number;
  monthly_income: number;
  monthly_expenses: number;
  total_savings: number;
  life_goals: string[];
  desired_children: string;
  target_retirement_age: number;
  truth_mode: string;
  projected_difference?: number;
  peak_score_at_retirement?: number;
}

interface ArchiveEntry {
  id: string;
  film_data: FilmData;
  saved_at: string;
}

const fmtCHF = (v: number) =>
  `CHF ${Math.round(v).toLocaleString('de-CH')}`;

const fmtDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
};

function projectNetWorth(data: FilmData): number {
  const yearsToRetirement = (data.target_retirement_age || 65) - (data.age || 30);
  const monthlySavings = (data.monthly_income || 0) - (data.monthly_expenses || 0);
  const r = 0.04;
  return (data.total_savings || 0) * Math.pow(1 + r, yearsToRetirement) +
    Math.max(0, monthlySavings) * 12 * ((Math.pow(1 + r, yearsToRetirement) - 1) / r);
}

function parseFilmData(raw: Json): FilmData {
  const obj = raw as Record<string, unknown>;
  return {
    age: (obj.age as number) || 0,
    monthly_income: (obj.monthly_income as number) || 0,
    monthly_expenses: (obj.monthly_expenses as number) || 0,
    total_savings: (obj.total_savings as number) || 0,
    life_goals: (obj.life_goals as string[]) || [],
    desired_children: (obj.desired_children as string) || '0',
    target_retirement_age: (obj.target_retirement_age as number) || 65,
    truth_mode: (obj.truth_mode as string) || 'optimistic',
    projected_difference: obj.projected_difference as number | undefined,
    peak_score_at_retirement: obj.peak_score_at_retirement as number | undefined,
  };
}

export default function ClientPortalLifeFilmArchive() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: archives = [], isLoading } = useQuery({
    queryKey: ['life-film-archives', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('life_film_archives')
        .select('*')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => ({
        id: row.id,
        film_data: parseFilmData(row.film_data),
        saved_at: row.saved_at,
      })) as ArchiveEntry[];
    },
    enabled: !!user,
  });

  const archivesWithDelta = useMemo(() => {
    return archives.map((entry, idx) => {
      const prev = archives[idx + 1];
      let deltaNetWorth: number | null = null;
      let deltaPct: number | null = null;
      if (prev) {
        const currentNW = projectNetWorth(entry.film_data);
        const prevNW = projectNetWorth(prev.film_data);
        deltaNetWorth = currentNW - prevNW;
        deltaPct = prevNW !== 0 ? (deltaNetWorth / prevNW) * 100 : null;
      }
      return { ...entry, deltaNetWorth, deltaPct };
    });
  }, [archives]);

  const showReminder = useMemo(() => {
    if (archives.length === 0) return false;
    const last = new Date(archives[0].saved_at);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return last < threeMonthsAgo;
  }, [archives]);

  const monthsSinceLast = useMemo(() => {
    if (archives.length === 0) return 0;
    const last = new Date(archives[0].saved_at);
    const now = new Date();
    return Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 30));
  }, [archives]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const selectedEntries = useMemo(() => {
    return selectedIds.map(id => archives.find(a => a.id === id)).filter(Boolean) as ArchiveEntry[];
  }, [selectedIds, archives]);

  const COMPARE_ROWS = [
    { label: 'Alter', key: 'age' as const, fmt: (v: number) => `${v} J.`, isFinancial: false },
    { label: 'Einkommen', key: 'monthly_income' as const, fmt: fmtCHF, isFinancial: true },
    { label: 'Ausgaben', key: 'monthly_expenses' as const, fmt: fmtCHF, isFinancial: true },
    { label: 'Erspartes', key: 'total_savings' as const, fmt: fmtCHF, isFinancial: true },
    { label: 'Pension mit', key: 'target_retirement_age' as const, fmt: (v: number) => `${v} J.`, isFinancial: false },
  ];

  return (
    <ClientPortalLayout>
      <div className="max-w-lg mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-1 rounded-lg hover:bg-accent transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Film className="h-4 w-4 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Lebensfilm Archiv</h1>
            </div>
            <p className="text-xs text-muted-foreground">{archives.length} gespeicherte Filme</p>
          </div>
          {archives.length >= 2 && (
            <Button
              variant={compareMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setCompareMode(!compareMode); setSelectedIds([]); }}
              className="gap-1"
            >
              <GitCompare className="h-3.5 w-3.5" />
              {compareMode ? 'Abbrechen' : 'Vergleichen'}
            </Button>
          )}
        </div>

        {/* Reminder banner */}
        {showReminder && !compareMode && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="mb-4 border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-xl">⏰</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Dein letzter Lebensfilm ist {monthsSinceLast} Monate alt.
                  </p>
                  <p className="text-xs text-muted-foreground">Zeit für ein Update!</p>
                </div>
                <Button size="sm" onClick={() => navigate('/app/client-portal/life-film')} className="gap-1 shrink-0">
                  <Plus className="h-3.5 w-3.5" />
                  Neu
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Compare view */}
        {compareMode && selectedEntries.length === 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <Card className="border-2 border-primary/30">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-bold text-foreground text-center">Vergleich</h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="font-medium text-muted-foreground">&nbsp;</div>
                  <div className="font-medium text-muted-foreground">{fmtDate(selectedEntries[0].saved_at)}</div>
                  <div className="font-medium text-muted-foreground">{fmtDate(selectedEntries[1].saved_at)}</div>

                  {COMPARE_ROWS.map(row => {
                    const v1 = selectedEntries[0].film_data[row.key] as number || 0;
                    const v2 = selectedEntries[1].film_data[row.key] as number || 0;
                    const delta = v1 - v2;
                    return (
                      <div key={row.key} className="contents">
                        <div className="text-left font-medium text-muted-foreground py-1">{row.label}</div>
                        <div className="py-1">
                          <PrivateValue>{row.fmt(v1)}</PrivateValue>
                        </div>
                        <div className="py-1">
                          <PrivateValue>{row.fmt(v2)}</PrivateValue>
                          {delta !== 0 && row.isFinancial && (
                            <span className={cn(
                              'block text-[10px] font-medium',
                              delta > 0 ? 'text-emerald-600' : 'text-destructive'
                            )}>
                              {delta > 0 ? '+' : ''}{row.fmt(delta)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {compareMode && selectedEntries.length < 2 && (
          <div className="mb-4 text-center">
            <Badge variant="secondary" className="text-xs">
              Wähle 2 Filme zum Vergleichen ({selectedIds.length}/2)
            </Badge>
          </div>
        )}

        {/* Archive list */}
        {isLoading ? (
          <div className="py-20 text-center">
            <Film className="h-8 w-8 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Archiv wird geladen...</p>
          </div>
        ) : archives.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Film className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Noch keine Lebensfilme gespeichert.</p>
            <Button onClick={() => navigate('/app/client-portal/life-film')}>
              <Plus className="h-4 w-4 mr-2" />
              Ersten Lebensfilm erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {archivesWithDelta.map((entry, idx) => {
              const nw = projectNetWorth(entry.film_data);
              const isSelected = selectedIds.includes(entry.id);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      isSelected && 'ring-2 ring-primary border-primary'
                    )}
                    onClick={() => {
                      if (compareMode) {
                        toggleSelect(entry.id);
                      } else {
                        navigate('/app/client-portal/life-film-result', {
                          state: { archiveId: entry.id, archiveData: entry.film_data, readOnly: true }
                        });
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {compareMode && (
                          <div className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                          )}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm font-semibold text-foreground">{fmtDate(entry.saved_at)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{entry.film_data.age} Jahre</span>
                            <span>•</span>
                            <span>Pension: {entry.film_data.target_retirement_age}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <TrendingUp className="h-3 w-3 text-primary shrink-0" />
                            <span className="text-xs font-medium text-foreground">
                              <PrivateValue>{fmtCHF(nw)}</PrivateValue>
                            </span>
                            {entry.deltaNetWorth !== null && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  'text-[10px]',
                                  (entry.deltaNetWorth ?? 0) >= 0 ? 'text-emerald-600' : 'text-destructive'
                                )}
                              >
                                {(entry.deltaNetWorth ?? 0) >= 0 ? '↑' : '↓'} {entry.deltaPct !== null ? `${Math.abs(entry.deltaPct).toFixed(1)}%` : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!compareMode && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* New film button */}
        {archives.length > 0 && !compareMode && (
          <div className="mt-6">
            <Button className="w-full gap-2" onClick={() => navigate('/app/client-portal/life-film')}>
              <Plus className="h-4 w-4" />
              Neuen Lebensfilm erstellen
            </Button>
          </div>
        )}
      </div>
    </ClientPortalLayout>
  );
}
