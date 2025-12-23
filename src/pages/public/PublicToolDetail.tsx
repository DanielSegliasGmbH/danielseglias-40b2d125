import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm';
import { ArrowLeft, Clock, Wrench, Calculator, PieChart, TrendingUp, FileText, LucideIcon } from 'lucide-react';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
};

export default function PublicToolDetail() {
  const { t } = useTranslation();
  const { toolKey } = useParams<{ toolKey: string }>();

  const { data: tool, isLoading, error } = useQuery({
    queryKey: ['public-tool', toolKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('slug', toolKey)
        .eq('enabled_for_public', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!toolKey,
  });

  const IconComponent = tool?.icon ? iconMap[tool.icon] || Wrench : Wrench;
  const isPlanned = tool?.status === 'planned';

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <Link to="/tools" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('public.tools.backToList')}
        </Link>

        <div className="max-w-3xl mx-auto">
          {isLoading && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-64 w-full mt-8" />
            </div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="py-12 text-center text-destructive">
                {t('app.loadError')}
              </CardContent>
            </Card>
          )}

          {!isLoading && !tool && (
            <Card>
              <CardContent className="py-12 text-center">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {t('public.tools.notFound')}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t('public.tools.notFoundDesc')}
                </p>
                <Link to="/tools">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('public.tools.backToList')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {tool && (
            <>
              {/* Tool Header */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      {t(tool.name_key)}
                    </h1>
                    {isPlanned && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('public.tools.comingSoon')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-lg text-muted-foreground">
                    {t(tool.description_key)}
                  </p>
                </div>
              </div>

              {/* Tool Content Area */}
              {isPlanned ? (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>{t('public.tools.inDevelopmentTitle')}</CardTitle>
                    <CardDescription>{t('public.tools.inDevelopmentDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-6 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {t('public.tools.notifyMeHint')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>{t(tool.name_key)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Placeholder for actual tool implementation */}
                    <div className="bg-muted/50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
                      <div>
                        <IconComponent className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {t('public.tools.toolPlaceholder')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* CTA Section */}
              <LeadCaptureForm
                source="tool_cta"
                toolKey={tool.key}
                title={isPlanned ? t('public.tools.notifyMeTitle') : t('public.tools.ctaTitle')}
                description={isPlanned ? t('public.tools.notifyMeDesc') : t('public.tools.ctaDescription')}
                showMessage={!isPlanned}
                ctaText={isPlanned ? t('public.tools.notifyMe') : undefined}
                compact
              />
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
