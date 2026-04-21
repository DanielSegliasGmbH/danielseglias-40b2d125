import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wrench, Calculator, PieChart, TrendingUp, FileText, Clock, ClipboardCheck, ChevronRight, Briefcase, Receipt, Landmark, Heart, Shield, Hourglass, Lock, EyeOff, Globe, Copy, Link2, KeyRound, LucideIcon } from 'lucide-react';
import { useAllTools, useUpdateTool, type ToolVisibility, type Tool } from '@/hooks/useTools';
import { toast } from 'sonner';
import { resolveToolText } from '@/lib/toolTranslations';

const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
  'ClipboardCheck': ClipboardCheck,
  'Briefcase': Briefcase,
  'Receipt': Receipt,
  'Landmark': Landmark,
  'Heart': Heart,
  'Shield': Shield,
  'Hourglass': Hourglass,
};

export default function AdminTools() {
  const { t } = useTranslation();
  const { data: tools, isLoading, error } = useAllTools();
  const updateTool = useUpdateTool();

  const handleToggleClient = (toolId: string, currentValue: boolean) => {
    updateTool.mutate(
      { id: toolId, updates: { enabled_for_clients: !currentValue } },
      {
        onSuccess: () => toast.success(t('adminTools.updateSuccess')),
        onError: () => toast.error(t('adminTools.updateError')),
      }
    );
  };

  const handleVisibilityChange = (toolId: string, value: string) => {
    const [vis, phase] = value.split(':');
    updateTool.mutate(
      {
        id: toolId,
        updates: {
          visibility: vis as ToolVisibility,
          unlock_phase: vis === 'phase_locked' ? Number(phase || 2) : null,
        },
      },
      {
        onSuccess: () => toast.success('Sichtbarkeit aktualisiert'),
        onError: () => toast.error(t('adminTools.updateError')),
      }
    );
  };

  const visibilityValue = (vis: ToolVisibility, phase: number | null) =>
    vis === 'phase_locked' ? `phase_locked:${phase ?? 2}` : vis;

  const visibilityBadge = (vis: ToolVisibility, phase: number | null) => {
    if (vis === 'public') return <Badge variant="default" className="text-xs gap-1"><Globe className="h-3 w-3" />Öffentlich</Badge>;
    if (vis === 'phase_locked') return <Badge variant="secondary" className="text-xs gap-1"><Lock className="h-3 w-3" />Phase {phase ?? '?'}</Badge>;
    if (vis === 'admin_only') return <Badge variant="outline" className="text-xs gap-1"><Shield className="h-3 w-3" />Admin</Badge>;
    return <Badge variant="destructive" className="text-xs gap-1"><EyeOff className="h-3 w-3" />Versteckt</Badge>;
  };

  const activeTools = tools?.filter((tool) => tool.status === 'active') ?? [];
  const plannedTools = tools?.filter((tool) => tool.status !== 'active') ?? [];

  const renderToolCard = (tool: Tool) => {
    const IconComponent = iconMap[tool.icon] || Wrench;
    const isPlanned = tool.status === 'planned';

    return (
      <Link key={tool.id} to={`/app/tools/${tool.slug || tool.key}`}>
        <Card className="transition-colors hover:bg-muted/30 cursor-pointer group">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <IconComponent className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-medium text-foreground text-sm sm:text-base">{resolveToolText(t, tool.name_key, 'name')}</h3>
                    {isPlanned && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('adminTools.planned')}
                      </Badge>
                    )}
                    {visibilityBadge(tool.visibility, tool.unlock_phase)}
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">{resolveToolText(t, tool.description_key, 'description')}</p>
                  {tool.enabled_for_public && tool.slug && (
                    <div
                      className="mt-2 flex flex-wrap items-center gap-2 text-xs"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Link2 className="h-3 w-3 text-muted-foreground shrink-0" />
                      <code className="truncate text-muted-foreground max-w-[220px]">
                        /tools/{tool.slug}
                      </code>
                      {tool.public_password && (
                        <Badge variant="outline" className="h-5 gap-1 text-[10px]">
                          <KeyRound className="h-2.5 w-2.5" />
                          PW
                        </Badge>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigator.clipboard.writeText(`${window.location.origin}/tools/${tool.slug}`);
                          toast.success('Link kopiert');
                        }}
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <Copy className="h-3 w-3" />
                        Kopieren
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="hidden md:flex flex-col items-start gap-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                  <Label className="text-xs text-muted-foreground">Sichtbarkeit</Label>
                  <Select
                    value={visibilityValue(tool.visibility, tool.unlock_phase)}
                    onValueChange={(v) => handleVisibilityChange(tool.id, v)}
                    disabled={updateTool.isPending}
                  >
                    <SelectTrigger className="h-8 w-[170px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">🌍 Öffentlich</SelectItem>
                      <SelectItem value="phase_locked:2">🔒 Phase 2</SelectItem>
                      <SelectItem value="phase_locked:3">🔒 Phase 3</SelectItem>
                      <SelectItem value="phase_locked:4">🔒 Phase 4</SelectItem>
                      <SelectItem value="phase_locked:5">🔒 Phase 5</SelectItem>
                      <SelectItem value="phase_locked:6">🔒 Phase 6</SelectItem>
                      <SelectItem value="hidden">🚫 Versteckt</SelectItem>
                      <SelectItem value="admin_only">🛡️ Admin only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="hidden sm:flex flex-col items-center gap-1" onClick={(e) => e.preventDefault()}>
                  <Label htmlFor={`tool-client-${tool.id}`} className="text-xs text-muted-foreground">
                    {t('adminTools.clients')}
                  </Label>
                  <Switch
                    id={`tool-client-${tool.id}`}
                    checked={tool.enabled_for_clients}
                    onCheckedChange={() => handleToggleClient(tool.id, tool.enabled_for_clients)}
                    disabled={isPlanned || updateTool.isPending}
                    aria-label={t('adminTools.enableForClients')}
                  />
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <AppLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 page-transition">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wrench className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{t('adminTools.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('adminTools.subtitle')}</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('adminTools.overviewTitle')}</CardTitle>
            <CardDescription>
              {activeTools.length} aktive Tools · {plannedTools.length} geplante Tools
            </CardDescription>
          </CardHeader>
        </Card>

        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="p-6 text-destructive">
              {t('app.loadError')}
            </CardContent>
          </Card>
        )}

        {/* Active Tools */}
        {activeTools.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pt-2">
              <h2 className="text-lg font-semibold text-foreground">Aktive Tools</h2>
              <Badge variant="secondary" className="text-xs">{activeTools.length}</Badge>
            </div>
            <div className="grid gap-3">
              {activeTools.map((tool) => renderToolCard(tool))}
            </div>
          </div>
        )}

        {/* Planned Tools */}
        {plannedTools.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 pt-2">
              <h2 className="text-lg font-semibold text-foreground">Geplante Tools</h2>
              <Badge variant="secondary" className="text-xs">{plannedTools.length}</Badge>
            </div>
            <div className="grid gap-3">
              {plannedTools.map((tool) => renderToolCard(tool))}
            </div>
          </div>
        )}

        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <p className="text-sm">{t('adminTools.moreToolsPlanned')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
