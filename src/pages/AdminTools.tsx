import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Wrench, Calculator, PieChart, TrendingUp, FileText, Clock } from 'lucide-react';

// This will be the central repository for tools that can be shown in the client portal
const availableTools = [
  {
    id: 'budget-calculator',
    icon: Calculator,
    labelKey: 'adminTools.budgetCalculator',
    descKey: 'adminTools.budgetCalculatorDesc',
    status: 'planned' as const,
  },
  {
    id: 'retirement-planner',
    icon: PieChart,
    labelKey: 'adminTools.retirementPlanner',
    descKey: 'adminTools.retirementPlannerDesc',
    status: 'planned' as const,
  },
  {
    id: 'investment-simulator',
    icon: TrendingUp,
    labelKey: 'adminTools.investmentSimulator',
    descKey: 'adminTools.investmentSimulatorDesc',
    status: 'planned' as const,
  },
  {
    id: 'document-generator',
    icon: FileText,
    labelKey: 'adminTools.documentGenerator',
    descKey: 'adminTools.documentGeneratorDesc',
    status: 'planned' as const,
  },
];

export default function AdminTools() {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('adminTools.title')}</h1>
            <p className="text-muted-foreground">{t('adminTools.subtitle')}</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t('adminTools.overviewTitle')}</CardTitle>
            <CardDescription>{t('adminTools.overviewDesc')}</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {availableTools.map((tool) => (
            <Card key={tool.id} className="transition-colors hover:bg-muted/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <tool.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{t(tool.labelKey)}</h3>
                        {tool.status === 'planned' && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {t('adminTools.planned')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{t(tool.descKey)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`tool-${tool.id}`} className="text-sm text-muted-foreground sr-only">
                      {t('adminTools.enableForClients')}
                    </Label>
                    <Switch
                      id={`tool-${tool.id}`}
                      disabled={tool.status === 'planned'}
                      aria-label={t('adminTools.enableForClients')}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
