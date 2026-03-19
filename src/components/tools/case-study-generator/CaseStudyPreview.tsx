import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, ArrowRight, Quote, CheckCircle2, AlertTriangle, Target, Clock, ExternalLink, Star } from 'lucide-react';
import type { CaseStudyData } from './types';
import {
  CUSTOMER_TYPE_LABELS,
  AGE_RANGE_LABELS,
  MAIN_PROBLEM_LABELS,
  PREVIOUS_SOLUTION_LABELS,
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
          {(data.estimatedValueCHF > 0 || data.feeSavings > 0 || data.roiMonths > 0) && (
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
              {data.roiMonths > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">ROI</p>
                  <p className="text-lg font-bold text-foreground">{data.roiMonths} Monate</p>
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

        {/* Resultate: Vorher / Nachher */}
        {(data.estimatedValueCHF > 0 || data.feeSavings > 0) && (
          <>
            <Separator />
            <div className="p-8">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Vorher / Nachher</h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Vorher */}
                <div className="rounded-xl p-5 bg-[hsl(var(--muted))] border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Vorher</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {data.previousSolution !== 'unklar' && (
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Lösung: {PREVIOUS_SOLUTION_LABELS[data.previousSolution]}</span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>Problem: {problemText}</span>
                    </li>
                    {data.feeSavings > 0 && (
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Höhere Kosten</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Nachher */}
                <div className="rounded-xl p-5 border" style={{ backgroundColor: 'rgba(122, 122, 103, 0.08)', borderColor: 'rgba(122, 122, 103, 0.25)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#7a7a67' }}>Nachher</p>
                  <ul className="space-y-2 text-sm text-foreground">
                    {data.feeSavings > 0 && (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#7a7a67' }} />
                        <span>{formatCHF(data.feeSavings, data.roundNumbers)}/Jahr gespart</span>
                      </li>
                    )}
                    {data.roiMonths > 0 && (
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#7a7a67' }} />
                        <span>Break-even nach {data.roiMonths} Monaten</span>
                      </li>
                    )}
                    {data.estimatedValueCHF > 0 && (
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#7a7a67' }} />
                        <span>{formatCHF(data.estimatedValueCHF, data.roundNumbers)} Mehrwert</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Vorteile */}
        {data.benefits.length > 0 && (
          <>
            <Separator />
            <div className="p-8">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Vorteile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {data.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#7a7a67' }} />
                    <span className="text-sm text-foreground">{b}</span>
                  </div>
                ))}
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
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Einordnung</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.expectedImprovement}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 italic">
                Viele unterschätzen die Auswirkungen von Gebühren und fehlender Struktur auf ihre langfristige Vermögensentwicklung. Schon kleine Optimierungen können über Jahre einen grossen Unterschied machen.
              </p>
            </div>
          </>
        )}

        {/* Testimonial */}
        {data.showTestimonial && data.testimonialText && (
          <>
            <Separator />
            <div className="p-8">
              <div className="bg-muted/30 rounded-xl p-6 relative">
                <Quote className="h-6 w-6 text-muted-foreground/20 absolute top-4 left-4" />
                <p className="text-sm italic text-foreground pl-8 leading-relaxed">
                  «{data.testimonialText}»
                </p>
                {data.testimonialName && (
                  <p className="text-xs text-muted-foreground mt-3 pl-8">– {data.testimonialName}</p>
                )}
                {data.testimonialGoogleLink && (
                  <a
                    href={data.testimonialGoogleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs mt-3 pl-8 hover:underline"
                    style={{ color: '#7a7a67' }}
                  >
                    <Star className="h-3.5 w-3.5" />
                    Originalbewertung ansehen
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </>
        )}

        {/* CTA */}
        <Separator />
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Möchtest du auch deine Situation optimieren?</p>
          {data.ctaLink ? (
            <a href={data.ctaLink} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full px-8">
                15 Minuten Gespräch buchen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          ) : (
            <Button size="lg" className="rounded-full px-8">
              15 Minuten Gespräch buchen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
