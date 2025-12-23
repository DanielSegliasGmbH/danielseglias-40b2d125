/**
 * CUSTOMER DASHBOARD TAB
 * 
 * Zeigt Projekte, Aufgaben, Meetings und Notizen für einen Kunden.
 * Übernommen aus ClientDetail.tsx, umgestellt auf customer_id.
 */
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Briefcase,
  ClipboardList,
  Calendar,
  FileText,
  Check,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, Locale } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';
import {
  useCustomerCases,
  useCustomerOpenTasks,
  useCustomerMeetings,
  useCustomerNotes,
  useCreateCaseForCustomer,
  useCreateTaskForCustomer,
  useCreateMeetingForCustomer,
  useCreateNoteForCustomer,
  useMarkCustomerTaskDone,
  useDeleteCustomerTask,
} from '@/hooks/useCustomerDashboardData';
import { useProfiles } from '@/hooks/useDashboardData';
import type { Database } from '@/integrations/supabase/types';

type MeetingType = Database['public']['Enums']['meeting_type'];
type TaskPriority = Database['public']['Enums']['task_priority'];

const DATE_LOCALES: Record<string, Locale> = { de, en: enUS, fr, it, gsw: de };
const MEETING_TYPES: MeetingType[] = ['erstberatung', 'folgeberatung', 'check_in', 'telefonat', 'video_call'];
const TASK_PRIORITIES: TaskPriority[] = ['niedrig', 'mittel', 'hoch', 'dringend'];

interface CustomerDashboardTabProps {
  customerId: string;
}

export function CustomerDashboardTab({ customerId }: CustomerDashboardTabProps) {
  const { t, i18n } = useTranslation();
  const dateLocale = DATE_LOCALES[i18n.language] || de;

  const { data: cases, isLoading: loadingCases } = useCustomerCases(customerId);
  const { data: openTasks, isLoading: loadingTasks } = useCustomerOpenTasks(customerId);
  const { data: meetings, isLoading: loadingMeetings } = useCustomerMeetings(customerId);
  const { data: notes, isLoading: loadingNotes } = useCustomerNotes(customerId);
  const { data: profiles } = useProfiles();

  const createCase = useCreateCaseForCustomer();
  const createTask = useCreateTaskForCustomer();
  const createMeeting = useCreateMeetingForCustomer();
  const createNote = useCreateNoteForCustomer();
  const markTaskDone = useMarkCustomerTaskDone();
  const deleteTask = useDeleteCustomerTask();

  const [caseOpen, setCaseOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [caseSearch, setCaseSearch] = useState('');
  const [newNote, setNewNote] = useState('');
  const [selectedCaseForNote, setSelectedCaseForNote] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [caseForm, setCaseForm] = useState({ title: '', description: '', due_date: '' });
  const [taskForm, setTaskForm] = useState({ case_id: '', title: '', description: '', priority: 'mittel' as TaskPriority, due_date: '' });
  const [meetingForm, setMeetingForm] = useState({ case_id: '', scheduled_at: '', meeting_type: 'folgeberatung' as MeetingType, duration_minutes: 60, location: '' });

  // Auto-select case wenn nur ein Case existiert
  useEffect(() => {
    if (cases && cases.length === 1 && !taskForm.case_id) {
      setTaskForm(prev => ({ ...prev, case_id: cases[0].id }));
    }
  }, [cases, taskForm.case_id]);

  const filteredCases = useMemo(() => {
    if (!cases) return [];
    const term = caseSearch.trim().toLowerCase();
    if (!term) return cases;
    return cases.filter((c) => {
      const searchString = [c.title, c.description || ''].join(' ').toLowerCase();
      return searchString.includes(term);
    });
  }, [cases, caseSearch]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '–';
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: dateLocale });
  };

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return '–';
    return format(new Date(dateStr), 'dd.MM.yyyy HH:mm', { locale: dateLocale });
  };

  const getProfileName = (userId: string | null) => {
    if (!userId || !profiles) return '–';
    const profile = profiles.find((p) => p.id === userId);
    return profile ? `${profile.first_name} ${profile.last_name}` : '–';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'aktiv': case 'offen': return 'default';
      case 'pausiert': case 'in_bearbeitung': return 'secondary';
      case 'archiviert': case 'abgeschlossen': return 'outline';
      default: return 'outline';
    }
  };

  const handleMarkDone = async (taskId: string) => {
    try {
      await markTaskDone.mutateAsync(taskId);
      toast.success(t('task.markedDone'));
    } catch {
      toast.error(t('app.error'));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync(taskId);
      toast.success(t('trash.deletedSuccess'));
      setTaskToDelete(null);
    } catch {
      toast.error(t('app.error'));
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim() || !selectedCaseForNote) return;
    try {
      await createNote.mutateAsync({ case_id: selectedCaseForNote, content: newNote });
      toast.success(t('note.createdSuccess'));
      setNewNote('');
      setSelectedCaseForNote('');
    } catch {
      toast.error(t('note.createError'));
    }
  };

  const handleCreateCase = async () => {
    if (!caseForm.title.trim()) return;
    try {
      await createCase.mutateAsync({
        customer_id: customerId,
        title: caseForm.title,
        description: caseForm.description,
        due_date: caseForm.due_date,
      });
      toast.success(t('case.createdSuccess'));
      setCaseOpen(false);
      setCaseForm({ title: '', description: '', due_date: '' });
    } catch {
      toast.error(t('case.createError'));
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.case_id || !taskForm.title.trim()) return;
    try {
      await createTask.mutateAsync({
        case_id: taskForm.case_id,
        title: taskForm.title,
        description: taskForm.description || undefined,
        priority: taskForm.priority,
        due_date: taskForm.due_date || undefined,
      });
      toast.success(t('task.createdSuccess'));
      setTaskOpen(false);
      setTaskForm({ case_id: cases?.length === 1 ? cases[0].id : '', title: '', description: '', priority: 'mittel', due_date: '' });
    } catch {
      toast.error(t('task.createError'));
    }
  };

  const handleCreateMeeting = async () => {
    if (!meetingForm.case_id || !meetingForm.scheduled_at) return;
    try {
      await createMeeting.mutateAsync({
        case_id: meetingForm.case_id,
        scheduled_at: meetingForm.scheduled_at,
        meeting_type: meetingForm.meeting_type,
        duration_minutes: meetingForm.duration_minutes,
        location: meetingForm.location,
      });
      toast.success(t('meeting.createdSuccess'));
      setMeetingOpen(false);
      setMeetingForm({ case_id: '', scheduled_at: '', meeting_type: 'folgeberatung', duration_minutes: 60, location: '' });
    } catch {
      toast.error(t('meeting.createError'));
    }
  };

  const now = new Date();
  const upcomingMeetings = meetings?.filter(m => new Date(m.scheduled_at) >= now) || [];
  const pastMeetings = meetings?.filter(m => new Date(m.scheduled_at) < now).slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Delete Task Dialog */}
      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('task.deleteTask')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('trash.softDeleteInfo')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('app.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('app.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases/Projekte */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t('case.title')}
            </CardTitle>
            <Dialog open={caseOpen} onOpenChange={setCaseOpen}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t('case.createForClient')}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('case.createCase')}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>{t('case.caseTitle')} *</Label><Input value={caseForm.title} onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })} /></div>
                  <div><Label>{t('case.description')}</Label><Textarea value={caseForm.description} onChange={(e) => setCaseForm({ ...caseForm, description: e.target.value })} rows={3} /></div>
                  <div><Label>{t('case.dueDate')}</Label><Input type="date" value={caseForm.due_date} onChange={(e) => setCaseForm({ ...caseForm, due_date: e.target.value })} /></div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setCaseOpen(false)}>{t('app.cancel')}</Button>
                    <Button onClick={handleCreateCase}>{t('case.createCase')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingCases ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('case.search')}
                    value={caseSearch}
                    onChange={(e) => setCaseSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {filteredCases.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('case.noCases')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('case.caseTitle')}</TableHead>
                        <TableHead>{t('case.status')}</TableHead>
                        <TableHead>{t('case.dueDate')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCases.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>
                            <Link to={`/app/cases/${c.id}`} className="font-medium hover:underline">
                              {c.title}
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusVariant(c.status)}>
                              {t(`case.statuses.${c.status}`, c.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(c.due_date)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Offene Aufgaben */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {t('task.openTasks')}
            </CardTitle>
            <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!cases || cases.length === 0}>
                  <Plus className="h-4 w-4 mr-1" />{t('task.createTask')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('task.createTask')}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t('case.title')} *</Label>
                    <Select value={taskForm.case_id} onValueChange={(v) => setTaskForm({ ...taskForm, case_id: v })}>
                      <SelectTrigger><SelectValue placeholder={t('task.selectCase')} /></SelectTrigger>
                      <SelectContent>
                        {cases?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t('task.taskTitle')} *</Label><Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
                  <div><Label>{t('task.description')}</Label><Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{t('task.priority')}</Label>
                      <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as TaskPriority })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TASK_PRIORITIES.map((p) => (
                            <SelectItem key={p} value={p}>{t(`task.priorities.${p}`, p)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>{t('task.dueDate')}</Label><Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} /></div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setTaskOpen(false)}>{t('app.cancel')}</Button>
                    <Button onClick={handleCreateTask}>{t('task.createTask')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingTasks ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : openTasks?.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('task.noTasks')}</p>
            ) : (
              <div className="space-y-2">
                {openTasks?.slice(0, 10).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {(task as any).case?.title} • {formatDate(task.due_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleMarkDone(task.id)}>
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setTaskToDelete(task.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meetings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('meeting.title')}
            </CardTitle>
            <Dialog open={meetingOpen} onOpenChange={setMeetingOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!cases || cases.length === 0}>
                  <Plus className="h-4 w-4 mr-1" />{t('meeting.planMeeting')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t('meeting.planMeeting')}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t('case.title')} *</Label>
                    <Select value={meetingForm.case_id} onValueChange={(v) => setMeetingForm({ ...meetingForm, case_id: v })}>
                      <SelectTrigger><SelectValue placeholder={t('task.selectCase')} /></SelectTrigger>
                      <SelectContent>
                        {cases?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>{t('meeting.scheduledAt')} *</Label><Input type="datetime-local" value={meetingForm.scheduled_at} onChange={(e) => setMeetingForm({ ...meetingForm, scheduled_at: e.target.value })} /></div>
                  <div>
                    <Label>{t('meeting.meetingType')}</Label>
                    <Select value={meetingForm.meeting_type} onValueChange={(v) => setMeetingForm({ ...meetingForm, meeting_type: v as MeetingType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MEETING_TYPES.map((mt) => (
                          <SelectItem key={mt} value={mt}>{t(`meeting.types.${mt}`, mt)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t('meeting.duration')}</Label><Input type="number" value={meetingForm.duration_minutes} onChange={(e) => setMeetingForm({ ...meetingForm, duration_minutes: Number(e.target.value) })} /></div>
                    <div><Label>{t('meeting.location')}</Label><Input value={meetingForm.location} onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })} /></div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setMeetingOpen(false)}>{t('app.cancel')}</Button>
                    <Button onClick={handleCreateMeeting}>{t('meeting.planMeeting')}</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loadingMeetings ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">{t('meeting.upcoming')}</h4>
                    <div className="space-y-2">
                      {upcomingMeetings.slice(0, 3).map((m) => (
                        <div key={m.id} className="p-2 border rounded-lg text-sm">
                          <p className="font-medium">{formatDateTime(m.scheduled_at)}</p>
                          <p className="text-muted-foreground">{t(`meeting.types.${m.meeting_type}`, m.meeting_type)} • {(m as any).case?.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pastMeetings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-muted-foreground">{t('meeting.past')}</h4>
                    <div className="space-y-1">
                      {pastMeetings.map((m) => (
                        <div key={m.id} className="text-sm text-muted-foreground">
                          {formatDateTime(m.scheduled_at)} - {t(`meeting.types.${m.meeting_type}`, m.meeting_type)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {meetings?.length === 0 && (
                  <p className="text-muted-foreground text-sm">{t('meeting.noMeetings')}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notizen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('note.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingNotes ? (
              <Skeleton className="h-20 w-full" />
            ) : (
              <div className="space-y-4">
                {/* Neue Notiz erstellen */}
                {cases && cases.length > 0 && (
                  <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                    <Select value={selectedCaseForNote} onValueChange={setSelectedCaseForNote}>
                      <SelectTrigger><SelectValue placeholder={t('note.selectCase')} /></SelectTrigger>
                      <SelectContent>
                        {cases.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      placeholder={t('note.placeholder')}
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                    />
                    <Button size="sm" onClick={handleSaveNote} disabled={!newNote.trim() || !selectedCaseForNote}>
                      {t('note.save')}
                    </Button>
                  </div>
                )}
                
                {/* Bestehende Notizen */}
                {notes?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('note.noNotes')}</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notes?.slice(0, 10).map((note) => (
                      <div key={note.id} className="p-2 border rounded-lg text-sm">
                        <p className="text-xs text-muted-foreground mb-1">
                          {formatDateTime(note.created_at)} • {(note as any).case?.title}
                        </p>
                        <p className="whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
