import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Send, Calendar, Eye, MessageSquare, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function AdminGroupsFeed() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: groups = [] } = useQuery({
    queryKey: ['admin-groups-list'],
    queryFn: async () => {
      const { data } = await supabase.from('community_groups').select('id, name').eq('is_active', true);
      return data || [];
    },
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-feed-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('group_feed_posts')
        .select('*, community_groups(name)')
        .order('scheduled_at', { ascending: false });
      return data || [];
    },
  });

  const save = useMutation({
    mutationFn: async (form: any) => {
      if (form.id) {
        await supabase.from('group_feed_posts').update(form).eq('id', form.id);
      } else {
        await supabase.from('group_feed_posts').insert(form);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-feed-posts'] });
      setEditing(null);
      toast.success('Gespeichert');
    },
  });

  const publish = async (id: string) => {
    await supabase.from('group_feed_posts').update({
      is_published: true,
      published_at: new Date().toISOString(),
    }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-feed-posts'] });
    toast.success('Veröffentlicht');
  };

  const remove = async (id: string) => {
    await supabase.from('group_feed_posts').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-feed-posts'] });
    toast.success('Gelöscht');
  };

  return (
    <AppLayout>
      <ScreenHeader title="Gruppen-Feed" showBack backTo="/app" />
      <div className="p-4 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Diskussionsstarter</h2>
          <Button size="sm" onClick={() => setEditing({ title: '', content: '', group_id: null, scheduled_at: new Date().toISOString() })}>
            <Plus className="h-4 w-4 mr-1" /> Neuer Post
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Laden...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Keine Posts</p>
        ) : (
          <div className="space-y-2">
            {posts.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={p.is_published ? 'default' : 'secondary'} className="text-[10px]">
                          {p.is_published ? 'Veröffentlicht' : 'Geplant'}
                        </Badge>
                        {p.community_groups?.name && (
                          <Badge variant="outline" className="text-[10px]">{p.community_groups.name}</Badge>
                        )}
                      </div>
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{p.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(p.scheduled_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </span>
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.engagement_views}</span>
                        <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{p.engagement_reactions}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{p.engagement_replies}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {!p.is_published && (
                        <Button size="sm" variant="default" onClick={() => publish(p.id)}>
                          <Send className="h-3.5 w-3.5 mr-1" /> Jetzt
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Bearbeiten</Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-destructive">×</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing?.id ? 'Post bearbeiten' : 'Neuer Post'}</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-3">
                <div>
                  <Label>Gruppe (optional)</Label>
                  <Select value={editing.group_id || 'none'} onValueChange={v => setEditing({ ...editing, group_id: v === 'none' ? null : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Alle Gruppen</SelectItem>
                      {groups.map((g: any) => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Titel</Label>
                  <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div>
                  <Label>Inhalt</Label>
                  <Textarea value={editing.content} onChange={e => setEditing({ ...editing, content: e.target.value })} rows={4} />
                </div>
                <div>
                  <Label>Geplant für</Label>
                  <Input type="datetime-local" value={editing.scheduled_at?.slice(0, 16)} onChange={e => setEditing({ ...editing, scheduled_at: new Date(e.target.value).toISOString() })} />
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
