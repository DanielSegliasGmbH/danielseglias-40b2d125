import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Bell, Plus, Send, FileText } from 'lucide-react';
import { useAdminNotifications, useCreateNotification, useUpdateNotification } from '@/hooks/useNotifications';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function AdminNotifications() {
  const { data: notifications, isLoading } = useAdminNotifications();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    body: '',
    link_url: '',
    link_label: '',
    target_role: 'client',
    status: 'draft' as 'draft' | 'published',
  });

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Titel und Text sind erforderlich.');
      return;
    }
    try {
      await createNotification.mutateAsync(form);
      toast.success('Benachrichtigung erstellt.');
      setDialogOpen(false);
      setForm({ title: '', body: '', link_url: '', link_label: '', target_role: 'client', status: 'draft' });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateNotification.mutateAsync({ id, status: 'published', published_at: new Date().toISOString() });
      toast.success('Benachrichtigung veröffentlicht.');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Benachrichtigungen</h1>
            <p className="text-sm text-muted-foreground">In-App Benachrichtigungen an Kunden senden</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Neue Benachrichtigung</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Neue Benachrichtigung</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Titel *</Label>
                  <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z.B. Neuer Bereich verfügbar" />
                </div>
                <div className="space-y-2">
                  <Label>Nachricht *</Label>
                  <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4} placeholder="Inhalt der Benachrichtigung…" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Link (optional)</Label>
                    <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="/app/client-portal/tools" />
                  </div>
                  <div className="space-y-2">
                    <Label>Link-Text</Label>
                    <Input value={form.link_label} onChange={e => setForm(f => ({ ...f, link_label: e.target.value }))} placeholder="Jetzt ansehen" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Zielgruppe</Label>
                  <Select value={form.target_role} onValueChange={v => setForm(f => ({ ...f, target_role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Alle Kunden</SelectItem>
                      <SelectItem value="staff">Mitarbeiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: 'draft' | 'published') => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Entwurf</SelectItem>
                      <SelectItem value="published">Sofort veröffentlichen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
                  <Button onClick={handleCreate} disabled={createNotification.isPending}>
                    {form.status === 'published' ? 'Veröffentlichen' : 'Als Entwurf speichern'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : notifications?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Noch keine Benachrichtigungen erstellt.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications?.map(n => (
              <Card key={n.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{n.title}</h3>
                        <Badge variant={n.status === 'published' ? 'default' : 'secondary'} className="shrink-0">
                          {n.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                      {n.published_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(n.published_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      )}
                    </div>
                    {n.status === 'draft' && (
                      <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={() => handlePublish(n.id)}>
                        <Send className="h-3.5 w-3.5" /> Veröffentlichen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
