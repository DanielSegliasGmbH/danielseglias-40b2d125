import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Calendar, RotateCcw, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { TERMIN_URL, getScoreText } from './constants';
import { ToolReflection } from '../ToolConversionElements';
import { ToolNextStep } from '../ToolNextStep';
import type { FinanzcheckResult } from './types';

interface Props {
  result: FinanzcheckResult;
  onBack: () => void;
  onReset: () => void;
}

export function FinanzcheckStep3({ result, onBack, onReset }: Props) {
  const { text: scoreText, color: scoreColor } = getScoreText(result.overallScore);

  const getScoreIcon = (score: number) => {
    if (score < 50) return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (score < 75) return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <CheckCircle className="h-5 w-5 text-green-600" />;
  };

  const getProgressColor = (score: number) => {
    if (score < 50) return 'bg-red-500';
    if (score < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ihr Finanzcheck-Ergebnis</CardTitle>
          <CardDescription>Basierend auf Ihren Antworten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${(result.overallScore / 100) * 251.2} 251.2`}
                  className={result.overallScore >= 75 ? 'text-green-500' : result.overallScore >= 50 ? 'text-yellow-500' : 'text-red-500'}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">{result.overallScore}</span>
              </div>
            </div>
            <p className={`text-lg font-medium ${scoreColor}`}>{scoreText}</p>
          </div>
        </CardContent>
      </Card>

      {/* Category Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Auswertung nach Kategorien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.categoryScores.map((cs) => (
            <div key={cs.categoryId} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getScoreIcon(cs.percentage)}
                  <span className="text-sm font-medium">{cs.label}</span>
                </div>
                <span className="text-sm text-muted-foreground">{cs.percentage}%</span>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`absolute h-full rounded-full transition-all ${getProgressColor(cs.percentage)}`}
                  style={{ width: `${cs.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Handlungsempfehlungen</CardTitle>
            <CardDescription>
              Basierend auf Ihren Antworten empfehlen wir folgende nächste Schritte:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                      rec.priority === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{rec.categoryLabel}</p>
                    <p className="text-sm">{rec.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Reflection */}
      {result.overallScore < 75 && (
        <ToolReflection
          question="Wenn du das so weiterlaufen lässt – wärst du in 10 Jahren zufrieden damit?"
          context="Kleine Optimierungen heute können langfristig einen grossen Unterschied machen."
        />
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
            <Button variant="outline" onClick={onReset} className="flex-1">
              <RotateCcw className="mr-2 h-4 w-4" />
              Neu starten
            </Button>
            <Button
              onClick={() => window.open(TERMIN_URL, '_blank')}
              className="flex-1"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Termin buchen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Step */}
      <ToolNextStep
        insightText={
          result.overallScore < 50
            ? "Dein Ergebnis zeigt klaren Handlungsbedarf. Lass uns gemeinsam anschauen, wo du am meisten herausholen kannst."
            : result.overallScore < 75
            ? "Es gibt konkretes Optimierungspotenzial. Der nächste Schritt hilft dir, die Hebel zu identifizieren."
            : "Du bist gut aufgestellt. Trotzdem lohnt sich ein genauer Blick auf die Details."
        }
        primary={{
          question: "Möchtest du deine 3a-Lösung im Detail prüfen?",
          description: "Der Mini-3A-Kurzcheck zeigt dir konkret, wo deine Vorsorge stark ist und wo du optimieren kannst.",
          targetSlug: "mini-3a-kurzcheck",
          buttonLabel: "3a-Lösung prüfen",
          recommended: true,
        }}
        secondary={{
          question: "Interessiert dich, was versteckte Kosten langfristig ausmachen?",
          description: "Sieh, wie sich kleine Gebührenunterschiede über Jahre summieren.",
          targetSlug: "kostenaufschluesselung",
          buttonLabel: "Kosten aufschlüsseln",
        }}
      />
    </div>
  );
}
