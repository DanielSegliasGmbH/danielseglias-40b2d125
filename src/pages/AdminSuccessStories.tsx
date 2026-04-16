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
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminSuccessStories, useSaveStory, type SuccessStory } from '@/hooks/useSuccessStories';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const EMPTY_STORY: Partial<SuccessStory> = {
  title: '',
  persona_name: '',
  persona_age: null,
  persona_context: '',
  start_situation: {},
  goals: '',
  actions_taken: [],
  end_result: {},
  quote: '',
  peakscore_journey: [],
  tags: [],
  is_active: false,
};

function StoryForm({
  story,
  onSave,
  onCancel,
  saving,
}: {
  story: Partial<SuccessStory>;
  onSave: (s: Partial<SuccessStory>) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(story);
  const [startSitText, setStartSitText] = useState(
    Object.entries(story.start_situation || {}).map(([k, v]) => `${k}: ${v}`).join('\n')
  );
  const [endResText, setEndResText] = useState(
    Object.entries(story.end_result || {}).map(([k, v]) => `${k}: ${v}`).join('\n')
  );
  const [actionsText, setActionsText] = useState(
    ((story.actions_taken || []) as string[]).join('\n')
  );
  const [journeyText, setJourneyText] = useState(
    ((story.peakscore_journey || []) as number[]).join(', ')
  );
  const [tagsText, setTagsText] = useState(
    ((story.tags || []) as string[]).join(', ')
  );

  const parseKeyValue = (text: string): Record<string, string> => {
    const result: Record<string, string> = {};
    text.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        result[line.substring(0, idx).trim()] = line.substring(idx + 1).trim();
      }
    });
    return result;
  };

  const handleSubmit = () => {
    if (!form.title || !form.persona_name) {
      toast.error('Titel und Name sind Pflicht');
      return;
    }
    onSave({
      ...form,
      start_situation: parseKeyValue(startSitText),
      end_result: parseKeyValue(endResText),
      actions_taken: actionsText.split('\n').filter(l => l.trim()) as any,
      peakscore_journey: journeyText.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v)) as any,
      tags: tagsText.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>Titel</Label>
          <Input
            value={form.title || ''}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="z.B. Lisa, 32 — von Score 3 zu Score 14"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Persona Name</Label>
          <Input
            value={form.persona_name || ''}
            onChange={e => setForm(f => ({ ...f, persona_name: e.target.value }))}
            placeholder="Marco, 34"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Alter</Label>
          <Input
            type="number"
            value={form.persona_age ?? ''}
            onChange={e => setForm(f => ({ ...f, persona_age: parseInt(e.target.value) || null }))}
            className="mt-1"
          />
        </div>
        <div className="col-span-2">
          <Label>Kontext</Label>
          <Input
            value={form.persona_context || ''}
            onChange={e => setForm(f => ({ ...f, persona_context: e.target.value }))}
            placeholder="Sachbearbeiter in Bern"
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label>Startsituation (Key: Value, pro Zeile)</Label>
        <Textarea
          value={startSitText}
          onChange={e => setStartSitText(e.target.value)}
          placeholder={"PeakScore: 4.2 Monate\nSparquote: 3%\nKein 3a: Ja"}
          className="mt-1 min-h-[80px] font-mono text-xs"
        />
      </div>

      <div>
        <Label>Ziele</Label>
        <Textarea
          value={form.goals || ''}
          onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
          className="mt-1 min-h-[60px]"
        />
      </div>

      <div>
        <Label>Schritte (einer pro Zeile)</Label>
        <Textarea
          value={actionsText}
          onChange={e => setActionsText(e.target.value)}
          placeholder={"Konten-Modell eingeführt\nSäule 3a maximiert"}
          className="mt-1 min-h-[100px] font-mono text-xs"
        />
      </div>

      <div>
        <Label>Ergebnis (Key: Value, pro Zeile)</Label>
        <Textarea
          value={endResText}
          onChange={e => setEndResText(e.target.value)}
          placeholder={"PeakScore: 17.3 Monate\nSparquote: 34%"}
          className="mt-1 min-h-[80px] font-mono text-xs"
        />
      </div>

      <div>
        <Label>Zitat</Label>
        <Textarea
          value={form.quote || ''}
          onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
          className="mt-1 min-h-[60px]"
        />
      </div>

      <div>
        <Label>PeakScore-Verlauf (Komma-getrennte Zahlen, monatlich)</Label>
        <Input
          value={journeyText}
          onChange={e => setJourneyText(e.target.value)}
          placeholder="4.2, 5.1, 6.3, 8.0, 10.2, 14.0, 17.3"
          className="mt-1 font-mono text-xs"
        />
      </div>

      <div>
        <Label>Tags (Komma-getrennt)</Label>
        <Input
          value={tagsText}
          onChange={e => setTagsText(e.target.value)}
          placeholder="sparen, investieren, familie"
          className="mt-1 font-mono text-xs"
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={form.is_active || false}
          onCheckedChange={v => setForm(f => ({ ...f, is_active: v, published_at: v ? new Date().toISOString() : null }))}
        />
        <Label>Veröffentlicht</Label>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Abbrechen</Button>
        <Button onClick={handleSubmit} disabled={saving} className="flex-1">Speichern</Button>
      </div>
    </div>
  );
}

export default function AdminSuccessStories() {
  const { data: stories, isLoading } = useAdminSuccessStories();
  const saveStory = useSaveStory();
  const queryClient = useQueryClient();
  const [editingStory, setEditingStory] = useState<Partial<SuccessStory> | null>(null);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('success_stories').delete().eq('id', id);
    if (error) {
      toast.error('Löschen fehlgeschlagen');
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-success-stories'] });
      toast.success('Story gelöscht');
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <ScreenHeader
          title="Erfolgsgeschichten"
          rightAction={
            <Button size="sm" className="gap-1" onClick={() => setEditingStory({ ...EMPTY_STORY })}>
              <Plus className="h-4 w-4" /> Neue Story
            </Button>
          }
        />

        <main className="px-4 sm:px-6 lg:container lg:mx-auto py-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Verwalte anonymisierte Erfolgsgeschichten für das Kundenportal.
            Sende mir 5-10 echte Transformationen und ich pflege sie hier ein.
          </p>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : !stories?.length ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Noch keine Stories. Erstelle die erste!</p>
              </CardContent>
            </Card>
          ) : (
            stories.map(story => (
              <Card key={story.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">{story.title}</p>
                      <Badge variant={story.is_active ? 'default' : 'secondary'} className="text-[10px] shrink-0">
                        {story.is_active ? 'Aktiv' : 'Entwurf'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{story.persona_context}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setEditingStory(story)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(story.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </main>

        <Dialog open={!!editingStory} onOpenChange={(o) => !o && setEditingStory(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStory?.id ? 'Story bearbeiten' : 'Neue Story'}</DialogTitle>
            </DialogHeader>
            {editingStory && (
              <StoryForm
                story={editingStory}
                onSave={(s) => {
                  saveStory.mutate(s);
                  setEditingStory(null);
                }}
                onCancel={() => setEditingStory(null)}
                saving={saveStory.isPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
