import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolTrustNote } from '../ToolConversionElements';
import { ToolSnapshotButton } from '../ToolSnapshotButton';
import { ToolNextStep } from '../ToolNextStep';
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  BookOpen,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Target,
  Lightbulb,
} from 'lucide-react';

interface Props {
  mode?: 'internal' | 'public';
}

interface InsightItem {
  id: string;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  description: string;
  consequence: string;
  selected: boolean;
}

const INITIAL_INSIGHTS: InsightItem[] = [
  {
    id: 'costs',
    icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
    emoji: '💸',
    title: 'Versteckte Kosten',
    description: 'Deine aktuellen Finanzprodukte haben Gebühren, die du nicht auf den ersten Blick siehst.',
    consequence: 'Über 20-30 Jahre summieren sich selbst kleine Kostenunterschiede zu fünfstelligen Beträgen.',
    selected: false,
  },
  {
    id: 'inflation',
    icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
    emoji: '📉',
    title: 'Kaufkraftverlust',
    description: 'Dein Geld auf dem Sparkonto verliert jedes Jahr an Wert – unsichtbar, aber real.',
    consequence: 'In 20 Jahren hat dein Geld rund 30-40% weniger Kaufkraft, wenn du nichts tust.',
    selected: false,
  },
  {
    id: 'timing',
    icon: <Clock className="h-5 w-5 text-primary" />,
    emoji: '⏳',
    title: 'Zeitverlust',
    description: 'Jeder Monat, den du wartest, kostet dich den mächtigsten Verbündeten: den Zinseszins.',
    consequence: 'Ein Jahr Verzögerung kann dich am Ende tausende Franken kosten.',
    selected: false,
  },
  {
    id: 'strategy',
    icon: <Target className="h-5 w-5 text-primary" />,
    emoji: '🎯',
    title: 'Fehlende Strategie',
    description: 'Ohne klaren Plan arbeitest du hart für dein Geld – aber dein Geld arbeitet nicht für dich.',
    consequence: 'Eine passende Strategie kann den Unterschied zwischen „reicht knapp" und „komfortabel" ausmachen.',
    selected: false,
  },
  {
    id: 'products',
    icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
    emoji: '🔍',
    title: 'Suboptimale Produkte',
    description: 'Viele Finanzprodukte werden verkauft, weil sie dem Berater nützen – nicht dir.',
    consequence: 'Ein unabhängiger Vergleich zeigt oft, dass bessere Lösungen verfügbar sind.',
    selected: false,
  },
];

export function FinanzEntscheidungTool({ mode = 'internal' }: Props) {
  const [insights, setInsights] = useState<InsightItem[]>(INITIAL_INSIGHTS);
  const [showDecision, setShowDecision] = useState(false);

  const selectedCount = insights.filter((i) => i.selected).length;

  const toggleInsight = (id: string) => {
    setInsights((prev) =>
      prev.map((i) => (i.id === id ? { ...i, selected: !i.selected } : i))
    );
  };

  const selectedInsights = insights.filter((i) => i.selected);

  return (
    <PdfExportWrapper toolName="Finanz-Entscheidung" hideExport={mode === 'public'}>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* ═══ INTRO ═══ */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="h-4 w-4" />
            Deine Entscheidung
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Alles auf einen Blick
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Wähle die Themen, die auf dich zutreffen. Du bekommst eine klare
            Zusammenfassung – und einen logischen nächsten Schritt.
          </p>
        </div>

        {/* ═══ INSIGHT SELECTION ═══ */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">
            Welche Erkenntnisse hast du in den letzten Analysen gewonnen?
          </p>
          <div className="grid grid-cols-1 gap-3">
            {insights.map((insight) => (
              <button
                key={insight.id}
                onClick={() => toggleInsight(insight.id)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  insight.selected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border bg-card hover:border-primary/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{insight.emoji}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {insight.title}
                      </p>
                      {insight.selected && (
                        <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ═══ SHOW DECISION BUTTON ═══ */}
        {selectedCount > 0 && !showDecision && (
          <div className="text-center" data-pdf-hide="true">
            <Button onClick={() => setShowDecision(true)} className="gap-2">
              Meine Zusammenfassung anzeigen
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* ═══ SUMMARY & DECISION ═══ */}
        {showDecision && selectedCount > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Consequences */}
            <Card className="border-primary/20">
              <CardContent className="py-5 px-5 space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  Das bedeutet konkret für dich:
                </h3>
                <div className="space-y-3">
                  {selectedInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/40"
                    >
                      {insight.icon}
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                          {insight.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {insight.consequence}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Decision question */}
            <Card className="border-none bg-transparent">
              <CardContent className="py-6">
                <div className="flex gap-3 items-start max-w-xl mx-auto">
                  <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-base font-medium text-foreground leading-relaxed italic">
                    «Möchtest du das aktiv verbessern – oder so weiterlaufen lassen?»
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* ═══ THREE OPTIONS ═══ */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">
                Drei Wege stehen dir offen:
              </p>

              {/* Option 1: Beratung */}
              <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="py-5 px-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">
                          Gemeinsam optimieren
                        </p>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <Sparkles className="h-3 w-3" />
                          Empfohlen
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        In einem persönlichen Gespräch gehen wir deine Situation
                        durch und zeigen dir konkret, was du verbessern kannst.
                      </p>
                      <a
                        href="https://calendar.app.google/LrIPZDNzivnrfq9w7"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        data-pdf-hide="true"
                      >
                        Gespräch vereinbaren
                        <ArrowRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Option 2: Selbst weiter */}
              <Card className="border-muted">
                <CardContent className="py-5 px-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-foreground">
                        Selbst weiter erkunden
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nutze die Werkzeuge, um dein Wissen zu vertiefen und
                        eigene Vergleiche anzustellen.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Option 3: Später */}
              <Card className="border-muted">
                <CardContent className="py-4 px-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Später entscheiden
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Kein Druck. Du kannst jederzeit zurückkommen.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trust section */}
            <div className="text-center space-y-2 py-2">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary/60" />
                  Unabhängig
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary/60" />
                  Transparent
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary/60" />
                  Keine Verpflichtung
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Du entscheidest jederzeit selbst · Unverbindliches Erstgespräch
              </p>
            </div>
          </div>
        )}

        {/* ═══ NEXT STEP (self-explore path) ═══ */}
        {showDecision && (
          <ToolNextStep
            insightText="Falls du erst noch tiefer einsteigen möchtest – hier sind die besten Startpunkte:"
            primary={{
              question: 'Wie steht es wirklich um meine Finanzen?',
              description:
                'Der Finanzcheck gibt dir in 5 Minuten eine ehrliche Standortbestimmung.',
              targetSlug: 'finanzcheck',
              buttonLabel: 'Finanzcheck starten',
              recommended: false,
            }}
            secondary={{
              question: 'Ist meine 3a-Lösung wirklich optimal?',
              description:
                'Prüfe in 2 Minuten, ob du das Beste aus deiner Vorsorge herausholst.',
              targetSlug: 'mini-3a-kurzcheck',
              buttonLabel: '3a-Kurzcheck starten',
            }}
          />
        )}

        <ToolTrustNote text="Keine Daten gespeichert · Keine Produktwerbung · Dein Tempo" />
      </div>
    </PdfExportWrapper>
  );
}
