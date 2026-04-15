import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, ShieldCheck, Flame } from 'lucide-react';
import { formatToolImpact } from '@/lib/peakScoreFormat';

interface ToolReflectionProps {
  /** The main reflection question */
  question: string;
  /** Optional supporting context */
  context?: string;
}

/**
 * A soft reflection moment that encourages the user to pause and think.
 * Not pushy — designed to trigger internal decision-making.
 * Hidden in PDF exports via data-pdf-hide.
 */
export function ToolReflection({ question, context }: ToolReflectionProps) {
  return (
    <Card className="border-none bg-muted/30" data-pdf-hide="true">
      <CardContent className="py-6">
        <div className="flex gap-3 items-start max-w-2xl mx-auto">
          <MessageCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <p className="text-base font-medium text-foreground leading-relaxed italic">
              «{question}»
            </p>
            {context && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {context}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ToolTrustNoteProps {
  /** Short trust-building text */
  text: string;
}

/**
 * A subtle trust signal that reinforces independence and transparency.
 * Hidden in PDF exports.
 */
export function ToolTrustNote({ text }: ToolTrustNoteProps) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground py-2" data-pdf-hide="true">
      <ShieldCheck className="h-3.5 w-3.5 text-primary/60 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

interface ToolSoftCtaProps {
  /** Main invitation text */
  text: string;
  /** Supporting note */
  note?: string;
  /** Calendar booking URL */
  bookingUrl?: string;
  /** Button label */
  buttonLabel?: string;
}

/**
 * A gentle, non-aggressive CTA that invites rather than pushes.
 * Replaces or complements existing hard CTAs.
 */
export function ToolSoftCta({ 
  text, 
  note,
  bookingUrl = "https://calendar.app.google/LrIPZDNzivnrfq9w7",
  buttonLabel = "Gespräch vereinbaren"
}: ToolSoftCtaProps) {
  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" data-pdf-hide="true">
      <CardContent className="py-6">
        <div className="max-w-xl mx-auto text-center space-y-3">
          <p className="text-base font-medium text-foreground leading-relaxed">
            {text}
          </p>
          {note && (
            <p className="text-sm text-muted-foreground">
              {note}
            </p>
          )}
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {buttonLabel}
          </a>
          <p className="text-xs text-muted-foreground pt-1">
            Unverbindlich · Du entscheidest jederzeit selbst
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface ToolPeakScoreEffektProps {
  /** Estimated PeakScore impact in months per year if recommendation is followed */
  monthsPerYear: number;
  /** Optional explanatory text */
  explanation?: string;
}

/**
 * Shows a "PeakScore-Effekt" box at the bottom of a tool,
 * translating the impact into human-readable freedom terms.
 */
export function ToolPeakScoreEffekt({ monthsPerYear, explanation }: ToolPeakScoreEffektProps) {
  if (monthsPerYear <= 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5" data-pdf-hide="true">
      <CardContent className="py-4 px-5">
        <div className="flex gap-3 items-start">
          <Flame className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PeakScore-Effekt</p>
            <p className="text-sm font-medium text-foreground">
              Wenn du diese Empfehlung umsetzt:{' '}
              <span className="text-primary font-bold">{formatToolImpact(monthsPerYear)}</span>
            </p>
            {explanation && (
              <p className="text-xs text-muted-foreground">{explanation}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
