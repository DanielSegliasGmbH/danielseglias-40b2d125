import { 
  ArrowRightLeft, 
  Lock, 
  Unlock, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Eye,
  RotateCcw,
  FileText,
  Layers,
  PiggyBank,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonRow {
  id: string;
  label: string;
  icon: React.ElementType;
  bank: string;
  insurance: string;
}

const comparisonData: ComparisonRow[] = [
  {
    id: 'structure',
    label: 'Vertragsstruktur',
    icon: FileText,
    bank: 'Flexibler Sparplan, kein langfristiger Vertrag',
    insurance: 'Langfristiger Versicherungsvertrag mit Bindung',
  },
  {
    id: 'flexibility',
    label: 'Flexibilität bei Einzahlungen',
    icon: ArrowRightLeft,
    bank: 'Einzahlungen jederzeit anpassbar oder pausierbar',
    insurance: 'Fixe Prämien, Änderungen oft eingeschränkt oder kostenpflichtig',
  },
  {
    id: 'costs',
    label: 'Kostenstruktur',
    icon: DollarSign,
    bank: 'Tiefe, transparente Produktkosten (TER)',
    insurance: 'Höhere Gesamtkosten inkl. Risiko-, Abschluss- und Verwaltungskosten',
  },
  {
    id: 'focus',
    label: 'Anlagefokus',
    icon: TrendingUp,
    bank: 'Fokus auf Vermögensaufbau über Fonds / ETFs',
    insurance: 'Kombination aus Sparen + Versicherungsschutz',
  },
  {
    id: 'liquidity',
    label: 'Liquidität & Kündigung',
    icon: RotateCcw,
    bank: 'Hohe Flexibilität, kein finanzieller Nachteil bei Anbieterwechsel',
    insurance: 'Kündigung oft mit Verlusten oder Rückkaufswert verbunden',
  },
  {
    id: 'transparency',
    label: 'Transparenz',
    icon: Eye,
    bank: 'Klare Entwicklung des Guthabens jederzeit sichtbar',
    insurance: 'Komplexe Darstellung, schwer nachvollziehbare Performance',
  },
];

export function SavingsPlan3aComparison() {
  return (
    <div className="space-y-6">
      {/* Header with column labels */}
      <div className="grid grid-cols-[1fr,1fr,1fr] gap-4 items-center">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Kriterium
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Bank-3a</p>
            <p className="text-xs text-muted-foreground">Fondslösung</p>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Versicherungs-3a</p>
            <p className="text-xs text-muted-foreground">Gebundene Vorsorge</p>
          </div>
        </div>
      </div>

      {/* Comparison rows */}
      <div className="space-y-3">
        {comparisonData.map((row) => {
          const IconComponent = row.icon;
          return (
            <div
              key={row.id}
              className="grid grid-cols-[1fr,1fr,1fr] gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              {/* Criterion */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-background flex items-center justify-center flex-shrink-0 shadow-sm">
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground leading-tight pt-1">
                  {row.label}
                </span>
              </div>

              {/* Bank-3a */}
              <div className="flex items-start gap-2">
                <Unlock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-snug">
                  {row.bank}
                </p>
              </div>

              {/* Insurance-3a */}
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground leading-snug">
                  {row.insurance}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary / Disclaimer */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border/50">
        <p className="text-sm text-muted-foreground leading-relaxed text-center italic">
          Welche Lösung sinnvoller ist, hängt von den persönlichen Zielen, der Lebenssituation 
          und dem gewünschten Fokus (Schutz vs. Vermögensaufbau) ab.
        </p>
      </div>
    </div>
  );
}
