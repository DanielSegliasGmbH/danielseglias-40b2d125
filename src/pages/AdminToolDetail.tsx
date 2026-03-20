import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Wrench, Calculator, PieChart, TrendingUp, FileText, Clock, Globe, Users, ExternalLink, ClipboardCheck, LucideIcon } from 'lucide-react';
import { useUpdateTool, Tool } from '@/hooks/useTools';
import { toast } from 'sonner';
import { FinanzcheckTool } from '@/components/tools/finanzcheck/FinanzcheckTool';
import { RenditeRisikoTool } from '@/components/tools/rendite-risiko/RenditeRisikoTool';
import { CaseStudyGeneratorTool } from '@/components/tools/case-study-generator/CaseStudyGeneratorTool';
import { KostenaufschluesselungTool } from '@/components/tools/kostenaufschluesselung/KostenaufschluesselungTool';
import { KostenImpactSimulatorTool } from '@/components/tools/kosten-impact-simulator/KostenImpactSimulatorTool';
import { WahrscheinlichkeitsrechnerTool } from '@/components/tools/wahrscheinlichkeitsrechner/WahrscheinlichkeitsrechnerTool';
import { ZufallsRealitaetsCheckTool } from '@/components/tools/zufalls-realitaets-check/ZufallsRealitaetsCheckTool';

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
  'ClipboardCheck': ClipboardCheck,
};

export default function AdminToolDetail() {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const updateTool = useUpdateTool();

  const { data: tool, isLoading, error } = useQuery({
    queryKey: ['admin-tool', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data as Tool | null;
    },
    enabled: !!slug,
  });

  const handleTogglePublic = (currentValue: boolean) => {
    if (!tool) return;
    updateTool.mutate(
      { id: tool.id, updates: { enabled_for_public: !currentValue } },
      {
        onSuccess: () => {
          toast.success(currentValue ? 'Öffentlicher Zugang deaktiviert' : 'Öffentlicher Zugang aktiviert');
        },
        onError: () => {
          toast.error('Fehler beim Aktualisieren');
        },
      }
    );
  };

  const handleToggleClient = (currentValue: boolean) => {
    if (!tool) return;
    updateTool.mutate(
      { id: tool.id, updates: { enabled_for_clients: !currentValue } },
      {
        onSuccess: () => {
          toast.success(currentValue ? 'Kunden-Zugang deaktiviert' : 'Kunden-Zugang aktiviert');
        },
        onError: () => {
          toast.error('Fehler beim Aktualisieren');
        },
      }
    );
  };

  const handleSetStatus = (status: 'active' | 'planned' | 'deprecated') => {
    if (!tool) return;
    updateTool.mutate(
      { id: tool.id, updates: { status } },
      {
        onSuccess: () => {
          toast.success(`Status auf "${status}" gesetzt`);
        },
        onError: () => {
          toast.error('Fehler beim Aktualisieren');
        },
      }
    );
  };

  const IconComponent = tool?.icon ? iconMap[tool.icon] || Wrench : Wrench;

  // Determine which tool component to render
  const renderToolComponent = () => {
    if (!tool) return null;

    switch (tool.slug) {
      case 'finanzcheck':
        return <FinanzcheckTool mode="internal" />;
      case 'rendite-risiko-simulation':
        return <RenditeRisikoTool mode="internal" />;
      case 'case-study-generator':
        return <CaseStudyGeneratorTool />;
      case 'kostenaufschluesselung':
        return <KostenaufschluesselungTool mode="internal" />;
      case 'kosten-impact-simulator':
        return <KostenImpactSimulatorTool mode="internal" />;
      case 'wahrscheinlichkeitsrechner':
        return <WahrscheinlichkeitsrechnerTool mode="internal" />;
      default:
        return (
          <div className="bg-muted/50 rounded-lg p-8 text-center min-h-[300px] flex items-center justify-center">
            <div>
              <IconComponent className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Tool-Komponente noch nicht implementiert
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Link 
          to="/app/tools" 
          className="inline-flex items-center text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zur Werkzeugkiste
        </Link>

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
              Fehler beim Laden des Tools
            </CardContent>
          </Card>
        )}

        {!isLoading && !tool && (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                Tool nicht gefunden
              </h2>
              <p className="text-muted-foreground mb-6">
                Das angeforderte Tool existiert nicht.
              </p>
              <Button variant="outline" onClick={() => navigate('/app/tools')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            </CardContent>
          </Card>
        )}

        {tool && (
          <>
            {/* Tool Header with Admin Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComponent className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-2xl">{t(tool.name_key)}</CardTitle>
                        <Badge 
                          variant={tool.status === 'active' ? 'default' : 'secondary'}
                        >
                          {tool.status === 'active' ? 'Aktiv' : tool.status === 'planned' ? 'Geplant' : 'Veraltet'}
                        </Badge>
                      </div>
                      <CardDescription className="text-base">
                        {t(tool.description_key)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status Controls */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={tool.status === 'active' ? 'default' : 'outline'}
                        onClick={() => handleSetStatus('active')}
                        disabled={updateTool.isPending}
                      >
                        Aktiv
                      </Button>
                      <Button
                        size="sm"
                        variant={tool.status === 'planned' ? 'default' : 'outline'}
                        onClick={() => handleSetStatus('planned')}
                        disabled={updateTool.isPending}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Geplant
                      </Button>
                    </div>
                  </div>

                  {/* Public Toggle */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Öffentlich sichtbar
                    </Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={tool.enabled_for_public}
                        onCheckedChange={() => handleTogglePublic(tool.enabled_for_public)}
                        disabled={updateTool.isPending || tool.status !== 'active'}
                      />
                      <span className="text-sm text-muted-foreground">
                        {tool.enabled_for_public ? 'Ja' : 'Nein'}
                      </span>
                      {tool.enabled_for_public && tool.slug && (
                        <a
                          href={`/tools/${tool.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                          Ansehen <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Client Toggle */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Für Kunden sichtbar
                    </Label>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={tool.enabled_for_clients}
                        onCheckedChange={() => handleToggleClient(tool.enabled_for_clients)}
                        disabled={updateTool.isPending || tool.status !== 'active'}
                      />
                      <span className="text-sm text-muted-foreground">
                        {tool.enabled_for_clients ? 'Ja' : 'Nein'}
                      </span>
                    </div>
                  </div>
                </div>

                {tool.status !== 'active' && (
                  <p className="text-xs text-muted-foreground mt-4">
                    Hinweis: Toggles sind nur verfügbar, wenn das Tool aktiv ist.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tool Content */}
            <Card>
              <CardHeader>
                <CardTitle>Tool-Vorschau</CardTitle>
                <CardDescription>
                  So sehen Nutzer das Tool
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderToolComponent()}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
