import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useCase,
  useCaseTasks,
  useCaseMeetings,
  useCaseNotes,
  useUpdateCase,
  useUpdateCaseStatus,
  useCreateTaskForCase,
  useUpdateTaskStatus,
  useMarkCaseTaskDone,
  useCreateMeetingForCase,
  useCreateNoteForCase,
  useDeleteCase,
  useDeleteTask,
} from '@/hooks/useCaseData';
import { useProfiles } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Briefcase,
  ClipboardList,
  Calendar,
  FileText,
  Check,
  Plus,
  Edit,
  User,
  Clock,
  MoreVertical,
  Trash2,
} from 'lucide-react';
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
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { AppLayout } from '@/components/AppLayout';
import { toast } from 'sonner';
import { format, Locale } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';
import type { Database } from '@/integrations/supabase/types';

type CaseStatus = Database['public']['Enums']['case_status'];
type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];
type MeetingType = Database['public']['Enums']['meeting_type'];

const DATE_LOCALES: Record<string, Locale> = { de, en: enUS, fr, it, gsw: de };
const CASE_STATUSES: CaseStatus[] = ['offen', 'in_bearbeitung', 'wartet_auf_kunde', 'abgeschlossen', 'pausiert'];
const TASK_STATUSES: TaskStatus[] = ['offen', 'in_arbeit', 'erledigt', 'blockiert'];
const TASK_PRIORITIES: TaskPriority[] = ['niedrig', 'mittel', 'hoch', 'dringend'];
const MEETING_TYPES: MeetingType[] = ['erstberatung', 'folgeberatung', 'check_in', 'telefonat', 'video_call'];

const PRIORITY_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  niedrig: 'outline',
  mittel: 'secondary',
  hoch: 'default',
  dringend: 'destructive',
};

export default function CaseDetail() {
  const { t, i18n } = useTranslation();
  const { id: caseId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const dateLocale = DATE_LOCALES[i18n.language] || de;

  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'all'>('all');
  const { data: caseData, isLoading: loadingCase } = useCase(caseId!);
  const { data: tasks, isLoading: loadingTasks, error: tasksError } = useCaseTasks(caseId!, taskFilter);
  const { data: meetings, isLoading: loadingMeetings } = useCaseMeetings(caseId!);
  const { data: notes, isLoading: loadingNotes } = useCaseNotes(caseId!);
  const { data: profiles } = useProfiles();

  const updateCase = useUpdateCase();
  const updateCaseStatus = useUpdateCaseStatus();
  const createTask = useCreateTaskForCase();
  const updateTaskStatus = useUpdateTaskStatus();
  const markTaskDone = useMarkCaseTaskDone();
  const createMeeting = useCreateMeetingForCase();
  const createNote = useCreateNoteForCase();

  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const deleteCase = useDeleteCase();
  const deleteTask = useDeleteTask();

  const [editForm, setEditForm] = useState({ title: '', description: '', assigned_to: '', due_date: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'mittel' as TaskPriority, due_date: '', assigned_to: '' });
  const [meetingForm, setMeetingForm] = useState({ scheduled_at: '', meeting_type: 'folgeberatung' as MeetingType, duration_minutes: 60, location: '' });

  const roleLabel = role === 'admin' ? t('roles.admin') : t('roles.staff');
  const roleVariant = role === 'admin' ? 'default' : 'secondary';

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
      case 'pausiert': case 'in_bearbeitung': case 'in_arbeit': return 'secondary';
      case 'archiviert': case 'abgeschlossen': case 'erledigt': return 'outline';
      case 'blockiert': case 'wartet_auf_kunde': return 'destructive';
      default: return 'outline';
    }
  };

  const handleEditCase = () => {
    if (caseData) {
      setEditForm({
        title: caseData.title,
        description: caseData.description || '',
        assigned_to: caseData.assigned_to || '',
        due_date: caseData.due_date || '',
      });
      setEditOpen(true);
    }
  };

  const handleSaveCase = async () => {
    try {
      await updateCase.mutateAsync({
        caseId: caseId!,
        data: {
          title: editForm.title,
          description: editForm.description || null,
          assigned_to: editForm.assigned_to || null,
          due_date: editForm.due_date || null,
        },
      });
      toast.success(t('case.updatedSuccess'));
      setEditOpen(false);
    } catch {
      toast.error(t('app.updateError'));
    }
  };

  const handleChangeStatus = async (status: CaseStatus) => {
    try {
      await updateCaseStatus.mutateAsync({ caseId: caseId!, status });
      toast.success(t('case.statusChanged'));
      setStatusOpen(false);
    } catch {
      toast.error(t('app.updateError'));
    }
  };

  const handleCreateTask = async () => {
    if (!taskForm.title.trim()) return;
    try {
      await createTask.mutateAsync({
        case_id: caseId!,
        title: taskForm.title,
        description: taskForm.description || undefined,
        priority: taskForm.priority,
        due_date: taskForm.due_date || undefined,
        assigned_to: taskForm.assigned_to || null,
      });
      toast.success(t('task.createdSuccess'));
      setTaskOpen(false);
      setTaskForm({ title: '', description: '', priority: 'mittel', due_date: '', assigned_to: '' });
    } catch {
      toast.error(t('task.createError'));
    }
  };

  const handleChangeTaskStatus = async (taskId: string, status: TaskStatus) => {
    try {
      await updateTaskStatus.mutateAsync({ taskId, status, caseId: caseId! });
      toast.success(t('task.statusChanged'));
    } catch {
      toast.error(t('app.updateError'));
    }
  };

  const handleMarkTaskDone = async (taskId: string) => {
    try {
      await markTaskDone.mutateAsync({ taskId, caseId: caseId! });
      toast.success(t('task.markedDone'));
    } catch {
      toast.error(t('app.error'));
    }
  };

  const handleCreateMeeting = async () => {
    if (!meetingForm.scheduled_at) return;
    try {
      await createMeeting.mutateAsync({
        case_id: caseId!,
        scheduled_at: meetingForm.scheduled_at,
        meeting_type: meetingForm.meeting_type,
        duration_minutes: meetingForm.duration_minutes,
        location: meetingForm.location || undefined,
      });
      toast.success(t('meeting.createdSuccess'));
      setMeetingOpen(false);
      setMeetingForm({ scheduled_at: '', meeting_type: 'folgeberatung', duration_minutes: 60, location: '' });
    } catch {
      toast.error(t('meeting.createError'));
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) return;
    try {
      await createNote.mutateAsync({ case_id: caseId!, content: newNote });
      toast.success(t('note.createdSuccess'));
      setNewNote('');
    } catch {
      toast.error(t('note.createError'));
    }
  };

  const handleDeleteCase = async () => {
    try {
      await deleteCase.mutateAsync(caseId!);
      toast.success(t('trash.deletedSuccess'));
      navigate(caseData?.client ? `/app/clients/${caseData.client.id}` : '/app/cases');
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

  if (loadingCase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('case.notFound')}</p>
          <Link to="/app/clients">
            <Button variant="outline">{t('app.back')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const upcomingMeetings = meetings?.filter(m => new Date(m.scheduled_at) >= now) || [];
  const pastMeetings = meetings?.filter(m => new Date(m.scheduled_at) < now).slice(0, 5) || [];
  const backLink = caseData.client ? `/app/clients/${caseData.client.id}` : '/app/clients';

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={backLink} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-foreground">{t('case.detail')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-4 py-8">
        {/* Case Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <Briefcase className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">{caseData.title}</h2>
                  <Badge variant={getStatusVariant(caseData.status)}>
                    {t(`case.statuses.${caseData.status}`, caseData.status)}
                  </Badge>
                </div>
                {caseData.description && (
                  <p className="text-muted-foreground mb-3">{caseData.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {caseData.client && (
                    <Link to={`/app/clients/${caseData.client.id}`} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      <User className="h-4 w-4" />
                      {caseData.client.first_name} {caseData.client.last_name}
                    </Link>
                  )}
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {t('case.assignedTo')}: {getProfileName(caseData.assigned_to)}
                  </span>
                  {caseData.due_date && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {t('case.dueDate')}: {formatDate(caseData.due_date)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {t('case.createdAt')}: {formatDate(caseData.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEditCase}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('case.editCase')}
                </Button>
                <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">{t('case.changeStatus')}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{t('case.changeStatus')}</DialogTitle></DialogHeader>
                    <div className="space-y-2">
                      {CASE_STATUSES.map((status) => (
                        <Button
                          key={status}
                          variant={caseData.status === status ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => handleChangeStatus(status)}
                        >
                          {t(`case.statuses.${status}`)}
                        </Button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('case.deleteCase')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('case.deleteCase')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('trash.softDeleteInfo')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('app.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteCase}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('app.delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
          {/* Tasks */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                {t('task.title')}
              </CardTitle>
              <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t('task.newTask')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t('task.createTask')}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>{t('task.taskTitle')} *</Label><Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
                    <div><Label>{t('task.description')}</Label><Textarea value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} rows={2} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('task.priority')}</Label>
                        <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v as TaskPriority })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TASK_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{t(`task.priorities.${p}`)}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div><Label>{t('task.dueDate')}</Label><Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} /></div>
                    </div>
                    <div>
                      <Label>{t('case.assignedTo')}</Label>
                      <Select value={taskForm.assigned_to} onValueChange={(v) => setTaskForm({ ...taskForm, assigned_to: v })}>
                        <SelectTrigger><SelectValue placeholder="–" /></SelectTrigger>
                        <SelectContent>
                          {profiles?.map((p) => <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>)}
                        </SelectContent>
                      </Select>
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
              <Tabs value={taskFilter} onValueChange={(v) => setTaskFilter(v as TaskStatus | 'all')} className="mb-4">
                <TabsList>
                  <TabsTrigger value="all">{t('task.all')}</TabsTrigger>
                  <TabsTrigger value="offen">{t('task.statuses.offen')}</TabsTrigger>
                  <TabsTrigger value="in_arbeit">{t('task.statuses.in_arbeit')}</TabsTrigger>
                  <TabsTrigger value="blockiert">{t('task.statuses.blockiert')}</TabsTrigger>
                  <TabsTrigger value="erledigt">{t('task.statuses.erledigt')}</TabsTrigger>
                </TabsList>
              </Tabs>
              {loadingTasks ? (
                <Skeleton className="h-20 w-full" />
              ) : tasksError ? (
                <p className="text-destructive">{t('task.loadError')}: {(tasksError as Error).message}</p>
              ) : tasks?.length === 0 ? (
                <p className="text-muted-foreground">{t('task.noTasks')}</p>
              ) : (
                <div className="space-y-2">
                  {tasks?.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded border hover:bg-muted/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{task.title}</span>
                          <Badge variant={PRIORITY_VARIANTS[task.priority] || 'secondary'}>
                            {t(`task.priorities.${task.priority}`)}
                          </Badge>
                          <Badge variant={getStatusVariant(task.status)}>
                            {t(`task.statuses.${task.status}`)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {task.due_date && `${t('table.due')}: ${formatDate(task.due_date)}`}
                          {task.assigned_to && ` • ${t('table.assignedTo')}: ${getProfileName(task.assigned_to)}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {task.status !== 'erledigt' && (
                          <Button variant="ghost" size="sm" onClick={() => handleMarkTaskDone(task.id)} title={t('task.markDone')}>
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {TASK_STATUSES.map((status) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => handleChangeTaskStatus(task.id, status)}
                                className={task.status === status ? 'bg-muted' : ''}
                              >
                                {t(`task.statuses.${status}`)}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setTaskToDelete(task.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('task.deleteTask')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t('meeting.createMeeting')}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t('meeting.createMeeting')}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>{t('meeting.scheduledAt')} *</Label><Input type="datetime-local" value={meetingForm.scheduled_at} onChange={(e) => setMeetingForm({ ...meetingForm, scheduled_at: e.target.value })} /></div>
                    <div>
                      <Label>{t('meeting.type')}</Label>
                      <Select value={meetingForm.meeting_type} onValueChange={(v) => setMeetingForm({ ...meetingForm, meeting_type: v as MeetingType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MEETING_TYPES.map((mt) => <SelectItem key={mt} value={mt}>{t(`meeting.types.${mt}`)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>{t('meeting.duration')}</Label><Input type="number" value={meetingForm.duration_minutes} onChange={(e) => setMeetingForm({ ...meetingForm, duration_minutes: parseInt(e.target.value) || 60 })} /></div>
                      <div><Label>{t('meeting.location')}</Label><Input value={meetingForm.location} onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })} /></div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setMeetingOpen(false)}>{t('app.cancel')}</Button>
                      <Button onClick={handleCreateMeeting}>{t('meeting.createMeeting')}</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loadingMeetings ? <Skeleton className="h-20 w-full" /> : meetings?.length === 0 ? (
                <p className="text-muted-foreground">{t('meeting.noMeetings')}</p>
              ) : (
                <div className="space-y-4">
                  {upcomingMeetings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('meeting.upcoming')}</h4>
                      <div className="space-y-2">
                        {upcomingMeetings.map((m) => (
                          <div key={m.id} className="p-3 rounded border bg-primary/5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{t(`meeting.types.${m.meeting_type}`)}</span>
                              <span className="text-sm">{formatDateTime(m.scheduled_at)}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {m.duration_minutes} {t('meeting.duration')} {m.location && `• ${m.location}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {pastMeetings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">{t('meeting.past')}</h4>
                      <div className="space-y-2">
                        {pastMeetings.map((m) => (
                          <div key={m.id} className="p-3 rounded border opacity-75">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{t(`meeting.types.${m.meeting_type}`)}</span>
                              <span className="text-sm">{formatDateTime(m.scheduled_at)}</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {m.duration_minutes} {t('meeting.duration')} {m.location && `• ${m.location}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('note.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={t('note.placeholder')}
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={handleSaveNote} disabled={!newNote.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {loadingNotes ? <Skeleton className="h-20 w-full" /> : notes?.length === 0 ? (
                  <p className="text-muted-foreground">{t('note.noNotes')}</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {notes?.map((note) => (
                      <div key={note.id} className="p-3 rounded border">
                        <p className="whitespace-pre-wrap">{note.content}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {getProfileName(note.author_id)} • {formatDateTime(note.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Case Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('case.editCase')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>{t('case.caseTitle')} *</Label><Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} /></div>
              <div><Label>{t('case.description')}</Label><Textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={3} /></div>
              <div>
                <Label>{t('case.assignedTo')}</Label>
                <Select value={editForm.assigned_to} onValueChange={(v) => setEditForm({ ...editForm, assigned_to: v })}>
                  <SelectTrigger><SelectValue placeholder="–" /></SelectTrigger>
                  <SelectContent>
                    {profiles?.map((p) => <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>{t('case.dueDate')}</Label><Input type="date" value={editForm.due_date} onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditOpen(false)}>{t('app.cancel')}</Button>
                <Button onClick={handleSaveCase}>{t('app.save')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
    </AppLayout>
  );
}
