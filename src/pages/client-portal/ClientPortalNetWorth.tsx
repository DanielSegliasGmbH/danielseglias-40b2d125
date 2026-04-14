import { useState, useMemo } from 'react';
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
import { Plus, TrendingUp, TrendingDown, Landmark, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useGamification } from '@/hooks/useGamification';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

export default function ClientPortalNetWorth() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { awardPoints } = useGamification();
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [liabilityDialogOpen, setLiabilityDialogOpen] = useState(false);

  // Asset form
  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState<string>(ASSET_CATEGORIES[0]);
  const [assetValue, setAssetValue] = useState('');

  // Liability form
  const [liabName, setLiabName] = useState('');
  const [liabCategory, setLiabCategory] = useState<string>(LIABILITY_CATEGORIES[0]);
  const [liabAmount, setLiabAmount] = useState('');

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

  const totalAssets = useMemo(() => assets.reduce((s: number, a: any) => s + Number(a.value), 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((s: number, l: any) => s + Number(l.amount), 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;

  // Donut chart data
  const donutData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    assets.forEach((a: any) => {
      byCategory[a.category] = (byCategory[a.category] || 0) + Number(a.value);
    });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  }, [assets]);

  const addAsset = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('net_worth_assets').insert({
        user_id: user.id,
        name: assetName,
        category: assetCategory,
        value: parseFloat(assetValue),
        last_updated_date: new Date().toISOString().slice(0, 10),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-assets'] });
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
      const { error } = await supabase.from('net_worth_liabilities').insert({
        user_id: user.id,
        name: liabName,
        category: liabCategory,
        amount: parseFloat(liabAmount),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-liabilities'] });
      toast.success('Verbindlichkeit hinzugefügt ✓');
      resetLiabForm();
      setLiabilityDialogOpen(false);
    },
    onError: () => toast.error('Fehler beim Speichern'),
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('net_worth_assets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-assets'] });
      toast.success('Eintrag gelöscht');
    },
  });

  const deleteLiability = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('net_worth_liabilities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['net-worth-liabilities'] });
      toast.success('Eintrag gelöscht');
    },
  });

  const resetAssetForm = () => { setAssetName(''); setAssetCategory(ASSET_CATEGORIES[0]); setAssetValue(''); };
  const resetLiabForm = () => { setLiabName(''); setLiabCategory(LIABILITY_CATEGORIES[0]); setLiabAmount(''); };

  const fmtCHF = (v: number) => `CHF ${v.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

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
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
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
                <Card>
                  <CardContent className="flex items-center justify-between py-2.5 px-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">{ASSET_ICONS[a.category] || '📦'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.name}</p>
                        <p className="text-[11px] text-muted-foreground">{a.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-sm font-semibold text-foreground">{fmtCHF(Number(a.value))}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteAsset.mutate(a.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
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
                <Card>
                  <CardContent className="flex items-center justify-between py-2.5 px-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{l.name}</p>
                      <p className="text-[11px] text-muted-foreground">{l.category}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-sm font-semibold text-destructive">{fmtCHF(Number(l.amount))}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteLiability.mutate(l.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
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
    </ClientPortalLayout>
  );
}
