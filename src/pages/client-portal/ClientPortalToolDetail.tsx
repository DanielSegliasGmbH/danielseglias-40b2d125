import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useGamification } from '@/hooks/useGamification';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calculator, PieChart, TrendingUp, FileText, Wrench, Scale, Home, ShieldCheck, LucideIcon } from 'lucide-react';
import { FinanzcheckTool } from '@/components/tools/finanzcheck/FinanzcheckTool';
import VorsorgecheckTool from '@/components/tools/vorsorgecheck/VorsorgecheckTool';
import VvgLeistungsvergleichTool from '@/components/tools/vvg-leistungsvergleich/VvgLeistungsvergleichTool';
import { RenditeRisikoTool } from '@/components/tools/rendite-risiko/RenditeRisikoTool';
import { CaseStudyGeneratorTool } from '@/components/tools/case-study-generator/CaseStudyGeneratorTool';
import { Vergleichsrechner3aTool } from '@/components/tools/vergleichsrechner-3a/Vergleichsrechner3aTool';
import { InflationsrechnerTool } from '@/components/tools/inflationsrechner/InflationsrechnerTool';
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
import { BeratungsreiseTool } from '@/components/tools/beratungsreise/BeratungsreiseTool';
import { Mini3aKurzcheckTool } from '@/components/tools/mini-3a-kurzcheck/Mini3aKurzcheckTool';
import { GlaubenssatzTransformerTool } from '@/components/tools/glaubenssatz-transformer/GlaubenssatzTransformerTool';
import { FinanzEntscheidungTool } from '@/components/tools/finanz-entscheidung/FinanzEntscheidungTool';
import { LebenzeitRechnerTool } from '@/components/tools/lebenzeit-rechner/LebenzeitRechnerTool';
import { RolexRechnerTool } from '@/components/tools/rolex-rechner/RolexRechnerTool';
import { ThreeAAnalyzerTool } from '@/components/tools/three-a-analyzer/ThreeAAnalyzerTool';
import { SteuerCheckTool } from '@/components/tools/steuer-check/SteuerCheckTool';
import { RecommendationCards } from '@/components/client-portal/RecommendationCards';
import { TOOL_RECOMMENDATIONS } from '@/config/recommendationConfig';

const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
  'Scale': Scale,
  'home': Home,
  'ShieldCheck': ShieldCheck,
};

export default function ClientPortalToolDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { awardPoints } = useGamification();

  // Award points for tool usage
  useEffect(() => {
    if (slug) {
      awardPoints('tool_used', slug);
    }
  }, [slug]);
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
      case 'case-study-generator':
        return <CaseStudyGeneratorTool />;
      case 'vergleichsrechner-3a':
        return <Vergleichsrechner3aTool />;
      case 'inflationsrechner':
        return <InflationsrechnerTool />;
      case 'tragbarkeitsrechner':
        return <TragbarkeitsrechnerTool mode="internal" />;
      case 'verlustrechner-3a':
        return <Verlustrechner3aTool />;
      case 'transparenz-check':
        return <TransparenzCheckTool mode="internal" />;
      case 'kostenaufschluesselung':
        return <KostenaufschluesselungTool mode="internal" />;
      case 'kosten-impact-simulator':
        return <KostenImpactSimulatorTool mode="internal" />;
      case 'wahrscheinlichkeitsrechner':
        return <WahrscheinlichkeitsrechnerTool mode="internal" />;
      case 'zufalls-realitaets-check':
        return <ZufallsRealitaetsCheckTool mode="internal" />;
      case 'recovery-analyse':
        return <RecoveryAnalyseTool mode="internal" />;
      case 'sicherheitsvergleich':
        return <SicherheitsvergleichTool mode="internal" />;
      case 'zeitverlust-simulator':
        return <ZeitverlustSimulatorTool mode="internal" />;
      case 'beratungsreise':
        return <BeratungsreiseTool mode="internal" />;
      case 'mini-3a-kurzcheck':
        return <Mini3aKurzcheckTool mode="internal" />;
      case 'glaubenssatz-transformer':
        return <GlaubenssatzTransformerTool mode="internal" />;
      case 'finanz-entscheidung':
        return <FinanzEntscheidungTool mode="internal" />;
      case 'lebenzeit-rechner':
        return <LebenzeitRechnerTool mode="internal" />;
      case 'rolex-rechner':
        return <RolexRechnerTool mode="internal" />;
      case 'three-a-analyzer':
        return <ThreeAAnalyzerTool mode="internal" />;
      case 'steuer-check':
        return <SteuerCheckTool mode="internal" />;
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

        {/* Recommendations */}
        {slug && TOOL_RECOMMENDATIONS[slug] && (
          <RecommendationCards recommendations={TOOL_RECOMMENDATIONS[slug]} />
        )}
      </div>
    </ClientPortalLayout>
  );
}
