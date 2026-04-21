import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, Wrench, ArrowRight, AlertCircle, Lock } from 'lucide-react';
import { usePublicTools } from '@/hooks/useTools';
import { groupToolsByCluster } from '@/config/toolClusters';
import { resolveToolText } from '@/lib/toolTranslations';

export default function PublicTools() {
  const { t } = useTranslation();
  const { data: tools, isLoading, error } = usePublicTools();

  const clusteredTools = tools && tools.length > 0 ? groupToolsByCluster(tools) : [];

  return (
    <PublicLayout title={t('public.tools.title')} description={t('public.tools.subtitle')}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('public.tools.title')}</h1>
              <p className="text-muted-foreground">{t('public.tools.subtitle')}</p>
            </div>
          </div>

          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
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
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h3 className="font-medium text-destructive mb-2">{t('app.loadError')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('public.tools.tryAgainLater', 'Bitte versuchen Sie es später erneut.')}
                </p>
              </CardContent>
            </Card>
          )}

          {clusteredTools.map(({ cluster, tools: clusterTools }) => (
            <div key={cluster.key} className="mb-10">
              <h2 className="text-xl font-semibold text-foreground mb-4">{t(cluster.i18nKey)}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clusterTools.map((tool) => (
                  <Card key={tool.id} className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                        <Wrench className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{resolveToolText(t, tool.name_key, 'name')}</span>
                        {(tool as { has_password?: boolean }).has_password && (
                          <span
                            title="Passwortgeschützt"
                            className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
                          >
                            <Lock className="h-3 w-3" />
                          </span>
                        )}
                      </CardTitle>
                      {tool.description_key && (
                        <CardDescription>{resolveToolText(t, tool.description_key, 'description')}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <Link to={`/tools/${tool.slug}`}>
                        <Button variant="outline" className="w-full">
                          {t('public.tools.startTool')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {tools && tools.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {t('public.tools.noToolsAvailable')}
              </CardContent>
            </Card>
          )}

          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t('public.tools.ctaTitle')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('public.tools.ctaDescription')}
              </p>
              <Link to="/contact">
                <Button>
                  {t('public.tools.ctaButton')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
