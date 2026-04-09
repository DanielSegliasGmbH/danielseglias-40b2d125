import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import {
  useAllUsers,
  useUpdateUserRole,
  useResendInvite,
  getUserStatus,
  getUserStatusLabel,
  getUserStatusColor,
} from '@/hooks/useUserManagement';
import { useCustomers } from '@/hooks/useCustomerData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Copy, Search, MoreVertical, RotateCw, KeyRound, Mail } from 'lucide-react';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { LinkCustomerDialog } from '@/components/admin/LinkCustomerDialog';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '–';
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function UserManagement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: users, isLoading } = useAllUsers();
  const { data: customers } = useCustomers();
  const updateRole = useUpdateUserRole();
  const resendInvite = useResendInvite();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const role = newRole === 'none' ? null : (newRole as AppRole);
      await updateRole.mutateAsync({ userId, role });
      toast.success('Rolle aktualisiert');
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
    }
  };

  const handleResendInvite = async (userId: string) => {
    try {
      const result = await resendInvite.mutateAsync(userId);
      toast.success(result.message || 'Einladung erneut versendet');
    } catch (error: any) {
      toast.error(`Fehler: ${error.message}`);
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
      toast.success('Kopiert');
    } catch {
      toast.error('Fehler beim Kopieren');
    }
  };

  const filteredUsers = users?.filter((u) => {
    if (statusFilter !== 'all' && u.account_status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      u.first_name.toLowerCase().includes(s) ||
      u.last_name.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s)
    );
  });

  const stats = {
    total: users?.length || 0,
    active: users?.filter((u) => getUserStatus(u) === 'active').length || 0,
    invited: users?.filter((u) => getUserStatus(u) === 'invited').length || 0,
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background page-transition">
        <ScreenHeader title="Benutzerverwaltung" />

        <div className="px-4 py-6 max-w-5xl mx-auto space-y-6 pb-24">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Aktiv</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.invited}</p>
                <p className="text-xs text-muted-foreground">Offen</p>
              </CardContent>
            </Card>
          </div>

          {/* Search + Filter + Create */}
          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Benutzer suchen…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-12 rounded-xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] h-12 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="suspended">Gesperrt</SelectItem>
                <SelectItem value="deleted">Gelöscht</SelectItem>
              </SelectContent>
            </Select>
            <CreateUserDialog />
          </div>

          {/* User List */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredUsers?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Keine Benutzer gefunden</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredUsers?.map((u) => {
                const status = getUserStatus(u);
                const statusLabel = getUserStatusLabel(status);
                const statusColor = getUserStatusColor(status);
                const customerName = getCustomerName(u.customer_id);

                return (
                  <Card key={u.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        {/* Left: Name + Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                              onClick={() => navigate(`/app/users/${u.id}`)}
                            >
                              {u.first_name} {u.last_name}
                            </h3>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>
                              {statusLabel}
                            </span>
                            {u.account_status !== 'active' && (
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${ACCOUNT_STATUS_CONFIG[u.account_status as AccountStatus]?.color || ''}`}>
                                {ACCOUNT_STATUS_CONFIG[u.account_status as AccountStatus]?.label || u.account_status}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{u.email || '–'}</p>
                          
                          {/* Meta info */}
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {u.role && (
                              <span>
                                Rolle: <span className="font-medium text-foreground">
                                  {u.role === 'admin' ? 'Admin' : u.role === 'staff' ? 'Mitarbeiter' : 'Benutzer'}
                                </span>
                              </span>
                            )}
                            <span className="font-medium">
                              {u.user_type === 'customer' ? '🏷 Kunde' : '👤 User'}
                            </span>
                            <span className="font-medium">
                              {u.plan === 'premium' ? '⭐ Premium' : 'Free'}
                            </span>
                            {u.has_strategy_access && (
                              <span className="font-medium text-green-600 dark:text-green-400">Strategie ✓</span>
                            )}
                            {customerName && (
                              <span>Kunde: <span className="font-medium text-foreground">{customerName}</span></span>
                            )}
                            {u.created_at && (
                              <span>Erstellt: {formatDate(u.created_at)}</span>
                            )}
                            {u.last_sign_in_at && (
                              <span>Letzter Login: {formatDateTime(u.last_sign_in_at)}</span>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => copyToClipboard(u.id)}>
                              <Copy className="h-4 w-4 mr-2" />
                              ID kopieren
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyToClipboard(u.email)}>
                              <Mail className="h-4 w-4 mr-2" />
                              E-Mail kopieren
                            </DropdownMenuItem>
                            {status === 'invited' && (
                              <DropdownMenuItem onClick={() => handleResendInvite(u.id)}>
                                <RotateCw className="h-4 w-4 mr-2" />
                                Einladung erneut senden
                              </DropdownMenuItem>
                            )}
                            {status === 'active' && (
                              <DropdownMenuItem onClick={() => handleResendInvite(u.id)}>
                                <KeyRound className="h-4 w-4 mr-2" />
                                Passwort-Reset senden
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Role selector (compact) */}
                      <div className="mt-3 flex items-center gap-2">
                        <Select
                          value={u.role || 'none'}
                          onValueChange={(value) => handleRoleChange(u.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-9 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Keine Rolle</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="staff">Mitarbeiter</SelectItem>
                            <SelectItem value="client">Benutzer</SelectItem>
                          </SelectContent>
                        </Select>
                        {u.role === 'client' && (
                          <LinkCustomerDialog userId={u.id} currentCustomerId={u.customer_id} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
