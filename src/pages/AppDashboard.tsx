import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  useActiveCasesCount,
  useOpenTasksCount,
  useActiveCases,
  useOpenTasks,
  useProfiles,
} from '@/hooks/useDashboardData';
import { useCustomers } from '@/hooks/useCustomerData';
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
import { Users, Briefcase, ClipboardList } from 'lucide-react';
import { CreateCustomerDialog } from '@/components/customers/CreateCustomerDialog';
import { CreateCaseDialog } from '@/components/dashboard/CreateCaseDialog';
import { CreateTaskDialog } from '@/components/dashboard/CreateTaskDialog';
import { GlobalSearch } from '@/components/dashboard/GlobalSearch';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { NotificationPrompt } from '@/components/NotificationPrompt';
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
  const { data: customers, isLoading: loadingCustomers } = useCustomers({ status: 'active' });
  const activeCustomersCount = customers?.length ?? 0;
  const { data: activeCasesCount, isLoading: loadingCasesCount } = useActiveCasesCount();
  const { data: openTasksCount, isLoading: loadingTasksCount } = useOpenTasksCount();
  const { data: activeCases, isLoading: loadingCases } = useActiveCases();
  const { data: openTasks, isLoading: loadingTasks } = useOpenTasks();
  const { data: profiles } = useProfiles();
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);

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
    <AppLayout>
      <div className="min-h-screen bg-background">
        <ScreenHeader
          title={t('dashboard.title')}
          rightAction={
            <div className="flex items-center gap-2">
              <GlobalSearch />
            </div>
          }
        />

      <main className="px-4 sm:px-6 lg:container lg:mx-auto py-6 sm:py-8 page-transition">
        {/* Greeting */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
            {t('dashboard.welcome', { name: user?.user_metadata?.first_name || 'User' })}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t('dashboard.loggedInAs')} <strong>{roleLabel}</strong>
          </p>
        </div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard.activeClients')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingCustomers ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl sm:text-3xl font-bold">{activeCustomersCount}</div>
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
                <div className="text-2xl sm:text-3xl font-bold">{activeCasesCount}</div>
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
                <div className="text-2xl sm:text-3xl font-bold">{openTasksCount}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{t('dashboard.statusNotDone')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Button onClick={() => setCreateCustomerOpen(true)} className="flex-1 sm:flex-none">
            {t('customer.createTitle', 'Neuen Kunden anlegen')}
          </Button>
          <CreateCustomerDialog open={createCustomerOpen} onOpenChange={setCreateCustomerOpen} />
          <CreateCaseDialog />
          <CreateTaskDialog />
        </div>

        {/* Open Tasks */}
        <Card className="mb-6 sm:mb-8">
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
              <div className="overflow-x-auto -mx-6 px-6">
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
                    <TableRow
                      key={task.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => task.case_id && (window.location.href = `/app/cases/${task.case_id}`)}
                    >
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        {task.case?.title}
                        <span className="text-muted-foreground ml-2">
                          ({task.case?.customer?.first_name} {task.case?.customer?.last_name})
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
              </div>
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
              <div className="overflow-x-auto -mx-6 px-6">
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
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => (window.location.href = `/app/cases/${c.id}`)}
                    >
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>
                        {c.customer?.first_name} {c.customer?.last_name}
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
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
    </AppLayout>
  );
}
