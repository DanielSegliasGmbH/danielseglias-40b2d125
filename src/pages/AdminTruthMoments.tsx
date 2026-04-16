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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TruthMoment {
  id: string;
  title: string;
  content: string;
  emoji: string;
  trigger_condition: string;
  trigger_config: any;
  display_location: string;
  is_active: boolean;
  sort_order: number;
}

const EMPTY: Partial<TruthMoment> = {
  title: '', content: '', emoji: '💡', trigger_condition: 'manual',
  trigger_config: {}, display_location: 'dashboard', is_active: true, sort_order: 0,
};

export default function AdminTruthMoments() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<TruthMoment> | null>(null);

  const { data: moments = [], isLoading } = useQuery({
    queryKey: ['admin-truth-moments'],
    queryFn: async () => {
      const { data } = await supabase.from('truth_moments').select('*').order('sort_order');
      return (data || []) as TruthMoment[];
    },
  });

  const save = useMutation({
    mutationFn: async (form: Partial<TruthMoment>) => {
      if (form.id) {
        await supabase.from('truth_moments').update(form).eq('id', form.id);
      } else {
        await supabase.from('truth_moments').insert(form as any);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-truth-moments'] });
      setEditing(null);
      toast.success('Gespeichert');
    },
  });

  const remove = async (id: string) => {
    await supabase.from('truth_moments').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-truth-moments'] });
    toast.success('Gelöscht');
  };

  const toggleActive = async (id: string, active: boolean) => {
    await supabase.from('truth_moments').update({ is_active: active }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-truth-moments'] });
  };

  return (
    <AppLayout>
      <ScreenHeader title="Wahrheits-Momente" showBack backTo="/app" />
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Wahrheits-Momente</h2>
          <Button size="sm" onClick={() => setEditing(EMPTY)}>
            <Plus className="h-4 w-4 mr-1" /> Neuer Moment
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Laden...</p>
        ) : moments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Keine Momente definiert</p>
        ) : (
          <div className="space-y-2">
            {moments.map(m => (
              <Card key={m.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <span className="text-lg">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.content}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px]">{m.trigger_condition}</Badge>
                      <Badge variant="secondary" className="text-[10px]">{m.display_location}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Switch checked={m.is_active} onCheckedChange={v => toggleActive(m.id, v)} />
                    <Button size="icon" variant="ghost" onClick={() => setEditing(m)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(m.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing?.id ? 'Bearbeiten' : 'Neuer Moment'}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label>Emoji</Label>
                    <Input value={editing.emoji} onChange={e => setEditing({ ...editing, emoji: e.target.value })} />
                  </div>
                  <div className="col-span-3">
                    <Label>Titel</Label>
                    <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>Inhalt</Label>
                  <Textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Trigger</Label>
                    <Input value={editing.trigger_condition} onChange={e => setEditing({ ...editing, trigger_condition: e.target.value })} placeholder="manual, peakscore_drop, etc." />
                  </div>
                  <div>
                    <Label>Anzeige-Ort</Label>
                    <Input value={editing.display_location} onChange={e => setEditing({ ...editing, display_location: e.target.value })} placeholder="dashboard, coach, etc." />
                  </div>
                </div>
                <div>
                  <Label>Reihenfolge</Label>
                  <Input type="number" value={editing.sort_order} onChange={e => setEditing({ ...editing, sort_order: +e.target.value })} />
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
