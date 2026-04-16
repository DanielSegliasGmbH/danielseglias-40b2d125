import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Send, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { JOURNEY_SCHEDULE, type JourneyNudge } from '@/config/journeySchedule';

interface NudgeOverride {
  id: string;
  day_number: number;
  nudge_key: string;
  nudge_type: string;
  emoji: string;
  title: string;
  content: string;
  cta_path: string;
  cta_label: string;
  if_finanz_typ: string | null;
  skip_if: string | null;
  xp_reward: number | null;
  is_active: boolean;
}

const EMPTY: Partial<NudgeOverride> = {
  day_number: 1,
  nudge_key: '',
  nudge_type: 'micro',
  emoji: '📌',
  title: '',
  content: '',
  cta_path: '/app/client-portal',
  cta_label: 'Ansehen',
  if_finanz_typ: null,
  skip_if: null,
  xp_reward: 0,
  is_active: true,
};

export default function AdminNudgeSchedule() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<NudgeOverride> | null>(null);
  const [showCodeNudges, setShowCodeNudges] = useState(true);

  const { data: overrides = [], isLoading } = useQuery({
    queryKey: ['admin-nudge-overrides'],
    queryFn: async () => {
      const { data } = await supabase
        .from('admin_nudge_overrides')
        .select('*')
        .order('day_number');
      return (data || []) as NudgeOverride[];
    },
  });

  const save = useMutation({
    mutationFn: async (form: Partial<NudgeOverride>) => {
      if (form.id) {
        await supabase.from('admin_nudge_overrides').update(form).eq('id', form.id);
      } else {
        await supabase.from('admin_nudge_overrides').insert(form as any);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-nudge-overrides'] });
      setEditing(null);
      toast.success('Nudge gespeichert');
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('admin_nudge_overrides').delete().eq('id', id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-nudge-overrides'] });
      toast.success('Nudge gelöscht');
    },
  });

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('admin_nudge_overrides').update({ is_active: active }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-nudge-overrides'] });
  };

  // Merge code nudges + overrides for display
  const allNudges = [
    ...JOURNEY_SCHEDULE.map(n => ({ ...n, source: 'code' as const })),
    ...overrides.map(o => ({
      day: o.day_number,
      key: o.nudge_key,
      type: o.nudge_type as any,
      emoji: o.emoji,
      title: o.title,
      content: o.content,
      cta: o.cta_path,
      ctaLabel: o.cta_label,
      ifFinanzTyp: o.if_finanz_typ || undefined,
      xp: o.xp_reward || undefined,
      source: 'db' as const,
      id: o.id,
      is_active: o.is_active,
    })),
  ].sort((a, b) => a.day - b.day);

  return (
    <AppLayout>
      <ScreenHeader title="Nudge-Schedule" showBack backTo="/app" />
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">Journey Nudges</h2>
            <Badge variant="secondary">{allNudges.length} Nudges</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs">Code-Nudges zeigen</Label>
            <Switch checked={showCodeNudges} onCheckedChange={setShowCodeNudges} />
            <Button size="sm" onClick={() => setEditing(EMPTY)}>
              <Plus className="h-4 w-4 mr-1" /> Neuer Nudge
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Laden...</p>
        ) : (
          <div className="space-y-2">
            {allNudges
              .filter(n => n.source === 'db' || showCodeNudges)
              .map((n, i) => (
                <Card key={n.key + i} className={n.source === 'code' ? 'opacity-60' : ''}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <span className="text-lg">{n.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">Tag {n.day}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{n.type}</Badge>
                        {n.source === 'code' && <Badge className="text-[10px] bg-muted text-muted-foreground">Code</Badge>}
                        {n.source === 'db' && !(n as any).is_active && <Badge variant="destructive" className="text-[10px]">Inaktiv</Badge>}
                        {n.xp && <span className="text-[10px] text-primary font-bold">+{n.xp} XP</span>}
                      </div>
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{n.content}</p>
                    </div>
                    {n.source === 'db' && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Switch
                          checked={(n as any).is_active}
                          onCheckedChange={(v) => toggleActive((n as any).id, v)}
                        />
                        <Button size="icon" variant="ghost" onClick={() => {
                          const o = overrides.find(x => x.id === (n as any).id);
                          if (o) setEditing(o);
                        }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove.mutate((n as any).id)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing?.id ? 'Nudge bearbeiten' : 'Neuer Nudge'}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tag</Label>
                    <Input type="number" value={editing.day_number} onChange={e => setEditing({ ...editing, day_number: +e.target.value })} />
                  </div>
                  <div>
                    <Label>Typ</Label>
                    <Select value={editing.nudge_type} onValueChange={v => setEditing({ ...editing, nudge_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="micro">Micro</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="phase-transition">Phase Transition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label>Emoji</Label>
                    <Input value={editing.emoji} onChange={e => setEditing({ ...editing, emoji: e.target.value })} />
                  </div>
                  <div className="col-span-3">
                    <Label>Key (eindeutig)</Label>
                    <Input value={editing.nudge_key} onChange={e => setEditing({ ...editing, nudge_key: e.target.value })} placeholder="day42-custom" />
                  </div>
                </div>
                <div>
                  <Label>Titel</Label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <Label>Inhalt</Label>
                  <Textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>CTA Pfad</Label>
                    <Input value={editing.cta_path} onChange={e => setEditing({ ...editing, cta_path: e.target.value })} />
                  </div>
                  <div>
                    <Label>CTA Label</Label>
                    <Input value={editing.cta_label} onChange={e => setEditing({ ...editing, cta_label: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Finanz-Typ Filter</Label>
                    <Select value={editing.if_finanz_typ || 'none'} onValueChange={v => setEditing({ ...editing, if_finanz_typ: v === 'none' ? null : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Alle</SelectItem>
                        <SelectItem value="skeptiker">Skeptiker</SelectItem>
                        <SelectItem value="geniesser">Geniesser</SelectItem>
                        <SelectItem value="pflichterfueller">Pflichterfüller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>XP Belohnung</Label>
                    <Input type="number" value={editing.xp_reward || 0} onChange={e => setEditing({ ...editing, xp_reward: +e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>Abbrechen</Button>
                  <Button onClick={() => save.mutate(editing)} disabled={save.isPending}>
                    {save.isPending ? 'Speichern...' : 'Speichern'}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
