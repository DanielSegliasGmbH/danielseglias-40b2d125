import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Users, Activity, TrendingUp, MessageSquare, LogIn, Wrench,
  ArrowRight, BarChart3, AlertTriangle, Zap, Eye,
} from 'lucide-react';
import {
  useAdminKPIs,
  useAdminUserSegments,
  useToolUsageStats,
  SIGNAL_CONFIG,
  type UserSegmentRow,
} from '@/hooks/useAdminDashboard';

function KPICard({ label, value, icon: Icon, sub }: {
  label: string; value: number | string; icon: typeof Users; sub?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
            {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
}

type SignalFilter = UserSegmentRow['signal'] | 'all';
type RoleFilter = 'all' | 'admin' | 'staff' | 'client';

export default function AdminAnalyticsDashboard() {
  const navigate = useNavigate();
  const { data: kpis, isLoading: kpisLoading } = useAdminKPIs();
  const { data: users, isLoading: usersLoading } = useAdminUserSegments();
  const { data: toolStats } = useToolUsageStats();

  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      if (signalFilter !== 'all' && u.signal !== signalFilter) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      return true;
    });
  }, [users, signalFilter, roleFilter]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <ScreenHeader title="Nutzer-Analytik" />

        {/* ── KPIs ────────────────────────────────── */}
        {kpisLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
          </div>
        ) : kpis ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <KPICard label="Nutzer gesamt" value={kpis.totalUsers} icon={Users} />
            <KPICard label="Aktiv (7 Tage)" value={kpis.active7d} icon={Activity} sub={`${kpis.active30d} in 30d`} />
            <KPICard label="Neue Nutzer (7d)" value={kpis.new7d} icon={TrendingUp} sub={`${kpis.new30d} in 30d`} />
            <KPICard label="Mit Login" value={kpis.withLogin} icon={LogIn} sub={`${kpis.inactive7d} inaktiv`} />
            <KPICard label="Chat-Nutzer" value={kpis.withChat} icon={MessageSquare} sub={`${kpis.totalSessions} Sessions`} />
          </div>
        ) : null}

        {/* ── Filters ─────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          <Select value={signalFilter} onValueChange={(v) => setSignalFilter(v as SignalFilter)}>
            <SelectTrigger className="w-[200px] h-9 text-xs">
              <SelectValue placeholder="Signal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Signale</SelectItem>
              {Object.entries(SIGNAL_CONFIG).filter(([k]) => k !== 'none').map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue placeholder="Rolle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Rollen</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="client">Client</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="text-xs self-center">
            {filteredUsers.length} Nutzer
          </Badge>
        </div>

        {/* ── User table ──────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Nutzerübersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <Skeleton className="h-60 w-full rounded-lg" />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Name</TableHead>
                      <TableHead className="text-xs">Rolle</TableHead>
                      <TableHead className="text-xs text-right">Sessions</TableHead>
                      <TableHead className="text-xs text-right">Events</TableHead>
                      <TableHead className="text-xs text-right">Tools ▸</TableHead>
                      <TableHead className="text-xs text-right">Tools ✓</TableHead>
                      <TableHead className="text-xs text-right">Chat</TableHead>
                      <TableHead className="text-xs">Letzte Aktivität</TableHead>
                      <TableHead className="text-xs">Signal</TableHead>
                      <TableHead className="text-xs w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.slice(0, 100).map((u) => {
                      const sig = SIGNAL_CONFIG[u.signal];
                      return (
                        <TableRow
                          key={u.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/app/users/${u.id}`)}
                        >
                          <TableCell className="text-sm font-medium">
                            {u.first_name} {u.last_name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{u.role}</Badge>
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{u.session_count}</TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{u.event_count}</TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{u.tool_opened_count}</TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{u.tool_completed_count}</TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{u.chat_count}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.last_activity
                              ? new Date(u.last_activity).toLocaleDateString('de-CH')
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sig.color}`}>
                              {sig.label}
                            </span>
                          </TableCell>
                          <TableCell>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredUsers.length > 100 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Zeige die ersten 100 von {filteredUsers.length} Nutzern
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Tool Usage ──────────────────────────── */}
        {toolStats && toolStats.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Tool-Nutzung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {toolStats.map((t) => (
                  <div key={t.tool_key} className="flex items-center gap-4">
                    <div className="w-40 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.tool_key}</p>
                    </div>
                    <div className="flex-1">
                      <Progress value={t.completion_rate} className="h-2" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums shrink-0">
                      <span>{t.opened}× geöffnet</span>
                      <span>{t.completed}× abgeschlossen</span>
                      <Badge
                        variant={t.completion_rate >= 50 ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {t.completion_rate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Signal segments summary ─────────────── */}
        {users && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(SIGNAL_CONFIG) as [UserSegmentRow['signal'], typeof SIGNAL_CONFIG['new']][])
              .filter(([k]) => k !== 'none')
              .map(([key, cfg]) => {
                const count = users.filter(u => u.signal === key).length;
                return (
                  <Card
                    key={key}
                    className="cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all"
                    onClick={() => setSignalFilter(key)}
                  >
                    <CardContent className="pt-3 pb-2 px-4">
                      <p className="text-xs text-muted-foreground">{cfg.label}</p>
                      <p className="text-xl font-bold text-foreground">{count}</p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
