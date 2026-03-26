import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Plus, ChevronDown, Pencil, Trash2, Users, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  useCourseModules,
  useAllCourseLessons,
  useUpsertCourseLesson,
  useDeleteCourseLesson,
  useModuleAccess,
  useLessonAccess,
  useUpsertModuleAccess,
  useUpsertLessonAccess,
  useLessonFeedback,
  CourseModule,
  CourseLesson,
} from '@/hooks/useCourseData';

export default function AdminCourses() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Videokurs verwalten</h1>
        </div>

        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Inhalte</TabsTrigger>
            <TabsTrigger value="access">Freischaltung</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-6">
            <ContentTab />
          </TabsContent>
          <TabsContent value="access" className="mt-6">
            <AccessTab />
          </TabsContent>
          <TabsContent value="feedback" className="mt-6">
            <FeedbackTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}

/* ─── Content Tab ─── */
function ContentTab() {
  const { data: modules } = useCourseModules();
  const { data: allLessons } = useAllCourseLessons();
  const upsertLesson = useUpsertCourseLesson();
  const deleteLesson = useDeleteCourseLesson();
  const [editLesson, setEditLesson] = useState<Partial<CourseLesson> | null>(null);
  const [editModuleId, setEditModuleId] = useState<string>('');

  const openNewLesson = (moduleId: string) => {
    setEditModuleId(moduleId);
    setEditLesson({ title: '', description: '', video_url: '', thumbnail_url: '', duration_text: '', sort_order: 0, module_id: moduleId });
  };

  const openEditLesson = (lesson: CourseLesson) => {
    setEditModuleId(lesson.module_id);
    setEditLesson(lesson);
  };

  const saveLesson = async () => {
    if (!editLesson?.title?.trim()) return;
    try {
      await upsertLesson.mutateAsync({ ...editLesson, module_id: editModuleId } as any);
      toast.success('Lektion gespeichert');
      setEditLesson(null);
    } catch {
      toast.error('Fehler beim Speichern');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Lektion wirklich löschen?')) return;
    try {
      await deleteLesson.mutateAsync(id);
      toast.success('Lektion gelöscht');
    } catch {
      toast.error('Fehler beim Löschen');
    }
  };

  return (
    <div className="space-y-4">
      {modules?.map(mod => {
        const moduleLessons = allLessons?.filter(l => l.module_id === mod.id) || [];
        return (
          <Collapsible key={mod.id}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{mod.icon_emoji}</span>
                      <div>
                        <CardTitle className="text-base">{mod.title}</CardTitle>
                        <CardDescription>{moduleLessons.length} Lektionen</CardDescription>
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2">
                  {moduleLessons.map(lesson => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{lesson.title}</p>
                        {lesson.duration_text && (
                          <p className="text-xs text-muted-foreground">{lesson.duration_text}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => openEditLesson(lesson)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(lesson.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => openNewLesson(mod.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Lektion hinzufügen
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}

      {/* Edit/Create Lesson Dialog */}
      <Dialog open={!!editLesson} onOpenChange={open => !open && setEditLesson(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editLesson?.id ? 'Lektion bearbeiten' : 'Neue Lektion'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titel</Label>
              <Input
                value={editLesson?.title || ''}
                onChange={e => setEditLesson(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={editLesson?.description || ''}
                onChange={e => setEditLesson(prev => prev ? { ...prev, description: e.target.value } : null)}
                rows={3}
              />
            </div>
            <div>
              <Label>Video-Link (Google Drive URL)</Label>
              <Input
                value={editLesson?.video_url || ''}
                onChange={e => setEditLesson(prev => prev ? { ...prev, video_url: e.target.value } : null)}
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div>
              <Label>Thumbnail URL (optional)</Label>
              <Input
                value={editLesson?.thumbnail_url || ''}
                onChange={e => setEditLesson(prev => prev ? { ...prev, thumbnail_url: e.target.value } : null)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Dauer (z.B. "5 Min.")</Label>
                <Input
                  value={editLesson?.duration_text || ''}
                  onChange={e => setEditLesson(prev => prev ? { ...prev, duration_text: e.target.value } : null)}
                />
              </div>
              <div>
                <Label>Reihenfolge</Label>
                <Input
                  type="number"
                  value={editLesson?.sort_order ?? 0}
                  onChange={e => setEditLesson(prev => prev ? { ...prev, sort_order: parseInt(e.target.value) || 0 } : null)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLesson(null)}>Abbrechen</Button>
            <Button onClick={saveLesson} disabled={!editLesson?.title?.trim()}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Access Tab ─── */
function AccessTab() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Fetch customers with linked users
  const { data: customers } = useQuery({
    queryKey: ['customers-for-course-access'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .is('deleted_at', null)
        .order('last_name');
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Kunde auswählen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder="Kunde auswählen…" />
            </SelectTrigger>
            <SelectContent>
              {customers?.map(c => (
                <SelectItem key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedCustomerId && <CustomerAccessPanel customerId={selectedCustomerId} />}
    </div>
  );
}

function CustomerAccessPanel({ customerId }: { customerId: string }) {
  const { data: modules } = useCourseModules();
  const { data: allLessons } = useAllCourseLessons();
  const { data: moduleAccess, isLoading: maLoading } = useModuleAccess(customerId);
  const { data: lessonAccess, isLoading: laLoading } = useLessonAccess(customerId);
  const upsertModule = useUpsertModuleAccess();
  const upsertLesson = useUpsertLessonAccess();

  const isModuleUnlocked = (moduleId: string) =>
    moduleAccess?.find(a => a.module_id === moduleId)?.is_unlocked ?? false;

  const isLessonUnlocked = (lessonId: string) =>
    lessonAccess?.find(a => a.lesson_id === lessonId)?.is_unlocked ?? false;

  const toggleModule = async (moduleId: string, current: boolean) => {
    try {
      await upsertModule.mutateAsync({ customer_id: customerId, module_id: moduleId, is_unlocked: !current });
    } catch {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const toggleLesson = async (lessonId: string, current: boolean) => {
    try {
      await upsertLesson.mutateAsync({ customer_id: customerId, lesson_id: lessonId, is_unlocked: !current });
    } catch {
      toast.error('Fehler beim Aktualisieren');
    }
  };

  if (maLoading || laLoading) return <p className="text-sm text-muted-foreground">Lade Zugriffsrechte…</p>;

  return (
    <div className="space-y-3">
      {modules?.map(mod => {
        const moduleLessons = allLessons?.filter(l => l.module_id === mod.id) || [];
        const moduleOn = isModuleUnlocked(mod.id);

        return (
          <Collapsible key={mod.id}>
            <Card>
              <div className="flex items-center justify-between p-4">
                <CollapsibleTrigger asChild>
                  <button className="flex items-center gap-3 text-left flex-1">
                    <span className="text-lg">{mod.icon_emoji}</span>
                    <span className="font-medium text-sm">{mod.title}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
                  </button>
                </CollapsibleTrigger>
                <Switch
                  checked={moduleOn}
                  onCheckedChange={() => toggleModule(mod.id, moduleOn)}
                  className="ml-3"
                />
              </div>
              <CollapsibleContent>
                <CardContent className="pt-0 space-y-2">
                  {moduleLessons.map(lesson => {
                    const lessonOn = isLessonUnlocked(lesson.id);
                    return (
                      <div key={lesson.id} className="flex items-center justify-between p-2 pl-10 rounded-lg bg-muted/30">
                        <span className="text-sm">{lesson.title}</span>
                        <Switch
                          checked={lessonOn}
                          onCheckedChange={() => toggleLesson(lesson.id, lessonOn)}
                        />
                      </div>
                    );
                  })}
                  {moduleLessons.length === 0 && (
                    <p className="text-xs text-muted-foreground pl-10">Keine Lektionen vorhanden</p>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}

/* ─── Feedback Tab ─── */
function FeedbackTab() {
  const { data: modules } = useCourseModules();
  const { data: allLessons } = useAllCourseLessons();
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const { data: feedbacks } = useLessonFeedback(selectedLessonId || undefined);

  // Fetch customer names for display
  const { data: customers } = useQuery({
    queryKey: ['customers-names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .is('deleted_at', null);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch customer_users to map user_id to customer
  const { data: customerUsers } = useQuery({
    queryKey: ['customer-users-map'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customer_users').select('user_id, customer_id');
      if (error) throw error;
      return data || [];
    },
  });

  const getCustomerName = (customerId: string) => {
    const c = customers?.find(c => c.id === customerId);
    return c ? `${c.first_name} ${c.last_name}` : 'Unbekannt';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback nach Lektion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
            <SelectTrigger>
              <SelectValue placeholder="Lektion auswählen…" />
            </SelectTrigger>
            <SelectContent>
              {modules?.map(mod => {
                const moduleLessons = allLessons?.filter(l => l.module_id === mod.id) || [];
                return moduleLessons.map(lesson => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {mod.icon_emoji} {lesson.title}
                  </SelectItem>
                ));
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedLessonId && feedbacks && (
        <Card>
          <CardContent className="p-4 space-y-3">
            {feedbacks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Noch kein Feedback vorhanden.</p>
            ) : (
              feedbacks.map(fb => (
                <div key={fb.id} className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{getCustomerName(fb.customer_id)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(fb.created_at).toLocaleDateString('de-CH')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{fb.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
