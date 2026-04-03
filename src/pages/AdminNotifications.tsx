import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Bell, Plus, Send, Copy, Archive, X, Search, UserMinus } from 'lucide-react';
import {
  useAdminNotifications,
  useCreateNotification,
  useUpdateNotification,
  useDuplicateNotification,
  useNotificationExclusions,
  NOTIFICATION_CATEGORIES,
  getCategoryLabel,
} from '@/hooks/useNotifications';
import { useAllUsers } from '@/hooks/useUserManagement';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type NotifStatus = 'draft' | 'published' | 'scheduled' | 'archived';

const STATUS_OPTIONS: { value: NotifStatus; label: string }[] = [
  { value: 'draft', label: 'Entwurf' },
  { value: 'scheduled', label: 'Geplant' },
  { value: 'published', label: 'Veröffentlicht' },
  { value: 'archived', label: 'Archiviert' },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'published': return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Veröffentlicht</Badge>;
    case 'scheduled': return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Geplant</Badge>;
    case 'archived': return <Badge variant="secondary">Archiviert</Badge>;
    default: return <Badge variant="outline">Entwurf</Badge>;
  }
}

const emptyForm = {
  title: '',
  body: '',
  description: '',
  category: 'general',
  link_url: '',
  link_label: '',
  target_role: 'client',
  status: 'draft' as NotifStatus,
  scheduled_at: '',
  expires_at: '',
};

export default function AdminNotifications() {
  const { data: notifications, isLoading } = useAdminNotifications();
  const { data: allUsers } = useAllUsers();
  const createNotification = useCreateNotification();
  const updateNotification = useUpdateNotification();
  const duplicateNotification = useDuplicateNotification();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Load exclusions when editing
  const { data: existingExclusions } = useNotificationExclusions(editingId);

  const clientUsers = useMemo(() =>
    allUsers?.filter(u => u.role === 'client') || [],
    [allUsers]
  );

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return [];
    const q = userSearch.toLowerCase();
    return clientUsers
      .filter(u =>
        !excludedUserIds.includes(u.id) &&
        (`${u.first_name} ${u.last_name}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [clientUsers, userSearch, excludedUserIds]);

  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    return notifications.filter(n => {
      if (filterStatus !== 'all' && n.status !== filterStatus) return false;
      if (filterCategory !== 'all' && n.category !== filterCategory) return false;
      return true;
    });
  }, [notifications, filterStatus, filterCategory]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setExcludedUserIds([]);
    setUserSearch('');
    setDialogOpen(true);
  };

  const openEdit = (n: any) => {
    setEditingId(n.id);
    setForm({
      title: n.title,
      body: n.body,
      description: n.description || '',
      category: n.category || 'general',
      link_url: n.link_url || '',
      link_label: n.link_label || '',
      target_role: n.target_role || 'client',
      status: n.status as NotifStatus,
      scheduled_at: n.scheduled_at ? n.scheduled_at.slice(0, 16) : '',
      expires_at: n.expires_at ? n.expires_at.slice(0, 16) : '',
    });
    setExcludedUserIds(existingExclusions || []);
    setUserSearch('');
    setDialogOpen(true);
  };

  // Sync exclusions when they load for editing
  useEffect(() => {
    if (editingId && existingExclusions) {
      setExcludedUserIds(existingExclusions);
    }
  }, [editingId, existingExclusions]);

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('Titel und Nachricht sind erforderlich.');
      return;
    }

    const payload: any = {
      ...form,
      excluded_user_ids: excludedUserIds,
    };
    if (form.scheduled_at) payload.scheduled_at = new Date(form.scheduled_at).toISOString();
    else payload.scheduled_at = null;
    if (form.expires_at) payload.expires_at = new Date(form.expires_at).toISOString();
    else payload.expires_at = null;
    if (!form.link_url) { payload.link_url = null; payload.link_label = null; }
    if (!form.description) payload.description = null;

    try {
      if (editingId) {
        await updateNotification.mutateAsync({ id: editingId, ...payload });
        toast.success('Benachrichtigung aktualisiert.');
      } else {
        await createNotification.mutateAsync(payload);
        toast.success('Benachrichtigung erstellt.');
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await updateNotification.mutateAsync({ id, status: 'published', published_at: new Date().toISOString() });
      toast.success('Veröffentlicht.');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleArchive = async (id: string) => {
    try {
      await updateNotification.mutateAsync({ id, status: 'archived' });
      toast.success('Archiviert.');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateNotification.mutateAsync(id);
      toast.success('Kopie erstellt.');
    } catch (err: any) { toast.error(err.message); }
  };

  const getUserName = (userId: string) => {
    const u = clientUsers.find(u => u.id === userId);
    return u ? `${u.first_name} ${u.last_name}` : userId.slice(0, 8) + '…';
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Benachrichtigungen</h1>
            <p className="text-sm text-muted-foreground">In-App Mitteilungen verwalten und veröffentlichen</p>
          </div>
          <Button onClick={openCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Neue Mitteilung
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              {STATUS_OPTIONS.map(s => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Kategorie" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Kategorien</SelectItem>
              {NOTIFICATION_CATEGORIES.map(c => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Keine Benachrichtigungen gefunden.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredNotifications.map(n => (
              <Card key={n.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(n)}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-sm text-foreground truncate">{n.title}</h3>
                        {getStatusBadge(n.status)}
                        <Badge variant="outline" className="text-xs">{getCategoryLabel(n.category)}</Badge>
                        {n.exclusion_count > 0 && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <UserMinus className="h-3 w-3" /> {n.exclusion_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{n.body}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>Ziel: {n.target_role === 'client' ? 'Alle Kunden' : 'Mitarbeiter'}</span>
                        {n.published_at && <span>Veröffentlicht: {format(new Date(n.published_at), 'dd.MM.yy HH:mm', { locale: de })}</span>}
                        {n.expires_at && <span>Ablauf: {format(new Date(n.expires_at), 'dd.MM.yy', { locale: de })}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {n.status === 'draft' && (
                        <Button size="sm" variant="outline" className="gap-1 h-8" onClick={() => handlePublish(n.id)}>
                          <Send className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Veröffentlichen</span>
                        </Button>
                      )}
                      {n.status === 'published' && (
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleArchive(n.id)}>
                          <Archive className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleDuplicate(n.id)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Benachrichtigung bearbeiten' : 'Neue Benachrichtigung'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label>Titel *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="z.B. Neuer Bereich verfügbar" />
            </div>

            {/* Short message */}
            <div className="space-y-1.5">
              <Label>Kurznachricht *</Label>
              <Textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={3} placeholder="Kurze Info für die Benachrichtigung…" />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label>Ausführlicher Text (optional)</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} placeholder="Längere Beschreibung…" />
            </div>

            {/* Category & Target */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kategorie</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Zielgruppe</Label>
                <Select value={form.target_role} onValueChange={v => setForm(f => ({ ...f, target_role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Alle Kunden</SelectItem>
                    <SelectItem value="all">Alle Nutzer</SelectItem>
                    <SelectItem value="staff">Nur Mitarbeiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Link / CTA */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Link (optional)</Label>
                <Input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} placeholder="/app/client-portal/tools" />
              </div>
              <div className="space-y-1.5">
                <Label>Button-Text</Label>
                <Input value={form.link_label} onChange={e => setForm(f => ({ ...f, link_label: e.target.value }))} placeholder="Jetzt ansehen" />
              </div>
            </div>

            {/* Status & Dates */}
            <Separator />
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v: NotifStatus) => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Geplant ab</Label>
                <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Ablaufdatum</Label>
                <Input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
              </div>
            </div>

            {/* Exclusions */}
            <Separator />
            <Accordion type="single" collapsible>
              <AccordionItem value="exclusions" className="border-0">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Personen ausschliessen ({excludedUserIds.length})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        placeholder="Person suchen…"
                        className="pl-9"
                      />
                    </div>

                    {/* Search results */}
                    {filteredUsers.length > 0 && (
                      <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                        {filteredUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setExcludedUserIds(prev => [...prev, u.id]);
                              setUserSearch('');
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors flex items-center justify-between"
                          >
                            <span>{u.first_name} {u.last_name}</span>
                            <span className="text-xs text-muted-foreground">{u.email}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Excluded list */}
                    {excludedUserIds.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Ausgeschlossene Personen:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {excludedUserIds.map(uid => (
                            <Badge key={uid} variant="secondary" className="gap-1 pr-1">
                              {getUserName(uid)}
                              <button onClick={() => setExcludedUserIds(prev => prev.filter(id => id !== uid))}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleSave} disabled={createNotification.isPending || updateNotification.isPending}>
                {editingId
                  ? 'Speichern'
                  : form.status === 'published'
                    ? 'Veröffentlichen'
                    : 'Als Entwurf speichern'
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
