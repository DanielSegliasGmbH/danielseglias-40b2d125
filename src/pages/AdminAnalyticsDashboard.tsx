import { useState, useMemo, useEffect } from 'react';
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
  ArrowRight, BarChart3, RefreshCw, Tag,
} from 'lucide-react';
import {
  useAdminKPIs,
  useAdminUserSegments,
  useToolUsageStats,
  type UserSegmentRow,
} from '@/hooks/useAdminDashboard';
import {
  useAllUserScoring,
  useRecomputeScores,
  STATUS_CONFIG,
  type UserStatus,
  type UserScoringRow,
} from '@/hooks/useUserScoring';
import { toast } from 'sonner';

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

type StatusFilter = UserStatus | 'all';
type RoleFilter = 'all' | 'admin' | 'staff' | 'client';

export default function AdminAnalyticsDashboard() {
  const navigate = useNavigate();
  const { data: kpis, isLoading: kpisLoading } = useAdminKPIs();
  const { data: users, isLoading: usersLoading } = useAdminUserSegments();
  const { data: toolStats } = useToolUsageStats();
  const { data: scoring } = useAllUserScoring();
  const recompute = useRecomputeScores();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [labelFilter, setLabelFilter] = useState('all');

  // Build scoring map
  const scoringMap = useMemo(() => {
    const map = new Map<string, UserScoringRow>();
    scoring?.forEach(s => map.set(s.user_id, s));
    return map;
  }, [scoring]);

  // Collect all labels for filter
  const allLabels = useMemo(() => {
    const labels = new Set<string>();
    scoring?.forEach(s => s.labels?.forEach(l => labels.add(l)));
    return Array.from(labels).sort();
  }, [scoring]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const sc = scoringMap.get(u.id);
      if (statusFilter !== 'all' && sc?.status !== statusFilter) return false;
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (labelFilter !== 'all' && !(sc?.labels || []).includes(labelFilter)) return false;
      return true;
    });
  }, [users, statusFilter, roleFilter, labelFilter, scoringMap]);

  const handleRecompute = () => {
    recompute.mutate(undefined, {
      onSuccess: (count) => toast.success(`Scoring für ${count} Nutzer aktualisiert`),
      onError: () => toast.error('Fehler beim Berechnen'),
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <ScreenHeader title="Nutzer-Analytik" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecompute}
            disabled={recompute.isPending}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${recompute.isPending ? 'animate-spin' : ''}`} />
            Scoring aktualisieren
          </Button>
        </div>

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

        {/* ── Status segments summary ─────────────── */}
        {scoring && scoring.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(STATUS_CONFIG) as [UserStatus, { label: string; color: string }][]).map(([key, cfg]) => {
              const count = scoring.filter(s => s.status === key).length;
              if (count === 0) return null;
              return (
                <Card
                  key={key}
                  className={`cursor-pointer hover:ring-1 hover:ring-primary/20 transition-all ${statusFilter === key ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
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

        {/* ── Filters ─────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-[180px] h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
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
          {allLabels.length > 0 && (
            <Select value={labelFilter} onValueChange={setLabelFilter}>
              <SelectTrigger className="w-[200px] h-9 text-xs">
                <Tag className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Label" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Labels</SelectItem>
                {allLabels.map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Score</TableHead>
                      <TableHead className="text-xs">Labels</TableHead>
                      <TableHead className="text-xs text-right">Sessions</TableHead>
                      <TableHead className="text-xs text-right">Tools ✓</TableHead>
                      <TableHead className="text-xs">Letzte Aktivität</TableHead>
                      <TableHead className="text-xs w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.slice(0, 100).map((u) => {
                      const sc = scoringMap.get(u.id);
                      const statusCfg = sc ? STATUS_CONFIG[sc.status] : null;
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
                          <TableCell>
                            {statusCfg ? (
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                                {statusCfg.label}
                                {sc?.is_manual_override && ' ✎'}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums font-medium">
                            {sc ? sc.score : '—'}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(sc?.labels || []).slice(0, 3).map(l => (
                                <span key={l} className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground truncate max-w-[120px]">
                                  {l}
                                </span>
                              ))}
                              {(sc?.labels?.length || 0) > 3 && (
                                <span className="text-[9px] text-muted-foreground">+{sc!.labels.length - 3}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{u.session_count}</TableCell>
                          <TableCell className="text-right text-sm tabular-nums">{u.tool_completed_count}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {u.last_activity
                              ? new Date(u.last_activity).toLocaleDateString('de-CH')
                              : '—'}
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
      </div>
    </AppLayout>
  );
}
