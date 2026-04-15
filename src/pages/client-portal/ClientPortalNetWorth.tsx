import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, TrendingUp, TrendingDown, Landmark, Trash2, RefreshCw, ArrowUpRight, ArrowDownRight, ChevronRight, Calendar, ExternalLink, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/hooks/useGamification';
import { usePeakScore } from '@/hooks/usePeakScore';
import { PeakScoreImpact } from '@/components/client-portal/PeakScoreImpact';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';

const ASSET_CATEGORIES = [
  'Bargeld', 'Bankkonto', 'Säule 3a', 'Pensionskasse', 'Aktien/ETF', 'Immobilien', 'Sonstiges',
] as const;

const LIABILITY_CATEGORIES = ['Hypothek', 'Konsumkredit', 'Sonstiges'] as const;

const ASSET_ICONS: Record<string, string> = {
  'Bargeld': '💵', 'Bankkonto': '🏦', 'Säule 3a': '🔐', 'Pensionskasse': '🏛️',
  'Aktien/ETF': '📈', 'Immobilien': '🏠', 'Sonstiges': '📦',
};

const DONUT_COLORS = [
  'hsl(var(--primary))', '#34d399', '#f59e0b', '#6366f1',
  '#ec4899', '#14b8a6', '#8b5cf6',
];

const fmtCHF = (v: number) => `CHF ${v.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

// ─── XP Float animation ───
function XpFloat({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <motion.span
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -30 }}
      transition={{ duration: 1.2 }}
      className="absolute -top-2 right-2 text-xs font-bold text-primary z-10"
    >
      +25 XP
    </motion.span>
  );
}

// ─── Save snapshot helper ───
async function saveSnapshot(userId: string, entryType: 'asset' | 'liability', entryId: string, value: number) {
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from('net_worth_snapshots').upsert(
    { user_id: userId, entry_type: entryType, entry_id: entryId, value, snapshot_date: today },
    { onConflict: 'entry_id,snapshot_date' }
  );
}

// ─── Get last 6 months labels ───
function getLast6Months(): { label: string; key: string }[] {
  const months: { label: string; key: string }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      label: d.toLocaleDateString('de-CH', { month: 'short', year: '2-digit' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
    });
  }
  return months;
}

export default function ClientPortalNetWorth() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();
  const { monthlyExpenses } = usePeakScore();
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [liabilityDialogOpen, setLiabilityDialogOpen] = useState(false);
  const [detailEntry, setDetailEntry] = useState<any>(null);
  const [detailType, setDetailType] = useState<'asset' | 'liability'>('asset');
  const [quickUpdateId, setQuickUpdateId] = useState<string | null>(null);
  const [quickUpdateValue, setQuickUpdateValue] = useState('');
  const [xpFlashId, setXpFlashId] = useState<string | null>(null);
  const [lastAssetImpact, setLastAssetImpact] = useState<number | null>(null);
  const [showAssetImpact, setShowAssetImpact] = useState(false);

  // Asset form
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState<string>(ASSET_CATEGORIES[0]);
  const [assetValue, setAssetValue] = useState('');
  const [assetUrl, setAssetUrl] = useState('');

  // Liability form
  const [liabName, setLiabName] = useState('');
  const [liabCategory, setLiabCategory] = useState<string>(LIABILITY_CATEGORIES[0]);
  const [liabAmount, setLiabAmount] = useState('');
  const [liabUrl, setLiabUrl] = useState('');

  const { data: assets = [] } = useQuery({
    queryKey: ['net-worth-assets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('net_worth_assets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const { data: liabilities = [] } = useQuery({
    queryKey: ['net-worth-liabilities', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('net_worth_liabilities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Snapshots for chart
  const { data: snapshots = [] } = useQuery({
    queryKey: ['net-worth-snapshots', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const { data, error } = await supabase
        .from('net_worth_snapshots')
        .select('*')
        .eq('user_id', user.id)
        .gte('snapshot_date', sixMonthsAgo.toISOString().slice(0, 10))
        .order('snapshot_date', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Entry-specific snapshots for detail
  const { data: entrySnapshots = [] } = useQuery({
    queryKey: ['entry-snapshots', detailEntry?.id],
    queryFn: async () => {
      if (!detailEntry) return [];
      const { data, error } = await supabase
        .from('net_worth_snapshots')
        .select('*')
        .eq('entry_id', detailEntry.id)
        .order('snapshot_date', { ascending: true })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
    enabled: !!detailEntry,
  });

  const totalAssets = useMemo(() => assets.reduce((s: number, a: any) => s + Number(a.value), 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((s: number, l: any) => s + Number(l.amount), 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;

  // Net worth chart data
  const chartData = useMemo(() => {
    const months = getLast6Months();
    return months.map(m => {
      // Get the latest snapshot for each entry in that month
      const monthSnapshots = snapshots.filter((s: any) => s.snapshot_date.startsWith(m.key));
      if (monthSnapshots.length === 0) return { month: m.label, value: null };

      // Group by entry_id, take latest per entry
      const latestByEntry: Record<string, any> = {};
      monthSnapshots.forEach((s: any) => {
        if (!latestByEntry[s.entry_id] || s.snapshot_date > latestByEntry[s.entry_id].snapshot_date) {
          latestByEntry[s.entry_id] = s;
        }
      });

      let totalA = 0, totalL = 0;
      Object.values(latestByEntry).forEach((s: any) => {
        if (s.entry_type === 'asset') totalA += Number(s.value);
        else totalL += Number(s.value);
      });
      return { month: m.label, value: totalA - totalL };
    });
  }, [snapshots]);

  const validChartData = chartData.filter(d => d.value !== null);
  const chartTrending = validChartData.length >= 2
    ? (validChartData[validChartData.length - 1].value! >= validChartData[validChartData.length - 2].value! ? 'up' : 'down')
    : 'up';

  // Change vs last month
  const changeInfo = useMemo(() => {
    if (validChartData.length < 2) return null;
    const current = validChartData[validChartData.length - 1].value!;
    const prev = validChartData[validChartData.length - 2].value!;
    const diff = current - prev;
    const pct = prev !== 0 ? ((diff / Math.abs(prev)) * 100) : 0;
    return { diff, pct, up: diff >= 0 };
  }, [validChartData]);

  // Donut chart data
  const donutData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    assets.forEach((a: any) => {
      byCategory[a.category] = (byCategory[a.category] || 0) + Number(a.value);
    });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  }, [assets]);

  // ─── Mutations ───
  const addAsset = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const val = parseFloat(assetValue);
      const { data, error } = await supabase.from('net_worth_assets').insert({
        user_id: user.id,
        name: assetName,
        category: assetCategory,
        value: val,
        last_updated_date: new Date().toISOString().slice(0, 10),
      }).select('id').single();
      if (error) throw error;
      // Save initial snapshot
      await saveSnapshot(user.id, 'asset', data.id, val);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-assets'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth-snapshots'] });
      const val = parseFloat(assetValue);
      const impact = monthlyExpenses > 0 ? val / monthlyExpenses : null;
      setLastAssetImpact(impact ? Math.round(impact * 10) / 10 : null);
      setShowAssetImpact(true);
      setTimeout(() => setShowAssetImpact(false), 4000);
      toast.success('Vermögenswert hinzugefügt ✓');
      awardPoints('asset_added', `asset_${Date.now()}`);
      resetAssetForm();
      setAssetDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const addLiability = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const val = parseFloat(liabAmount);
      const { data, error } = await supabase.from('net_worth_liabilities').insert({
        user_id: user.id,
        name: liabName,
        category: liabCategory,
        amount: val,
      }).select('id').single();
      if (error) throw error;
      await saveSnapshot(user.id, 'liability', data.id, val);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth-snapshots'] });
      toast.success('Verbindlichkeit hinzugefügt ✓');
      resetLiabForm();
      setLiabilityDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const quickUpdate = useMutation({
    mutationFn: async ({ id, type, value }: { id: string; type: 'asset' | 'liability'; value: number }) => {
      if (!user) throw new Error('Not auth');
      if (type === 'asset') {
        const { error } = await supabase.from('net_worth_assets').update({
          value, last_updated_date: new Date().toISOString().slice(0, 10), updated_at: new Date().toISOString(),
        }).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('net_worth_liabilities').update({
          amount: value, updated_at: new Date().toISOString(),
        }).eq('id', id);
        if (error) throw error;
      }
      await saveSnapshot(user.id, type, id, value);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-assets'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth-liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth-snapshots'] });
      queryClient.invalidateQueries({ queryKey: ['entry-snapshots'] });
      toast.success('Wert aktualisiert ✓');
      awardPoints('asset_added', `update_${vars.id}_${Date.now()}`);
      setXpFlashId(vars.id);
      setTimeout(() => setXpFlashId(null), 1500);
      setQuickUpdateId(null);
      setQuickUpdateValue('');
    },
    onError: () => toast.error('Fehler beim Aktualisieren'),
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('net_worth_assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-assets'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth-snapshots'] });
      toast.success('Eintrag gelöscht');
      setDetailEntry(null);
    },
  });

  const deleteLiability = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('net_worth_liabilities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-liabilities'] });
      queryClient.invalidateQueries({ queryKey: ['net-worth-snapshots'] });
      toast.success('Eintrag gelöscht');
      setDetailEntry(null);
    },
  });

  const resetAssetForm = () => { setAssetName(''); setAssetCategory(ASSET_CATEGORIES[0]); setAssetValue(''); };
  const resetLiabForm = () => { setLiabName(''); setLiabCategory(LIABILITY_CATEGORIES[0]); setLiabAmount(''); };

  const openDetail = (entry: any, type: 'asset' | 'liability') => {
    setDetailEntry(entry);
    setDetailType(type);
  };

  // Detail mini chart data
  const detailChartData = useMemo(() => {
    return entrySnapshots.map((s: any) => ({
      date: new Date(s.snapshot_date).toLocaleDateString('de-CH', { day: '2-digit', month: 'short' }),
      value: Number(s.value),
    }));
  }, [entrySnapshots]);

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Net worth hero */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="text-center py-6">
              <p className="text-xs text-muted-foreground mb-1">Nettovermögen</p>
              <p className={cn(
                "text-3xl font-bold",
                netWorth >= 0 ? "text-primary" : "text-destructive"
              )}>
                {fmtCHF(netWorth)}
              </p>
              {changeInfo && (
                <div className={cn(
                  "flex items-center justify-center gap-1 mt-1.5 text-xs font-medium",
                  changeInfo.up ? "text-primary" : "text-destructive"
                )}>
                  {changeInfo.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  <span>{changeInfo.up ? '+' : ''}{fmtCHF(changeInfo.diff)} ({changeInfo.up ? '↑' : '↓'} {Math.abs(changeInfo.pct).toFixed(1)}%)</span>
                </div>
              )}
              <div className="flex justify-center gap-6 mt-3">
                <div className="text-center">
                  <TrendingUp className="h-4 w-4 text-primary mx-auto mb-0.5" />
                  <p className="text-xs text-muted-foreground">Vermögen</p>
                  <p className="text-sm font-semibold">{fmtCHF(totalAssets)}</p>
                </div>
                <div className="text-center">
                  <TrendingDown className="h-4 w-4 text-destructive mx-auto mb-0.5" />
                  <p className="text-xs text-muted-foreground">Schulden</p>
                  <p className="text-sm font-semibold">{fmtCHF(totalLiabilities)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* PeakScore impact after asset add */}
        <PeakScoreImpact impact={lastAssetImpact} show={showAssetImpact} className="px-1" />

        {/* Net worth chart */}
        {validChartData.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Vermögensentwicklung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={validChartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartTrending === 'up' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={chartTrending === 'up' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value: number) => [fmtCHF(value), 'Nettovermögen']}
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={chartTrending === 'up' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                        strokeWidth={2}
                        fill="url(#nwGrad)"
                        dot={{ r: 3, fill: chartTrending === 'up' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Donut chart */}
        {donutData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Aufteilung Vermögen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                        {donutData.map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [fmtCHF(value), '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {donutData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Dialog open={assetDialogOpen} onOpenChange={setAssetDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 gap-2 rounded-xl h-11">
                <Plus className="h-4 w-4" /> Vermögenswert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Neuer Vermögenswert</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Name</Label><Input value={assetName} onChange={e => setAssetName(e.target.value)} placeholder="z.B. Sparkonto UBS" /></div>
                <div>
                  <Label>Kategorie</Label>
                  <Select value={assetCategory} onValueChange={setAssetCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ASSET_CATEGORIES.map(c => <SelectItem key={c} value={c}>{ASSET_ICONS[c]} {c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Wert (CHF)</Label><Input type="number" min="0" step="100" value={assetValue} onChange={e => setAssetValue(e.target.value)} placeholder="0" /></div>
                <Button onClick={() => addAsset.mutate()} disabled={!assetName || !assetValue || parseFloat(assetValue) <= 0 || addAsset.isPending} className="w-full">Speichern</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={liabilityDialogOpen} onOpenChange={setLiabilityDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1 gap-2 rounded-xl h-11">
                <Plus className="h-4 w-4" /> Verbindlichkeit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Neue Verbindlichkeit</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Name</Label><Input value={liabName} onChange={e => setLiabName(e.target.value)} placeholder="z.B. Hypothek" /></div>
                <div>
                  <Label>Kategorie</Label>
                  <Select value={liabCategory} onValueChange={setLiabCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LIABILITY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Betrag (CHF)</Label><Input type="number" min="0" step="100" value={liabAmount} onChange={e => setLiabAmount(e.target.value)} placeholder="0" /></div>
                <Button onClick={() => addLiability.mutate()} disabled={!liabName || !liabAmount || parseFloat(liabAmount) <= 0 || addLiability.isPending} className="w-full">Speichern</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Assets list */}
        {assets.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">Vermögenswerte</p>
            {assets.map((a: any, i: number) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="relative overflow-visible">
                  <AnimatePresence>
                    {xpFlashId === a.id && <XpFloat show={true} />}
                  </AnimatePresence>
                  <CardContent className="flex items-center justify-between py-2.5 px-4">
                    <button className="flex items-center gap-2.5 min-w-0 text-left" onClick={() => openDetail(a, 'asset')}>
                      <span className="text-base">{ASSET_ICONS[a.category] || '📦'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.name}</p>
                        <p className="text-[11px] text-muted-foreground">{a.category}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 ml-1" />
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {quickUpdateId === a.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            className="h-8 w-24 text-xs"
                            value={quickUpdateValue}
                            onChange={e => setQuickUpdateValue(e.target.value)}
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter' && quickUpdateValue) {
                                quickUpdate.mutate({ id: a.id, type: 'asset', value: parseFloat(quickUpdateValue) });
                              }
                              if (e.key === 'Escape') { setQuickUpdateId(null); setQuickUpdateValue(''); }
                            }}
                          />
                          <Button size="sm" className="h-8 text-xs px-2" disabled={!quickUpdateValue || quickUpdate.isPending}
                            onClick={() => quickUpdate.mutate({ id: a.id, type: 'asset', value: parseFloat(quickUpdateValue) })}>
                            OK
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-foreground">{fmtCHF(Number(a.value))}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Aktualisieren"
                            onClick={() => { setQuickUpdateId(a.id); setQuickUpdateValue(String(Number(a.value))); }}>
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Liabilities list */}
        {liabilities.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">Verbindlichkeiten</p>
            {liabilities.map((l: any, i: number) => (
              <motion.div key={l.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="relative overflow-visible">
                  <AnimatePresence>
                    {xpFlashId === l.id && <XpFloat show={true} />}
                  </AnimatePresence>
                  <CardContent className="flex items-center justify-between py-2.5 px-4">
                    <button className="flex items-center gap-2.5 min-w-0 text-left" onClick={() => openDetail(l, 'liability')}>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{l.name}</p>
                        <p className="text-[11px] text-muted-foreground">{l.category}</p>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 ml-1" />
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {quickUpdateId === l.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            className="h-8 w-24 text-xs"
                            value={quickUpdateValue}
                            onChange={e => setQuickUpdateValue(e.target.value)}
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter' && quickUpdateValue) {
                                quickUpdate.mutate({ id: l.id, type: 'liability', value: parseFloat(quickUpdateValue) });
                              }
                              if (e.key === 'Escape') { setQuickUpdateId(null); setQuickUpdateValue(''); }
                            }}
                          />
                          <Button size="sm" className="h-8 text-xs px-2" disabled={!quickUpdateValue || quickUpdate.isPending}
                            onClick={() => quickUpdate.mutate({ id: l.id, type: 'liability', value: parseFloat(quickUpdateValue) })}>
                            OK
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-destructive">{fmtCHF(Number(l.amount))}</span>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Aktualisieren"
                            onClick={() => { setQuickUpdateId(l.id); setQuickUpdateValue(String(Number(l.amount))); }}>
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {assets.length === 0 && liabilities.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <Landmark className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Noch keine Einträge vorhanden.</p>
              <p className="text-muted-foreground text-xs mt-1">Füge deinen ersten Vermögenswert hinzu.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!detailEntry} onOpenChange={open => { if (!open) setDetailEntry(null); }}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl">
          {detailEntry && (
            <div className="space-y-4 pb-6">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  {detailType === 'asset' && <span>{ASSET_ICONS[detailEntry.category] || '📦'}</span>}
                  {detailEntry.name}
                </SheetTitle>
              </SheetHeader>

              {/* Current value */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Aktueller Wert</span>
                <span className={cn("text-lg font-bold", detailType === 'asset' ? "text-foreground" : "text-destructive")}>
                  {fmtCHF(Number(detailType === 'asset' ? detailEntry.value : detailEntry.amount))}
                </span>
              </div>

              {/* Last updated */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Zuletzt aktualisiert: {new Date(detailEntry.updated_at).toLocaleDateString('de-CH')}</span>
              </div>

              {/* Mini history chart */}
              {detailChartData.length >= 2 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs">Wertverlauf</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[120px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={detailChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                          <Tooltip formatter={(v: number) => [fmtCHF(v), 'Wert']}
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {detailChartData.length < 2 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Noch nicht genug Daten für den Verlauf. Aktualisiere den Wert regelmässig.
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    setQuickUpdateId(detailEntry.id);
                    setQuickUpdateValue(String(Number(detailType === 'asset' ? detailEntry.value : detailEntry.amount)));
                    setDetailEntry(null);
                  }}
                >
                  <RefreshCw className="h-4 w-4" /> Aktualisieren
                </Button>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => {
                    if (detailType === 'asset') deleteAsset.mutate(detailEntry.id);
                    else deleteLiability.mutate(detailEntry.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Löschen
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </ClientPortalLayout>
  );
}
