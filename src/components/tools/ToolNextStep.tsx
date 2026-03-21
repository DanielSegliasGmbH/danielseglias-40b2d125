import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react';

export interface ToolTransition {
  /** Contextual question that creates curiosity */
  question: string;
  /** Short supporting text */
  description: string;
  /** The target tool slug */
  targetSlug: string;
  /** Button label */
  buttonLabel: string;
  /** Optional: "empfohlen" badge */
  recommended?: boolean;
}

interface ToolNextStepProps {
  /** The intro context text for the tool (what are we looking at?) */
  introContext?: string;
  /** Insight text (what does this mean?) */
  insightText?: string;
  /** Primary next step */
  primary: ToolTransition;
  /** Optional secondary next step */
  secondary?: ToolTransition;
}

/**
 * Reusable component that adds a guided "next step" CTA at the bottom of each tool.
 * Renders inside PdfExportWrapper but is hidden in PDF exports via data-pdf-hide.
 */
export function ToolNextStep({ primary, secondary, insightText }: ToolNextStepProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine the base path from current location
  const getTargetPath = (slug: string) => {
    if (location.pathname.includes('/app/client-portal/tools/')) {
      return `/app/client-portal/tools/${slug}`;
    }
    if (location.pathname.includes('/app/tools/')) {
      return `/app/tools/${slug}`;
    }
    return `/tools/${slug}`;
  };

  return (
    <div className="space-y-4 mt-8" data-pdf-hide="true">
      {/* Insight / Consequence text */}
      {insightText && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4 px-5">
            <div className="flex gap-3 items-start">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-foreground leading-relaxed">{insightText}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary next step */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent hover:shadow-md transition-shadow">
        <CardContent className="py-5 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {primary.recommended && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    <Sparkles className="h-3 w-3" />
                    Empfohlener nächster Schritt
                  </span>
                )}
              </div>
              <p className="font-medium text-foreground">{primary.question}</p>
              <p className="text-sm text-muted-foreground">{primary.description}</p>
            </div>
            <Button
              onClick={() => navigate(getTargetPath(primary.targetSlug))}
              className="gap-2 shrink-0"
            >
              {primary.buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Secondary next step */}
      {secondary && (
        <Card className="border-muted hover:border-primary/20 transition-colors">
          <CardContent className="py-4 px-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{secondary.question}</p>
                <p className="text-xs text-muted-foreground">{secondary.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(getTargetPath(secondary.targetSlug))}
                className="gap-2 shrink-0"
              >
                {secondary.buttonLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
