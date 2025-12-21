import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteCases, useProfiles } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Briefcase, ChevronRight, Search, Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CreateCaseDialog } from '@/components/dashboard/CreateCaseDialog';
import { AppLayout } from '@/components/AppLayout';
import { format, Locale } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';

const DATE_LOCALES: Record<string, Locale> = { de, en: enUS, fr, it, gsw: de };

type CaseSortMode = 'created_desc' | 'created_asc' | 'due_asc' | 'title_asc' | 'status_asc';

const STATUS_ORDER: Record<string, number> = { 
  offen: 0, 
  in_bearbeitung: 1, 
  wartet_auf_kunde: 2, 
  pausiert: 3, 
  abgeschlossen: 4 
};

export default function CaseList() {
  const { t, i18n } = useTranslation();
  const { user, role, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<CaseSortMode>('created_desc');
  
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useInfiniteCases(sortMode);
  const { data: profiles } = useProfiles();
  const dateLocale = DATE_LOCALES[i18n.language] || de;

  // Flatten all pages into single array
  const allCases = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.items);
  }, [data]);

  const totalCount = data?.pages?.[0]?.totalCount ?? 0;

  // Client-side filter and sort (on loaded data)
  const sortedCases = useMemo(() => {
    if (!allCases.length) return [];
    
    // Filter first
    const term = searchTerm.trim().toLowerCase();
    let filtered = allCases;
    if (term) {
      filtered = allCases.filter((c) => {
        const searchString = [
          c.title,
          c.description,
          c.client?.first_name,
          c.client?.last_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchString.includes(term);
      });
    }
    
    // Then sort
    return [...filtered].sort((a, b) => {
      switch (sortMode) {
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'due_asc':
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'status_asc':
          return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
        default:
          return 0;
      }
    });
  }, [allCases, searchTerm, sortMode]);

  const roleLabel = role === 'admin' ? t('roles.admin') : t('roles.staff');
  const roleVariant = role === 'admin' ? 'default' : 'secondary';

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '–';
    return format(new Date(dateStr), 'dd.MM.yyyy', { locale: dateLocale });
  };

  const getProfileName = (userId: string | null) => {
    if (!userId || !profiles) return '–';
    const profile = profiles.find((p) => p.id === userId);
    return profile ? `${profile.first_name} ${profile.last_name}` : '–';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'offen': return 'default';
      case 'in_bearbeitung': return 'secondary';
      case 'wartet_auf_kunde': return 'outline';
      case 'abgeschlossen': return 'outline';
      case 'pausiert': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">{t('case.list')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            </div>
          </div>
        </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">{t('case.title')}</h2>
          <CreateCaseDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t('case.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('case.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={sortMode} onValueChange={(v) => setSortMode(v as CaseSortMode)}>
                  <SelectTrigger className="w-full sm:w-52">
                    <SelectValue placeholder={t('case.sortBy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_desc">{t('case.sortOptions.createdDesc')}</SelectItem>
                    <SelectItem value="created_asc">{t('case.sortOptions.createdAsc')}</SelectItem>
                    <SelectItem value="due_asc">{t('case.sortOptions.dueAsc')}</SelectItem>
                    <SelectItem value="title_asc">{t('case.sortOptions.titleAsc')}</SelectItem>
                    <SelectItem value="status_asc">{t('case.sortOptions.statusAsc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {sortedCases.length} {t('case.of')} {totalCount} {t('case.title')}
                </p>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : allCases.length === 0 ? (
              <p className="text-muted-foreground py-4">{t('case.noCases')}</p>
            ) : sortedCases.length === 0 ? (
              <p className="text-muted-foreground py-4">{t('case.noCasesFound')}</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('case.caseTitle')}</TableHead>
                      <TableHead>{t('table.client')}</TableHead>
                      <TableHead>{t('case.status')}</TableHead>
                      <TableHead>{t('case.assignedTo')}</TableHead>
                      <TableHead>{t('case.dueDate')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCases.map((caseItem) => (
                      <TableRow key={caseItem.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{caseItem.title}</TableCell>
                        <TableCell>
                          {caseItem.client ? (
                            <Link 
                              to={`/app/clients/${caseItem.client.id}`}
                              className="text-primary hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {caseItem.client.first_name} {caseItem.client.last_name}
                            </Link>
                          ) : '–'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(caseItem.status)}>
                            {t(`case.statuses.${caseItem.status}`, caseItem.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>{getProfileName(caseItem.assigned_to)}</TableCell>
                        <TableCell>{formatDate(caseItem.due_date)}</TableCell>
                        <TableCell>
                          <Link to={`/app/cases/${caseItem.id}`}>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Load More Section */}
                <div className="mt-4 flex flex-col items-center gap-2 pt-4 border-t">
                  {hasNextPage ? (
                    <Button
                      variant="outline"
                      onClick={() => fetchNextPage()}
                      disabled={isFetchingNextPage}
                    >
                      {isFetchingNextPage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {t('case.loadingMore')}
                        </>
                      ) : (
                        t('case.loadMore')
                      )}
                    </Button>
                  ) : allCases.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t('case.noMore')}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
    </AppLayout>
  );
}
