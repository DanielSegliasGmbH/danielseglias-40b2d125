import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCases, useProfiles } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { LogOut, Briefcase, ArrowLeft, ChevronRight, Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CreateCaseDialog } from '@/components/dashboard/CreateCaseDialog';
import { format, Locale } from 'date-fns';
import { de, enUS, fr, it } from 'date-fns/locale';

const DATE_LOCALES: Record<string, Locale> = { de, en: enUS, fr, it, gsw: de };

export default function CaseList() {
  const { t, i18n } = useTranslation();
  const { user, role, signOut } = useAuth();
  const { data: cases, isLoading } = useCases();
  const { data: profiles } = useProfiles();
  const [searchTerm, setSearchTerm] = useState('');
  const dateLocale = DATE_LOCALES[i18n.language] || de;

  const filteredCases = useMemo(() => {
    if (!cases) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return cases;
    
    return cases.filter((c) => {
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
  }, [cases, searchTerm]);

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
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">{t('case.list')}</h1>
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
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('case.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {cases && cases.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {filteredCases.length} {t('case.of')} {cases.length} {t('case.title')}
                </p>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : cases?.length === 0 ? (
              <p className="text-muted-foreground py-4">{t('case.noCases')}</p>
            ) : filteredCases.length === 0 ? (
              <p className="text-muted-foreground py-4">{t('case.noCasesFound')}</p>
            ) : (
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
                  {filteredCases.map((caseItem) => (
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
