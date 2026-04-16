import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { JOURNEY_PHASES } from '@/config/journeyPhases';
import { Users, TrendingUp, Clock, CheckSquare, Activity, BarChart3 } from 'lucide-react';

export default function AdminUserAnalytics() {
  // Total users
  const { data: totalUsers = 0 } = useQuery({
    queryKey: ['analytics-total-users'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
      return count || 0;
    },
  });

  // Active users (logged in last 7 days) - approximate via gamification
  const { data: activeUsers = 0 } = useQuery({
    queryKey: ['analytics-active-users'],
    queryFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('gamification_actions')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', weekAgo);
      return count || 0;
    },
  });

  // Phase distribution
  const { data: phaseStats = [] } = useQuery({
    queryKey: ['analytics-phase-dist'],
    queryFn: async () => {
      const { data } = await supabase.from('user_journey').select('current_phase');
      const counts: Record<number, number> = {};
      (data || []).forEach((r: any) => {
        counts[r.current_phase] = (counts[r.current_phase] || 0) + 1;
      });
      return JOURNEY_PHASES.map(p => ({
        ...p,
        count: counts[p.phase] || 0,
      }));
    },
  });

  // Most completed tasks
  const { data: topTasks = [] } = useQuery({
    queryKey: ['analytics-top-tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('client_tasks')
        .select('title')
        .eq('is_completed', true)
        .limit(500);
      const counts: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        const t = r.title?.trim();
        if (t) counts[t] = (counts[t] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([title, count]) => ({ title, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    },
  });

  // Feature usage
  const { data: featureUsage = [] } = useQuery({
    queryKey: ['analytics-feature-usage'],
    queryFn: async () => {
      const { data } = await supabase.from('feature_unlocks').select('feature_key');
      const counts: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        counts[r.feature_key] = (counts[r.feature_key] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);
    },
  });

  // Coach completion rate
  const { data: coachStats = { total: 0, completed: 0 } } = useQuery({
    queryKey: ['analytics-coach'],
    queryFn: async () => {
      const { count: total } = await supabase.from('coach_progress').select('id', { count: 'exact', head: true });
      const { count: completed } = await supabase.from('coach_progress').select('id', { count: 'exact', head: true }).eq('status', 'completed');
      return { total: total || 0, completed: completed || 0 };
    },
  });

  // Gamification stats
  const { data: xpStats = { total: 0, avg: 0 } } = useQuery({
    queryKey: ['analytics-xp'],
    queryFn: async () => {
      const { data } = await supabase.from('gamification_actions').select('points_awarded');
      const total = (data || []).reduce((s: number, r: any) => s + (r.points_awarded || 0), 0);
      const uniqueUsers = new Set((data || []).map((r: any) => r.user_id)).size;
      return { total, avg: uniqueUsers > 0 ? Math.round(total / uniqueUsers) : 0 };
    },
  });

  const totalPhaseUsers = phaseStats.reduce((s, p) => s + p.count, 0);

  return (
    <AppLayout>
      <ScreenHeader title="Nutzer-Analytics" showBack backTo="/app" />
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-[10px] text-muted-foreground">Nutzer total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Activity className="h-5 w-5 text-success mx-auto mb-1" />
              <p className="text-2xl font-bold">{activeUsers}</p>
              <p className="text-[10px] text-muted-foreground">Aktiv (7 Tage)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{xpStats.total.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">XP gesamt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <CheckSquare className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">
                {coachStats.total > 0 ? Math.round((coachStats.completed / coachStats.total) * 100) : 0}%
              </p>
              <p className="text-[10px] text-muted-foreground">Coach-Abschluss</p>
            </CardContent>
          </Card>
        </div>

        {/* Phase Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4" /> Phasen-Verteilung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {phaseStats.map(p => {
              const pct = totalPhaseUsers > 0 ? Math.round((p.count / totalPhaseUsers) * 100) : 0;
              return (
                <div key={p.phase} className="flex items-center gap-3">
                  <span className="text-sm w-6">{p.emoji}</span>
                  <span className="text-xs font-medium w-24 truncate">{p.name}</span>
                  <div className="flex-1 bg-muted rounded-full h-2.5">
                    <div className="bg-primary rounded-full h-2.5 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-bold w-10 text-right">{p.count}</span>
                  <span className="text-[10px] text-muted-foreground w-10 text-right">{pct}%</span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Tasks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Häufigste Aufgaben</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {topTasks.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{t.title}</span>
                    <Badge variant="secondary" className="ml-2">{t.count}×</Badge>
                  </div>
                ))}
                {topTasks.length === 0 && <p className="text-xs text-muted-foreground">Keine Daten</p>}
              </div>
            </CardContent>
          </Card>

          {/* Feature Usage */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Feature-Nutzung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {featureUsage.map(f => (
                  <div key={f.key} className="flex items-center justify-between text-xs">
                    <span className="font-mono truncate flex-1">{f.key}</span>
                    <Badge variant="secondary" className="ml-2">{f.count}</Badge>
                  </div>
                ))}
                {featureUsage.length === 0 && <p className="text-xs text-muted-foreground">Keine Daten</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
