/**
 * CLIENT DETAIL PAGE
 * 
 * Hooks für Daten:
 * - useClient(clientId) -> Client-Stammdaten
 * - useClientCases(clientId) -> Cases dieses Clients
 * - useClientOpenTasks(clientId) -> Offene Tasks (über Cases)
 * - useClientMeetings(clientId) -> Meetings (über Cases)
 * - useClientNotes(clientId) -> Notizen (über Cases)
 * 
 * Task-Erstellung: useCreateTaskForClient Hook
 */
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useClient,
  useClientCases,
  useClientOpenTasks,
  useClientMeetings,
  useClientNotes,
  useMarkTaskDone,
  useCreateNote,
  useCreateCaseForClient,
  useCreateMeeting,
  useUpdateClient,
  useCreateTaskForClient,
  useDeleteClient,
} from '@/hooks/useClientData';
import { useDeleteTask } from '@/hooks/useCaseData';
import { useProfiles } from '@/hooks/useDashboardData';
import { ClientPortalSettingsCard } from '@/components/admin/ClientPortalSettingsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  ArrowLeft,
  Briefcase,
  ClipboardList,
  Calendar,
  FileText,
  Check,
  Plus,
  Edit,
  Phone,
  Mail,
  MapPin,
  Search,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type MeetingType = Database['public']['Enums']['meeting_type'];
type ClientStatus = Database['public']['Enums']['client_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];

const DATE_LOCALES: Record<string, Locale> = { de, en: enUS, fr, it, gsw: de };
const MEETING_TYPES: MeetingType[] = ['erstberatung', 'folgeberatung', 'check_in', 'telefonat', 'video_call'];
const CLIENT_STATUSES: ClientStatus[] = ['aktiv', 'pausiert', 'archiviert'];
const TASK_PRIORITIES: TaskPriority[] = ['niedrig', 'mittel', 'hoch', 'dringend'];

export default function ClientDetail() {
  const { t, i18n } = useTranslation();
  const { id: clientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const dateLocale = DATE_LOCALES[i18n.language] || de;

  const { data: client, isLoading: loadingClient } = useClient(clientId!);
  const { data: cases, isLoading: loadingCases } = useClientCases(clientId!);
  const { data: openTasks, isLoading: loadingTasks } = useClientOpenTasks(clientId!);
  const { data: meetings, isLoading: loadingMeetings } = useClientMeetings(clientId!);
  const { data: notes, isLoading: loadingNotes } = useClientNotes(clientId!);
  const { data: profiles } = useProfiles();

  const markTaskDone = useMarkTaskDone();
  const createNote = useCreateNote();
  const createCase = useCreateCaseForClient();
  const createMeeting = useCreateMeeting();
  const updateClient = useUpdateClient();
  const createTask = useCreateTaskForClient();
  const deleteClient = useDeleteClient();
  const deleteTask = useDeleteTask();

  const [newNote, setNewNote] = useState('');
  const [selectedCaseForNote, setSelectedCaseForNote] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [caseOpen, setCaseOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [caseSearch, setCaseSearch] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', email: '', phone: '', address: '', status: 'aktiv' as ClientStatus });
  const [caseForm, setCaseForm] = useState({ title: '', description: '', due_date: '' });
  const [meetingForm, setMeetingForm] = useState({ case_id: '', scheduled_at: '', meeting_type: 'folgeberatung' as MeetingType, duration_minutes: 60, location: '' });
  const [taskForm, setTaskForm] = useState({ case_id: '', title: '', description: '', priority: 'mittel' as TaskPriority, due_date: '' });

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

  const handleEditClient = () => {
    if (client) {
      setEditForm({
        first_name: client.first_name,
        last_name: client.last_name,
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        status: client.status,
      });
      setEditOpen(true);
    }
  };

  const handleSaveClient = async () => {
    try {
      await updateClient.mutateAsync({ clientId: clientId!, data: editForm });
      toast.success(t('client.updatedSuccess'));
      setEditOpen(false);
    } catch {
      toast.error(t('app.updateError'));
    }
  };

  const handleDeleteClient = async () => {
    try {
      await deleteClient.mutateAsync(clientId!);
      toast.success(t('trash.deletedSuccess'));
      navigate('/app/clients');
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

  const handleCreateCase = async () => {
    if (!caseForm.title.trim()) return;
    try {
      await createCase.mutateAsync({
        client_id: clientId!,
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

  if (loadingClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('client.notFound')}</p>
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

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/app/clients" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-foreground">{t('client.detail')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-4 py-8">
        {/* Client Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{client.first_name} {client.last_name}</h2>
                  <Badge variant={getStatusVariant(client.status)}>
                    {t(`client.statuses.${client.status}`, client.status)}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {client.phone && (
                    <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {client.phone}</span>
                  )}
                  {client.email && (
                    <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> {client.email}</span>
                  )}
                  {client.address && (
                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {client.address}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleEditClient}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('client.editClient')}
                </Button>
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
                      {t('client.deleteClient')}
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
              <AlertDialogTitle>{t('client.deleteClient')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('trash.softDeleteInfo')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('app.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClient}
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
          {/* Cases */}
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
              {loadingCases ? <Skeleton className="h-20 w-full" /> : cases?.length === 0 ? (
                <p className="text-muted-foreground">{t('case.noCases')}</p>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('case.searchPlaceholder')}
                      value={caseSearch}
                      onChange={(e) => setCaseSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {cases && cases.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {filteredCases.length} {t('case.of')} {cases.length} {t('case.title')}
                    </p>
                  )}
                  {filteredCases.length === 0 ? (
                    <p className="text-muted-foreground py-2">{t('case.noCasesFound')}</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredCases.map((c) => (
                        <Link key={c.id} to={`/app/cases/${c.id}`} className="block p-3 rounded border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{c.title}</span>
                            <Badge variant={getStatusVariant(c.status)}>{t(`case.statuses.${c.status}`, c.status)}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {t('table.assignedTo')}: {getProfileName(c.assigned_to)} {c.due_date && `• ${t('table.due')}: ${formatDate(c.due_date)}`}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Open Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                {t('task.openTasks')}
              </CardTitle>
              {cases && cases.length > 0 ? (
                <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" />{t('task.newTask')}</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{t('task.createTask')}</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      {cases.length > 1 && (
                        <div>
                          <Label>{t('task.selectCase')} *</Label>
                          <Select value={taskForm.case_id} onValueChange={(v) => setTaskForm({ ...taskForm, case_id: v })}>
                            <SelectTrigger><SelectValue placeholder={t('task.selectCase')} /></SelectTrigger>
                            <SelectContent>
                              {cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {cases.length === 1 && (
                        <p className="text-sm text-muted-foreground">Case: <strong>{cases[0].title}</strong></p>
                      )}
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
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setTaskOpen(false)}>{t('app.cancel')}</Button>
                        <Button onClick={handleCreateTask} disabled={!taskForm.title.trim() || !taskForm.case_id}>{t('task.createTask')}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Link to={`#`} onClick={(e) => { e.preventDefault(); setCaseOpen(true); }}>
                  <Button size="sm" variant="outline">{t('case.createCase')}</Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {loadingTasks ? <Skeleton className="h-20 w-full" /> : openTasks?.length === 0 ? (
                <p className="text-muted-foreground">
                  {cases && cases.length === 0 
                    ? t('case.noCases') 
                    : t('task.noTasks')
                  }
                </p>
              ) : (
                <div className="space-y-2">
                  {openTasks?.slice(0, 10).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <span className="font-medium">{task.title}</span>
                        <div className="text-sm text-muted-foreground">
                          {task.case?.title} {task.due_date && `• ${formatDate(task.due_date)}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleMarkDone(task.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                    <div>
                      <Label>{t('meeting.selectCase')} *</Label>
                      <Select value={meetingForm.case_id} onValueChange={(v) => setMeetingForm({ ...meetingForm, case_id: v })}>
                        <SelectTrigger><SelectValue placeholder={t('meeting.selectCase')} /></SelectTrigger>
                        <SelectContent>
                          {cases?.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
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
                      <h4 className="text-sm font-medium mb-2">{t('meeting.upcoming')}</h4>
                      {upcomingMeetings.map((m) => (
                        <div key={m.id} className="p-3 rounded border mb-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{formatDateTime(m.scheduled_at)}</span>
                            <Badge variant="outline">{t(`meeting.types.${m.meeting_type}`)}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">{m.case?.title} • {m.duration_minutes} min {m.location && `• ${m.location}`}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {pastMeetings.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-muted-foreground">{t('meeting.past')}</h4>
                      {pastMeetings.map((m) => (
                        <div key={m.id} className="p-3 rounded border mb-2 opacity-60">
                          <div className="flex items-center justify-between">
                            <span>{formatDateTime(m.scheduled_at)}</span>
                            <Badge variant="outline">{t(`meeting.types.${m.meeting_type}`)}</Badge>
                          </div>
                        </div>
                      ))}
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
              {/* New Note Form */}
              {cases && cases.length > 0 && (
                <div className="mb-4 p-3 rounded border bg-muted/20">
                  <div className="flex gap-2 mb-2">
                    <Select value={selectedCaseForNote} onValueChange={setSelectedCaseForNote}>
                      <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('task.selectCase')} /></SelectTrigger>
                      <SelectContent>
                        {cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea placeholder={t('note.placeholder')} value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={2} className="mb-2" />
                  <Button size="sm" onClick={handleSaveNote} disabled={!newNote.trim() || !selectedCaseForNote}>
                    {t('note.createNote')}
                  </Button>
                </div>
              )}
              
              {loadingNotes ? <Skeleton className="h-20 w-full" /> : notes?.length === 0 ? (
                <p className="text-muted-foreground">{t('note.noNotes')}</p>
              ) : (
                <div className="space-y-2">
                  {notes?.slice(0, 10).map((note) => (
                    <div key={note.id} className="p-3 rounded border">
                      <div className="text-sm text-muted-foreground mb-1">
                        {note.case?.title} • {formatDateTime(note.created_at)}
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin: Client Portal Settings */}
        {role === 'admin' && (
          <div className="mt-6">
            <ClientPortalSettingsCard clientId={clientId!} />
          </div>
        )}

        {/* Edit Client Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('client.editClient')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>{t('client.firstName')} *</Label><Input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} /></div>
                <div><Label>{t('client.lastName')} *</Label><Input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} /></div>
              </div>
              <div><Label>{t('client.email')}</Label><Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
              <div><Label>{t('client.phone')}</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></div>
              <div><Label>{t('client.address')}</Label><Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} /></div>
              <div>
                <Label>{t('client.status')}</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as ClientStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CLIENT_STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`client.statuses.${s}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditOpen(false)}>{t('app.cancel')}</Button>
                <Button onClick={handleSaveClient}>{t('app.save')}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
    </AppLayout>
  );
}
