import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, BarChart3, Target } from 'lucide-react';
import { toast } from 'sonner';
import {
  useAllCtas, useUpsertCta, useDeleteCta, useCtaImpressionStats,
  CTA_TYPES, type CtaDefinition, type CtaConditions,
} from '@/hooks/useCtaEngine';
import { STATUS_CONFIG, type UserStatus } from '@/hooks/useUserScoring';

function emptyForm(): Partial<CtaDefinition> {
  return {
    name: '',
    description: '',
    cta_type: 'booking',
    target: '',
    display_text: '',
    display_description: '',
    icon: 'arrow-right',
    priority: 100,
    is_active: true,
    conditions: {},
  };
}

export default function AdminCtaManagement() {
  const { data: ctas, isLoading } = useAllCtas();
  const { data: stats } = useCtaImpressionStats();
  const upsert = useUpsertCta();
  const deleteCta = useDeleteCta();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<CtaDefinition>>(emptyForm());
  const [condStatuses, setCondStatuses] = useState<string[]>([]);
  const [condMinScore, setCondMinScore] = useState('');
  const [condMaxScore, setCondMaxScore] = useState('');
  const [condLabels, setCondLabels] = useState('');
  const [condMinSessions, setCondMinSessions] = useState('');
  const [condMinTools, setCondMinTools] = useState('');

  const openCreate = () => {
    setForm(emptyForm());
    resetConditions({});
    setDialogOpen(true);
  };

  const openEdit = (cta: CtaDefinition) => {
    setForm(cta);
    resetConditions(cta.conditions);
    setDialogOpen(true);
  };

  const resetConditions = (c: CtaConditions) => {
    setCondStatuses(c.statuses || []);
    setCondMinScore(c.min_score != null ? String(c.min_score) : '');
    setCondMaxScore(c.max_score != null ? String(c.max_score) : '');
    setCondLabels((c.labels || []).join(', '));
    setCondMinSessions(c.min_sessions != null ? String(c.min_sessions) : '');
    setCondMinTools(c.min_tools_completed != null ? String(c.min_tools_completed) : '');
  };

  const handleSave = async () => {
    if (!form.name || !form.display_text) {
      toast.error('Name und Anzeigetext sind erforderlich');
      return;
    }

    const conditions: CtaConditions = {};
    if (condStatuses.length > 0) conditions.statuses = condStatuses;
    if (condMinScore) conditions.min_score = Number(condMinScore);
    if (condMaxScore) conditions.max_score = Number(condMaxScore);
    if (condLabels.trim()) conditions.labels = condLabels.split(',').map(l => l.trim()).filter(Boolean);
    if (condMinSessions) conditions.min_sessions = Number(condMinSessions);
    if (condMinTools) conditions.min_tools_completed = Number(condMinTools);

    try {
      await upsert.mutateAsync({ ...form, conditions } as any);
      toast.success(form.id ? 'CTA aktualisiert' : 'CTA erstellt');
      setDialogOpen(false);
    } catch {
      toast.error('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCta.mutateAsync(id);
      toast.success('CTA gelöscht');
    } catch {
      toast.error('Fehler beim Löschen');
    }
  };

  const toggleActive = async (cta: CtaDefinition) => {
    await upsert.mutateAsync({ ...cta, is_active: !cta.is_active } as any);
  };

  // KPIs
  const totalViews = useMemo(() => {
    if (!stats) return 0;
    let total = 0;
    stats.forEach(s => { total += s.views; });
    return total;
  }, [stats]);

  const totalClicks = useMemo(() => {
    if (!stats) return 0;
    let total = 0;
    stats.forEach(s => { total += s.clicks; });
    return total;
  }, [stats]);

  const avgRate = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <ScreenHeader title="CTA-Steuerung" />
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            Neuer CTA
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Aktive CTAs</p>
              <p className="text-2xl font-bold text-foreground">{ctas?.filter(c => c.is_active).length || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Impressions</p>
              <p className="text-2xl font-bold text-foreground">{totalViews}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Klicks</p>
              <p className="text-2xl font-bold text-foreground">{totalClicks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">Conversion-Rate</p>
              <p className="text-2xl font-bold text-foreground">{avgRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" /> CTA-Übersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Typ</TableHead>
                    <TableHead className="text-xs">Anzeigetext</TableHead>
                    <TableHead className="text-xs text-right">Prio</TableHead>
                    <TableHead className="text-xs text-right">Views</TableHead>
                    <TableHead className="text-xs text-right">Klicks</TableHead>
                    <TableHead className="text-xs text-right">Rate</TableHead>
                    <TableHead className="text-xs">Aktiv</TableHead>
                    <TableHead className="text-xs w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(ctas || []).map(cta => {
                    const s = stats?.get(cta.name) || { views: 0, clicks: 0 };
                    const rate = s.views > 0 ? Math.round((s.clicks / s.views) * 100) : 0;
                    return (
                      <TableRow key={cta.id}>
                        <TableCell className="text-sm font-medium">{cta.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {CTA_TYPES[cta.cta_type] || cta.cta_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{cta.display_text}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{cta.priority}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{s.views}</TableCell>
                        <TableCell className="text-right text-sm tabular-nums">{s.clicks}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={rate >= 10 ? 'default' : 'secondary'} className="text-[10px]">
                            {rate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={cta.is_active}
                            onCheckedChange={() => toggleActive(cta)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cta)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(cta.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {(!ctas || ctas.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Noch keine CTAs erstellt
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'CTA bearbeiten' : 'Neuer CTA'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Name (intern)</Label>
                <Input
                  value={form.name || ''}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="z.B. booking_high_intent"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Typ</Label>
                <Select value={form.cta_type || 'link'} onValueChange={v => setForm(f => ({ ...f, cta_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CTA_TYPES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Anzeigetext</Label>
              <Input
                value={form.display_text || ''}
                onChange={e => setForm(f => ({ ...f, display_text: e.target.value }))}
                placeholder="z.B. Buche dein Erstgespräch"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Beschreibung (optional)</Label>
              <Textarea
                value={form.display_description || ''}
                onChange={e => setForm(f => ({ ...f, display_description: e.target.value }))}
                placeholder="Kurzer Erklärungstext"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Ziel (URL/Pfad)</Label>
                <Input
                  value={form.target || ''}
                  onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                  placeholder="z.B. https://calendar.app.google/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Priorität (niedriger = höher)</Label>
                <Input
                  type="number"
                  value={form.priority || 100}
                  onChange={e => setForm(f => ({ ...f, priority: Number(e.target.value) }))}
                />
              </div>
            </div>

            {/* Conditions */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-xs font-semibold text-foreground">Bedingungen</p>

              <div className="space-y-1.5">
                <Label className="text-[11px] text-muted-foreground">Status (mehrere möglich)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.entries(STATUS_CONFIG) as [UserStatus, { label: string }][]).map(([key, cfg]) => (
                    <Badge
                      key={key}
                      variant={condStatuses.includes(key) ? 'default' : 'outline'}
                      className="cursor-pointer text-[10px]"
                      onClick={() => {
                        setCondStatuses(prev =>
                          prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
                        );
                      }}
                    >
                      {cfg.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Min. Score</Label>
                  <Input
                    type="number"
                    value={condMinScore}
                    onChange={e => setCondMinScore(e.target.value)}
                    placeholder="z.B. 30"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Max. Score</Label>
                  <Input
                    type="number"
                    value={condMaxScore}
                    onChange={e => setCondMaxScore(e.target.value)}
                    placeholder="z.B. 80"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Labels (kommagetrennt)</Label>
                <Input
                  value={condLabels}
                  onChange={e => setCondLabels(e.target.value)}
                  placeholder="z.B. hat CTA geklickt, hohe Aktivität"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Min. Sessions</Label>
                  <Input
                    type="number"
                    value={condMinSessions}
                    onChange={e => setCondMinSessions(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Min. Tools abgeschlossen</Label>
                  <Input
                    type="number"
                    value={condMinTools}
                    onChange={e => setCondMinTools(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {form.id ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
