import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClients } from '@/hooks/useDashboardData';
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
import { LogOut, Users, ArrowLeft, ChevronRight, Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CreateClientDialog } from '@/components/dashboard/CreateClientDialog';

export default function ClientList() {
  const { t } = useTranslation();
  const { user, role, signOut } = useAuth();
  const { data: clients, isLoading } = useClients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return clients;
    
    return clients.filter((client) => {
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
  }, [clients, searchTerm]);

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
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('client.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              {clients && clients.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {filteredClients.length} {t('client.of')} {clients.length} {t('client.title')}
                </p>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : clients?.length === 0 ? (
              <p className="text-muted-foreground py-4">{t('client.noClients')}</p>
            ) : filteredClients.length === 0 ? (
              <p className="text-muted-foreground py-4">{t('client.noClientsFound')}</p>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
