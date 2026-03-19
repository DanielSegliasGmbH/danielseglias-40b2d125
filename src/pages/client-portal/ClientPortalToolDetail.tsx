import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calculator, PieChart, TrendingUp, FileText, Wrench, Scale, LucideIcon } from 'lucide-react';
import { FinanzcheckTool } from '@/components/tools/finanzcheck/FinanzcheckTool';
import VorsorgecheckTool from '@/components/tools/vorsorgecheck/VorsorgecheckTool';
import VvgLeistungsvergleichTool from '@/components/tools/vvg-leistungsvergleich/VvgLeistungsvergleichTool';
import { RenditeRisikoTool } from '@/components/tools/rendite-risiko/RenditeRisikoTool';
import { CaseStudyGeneratorTool } from '@/components/tools/case-study-generator/CaseStudyGeneratorTool';

const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
  'Scale': Scale,
};

export default function ClientPortalToolDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: tool, isLoading, error } = useQuery({
    queryKey: ['client-tool', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('slug', slug)
        .eq('enabled_for_clients', true)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const IconComponent = tool?.icon ? (iconMap[tool.icon] || Wrench) : Wrench;

  const renderToolComponent = () => {
    if (!tool) return null;

    switch (tool.slug) {
      case 'finanzcheck':
        return <FinanzcheckTool mode="internal" />;
      case 'vorsorgecheck-3a':
        return <VorsorgecheckTool />;
      case 'vvg-leistungsvergleich':
        return <VvgLeistungsvergleichTool />;
      case 'rendite-risiko-simulation':
        return <RenditeRisikoTool mode="internal" />;
      default:
        return (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('tools.notImplemented')}</p>
            </CardContent>
          </Card>
        );
    }
  };

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </ClientPortalLayout>
    );
  }

  if (error || !tool) {
    return (
      <ClientPortalLayout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">{t('tools.notFound')}</p>
              <Button variant="outline" onClick={() => navigate('/app/client-portal/tools')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('app.back')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/app/client-portal/tools')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('app.back')}
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <IconComponent className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t(tool.name_key)}</h1>
            <p className="text-muted-foreground">{t(tool.description_key)}</p>
          </div>
        </div>

        {renderToolComponent()}
      </div>
    </ClientPortalLayout>
  );
}
