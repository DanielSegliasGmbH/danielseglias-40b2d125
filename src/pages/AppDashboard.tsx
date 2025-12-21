import { useTranslation } from 'react-i18next';
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
import { LogOut, Users, Briefcase, ClipboardList, Settings } from 'lucide-react';
import { CreateClientDialog } from '@/components/dashboard/CreateClientDialog';
import { CreateCaseDialog } from '@/components/dashboard/CreateCaseDialog';
import { CreateTaskDialog } from '@/components/dashboard/CreateTaskDialog';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Link } from 'react-router-dom';
import { format, Locale } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';

const DATE_LOCALES: Record<string, Locale> = {
  de,
  en: enUS,
  fr,
  it,
  gsw: de,
};

export default function AppDashboard() {
  const { t, i18n } = useTranslation();
  const { user, role, signOut } = useAuth();
  const { data: activeClientsCount, isLoading: loadingClients } = useActiveClientsCount();
  const { data: activeCasesCount, isLoading: loadingCasesCount } = useActiveCasesCount();
  const { data: openTasksCount, isLoading: loadingTasksCount } = useOpenTasksCount();
  const { data: activeCases, isLoading: loadingCases } = useActiveCases();
  const { data: openTasks, isLoading: loadingTasks } = useOpenTasks();
  const { data: profiles } = useProfiles();

  const roleLabel = role === 'admin' ? t('roles.admin') : t('roles.staff');
  const roleVariant = role === 'admin' ? 'default' : 'secondary';
  const dateLocale = DATE_LOCALES[i18n.language] || de;

  const getProfileName = (userId: string | null) => {
    if (!userId || !profiles) return '–';
    const profile = profiles.find((p) => p.id === userId);
    return profile ? `${profile.first_name} ${profile.last_name}` : '–';
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '–';
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: dateLocale });
  };

  const getStatusLabel = (status: string, type: 'case' | 'task') => {
    const key = type === 'case' ? `case.statuses.${status}` : `task.statuses.${status}`;
    return t(key, status);
  };

  const getPriorityLabel = (priority: string) => {
    return t(`task.priorities.${priority}`, priority);
  };

  const PRIORITY_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    niedrig: 'outline',
    mittel: 'secondary',
    hoch: 'default',
    dringend: 'destructive',
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">{t('app.title')}</h1>
            <Badge variant={roleVariant}>{roleLabel}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Greeting */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t('dashboard.welcome', { name: user?.user_metadata?.first_name || 'User' })}
          </h2>
          <p className="text-muted-foreground">
            {t('dashboard.loggedInAs')} <strong>{roleLabel}</strong>
          </p>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.activeClients')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingClients ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{activeClientsCount}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{t('dashboard.statusActive')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.activeCases')}</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingCasesCount ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{activeCasesCount}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{t('dashboard.statusNotClosed')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.openTasks')}</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingTasksCount ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-3xl font-bold">{openTasksCount}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{t('dashboard.statusNotDone')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <CreateClientDialog />
          <CreateCaseDialog />
          <CreateTaskDialog />
          {role === 'admin' && (
            <Link to="/app/users">
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                {t('userManagement.title')}
              </Button>
            </Link>
          )}
        </div>

        {/* Open Tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              {t('dashboard.myOpenTasks')}
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
              <p className="text-muted-foreground py-4">{t('dashboard.noOpenTasks')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.title')}</TableHead>
                    <TableHead>{t('task.caseClient')}</TableHead>
                    <TableHead>{t('table.priority')}</TableHead>
                    <TableHead>{t('table.due')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
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
                          {getPriorityLabel(task.priority)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(task.due_date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getStatusLabel(task.status, 'task')}</Badge>
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
              {t('dashboard.activeCasesList')}
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
              <p className="text-muted-foreground py-4">{t('dashboard.noActiveCases')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('table.title')}</TableHead>
                    <TableHead>{t('table.client')}</TableHead>
                    <TableHead>{t('table.status')}</TableHead>
                    <TableHead>{t('table.assignedTo')}</TableHead>
                    <TableHead>{t('table.due')}</TableHead>
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
                        <Badge variant="outline">{getStatusLabel(c.status, 'case')}</Badge>
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
