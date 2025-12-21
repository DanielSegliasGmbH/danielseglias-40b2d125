import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useInfiniteClients } from '@/hooks/useDashboardData';
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
import { LogOut, Users, ArrowLeft, ChevronRight, Search, Loader2 } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CreateClientDialog } from '@/components/dashboard/CreateClientDialog';

type ClientSortMode = 'last_asc' | 'last_desc' | 'status' | 'created_desc';

const STATUS_ORDER: Record<string, number> = { aktiv: 0, pausiert: 1, archiviert: 2 };

export default function ClientList() {
  const { t } = useTranslation();
  const { user, role, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<ClientSortMode>('last_asc');

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteClients();

  // Flatten all pages into single array
  const allClients = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap(page => page.items);
  }, [data]);

  const totalCount = data?.pages?.[0]?.totalCount ?? 0;

  // Client-side filter and sort (on loaded data)
  const filteredClients = useMemo(() => {
    if (!allClients.length) return [];

    // Filter first
    const term = searchTerm.trim().toLowerCase();
    let filtered = allClients;
    if (term) {
      filtered = allClients.filter((client) => {
        const searchString = [
          client.first_name,
          client.last_name,
          client.email,
          client.phone,
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
        case 'last_asc':
          return (a.last_name || '').localeCompare(b.last_name || '');
        case 'last_desc':
          return (b.last_name || '').localeCompare(a.last_name || '');
        case 'status':
          return (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [allClients, searchTerm, sortMode]);

  const roleLabel = role === 'admin' ? t('roles.admin') : t('roles.staff');
  const roleVariant = role === 'admin' ? 'default' : 'secondary';

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'aktiv': return 'default';
      case 'pausiert': return 'secondary';
      case 'archiviert': return 'outline';
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
            <h1 className="text-xl font-bold text-foreground">{t('client.list')}</h1>
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
          <h2 className="text-2xl font-bold text-foreground">{t('client.title')}</h2>
          <CreateClientDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('client.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('client.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={sortMode} onValueChange={(v) => setSortMode(v as ClientSortMode)}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={t('client.sortBy')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last_asc">{t('client.sort.lastAsc')}</SelectItem>
                    <SelectItem value="last_desc">{t('client.sort.lastDesc')}</SelectItem>
                    <SelectItem value="status">{t('client.sort.status')}</SelectItem>
                    <SelectItem value="created_desc">{t('client.sort.createdDesc')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {totalCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {filteredClients.length} {t('client.of')} {totalCount} {t('client.title')}
                </p>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : allClients.length === 0 ? (
              <p className="text-muted-foreground py-4">{t('client.noClients')}</p>
            ) : filteredClients.length === 0 ? (
              <p className="text-muted-foreground py-4">{t('client.noClientsFound')}</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('client.lastName')}</TableHead>
                      <TableHead>{t('client.firstName')}</TableHead>
                      <TableHead>{t('client.email')}</TableHead>
                      <TableHead>{t('client.phone')}</TableHead>
                      <TableHead>{t('client.status')}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{client.last_name}</TableCell>
                        <TableCell>{client.first_name}</TableCell>
                        <TableCell>{client.email || '–'}</TableCell>
                        <TableCell>{client.phone || '–'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(client.status)}>
                            {t(`client.statuses.${client.status}`, client.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link to={`/app/clients/${client.id}`}>
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
                          {t('client.loadingMore')}
                        </>
                      ) : (
                        t('client.loadMore')
                      )}
                    </Button>
                  ) : allClients.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {t('client.noMore')}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
