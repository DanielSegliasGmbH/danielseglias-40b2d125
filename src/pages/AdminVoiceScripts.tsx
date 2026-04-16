import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VoiceScript {
  id: string;
  script_type: string;
  title: string;
  template: string;
  variables: string[];
  trigger_condition: string | null;
  is_active: boolean;
  sort_order: number;
}

const SCRIPT_TYPES = [
  { value: 'daily_briefing', label: 'Tägliches Briefing' },
  { value: 'weekly_reflection', label: 'Wochen-Reflexion' },
  { value: 'monthly_review', label: 'Monats-Review' },
  { value: 'special_event', label: 'Special Event' },
  { value: 'milestone', label: 'Meilenstein' },
];

const AVAILABLE_VARIABLES = ['{name}', '{zukunfts_name}', '{peakscore}', '{streak_days}', '{phase}', '{xp}', '{rank}', '{days_active}'];

const EMPTY: Partial<VoiceScript> = {
  script_type: 'daily_briefing', title: '', template: '', variables: [],
  trigger_condition: null, is_active: true, sort_order: 0,
};

export default function AdminVoiceScripts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<VoiceScript> | null>(null);

  const { data: scripts = [], isLoading } = useQuery({
    queryKey: ['admin-voice-scripts'],
    queryFn: async () => {
      const { data } = await supabase.from('voice_scripts').select('*').order('script_type, sort_order');
      return (data || []) as VoiceScript[];
    },
  });

  const save = useMutation({
    mutationFn: async (form: Partial<VoiceScript>) => {
      // Auto-detect variables from template
      const vars = AVAILABLE_VARIABLES.filter(v => form.template?.includes(v));
      const payload = { ...form, variables: vars };
      if (form.id) {
        await supabase.from('voice_scripts').update(payload).eq('id', form.id);
      } else {
        await supabase.from('voice_scripts').insert(payload as any);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-voice-scripts'] });
      setEditing(null);
      toast.success('Gespeichert');
    },
  });

  const remove = async (id: string) => {
    await supabase.from('voice_scripts').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-voice-scripts'] });
    toast.success('Gelöscht');
  };

  // Group by type
  const grouped = SCRIPT_TYPES.map(t => ({
    ...t,
    scripts: scripts.filter(s => s.script_type === t.value),
  }));

  return (
    <AppLayout>
      <ScreenHeader title="Voice Scripts" showBack backTo="/app" />
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Sprach-Vorlagen</h2>
          <Button size="sm" onClick={() => setEditing(EMPTY)}>
            <Plus className="h-4 w-4 mr-1" /> Neue Vorlage
          </Button>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="p-3">
            <p className="text-xs font-medium mb-1">Verfügbare Variablen:</p>
            <div className="flex flex-wrap gap-1">
              {AVAILABLE_VARIABLES.map(v => (
                <Badge key={v} variant="outline" className="text-[10px] font-mono">{v}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Laden...</p>
        ) : (
          grouped.map(g => (
            <div key={g.value}>
              <h3 className="text-sm font-bold mb-2">{g.label}</h3>
              {g.scripts.length === 0 ? (
                <p className="text-xs text-muted-foreground mb-3">Keine Vorlagen</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {g.scripts.map(s => (
                    <Card key={s.id}>
                      <CardContent className="p-3 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{s.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2 font-mono">{s.template}</p>
                          {s.variables.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {s.variables.map(v => (
                                <Badge key={v} variant="secondary" className="text-[10px] font-mono">{v}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Switch checked={s.is_active} onCheckedChange={async v => {
                            await supabase.from('voice_scripts').update({ is_active: v }).eq('id', s.id);
                            qc.invalidateQueries({ queryKey: ['admin-voice-scripts'] });
                          }} />
                          <Button size="icon" variant="ghost" onClick={() => setEditing(s)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => remove(s.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))
        )}

        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing?.id ? 'Bearbeiten' : 'Neue Vorlage'}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div>
                  <Label>Typ</Label>
                  <Select value={editing.script_type} onValueChange={v => setEditing({ ...editing, script_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SCRIPT_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Titel</Label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <Label>Template (mit Variablen)</Label>
                  <Textarea value={editing.template} onChange={e => setEditing({ ...editing, template: e.target.value })} rows={5} placeholder="Guten Morgen {name}, dein PeakScore liegt bei {peakscore}..." />
                </div>
                <div>
                  <Label>Trigger (optional)</Label>
                  <Input value={editing.trigger_condition || ''} onChange={e => setEditing({ ...editing, trigger_condition: e.target.value || null })} placeholder="morning, sunday, milestone, etc." />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditing(null)}>Abbrechen</Button>
                  <Button onClick={() => save.mutate(editing)} disabled={save.isPending}>Speichern</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
