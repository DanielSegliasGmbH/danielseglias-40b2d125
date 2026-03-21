import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, Download } from 'lucide-react';
import { Mini3aInputs, DEFAULT_INPUTS, CategoryLinks, CATEGORY_KEYS } from './types';
import { calculateMini3a } from './calcLogic';
import { InputForm } from './InputForm';
import { KpiCards } from './KpiCards';
import { CategoryTiles } from './CategoryTiles';
import { RadarSection } from './RadarSection';
import { CostBreakdownChart } from './CostBreakdownChart';
import { RecommendationBlock } from './RecommendationBlock';
import { LinksSection } from './LinksSection';
import { generateOnePager, generateReport } from './pdfExport';
import { ToolReflection, ToolTrustNote } from '../ToolConversionElements';
import { ToolNextStep } from '../ToolNextStep';

interface Mini3aKurzcheckToolProps {
  mode?: 'internal' | 'public';
}

function initLinks(): CategoryLinks {
  const out: CategoryLinks = {};
  CATEGORY_KEYS.forEach(k => {
    out[k] = [{ titel: '', url: '' }, { titel: '', url: '' }, { titel: '', url: '' }];
  });
  return out;
}

export function Mini3aKurzcheckTool({ mode = 'internal' }: Mini3aKurzcheckToolProps) {
  const [inputs, setInputs] = useState<Mini3aInputs>(DEFAULT_INPUTS);
  const [links, setLinks] = useState<CategoryLinks>(initLinks);

  const result = useMemo(() => calculateMini3a(inputs), [inputs]);

  return (
    <div className="space-y-8">
      {/* Input Form */}
      <InputForm inputs={inputs} onChange={setInputs} />

      <Separator />

      {/* KPI Cards */}
      <KpiCards result={result} />

      {/* Category Tiles */}
      <CategoryTiles categories={result.categories} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RadarSection categories={result.categories} />
        <CostBreakdownChart costBreakdown={result.costBreakdown} />
      </div>

      {/* Recommendation */}
      <RecommendationBlock text={result.empfehlung} />

      {/* Reflection – only when score indicates room for improvement */}
      {result.gesamtscore < 70 && (
        <ToolReflection
          question="Was würde es für dich bedeuten, wenn du mit einer besseren Lösung jedes Jahr mehr aus deiner Vorsorge herausholst?"
          context="Ein unabhängiger Blick zeigt oft Potenzial, das man selbst übersieht."
        />
      )}

      {/* Links */}
      {mode === 'internal' && (
        <LinksSection links={links} onChange={setLinks} />
      )}
      {mode !== 'internal' && (
        <LinksSection links={links} onChange={setLinks} readOnly />
      )}

      {/* PDF Export */}
      {mode === 'internal' && (
        <Card>
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">PDF-Export</h3>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => generateOnePager(inputs, result, links)}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                OnePager (4 Seiten)
              </Button>
              <Button
                onClick={() => generateReport(inputs, result, links)}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Report (11 Seiten)
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trust Note */}
      <ToolTrustNote text="Unabhängige Analyse · Keine Produktempfehlung · Deine Daten bleiben bei dir" />

      {/* Next Step */}
      <ToolNextStep
        insightText={
          result.gesamtscore < 50
            ? "Dein aktuelles 3a-Produkt hat deutliches Verbesserungspotenzial. Es lohnt sich, die Kosten genauer anzuschauen."
            : result.gesamtscore < 70
            ? "Es gibt konkrete Stellschrauben. Lass uns anschauen, was dich die Gebühren wirklich kosten."
            : "Deine 3a-Lösung ist solide. Willst du trotzdem sehen, ob du bei den Kosten noch optimieren kannst?"
        }
        primary={{
          question: "Was kosten dich die Gebühren wirklich – über die gesamte Laufzeit?",
          description: "Sieh konkret, wie sich deine aktuellen Gebühren auf dein Endvermögen auswirken.",
          targetSlug: "kosten-impact-simulator",
          buttonLabel: "Kosten-Impact berechnen",
          recommended: true,
        }}
        secondary={{
          question: "Wie schneidet dein Anbieter im direkten Vergleich ab?",
          description: "Vergleiche Kosten, Rendite und Flexibilität verschiedener 3a-Anbieter.",
          targetSlug: "vergleichsrechner-3a",
          buttonLabel: "Anbieter vergleichen",
        }}
      />
    </div>
  );
}
