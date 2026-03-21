import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm';
import { ArrowLeft, Wrench, Calculator, PieChart, TrendingUp, FileText, ClipboardCheck, Home, ShieldCheck, LucideIcon } from 'lucide-react';
import { FinanzcheckTool } from '@/components/tools/finanzcheck/FinanzcheckTool';
import VorsorgecheckTool from '@/components/tools/vorsorgecheck/VorsorgecheckTool';
import KvgPraemienvergleichTool from '@/components/tools/kvg-praemienvergleich/KvgPraemienvergleichTool';
import VvgLeistungsvergleichTool from '@/components/tools/vvg-leistungsvergleich/VvgLeistungsvergleichTool';
import { RenditeRisikoTool } from '@/components/tools/rendite-risiko/RenditeRisikoTool';
import { TragbarkeitsrechnerTool } from '@/components/tools/tragbarkeitsrechner/TragbarkeitsrechnerTool';
import { Verlustrechner3aTool } from '@/components/tools/verlustrechner-3a/Verlustrechner3aTool';
import { TransparenzCheckTool } from '@/components/tools/transparenz-check/TransparenzCheckTool';
import { KostenaufschluesselungTool } from '@/components/tools/kostenaufschluesselung/KostenaufschluesselungTool';
import { KostenImpactSimulatorTool } from '@/components/tools/kosten-impact-simulator/KostenImpactSimulatorTool';
import { WahrscheinlichkeitsrechnerTool } from '@/components/tools/wahrscheinlichkeitsrechner/WahrscheinlichkeitsrechnerTool';
import { ZufallsRealitaetsCheckTool } from '@/components/tools/zufalls-realitaets-check/ZufallsRealitaetsCheckTool';
import { RecoveryAnalyseTool } from '@/components/tools/recovery-analyse/RecoveryAnalyseTool';
import { SicherheitsvergleichTool } from '@/components/tools/sicherheitsvergleich/SicherheitsvergleichTool';
import { ZeitverlustSimulatorTool } from '@/components/tools/zeitverlust-simulator/ZeitverlustSimulatorTool';
import { GlaubenssatzTransformerTool } from '@/components/tools/glaubenssatz-transformer/GlaubenssatzTransformerTool';
import { FinanzEntscheidungTool } from '@/components/tools/finanz-entscheidung/FinanzEntscheidungTool';
import NotFound from '@/pages/NotFound';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
  'ClipboardCheck': ClipboardCheck,
  'home': Home,
  'ShieldCheck': ShieldCheck,
};

export default function PublicToolDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  // Load ONLY from public_pages (published tools only)
  const { data: publicPage, isLoading, error } = useQuery({
    queryKey: ['public-pages', 'tool', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_pages')
        .select('*')
        .eq('slug', slug)
        .eq('page_type', 'tool')
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    staleTime: 60 * 1000, // 60 seconds
    refetchOnWindowFocus: false,
  });

  const IconComponent = iconMap['wrench'] || Wrench;

  // If not loading and no page found → 404
  if (!isLoading && !publicPage) {
    return <NotFound />;
  }

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
              <CardContent className="py-12 text-center">
                <Wrench className="h-10 w-10 text-destructive mx-auto mb-4" />
                <h3 className="font-medium text-destructive mb-2">{t('app.loadError')}</h3>
                <p className="text-muted-foreground text-sm">
                  {t('public.tools.tryAgainLater', 'Bitte versuchen Sie es später erneut.')}
                </p>
              </CardContent>
            </Card>
          )}

          {publicPage && (
            <>
              {/* Header */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {publicPage.title}
                  </h1>
                  {publicPage.excerpt && (
                    <p className="text-lg text-muted-foreground">
                      {publicPage.excerpt}
                    </p>
                  )}
                </div>
              </div>

              {/* Tool Content - Render appropriate tool component */}
              {slug === 'finanzcheck' ? (
                <div className="mb-8">
                  <FinanzcheckTool mode="public" />
                </div>
              ) : slug === 'kvg-praemienvergleich' ? (
                <div className="mb-8">
                  <KvgPraemienvergleichTool />
                </div>
              ) : slug === 'vvg-leistungsvergleich' ? (
                <div className="mb-8">
                  <VvgLeistungsvergleichTool />
                </div>
              ) : slug === 'vorsorgecheck-3a' ? (
                <div className="mb-8">
                  <VorsorgecheckTool />
                </div>
              ) : slug === 'rendite-risiko-simulation' ? (
                <div className="mb-8">
                  <RenditeRisikoTool mode="public" />
                </div>
              ) : slug === 'tragbarkeitsrechner' ? (
                <div className="mb-8">
                  <TragbarkeitsrechnerTool mode="public" />
                </div>
              ) : slug === 'verlustrechner-3a' ? (
                <div className="mb-8">
                  <Verlustrechner3aTool />
                </div>
              ) : slug === 'transparenz-check' ? (
                <div className="mb-8">
                  <TransparenzCheckTool mode="public" />
                </div>
              ) : slug === 'kostenaufschluesselung' ? (
                <div className="mb-8">
                  <KostenaufschluesselungTool mode="public" />
                </div>
              ) : slug === 'kosten-impact-simulator' ? (
                <div className="mb-8">
                  <KostenImpactSimulatorTool mode="public" />
                </div>
              ) : slug === 'wahrscheinlichkeitsrechner' ? (
                <div className="mb-8">
                  <WahrscheinlichkeitsrechnerTool mode="public" />
                </div>
              ) : slug === 'zufalls-realitaets-check' ? (
                <div className="mb-8">
                  <ZufallsRealitaetsCheckTool mode="public" />
                </div>
              ) : slug === 'recovery-analyse' ? (
                <div className="mb-8">
                  <RecoveryAnalyseTool mode="public" />
                </div>
              ) : slug === 'sicherheitsvergleich' ? (
                <div className="mb-8">
                  <SicherheitsvergleichTool mode="public" />
                </div>
              ) : slug === 'zeitverlust-simulator' ? (
                <div className="mb-8">
                  <ZeitverlustSimulatorTool mode="public" />
                </div>
              ) : slug === 'glaubenssatz-transformer' ? (
                <div className="mb-8">
                  <GlaubenssatzTransformerTool mode="public" />
                </div>
              ) : slug === 'finanz-entscheidung' ? (
                <div className="mb-8">
                  <FinanzEntscheidungTool mode="public" />
                </div>
              ) : publicPage.content ? (
                <Card className="mb-8">
                  <CardContent className="py-6 prose prose-neutral dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: publicPage.content }} />
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-8">
                  <CardContent className="py-12 text-center">
                    <IconComponent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('public.tools.toolPlaceholder')}</p>
                  </CardContent>
                </Card>
              )}

              {/* CTA */}
              <LeadCaptureForm
                source="tool_cta"
                toolKey={slug || ''}
                title={t('public.tools.ctaTitle')}
                description={t('public.tools.ctaDescription')}
                showMessage
                compact
              />
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
