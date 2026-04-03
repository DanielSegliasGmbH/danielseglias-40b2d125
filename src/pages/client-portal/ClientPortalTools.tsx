import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Wrench, Clock, Calculator, PieChart, TrendingUp, FileText, LucideIcon } from 'lucide-react';
import { useClientToolsFiltered } from '@/hooks/useClientPortal';
import { groupToolsByCluster } from '@/config/toolClusters';

const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
};

export default function ClientPortalTools() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: tools, isLoading, error } = useClientTools();

  const hasTools = tools && tools.length > 0;
  const clusteredTools = hasTools ? groupToolsByCluster(tools) : [];

  const handleStartTool = (slug: string | null) => {
    if (slug) {
      navigate(`/app/client-portal/tools/${slug}`);
    }
  };

  return (
    <ClientPortalLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('clientPortal.tools')}</h1>
            <p className="text-muted-foreground">{t('clientPortal.toolsDesc')}</p>
          </div>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="w-10 h-10 rounded-lg mb-2" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
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

        {!isLoading && !hasTools && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <CardTitle>{t('clientPortal.comingSoon')}</CardTitle>
              </div>
              <CardDescription>{t('clientPortal.inDevelopment')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="font-medium mb-3">{t('clientPortal.plannedFeatures')}</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• {t('clientPortal.toolsFeatures.feature1')}</li>
                  <li>• {t('clientPortal.toolsFeatures.feature2')}</li>
                  <li>• {t('clientPortal.toolsFeatures.feature3')}</li>
                  <li>• {t('clientPortal.toolsFeatures.feature4')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {clusteredTools.map(({ cluster, tools: clusterTools }) => (
          <div key={cluster.key} className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">{t(cluster.i18nKey)}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {clusterTools.map((tool) => {
                const IconComponent = iconMap[tool.icon] || Wrench;

                return (
                  <Card key={tool.id} className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{t(tool.name_key)}</CardTitle>
                      <CardDescription>{t(tool.description_key)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleStartTool(tool.slug)}
                        disabled={!tool.slug}
                      >
                        {t('clientPortal.startTool')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ClientPortalLayout>
  );
}
