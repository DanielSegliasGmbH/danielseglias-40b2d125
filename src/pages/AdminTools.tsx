import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench, Calculator, PieChart, TrendingUp, FileText, Clock, ClipboardCheck, ChevronRight, LucideIcon } from 'lucide-react';
import { useAllTools, useUpdateTool } from '@/hooks/useTools';
import { groupToolsByCluster } from '@/config/toolClusters';
import { toast } from 'sonner';

const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
  'ClipboardCheck': ClipboardCheck,
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

  const handleTogglePublic = (toolId: string, currentValue: boolean) => {
    updateTool.mutate(
      { id: toolId, updates: { enabled_for_public: !currentValue } },
      {
        onSuccess: () => toast.success(t('adminTools.updateSuccess')),
        onError: () => toast.error(t('adminTools.updateError')),
      }
    );
  };

  const clusteredTools = tools ? groupToolsByCluster(tools) : [];

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
            <CardDescription>{t('adminTools.overviewDesc')}</CardDescription>
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

        {clusteredTools.map(({ cluster, tools: clusterTools }) => (
          <div key={cluster.key} className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground pt-2">{t(cluster.i18nKey)}</h2>
            <div className="grid gap-3">
              {clusterTools.map((tool) => {
                const IconComponent = iconMap[tool.icon] || Wrench;
                const isPlanned = tool.status === 'planned';

                return (
                  <Link key={tool.id} to={`/app/tools/${tool.slug || tool.key}`}>
                    <Card className="transition-colors hover:bg-muted/30 cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <IconComponent className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-foreground">{t(tool.name_key)}</h3>
                                {isPlanned && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {t('adminTools.planned')}
                                  </Badge>
                                )}
                                {tool.enabled_for_public && (
                                  <Badge variant="outline" className="text-xs">Öffentlich</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{t(tool.description_key)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center gap-1" onClick={(e) => e.preventDefault()}>
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
                            <div className="flex flex-col items-center gap-1" onClick={(e) => e.preventDefault()}>
                              <Label htmlFor={`tool-public-${tool.id}`} className="text-xs text-muted-foreground">
                                {t('adminTools.public')}
                              </Label>
                              <Switch
                                id={`tool-public-${tool.id}`}
                                checked={tool.enabled_for_public}
                                onCheckedChange={() => handleTogglePublic(tool.id, tool.enabled_for_public)}
                                disabled={isPlanned || updateTool.isPending}
                                aria-label={t('adminTools.enableForPublic')}
                              />
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

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
