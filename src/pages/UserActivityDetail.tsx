import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAllUsers, getUserStatus, getUserStatusLabel, getUserStatusColor } from '@/hooks/useUserManagement';
import { useUserEvents, useUserSessions, useUserActivitySummary } from '@/hooks/useUserActivity';
import { UserVisibilityPanel } from '@/components/admin/UserVisibilityPanel';
import { useUserRuleLogs, CONDITION_LABELS, ACTION_LABELS } from '@/hooks/useAutomationEngine';
import { useUserScoring, useUpdateUserScoring, STATUS_CONFIG, LABEL_PRESETS, type UserStatus } from '@/hooks/useUserScoring';
import { useNextBestStepForUser } from '@/hooks/useNextBestStep';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, User, Mail, CalendarDays, Clock, Activity,
  MessageSquare, MousePointer, Eye, LogIn, BarChart3, Wrench,
  ChevronLeft, ChevronRight, Copy, Shield, Zap, Tag, Pencil,
  Navigation,
} from 'lucide-react';
import { toast } from 'sonner';

// ── Helpers ─────────────────────────────────────────────
function formatDate(d: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatDateTime(d: string | null) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('de-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Seite geöffnet',
  login: 'Login',
  logout: 'Logout',
  session_start: 'Session gestartet',
  session_end: 'Session beendet',
  chat_opened: 'Chat geöffnet',
  chat_message_sent: 'Nachricht gesendet',
  tool_opened: 'Tool geöffnet',
  tool_completed: 'Tool abgeschlossen',
  module_opened: 'Modul geöffnet',
  video_started: 'Video gestartet',
  video_completed: 'Video abgeschlossen',
  cta_clicked: 'CTA geklickt',
  form_started: 'Formular gestartet',
  form_submitted: 'Formular abgesendet',
  error: 'Fehler',
};

const EVENT_ICONS: Record<string, typeof Activity> = {
  page_view: Eye,
  login: LogIn,
  logout: LogIn,
  session_start: Activity,
  session_end: Activity,
  chat_opened: MessageSquare,
  chat_message_sent: MessageSquare,
  tool_opened: Wrench,
  tool_completed: Wrench,
  cta_clicked: MousePointer,
};

function getEventLabel(type: string) {
  return EVENT_LABELS[type] || type;
}

function getEventIcon(type: string) {
  return EVENT_ICONS[type] || Activity;
}

function getEventContext(event: { page_path: string | null; tool_key: string | null; module_key: string | null; event_name: string | null; metadata: Record<string, unknown> }) {
  const parts: string[] = [];
  if (event.tool_key) parts.push(`Tool: ${event.tool_key}`);
  if (event.module_key) parts.push(`Modul: ${event.module_key}`);
  if (event.event_name && event.event_name !== event.tool_key) parts.push(event.event_name);
  if (event.page_path) parts.push(event.page_path);
  return parts;
}

// ── Component ───────────────────────────────────────────
export default function UserActivityDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data: users, isLoading: usersLoading } = useAllUsers();
  const user = users?.find((u) => u.id === userId);

  // Filters
  const [eventType, setEventType] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);

  const { data: eventsData, isLoading: eventsLoading } = useUserEvents(userId, {
    eventType,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
  });
  const { data: sessions } = useUserSessions(userId);

  // Resolve customer_id for visibility panel
  const { data: customerLink } = useQuery({
    queryKey: ['customer-user-link', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('customer_users')
        .select('customer_id')
        .eq('user_id', userId!)
        .maybeSingle();
      return data;
    },
    enabled: !!userId,
  });
  const linkedCustomerId = customerLink?.customer_id ?? user?.customer_id ?? null;
  const { data: summary, isLoading: summaryLoading } = useUserActivitySummary(userId);
  const { data: ruleLogs } = useUserRuleLogs(userId);
  const { data: userScoring } = useUserScoring(userId);
  const updateScoring = useUpdateUserScoring();
  const { data: nextStepData } = useNextBestStepForUser(userId);

  // Distinct event types for filter dropdown
  const distinctTypes = useMemo(() => {
    if (!summary?.eventTypeCounts) return [];
    return Object.keys(summary.eventTypeCounts).sort();
  }, [summary]);

  const totalPages = eventsData ? Math.ceil(eventsData.totalCount / 50) : 0;

  if (usersLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background page-transition">
          <ScreenHeader title="Nutzeraktivität" />
          <div className="px-4 py-6 max-w-5xl mx-auto space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-60 w-full rounded-xl" />
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background page-transition">
          <ScreenHeader title="Nutzeraktivität" />
          <div className="px-4 py-6 max-w-5xl mx-auto">
            <p className="text-muted-foreground">Nutzer nicht gefunden.</p>
            <Button variant="ghost" className="mt-4" onClick={() => navigate('/app/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Zurück
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const status = getUserStatus(user);
  const statusLabel = getUserStatusLabel(status);
  const statusColor = getUserStatusColor(status);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background page-transition">
        <ScreenHeader title="Nutzeraktivität" />

        <div className="px-4 py-6 max-w-5xl mx-auto space-y-6 pb-24">
          {/* Back */}
          <Button variant="ghost" size="sm" onClick={() => navigate('/app/users')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Benutzerverwaltung
          </Button>

          {/* ── 1. Header / Overview ─────────────────── */}
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <User className="h-7 w-7 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-semibold text-foreground">
                      {user.first_name} {user.last_name}
                    </h2>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                    {user.role && (
                      <Badge variant="outline" className="text-xs">
                        {user.role === 'admin' ? 'Admin' : user.role === 'staff' ? 'Mitarbeiter' : 'Benutzer'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(user.id); toast.success('User-ID kopiert'); }}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <Copy className="h-3 w-3" /> {user.id}
                  </button>
                </div>
              </div>

              {/* KPI row */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <KpiMini label="Erstellt" value={formatDate(user.created_at)} icon={CalendarDays} />
                <KpiMini label="Letzter Login" value={formatDateTime(user.last_sign_in_at)} icon={LogIn} />
                <KpiMini label="Letzte Aktivität" value={summary ? formatDateTime(summary.lastActivity) : '–'} icon={Clock} />
                <KpiMini label="Sessions" value={summary?.totalSessions?.toString() ?? '–'} icon={Activity} />
              </div>
            </CardContent>
          </Card>

          {/* ── 2. Usage Summary ─────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" /> Nutzungs-Zusammenfassung
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-20 w-full rounded-lg" />
              ) : summary ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryTile label="Events gesamt" value={summary.totalEvents} />
                  <SummaryTile label="Logins" value={summary.totalLogins} />
                  <SummaryTile label="Seitenaufrufe" value={summary.totalPageViews} />
                  <SummaryTile label="Tools geöffnet" value={summary.toolsOpened.length} />
                  <SummaryTile label="Chat-Nachrichten" value={summary.chatMessages} />
                  <SummaryTile label="Sessions" value={summary.totalSessions} />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Keine Daten vorhanden.</p>
              )}
            </CardContent>
          </Card>

          {/* ── 2b. Scoring & Status ─────────────────── */}
          <ScoringCard scoring={userScoring} userId={userId!} onUpdate={updateScoring} />

          {/* ── 2c. Next Best Step (Admin view) ──────── */}
          {nextStepData?.primary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Navigation className="h-4 w-4" /> Empfohlener nächster Schritt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px]">{nextStepData.primary.type}</Badge>
                    <span className="text-sm font-semibold text-foreground">{nextStepData.primary.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{nextStepData.primary.reason}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">Pfad: {nextStepData.primary.path}</p>
                </div>
                {nextStepData.secondary && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="outline" className="text-[10px]">{nextStepData.secondary.type}</Badge>
                      <span className="text-xs font-medium text-foreground">{nextStepData.secondary.title}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{nextStepData.secondary.reason}</p>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Begründung: {nextStepData.reasoning}
                </p>
              </CardContent>
            </Card>
          )}

          {summary && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4" /> Bereits genutzt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <StatusChip done={summary.totalLogins > 0} label="Eingeloggt" />
                  <StatusChip done={(summary.eventTypeCounts['chat_opened'] ?? 0) > 0} label="Chat genutzt" />
                  <StatusChip done={summary.toolsOpened.length > 0} label="Tool geöffnet" />
                  <StatusChip done={(summary.eventTypeCounts['tool_completed'] ?? 0) > 0} label="Tool abgeschlossen" />
                  <StatusChip done={(summary.eventTypeCounts['module_opened'] ?? 0) > 0} label="Modul geöffnet" />
                  <StatusChip done={(summary.eventTypeCounts['video_started'] ?? 0) > 0} label="Video gestartet" />
                  <StatusChip done={(summary.eventTypeCounts['video_completed'] ?? 0) > 0} label="Video abgeschlossen" />
                </div>
                {summary.toolsOpened.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Geöffnete Tools:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.toolsOpened.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* ── 4. Visibility / Permissions ────────── */}
          <UserVisibilityPanel userId={userId!} customerId={linkedCustomerId} />

          {/* ── 4b. Automation Logs ───────────────── */}
          {ruleLogs && ruleLogs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Automatische Einflüsse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ruleLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-muted/50 text-sm">
                      <Zap className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground">
                          {ACTION_LABELS[log.action_executed] || log.action_executed}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Regel: {(log.automation_rules as any)?.name || 'Unbekannt'} ·{' '}
                          {new Date(log.created_at).toLocaleString('de-CH')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" /> Aktivitäts-Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={eventType} onValueChange={(v) => { setEventType(v); setPage(0); }}>
                  <SelectTrigger className="w-[160px] h-9 text-xs">
                    <SelectValue placeholder="Event-Typ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Events</SelectItem>
                    {distinctTypes.map((t) => (
                      <SelectItem key={t} value={t}>{getEventLabel(t)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
                  className="w-[140px] h-9 text-xs"
                  placeholder="Von"
                />
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
                  className="w-[140px] h-9 text-xs"
                  placeholder="Bis"
                />
                {(eventType !== 'all' || dateFrom || dateTo) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-9"
                    onClick={() => { setEventType('all'); setDateFrom(''); setDateTo(''); setPage(0); }}
                  >
                    Filter zurücksetzen
                  </Button>
                )}
              </div>

              {/* Events list */}
              {eventsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                </div>
              ) : !eventsData?.events.length ? (
                <p className="text-sm text-muted-foreground py-6 text-center">Keine Events gefunden.</p>
              ) : (
                <div className="space-y-1">
                  {eventsData.events.map((ev) => {
                    const Icon = getEventIcon(ev.event_type);
                    const context = getEventContext(ev);
                    return (
                      <div key={ev.id} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="mt-0.5 h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground">
                              {getEventLabel(ev.event_type)}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDateTime(ev.created_at)}
                            </span>
                          </div>
                          {context.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {context.join(' · ')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Seite {page + 1} von {totalPages} ({eventsData?.totalCount} Events)
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

// ── Sub-components ──────────────────────────────────────
function KpiMini({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Activity }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3 text-center">
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function StatusChip({ done, label }: { done: boolean; label: string }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
      done
        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        : 'bg-muted text-muted-foreground'
    }`}>
      {done ? '✓' : '–'} {label}
    </span>
  );
}

// ── Scoring Card ────────────────────────────────────────
function ScoringCard({ scoring, userId, onUpdate }: {
  scoring: import('@/hooks/useUserScoring').UserScoringRow | null | undefined;
  userId: string;
  onUpdate: ReturnType<typeof import('@/hooks/useUserScoring').useUpdateUserScoring>;
}) {
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingLabels, setEditingLabels] = useState(false);

  if (!scoring) {
    return (
      <Card>
        <CardContent className="py-4 px-4">
          <p className="text-sm text-muted-foreground">Kein Scoring vorhanden. Bitte «Scoring aktualisieren» im Dashboard ausführen.</p>
        </CardContent>
      </Card>
    );
  }

  const statusCfg = STATUS_CONFIG[scoring.status] || STATUS_CONFIG.neu;
  const breakdown = scoring.score_breakdown;

  const handleStatusChange = (newStatus: string) => {
    onUpdate.mutate(
      { userId, status: newStatus as UserStatus, isManualOverride: true },
      { onSuccess: () => { toast.success('Status aktualisiert'); setEditingStatus(false); } }
    );
  };

  const toggleLabel = (label: string) => {
    const current = scoring.labels || [];
    const updated = current.includes(label)
      ? current.filter(l => l !== label)
      : [...current, label];
    onUpdate.mutate(
      { userId, labels: updated, isManualOverride: scoring.is_manual_override },
      { onSuccess: () => toast.success('Labels aktualisiert') }
    );
  };

  const removeManualOverride = () => {
    onUpdate.mutate(
      { userId, isManualOverride: false },
      { onSuccess: () => toast.success('Manueller Override entfernt') }
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Scoring & Status
          {scoring.is_manual_override && (
            <Badge variant="outline" className="text-[10px] ml-auto">
              <Pencil className="h-2.5 w-2.5 mr-1" /> Manuell überschrieben
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score + Status row */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-muted/50 rounded-lg p-3 min-w-[80px] text-center">
            <p className="text-2xl font-bold text-foreground">{scoring.score}</p>
            <p className="text-[10px] text-muted-foreground">Score</p>
          </div>
          <div>
            {editingStatus ? (
              <Select value={scoring.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <button
                onClick={() => setEditingStatus(true)}
                className="group flex items-center gap-1.5"
              >
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            )}
          </div>
          {scoring.is_manual_override && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={removeManualOverride}>
              Override entfernen
            </Button>
          )}
        </div>

        {/* Score breakdown */}
        {breakdown && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: 'Login', value: breakdown.login, max: 5 },
              { label: 'Sessions', value: breakdown.sessions, max: 20 },
              { label: 'Tools ▸', value: breakdown.tools_opened, max: 15 },
              { label: 'Tools ✓', value: breakdown.tools_completed, max: 25 },
              { label: 'Chat', value: breakdown.chat, max: 10 },
              { label: 'CTA', value: breakdown.cta, max: 10 },
              { label: 'Wiederkehr', value: breakdown.recurrence, max: 15 },
              { label: 'Inaktivität', value: breakdown.inactivity_penalty, max: 0 },
            ].map(item => (
              <div key={item.label} className="text-xs">
                <div className="flex justify-between mb-0.5">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-medium tabular-nums ${item.value < 0 ? 'text-destructive' : 'text-foreground'}`}>
                    {item.value > 0 ? '+' : ''}{item.value}
                  </span>
                </div>
                {item.max > 0 && (
                  <Progress value={(item.value / item.max) * 100} className="h-1" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Labels */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">Labels</span>
            <button
              onClick={() => setEditingLabels(!editingLabels)}
              className="text-[10px] text-primary hover:underline ml-auto"
            >
              {editingLabels ? 'Fertig' : 'Bearbeiten'}
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {editingLabels ? (
              LABEL_PRESETS.map(label => {
                const active = (scoring.labels || []).includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => toggleLabel(label)}
                    className={`text-[10px] px-2 py-1 rounded-full border transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary border-primary/30'
                        : 'bg-muted text-muted-foreground border-transparent hover:border-border'
                    }`}
                  >
                    {active ? '✓ ' : ''}{label}
                  </button>
                );
              })
            ) : (
              (scoring.labels || []).length > 0
                ? scoring.labels.map(l => (
                    <span key={l} className="text-[10px] bg-muted px-2 py-1 rounded-full text-muted-foreground">
                      {l}
                    </span>
                  ))
                : <span className="text-[10px] text-muted-foreground">Keine Labels</span>
            )}
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground">
          Zuletzt berechnet: {scoring.last_computed_at ? new Date(scoring.last_computed_at).toLocaleString('de-CH') : '–'}
        </p>
      </CardContent>
    </Card>
  );
}
