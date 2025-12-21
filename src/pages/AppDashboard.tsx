import { useAuth } from '@/hooks/useAuth';
import {
  useActiveClientsCount,
  useActiveCasesCount,
  useOpenTasksCount,
  useActiveCases,
  useOpenTasks,
  useProfiles,
} from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LogOut, Users, Briefcase, ClipboardList, Calendar } from 'lucide-react';
import { CreateClientDialog } from '@/components/dashboard/CreateClientDialog';
import { CreateCaseDialog } from '@/components/dashboard/CreateCaseDialog';
import { CreateTaskDialog } from '@/components/dashboard/CreateTaskDialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = {
  offen: 'Offen',
  in_bearbeitung: 'In Bearbeitung',
  wartet_auf_kunde: 'Wartet auf Kunde',
  abgeschlossen: 'Abgeschlossen',
  pausiert: 'Pausiert',
  in_arbeit: 'In Arbeit',
  erledigt: 'Erledigt',
  blockiert: 'Blockiert',
};

const PRIORITY_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  niedrig: 'outline',
  mittel: 'secondary',
  hoch: 'default',
  dringend: 'destructive',
};

const PRIORITY_LABELS: Record<string, string> = {
  niedrig: 'Niedrig',
  mittel: 'Mittel',
  hoch: 'Hoch',
  dringend: 'Dringend',
};

export default function AppDashboard() {
  const { user, role, signOut } = useAuth();
  const { data: activeClientsCount, isLoading: loadingClients } = useActiveClientsCount();
  const { data: activeCasesCount, isLoading: loadingCasesCount } = useActiveCasesCount();
  const { data: openTasksCount, isLoading: loadingTasksCount } = useOpenTasksCount();
  const { data: activeCases, isLoading: loadingCases } = useActiveCases();
  const { data: openTasks, isLoading: loadingTasks } = useOpenTasks();
  const { data: profiles } = useProfiles();

  const roleLabel = role === 'admin' ? 'Administrator' : 'Mitarbeiter';
  const roleVariant = role === 'admin' ? 'default' : 'secondary';

  const getProfileName = (userId: string | null) => {
    if (!userId || !profiles) return '–';
    const profile = profiles.find((p) => p.id === userId);
    return profile ? `${profile.first_name} ${profile.last_name}` : '–';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '–';
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: de });
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">Mandantenverwaltung</h1>
            <Badge variant={roleVariant}>{roleLabel}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Willkommen, {user?.user_metadata?.first_name || 'Benutzer'}!
          </h2>
          <p className="text-muted-foreground">
            Sie sind angemeldet als: <strong>{roleLabel}</strong>
          </p>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingClients ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{activeClientsCount}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Status: aktiv</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktive Cases</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingCasesCount ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{activeCasesCount}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Status ≠ abgeschlossen</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Offene Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingTasksCount ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{openTasksCount}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Status ≠ erledigt</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <CreateClientDialog />
          <CreateCaseDialog />
          <CreateTaskDialog />
        </div>

        {/* Open Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Meine offenen Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingTasks ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : openTasks?.length === 0 ? (
              <p className="text-muted-foreground py-4">Keine offenen Tasks</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead>Case / Client</TableHead>
                    <TableHead>Priorität</TableHead>
                    <TableHead>Fällig</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openTasks?.slice(0, 10).map((task) => (
                    <TableRow key={task.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        {task.case?.title}
                        <span className="text-muted-foreground ml-2">
                          ({task.case?.client?.first_name} {task.case?.client?.last_name})
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={PRIORITY_VARIANTS[task.priority] || 'secondary'}>
                          {PRIORITY_LABELS[task.priority] || task.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(task.due_date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{STATUS_LABELS[task.status] || task.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Active Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Aktive Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCases ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : activeCases?.length === 0 ? (
              <p className="text-muted-foreground py-4">Keine aktiven Cases</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Zugewiesen an</TableHead>
                    <TableHead>Fällig</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCases?.slice(0, 10).map((c) => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>
                        {c.client?.first_name} {c.client?.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{STATUS_LABELS[c.status] || c.status}</Badge>
                      </TableCell>
                      <TableCell>{getProfileName(c.assigned_to)}</TableCell>
                      <TableCell>{formatDate(c.due_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
