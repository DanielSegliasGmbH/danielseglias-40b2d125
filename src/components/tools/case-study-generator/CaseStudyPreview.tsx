import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, ArrowRight, Quote, CheckCircle2, AlertTriangle, Target, Clock, ExternalLink, Star, DollarSign, Timer, FileText } from 'lucide-react';
import { CountUpNumber } from './CountUpNumber';
import type { CaseStudyData } from './types';
import {
  CUSTOMER_TYPE_LABELS,
  AGE_RANGE_LABELS,
  MAIN_PROBLEM_LABELS,
  PREVIOUS_SOLUTION_LABELS,
  GLOBAL_CTA_LINK,
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
  const testimonialWordCount = data.testimonialText.trim().split(/\s+/).filter(Boolean).length;
  const showTestimonial = data.showTestimonial && data.testimonialText && testimonialWordCount >= 10;
  const buttonText = data.ctaButtonText || '15 Minuten Gespräch buchen';
  const images = data.media.filter(m => m.type === 'image');
  const pdfs = data.media.filter(m => m.type === 'pdf');

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
      <div className="bg-background rounded-2xl border border-border overflow-hidden">
        {/* Hero Section */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-2 mb-4">
            {data.customerImageUrl && (
              <img src={data.customerImageUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-border" />
            )}
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

          {/* Impact Cards */}
          {(data.estimatedValueCHF > 0 || data.feeSavings > 0 || data.roiMonths > 0) && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {data.estimatedValueCHF > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground mb-0.5">Mehrwert</p>
                  <CountUpNumber
                    value={data.roundNumbers ? Math.round(data.estimatedValueCHF / 100) * 100 : data.estimatedValueCHF}
                    prefix="CHF "
                    className="text-lg font-bold text-foreground"
                  />
                </div>
              )}
              {data.feeSavings > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <DollarSign className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground mb-0.5">Ersparnis/Jahr</p>
                  <CountUpNumber
                    value={data.roundNumbers ? Math.round(data.feeSavings / 100) * 100 : data.feeSavings}
                    prefix="CHF "
                    className="text-lg font-bold text-foreground"
                  />
                </div>
              )}
              {data.roiMonths > 0 && (
                <div className="bg-muted/50 rounded-xl p-4 text-center">
                  <Timer className="h-5 w-5 mx-auto mb-1.5 text-muted-foreground" />
                  <p className="text-[10px] text-muted-foreground mb-0.5">ROI</p>
                  <CountUpNumber
                    value={data.roiMonths}
                    suffix=" Monate"
                    className="text-lg font-bold text-foreground"
                  />
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

        {/* Vorher / Nachher */}
        {(data.estimatedValueCHF > 0 || data.feeSavings > 0) && (
          <>
            <Separator />
            <div className="p-8">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">Vorher / Nachher</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-5 bg-muted/60 border border-border">
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

                <div className="rounded-xl p-5 border border-primary/25 bg-primary/5">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Nachher</p>
                  <ul className="space-y-2 text-sm text-foreground">
                    {data.feeSavings > 0 && (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        <span>{formatCHF(data.feeSavings, data.roundNumbers)}/Jahr gespart</span>
                      </li>
                    )}
                    {data.roiMonths > 0 && (
                      <li className="flex items-start gap-2">
                        <Clock className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                        <span>Break-even nach {data.roiMonths} Monaten</span>
                      </li>
                    )}
                    {data.estimatedValueCHF > 0 && (
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
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
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-foreground">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Media */}
        {(images.length > 0 || pdfs.length > 0) && (
          <>
            <Separator />
            <div className="p-8">
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {images.map((img, i) => (
                    <img key={i} src={img.url} alt={img.name} className="w-full h-32 object-cover rounded-lg border border-border" />
                  ))}
                </div>
              )}
              {pdfs.length > 0 && (
                <div className="space-y-2">
                  {pdfs.map((pdf, i) => (
                    <a key={i} href={pdf.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <FileText className="h-4 w-4" />
                      {pdf.name}
                    </a>
                  ))}
                </div>
              )}
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
        {showTestimonial && (
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
                    className="inline-flex items-center gap-1.5 text-xs mt-3 pl-8 text-primary hover:underline"
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
          <a href={GLOBAL_CTA_LINK} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="rounded-full px-8">
              {buttonText}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
