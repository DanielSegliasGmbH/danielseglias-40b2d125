import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PdfExportWrapper } from '../PdfExportWrapper';
import { ToolNextStep } from '../ToolNextStep';
import { ToolTrustNote } from '../ToolConversionElements';
import { BELIEFS, Belief } from './beliefData';
import { ArrowLeft, Lightbulb, Brain, Eye, Sparkles, MessageCircle } from 'lucide-react';

interface Props {
  mode?: 'internal' | 'public';
}

export function GlaubenssatzTransformerTool({ mode = 'internal' }: Props) {
  const [selected, setSelected] = useState<Belief | null>(null);

  if (selected) {
    return (
      <PdfExportWrapper toolName="Glaubenssatz-Transformer" hideExport={mode === 'public'}>
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Back */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelected(null)}
            className="gap-2"
            data-pdf-hide="true"
          >
            <ArrowLeft className="h-4 w-4" />
            Anderen Glaubenssatz wählen
          </Button>

          {/* Title */}
          <div className="text-center space-y-2">
            <span className="text-4xl">{selected.emoji}</span>
            <h2 className="text-xl font-bold text-foreground">{selected.title}</h2>
          </div>

          {/* Why people believe this */}
          <Card className="border-muted">
            <CardContent className="py-5 px-5">
              <div className="flex gap-3 items-start">
                <Brain className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Warum viele das glauben</p>
                  <p className="text-sm text-foreground leading-relaxed">{selected.whyPeopleBelieve}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reality */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-5 px-5">
              <div className="flex gap-3 items-start">
                <Eye className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary uppercase tracking-wide">Die Wirklichkeit</p>
                  <p className="text-sm text-foreground leading-relaxed">{selected.reality}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New perspective */}
          <Card className="border-none bg-muted/50">
            <CardContent className="py-5 px-5">
              <div className="flex gap-3 items-start">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground uppercase tracking-wide">Neue Perspektive</p>
                  <p className="text-sm text-foreground leading-relaxed">{selected.newPerspective}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Impulse question */}
          <Card className="border-none bg-transparent" data-pdf-hide="true">
            <CardContent className="py-6">
              <div className="flex gap-3 items-start max-w-xl mx-auto">
                <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-base font-medium text-foreground leading-relaxed italic">
                  «{selected.impulse}»
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trust Note */}
          <ToolTrustNote text="Keine Verkaufsabsicht · Nur Perspektive · Du entscheidest" />

          {/* Next Step */}
          <ToolNextStep
            insightText="Du hast gerade einen Glaubenssatz hinterfragt. Willst du jetzt sehen, wo du finanziell wirklich stehst?"
            primary={{
              question: 'Wie gut bist du finanziell aufgestellt – ehrlich und unabhängig?',
              description: 'Der Finanzcheck gibt dir in 5 Minuten eine klare Standortbestimmung.',
              targetSlug: 'finanzcheck',
              buttonLabel: 'Finanzcheck starten',
              recommended: true,
            }}
            secondary={{
              question: 'Ist deine 3a-Lösung wirklich optimal?',
              description: 'Prüfe in 2 Minuten, ob du das Beste aus deiner Vorsorge herausholst.',
              targetSlug: 'mini-3a-kurzcheck',
              buttonLabel: '3a-Kurzcheck starten',
            }}
          />
        </div>
      </PdfExportWrapper>
    );
  }

  // Selection view
  return (
    <PdfExportWrapper toolName="Glaubenssatz-Transformer" hideExport={mode === 'public'}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Intro */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Lightbulb className="h-4 w-4" />
            Mindset-Tool
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Welcher Gedanke hält dich zurück?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Wähle einen Glaubenssatz, der dir bekannt vorkommt. Du bekommst eine klare, ehrliche Gegenperspektive.
          </p>
        </div>

        {/* Belief Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BELIEFS.map((belief) => (
            <button
              key={belief.id}
              onClick={() => setSelected(belief)}
              className="text-left p-4 rounded-lg border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{belief.emoji}</span>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                  {belief.title}
                </p>
              </div>
            </button>
          ))}
        </div>

        <ToolTrustNote text="Kein Quiz · Kein Scoring · Nur neue Perspektiven" />
      </div>
    </PdfExportWrapper>
  );
}
