import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAllUsers, useUpdateUserRole } from '@/hooks/useUserManagement';
import { useClients } from '@/hooks/useDashboardData';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LogOut, Users, ArrowLeft } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { LinkClientDialog } from '@/components/admin/LinkClientDialog';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export default function UserManagement() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { data: users, isLoading } = useAllUsers();
  const { data: clients } = useClients();
  const updateRole = useUpdateUserRole();

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const role = newRole === 'none' ? null : (newRole as AppRole);
      await updateRole.mutateAsync({ userId, role });
      toast.success(t('userManagement.roleUpdated'));
    } catch (error: any) {
      toast.error(`${t('userManagement.roleUpdateError')}: ${error.message}`);
    }
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId || !clients) return null;
    const client = clients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : null;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/app" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold text-foreground">{t('userManagement.title')}</h1>
            <Badge variant="default">{t('roles.admin')}</Badge>
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
          <h2 className="text-2xl font-bold text-foreground">{t('userManagement.allUsers')}</h2>
          <CreateUserDialog />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('userManagement.allUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : users?.length === 0 ? (
              <p className="text-muted-foreground py-4">{t('userManagement.noUsers')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('auth.firstName')}</TableHead>
                    <TableHead>{t('auth.lastName')}</TableHead>
                    <TableHead>{t('auth.phone')}</TableHead>
                    <TableHead>{t('table.role')}</TableHead>
                    <TableHead>{t('table.client')}</TableHead>
                    <TableHead>{t('table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.first_name}</TableCell>
                      <TableCell>{u.last_name}</TableCell>
                      <TableCell>{u.phone || '–'}</TableCell>
                      <TableCell>
                        <Select
                          value={u.role || 'none'}
                          onValueChange={(value) => handleRoleChange(u.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('userManagement.noRole')}</SelectItem>
                            <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                            <SelectItem value="staff">{t('roles.staff')}</SelectItem>
                            <SelectItem value="client">{t('roles.client')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {u.client_id ? (
                          <Badge variant="outline">{getClientName(u.client_id)}</Badge>
                        ) : (
                          <span className="text-muted-foreground">–</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.role === 'client' && (
                          <LinkClientDialog userId={u.id} currentClientId={u.client_id} />
                        )}
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
