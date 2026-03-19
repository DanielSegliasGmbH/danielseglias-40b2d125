import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, ArrowRight, Quote, CheckCircle2, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import type { CaseStudyData } from './types';
import {
  CUSTOMER_TYPE_LABELS,
  AGE_RANGE_LABELS,
  MAIN_PROBLEM_LABELS,
  STRATEGY_LABELS,
  CTA_LABELS,
} from './types';

interface Props {
  data: CaseStudyData;
}

function formatCHF(value: number, round: boolean): string {
  const v = round ? Math.round(value / 100) * 100 : value;
  return `CHF ${v.toLocaleString('de-CH')}`;
}

export function CaseStudyPreview({ data }: Props) {
  const hasContent = data.publicTitle || data.initialSituation;

  if (!hasContent) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
        <div className="text-center">
          <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Fülle das Formular aus, um die Vorschau zu sehen</p>
        </div>
      </div>
    );
  }

  const problemText = data.mainProblem === 'andere' ? data.mainProblemCustom : MAIN_PROBLEM_LABELS[data.mainProblem];
  const benefits = data.additionalBenefits.filter(b => b.trim());

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        {/* Hero Section */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary" className="text-xs">
              {CUSTOMER_TYPE_LABELS[data.customerType]}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {AGE_RANGE_LABELS[data.ageRange]}
            </Badge>
            {data.region && (
              <Badge variant="outline" className="text-xs">{data.region}</Badge>
            )}
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3 leading-tight">
            {data.publicTitle || 'Öffentlicher Titel'}
          </h1>

          {data.initialSituation && data.expectedImprovement && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {data.initialSituation.slice(0, 120)}
              {data.initialSituation.length > 120 ? '...' : ''}{' '}
              → {data.expectedImprovement.slice(0, 80)}
              {data.expectedImprovement.length > 80 ? '...' : ''}
            </p>
          )}

          {/* Kennzahlen */}
          {(data.estimatedValueCHF > 0 || data.feeSavings > 0) && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {data.estimatedValueCHF > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Mehrwert</p>
                  <p className="text-lg font-bold text-foreground">{formatCHF(data.estimatedValueCHF, data.roundNumbers)}</p>
                </div>
              )}
              {data.feeSavings > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Ersparnis/Jahr</p>
                  <p className="text-lg font-bold text-foreground">{formatCHF(data.feeSavings, data.roundNumbers)}</p>
                </div>
              )}
              {benefits.length > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Hauptvorteil</p>
                  <p className="text-sm font-semibold text-foreground">{benefits[0]}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Ausgangslage */}
        {data.initialSituation && (
          <div className="p-8">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Ausgangslage</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.initialSituation}</p>
          </div>
        )}

        {/* Herausforderung */}
        {problemText && (
          <>
            <Separator />
            <div className="p-8">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Herausforderung</h2>
              </div>
              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <p className="text-sm text-foreground font-medium">{problemText}</p>
              </div>
            </div>
          </>
        )}

        {/* Lösung */}
        {data.recommendedSolution && (
          <>
            <Separator />
            <div className="p-8">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Unsere Lösung</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{data.recommendedSolution}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="text-xs">{STRATEGY_LABELS[data.strategyType]}</Badge>
                {data.structure && <span>• {data.structure}</span>}
              </div>
            </div>
          </>
        )}

        {/* Vorher / Nachher */}
        {(data.initialSituation || data.recommendedSolution) && (
          <>
            <Separator />
            <div className="p-8">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Vorher / Nachher</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Vorher */}
                <div className="rounded-xl p-5 bg-[hsl(var(--muted))] border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vorher</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {data.previousSolution !== 'keine' && (
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span>Lösung: {data.previousSolution === 'versicherung' ? 'Versicherung' : data.previousSolution === 'bank' ? 'Bank' : 'Eigenständig'}</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>Problem: {problemText}</span>
                    </li>
                    {data.feeSavings > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="text-muted-foreground mt-0.5">•</span>
                        <span>Höhere Kosten</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Nachher */}
                <div className="rounded-xl p-5 bg-primary/5 border border-primary/20">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Nachher</p>
                  <ul className="space-y-2 text-sm text-foreground">
                    {data.feeSavings > 0 && (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{formatCHF(data.feeSavings, data.roundNumbers)}/Jahr gespart</span>
                      </li>
                    )}
                    {benefits.slice(0, 3).map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Erkenntnis */}
        {data.expectedImprovement && (
          <>
            <Separator />
            <div className="p-8">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Erkenntnis</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.expectedImprovement}</p>
            </div>
          </>
        )}

        {/* Testimonial */}
        {data.showTestimonial && data.testimonialText && (
          <>
            <Separator />
            <div className="p-8">
              <div className="bg-muted/30 rounded-xl p-6 relative">
                <Quote className="h-6 w-6 text-primary/20 absolute top-4 left-4" />
                <p className="text-sm italic text-foreground pl-8 leading-relaxed">
                  «{data.testimonialText}»
                </p>
                {data.testimonialAuthor && (
                  <p className="text-xs text-muted-foreground mt-3 pl-8">– {data.testimonialAuthor}</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* CTA */}
        <Separator />
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Möchtest du auch deine Situation optimieren?</p>
          <Button size="lg" className="rounded-full px-8">
            {CTA_LABELS[data.ctaType]}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
