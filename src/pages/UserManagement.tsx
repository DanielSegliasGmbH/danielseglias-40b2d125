import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useAllUsers, useUpdateUserRole } from '@/hooks/useUserManagement';
import { useCustomers } from '@/hooks/useCustomerData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Users, Copy } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { LinkClientDialog } from '@/components/admin/LinkClientDialog';
import { AppLayout } from '@/components/AppLayout';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

export default function UserManagement() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { data: users, isLoading } = useAllUsers();
  const { data: customers } = useCustomers();
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

  const getCustomerName = (customerId: string | null) => {
    if (!customerId || !customers) return null;
    const customer = customers.find((c) => c.id === customerId);
    return customer ? `${customer.first_name} ${customer.last_name}` : null;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('userManagement.userIdCopied'));
    } catch {
      toast.error(t('app.error'));
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">{t('userManagement.title')}</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
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
              <TooltipProvider>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('userManagement.userId')}</TableHead>
                      <TableHead>{t('auth.firstName')}</TableHead>
                      <TableHead>{t('auth.lastName')}</TableHead>
                      <TableHead>{t('auth.phone')}</TableHead>
                      <TableHead>{t('table.role')}</TableHead>
                      <TableHead>{t('customer.singular', 'Kunde')}</TableHead>
                      <TableHead>{t('table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded cursor-default">
                                  {u.id.slice(0, 8)}…
                                </code>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="font-mono text-xs">
                                {u.id}
                              </TooltipContent>
                            </Tooltip>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(u.id)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
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
                          {u.customer_id ? (
                            <Badge variant="outline">{getCustomerName(u.customer_id)}</Badge>
                          ) : (
                            <span className="text-muted-foreground">–</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {u.role === 'client' && (
                            <LinkClientDialog userId={u.id} currentCustomerId={u.customer_id} />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TooltipProvider>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
    </AppLayout>
  );
}
