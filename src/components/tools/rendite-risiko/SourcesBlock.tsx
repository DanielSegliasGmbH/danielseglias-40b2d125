import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

export interface Source {
  title: string;
  url: string;
  description?: string;
}

/**
 * Structured sources list — admin can edit this array to manage sources.
 * Future: load from Supabase table for CMS-like editing.
 */
export const DEFAULT_SOURCES: Source[] = [
  {
    title: 'UBS Global Investment Returns Yearbook',
    url: 'https://www.ubs.com/global/en/investment-bank/in-focus/2024/global-investment-returns-yearbook.html',
    description: 'Langfristige Kapitalmarktdaten (Dimson, Marsh, Staunton)',
  },
  {
    title: 'MSCI World Index – Langfristige Renditekennzahlen',
    url: 'https://www.msci.com/documents/10199/178e6643-6ae6-47b9-82be-e1fc565ededb',
    description: 'Factsheet des weltweit meistbeachteten Aktienindex',
  },
  {
    title: 'Gerd Kommer – Souverän investieren mit Indexfonds und ETFs',
    url: 'https://gerd-kommer.de/buecher/',
    description: 'Evidenzbasiertes Investieren für Privatanleger',
  },
  {
    title: 'Credit Suisse Global Investment Returns Yearbook',
    url: 'https://www.credit-suisse.com/about-us/en/reports-research/csri.html',
    description: 'Historische Renditen globaler Anlageklassen',
  },
];

interface Props {
  sources?: Source[];
}

export function SourcesBlock({ sources = DEFAULT_SOURCES }: Props) {
  return (
    <Card>
      <CardContent className="p-6 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Quellen &amp; Grundlagen
        </h3>
        <ul className="space-y-2">
          {sources.map((source, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-0.5">•</span>
              <div className="space-y-0.5">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-scale-8 hover:text-scale-10 inline-flex items-center gap-1 transition-colors"
                >
                  {source.title}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                {source.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {source.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
