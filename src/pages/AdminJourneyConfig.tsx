import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { JOURNEY_PHASES } from '@/config/journeyPhases';
import { Users, TrendingUp, Clock, UserPlus } from 'lucide-react';

export default function AdminJourneyConfig() {
  const qc = useQueryClient();
  const [overrideUserId, setOverrideUserId] = useState('');
  const [overridePhase, setOverridePhase] = useState(0);

  // Phase overrides
  const { data: overrides = [] } = useQuery({
    queryKey: ['admin-phase-overrides'],
    queryFn: async () => {
      const { data } = await supabase
        .from('journey_phase_overrides')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Journey analytics: users per phase
  const { data: journeyStats = [] } = useQuery({
    queryKey: ['admin-journey-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_journey')
        .select('current_phase');
      // Count per phase
      const counts: Record<number, number> = {};
      (data || []).forEach((r: any) => {
        counts[r.current_phase] = (counts[r.current_phase] || 0) + 1;
      });
      return JOURNEY_PHASES.map(p => ({
        phase: p.phase,
        name: p.name,
        emoji: p.emoji,
        count: counts[p.phase] || 0,
      }));
    },
  });

  // Feature unlock counts
  const { data: featureStats = [] } = useQuery({
    queryKey: ['admin-feature-stats'],
    queryFn: async () => {
      const { data } = await supabase
        .from('feature_unlocks')
        .select('feature_key, phase');
      const counts: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        counts[r.feature_key] = (counts[r.feature_key] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    },
  });

  const totalUsers = journeyStats.reduce((s, p) => s + p.count, 0);

  const addOverride = useMutation({
    mutationFn: async () => {
      if (!overrideUserId) return;
      await supabase.from('journey_phase_overrides').upsert({
        user_id: overrideUserId,
        override_phase: overridePhase,
        reason: 'Admin override',
      }, { onConflict: 'user_id' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-phase-overrides'] });
      setOverrideUserId('');
      toast.success('Override gespeichert');
    },
  });

  const removeOverride = async (id: string) => {
    await supabase.from('journey_phase_overrides').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-phase-overrides'] });
    toast.success('Override entfernt');
  };

  return (
    <AppLayout>
      <ScreenHeader title="Journey-Konfiguration" showBack backTo="/app" />
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <Tabs defaultValue="analytics">
          <TabsList className="w-full">
            <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
            <TabsTrigger value="phases" className="flex-1">Phasen</TabsTrigger>
            <TabsTrigger value="overrides" className="flex-1">Overrides</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4">
            {/* Phase Distribution */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" /> Nutzer pro Phase
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {journeyStats.map(p => {
                  const pct = totalUsers > 0 ? Math.round((p.count / totalUsers) * 100) : 0;
                  return (
                    <div key={p.phase} className="flex items-center gap-3">
                      <span className="text-sm w-6">{p.emoji}</span>
                      <span className="text-xs font-medium w-24">{p.name}</span>
                      <div className="flex-1 bg-muted rounded-full h-2.5">
                        <div
                          className="bg-primary rounded-full h-2.5 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold w-12 text-right">{p.count}</span>
                      <span className="text-[10px] text-muted-foreground w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
                <p className="text-xs text-muted-foreground pt-2">Total: {totalUsers} Nutzer</p>
              </CardContent>
            </Card>

            {/* Top unlocked features */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Meistgenutzte Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {featureStats.map(f => (
                    <div key={f.key} className="flex items-center justify-between text-xs">
                      <span className="font-mono">{f.key}</span>
                      <Badge variant="secondary">{f.count}</Badge>
                    </div>
                  ))}
                  {featureStats.length === 0 && (
                    <p className="text-xs text-muted-foreground">Noch keine Daten</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phases" className="space-y-3">
            {JOURNEY_PHASES.map(p => (
              <Card key={p.phase}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{p.emoji}</span>
                    <h3 className="font-bold text-sm">Phase {p.phase}: {p.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(p.gate).map(([k, v]) => (
                      <Badge key={k} variant="outline" className="text-[10px]">
                        {k}: {String(v)}
                      </Badge>
                    ))}
                    {Object.keys(p.gate).length === 0 && (
                      <Badge variant="outline" className="text-[10px]">Immer freigeschaltet</Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.featureKeys.map(k => (
                      <Badge key={k} variant="secondary" className="text-[10px] font-mono">{k}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="overrides" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Nutzer-Override hinzufügen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="User-ID"
                    value={overrideUserId}
                    onChange={e => setOverrideUserId(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={6}
                    value={overridePhase}
                    onChange={e => setOverridePhase(+e.target.value)}
                    className="w-20"
                  />
                  <Button onClick={() => addOverride.mutate()} disabled={!overrideUserId}>
                    <UserPlus className="h-4 w-4 mr-1" /> Setzen
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {overrides.map((o: any) => (
                <Card key={o.id}>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono">{o.user_id}</p>
                      <p className="text-xs text-muted-foreground">Phase {o.override_phase} — {o.reason}</p>
                    </div>
                    <Button size="sm" variant="destructive" onClick={() => removeOverride(o.id)}>Entfernen</Button>
                  </CardContent>
                </Card>
              ))}
              {overrides.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Overrides aktiv</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
