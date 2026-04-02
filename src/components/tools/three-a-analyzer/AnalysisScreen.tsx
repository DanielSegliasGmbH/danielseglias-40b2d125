import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Building2, FileText, TrendingUp, Wallet, AlertCircle, Info, CheckCircle2, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnalysisData, CostPosition } from './types';
import { ReviewRequestForm } from './ReviewRequestForm';

interface AnalysisScreenProps {
  data: AnalysisData;
  analysisId: string | null;
  onBack: () => void;
  onReset: () => void;
}

function ValueOrUnknown({ value, suffix }: { value: string | number | null; suffix?: string }) {
  if (value === null || value === undefined || value === '') {
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground italic text-sm">
        <HelpCircle className="h-3.5 w-3.5" />
        nicht eindeutig erkennbar
      </span>
    );
  }
  return <span className="font-medium text-foreground">{value}{suffix || ''}</span>;
}

function CostRow({ position }: { position: CostPosition }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <span className="text-sm text-foreground">{position.label}</span>
        {!position.isVerified && position.value !== null && (
          <Badge variant="outline" className="text-xs">unsicher</Badge>
        )}
      </div>
      <div>
        {position.value !== null ? (
          <span className={`text-sm font-medium ${position.isVerified ? 'text-foreground' : 'text-muted-foreground'}`}>
            CHF {position.value.toLocaleString('de-CH')}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-muted-foreground italic text-xs">
            <HelpCircle className="h-3 w-3" />
            nicht verifizierbar
          </span>
        )}
      </div>
    </div>
  );
}

function IssueBadge({ severity }: { severity: string }) {
  switch (severity) {
    case 'critical':
      return <Badge variant="destructive" className="text-xs">Prüfenswert</Badge>;
    case 'warning':
      return <Badge className="text-xs bg-amber-500/15 text-amber-700 border-amber-200">Hinweis</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">Info</Badge>;
  }
}

function IssueIcon({ severity }: { severity: string }) {
  switch (severity) {
    case 'critical':
      return <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />;
    default:
      return <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />;
  }
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  versicherung: 'Versicherungsgebundene Säule 3a',
  bank: 'Banklösung',
  fonds: 'Fondslösung',
  gemischt: 'Gemischte Lösung',
  unbekannt: 'Nicht eindeutig zuordenbar',
};

const FLEXIBILITY_LABELS: Record<string, string> = {
  flexibel: 'Flexibel',
  eingeschraenkt: 'Eingeschränkt',
  starr: 'Starr',
  moeglich: 'Möglich',
  nicht_moeglich: 'Nicht möglich',
};

const STRATEGY_LABELS: Record<string, string> = {
  defensiv: 'Defensiv',
  ausgewogen: 'Ausgewogen',
  chancenorientiert: 'Chancenorientiert',
};

export function AnalysisScreen({ data, analysisId, onBack, onReset }: AnalysisScreenProps) {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Zurück zum Upload
      </Button>

      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Erstanalyse deiner Säule 3a</h2>
        <p className="text-muted-foreground text-sm">
          Basierend auf den hochgeladenen Dokumenten. Fehlende oder unsichere Daten sind gekennzeichnet.
        </p>
      </div>

      {/* 1. Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Anbieter</p>
              <ValueOrUnknown value={data.provider} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Produktname</p>
              <ValueOrUnknown value={data.productName} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Produkttyp</p>
              <ValueOrUnknown value={data.productType ? PRODUCT_TYPE_LABELS[data.productType] || data.productType : null} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Beitrag</p>
              <ValueOrUnknown 
                value={data.contributionAmount ? `CHF ${data.contributionAmount.toLocaleString('de-CH')}` : null} 
                suffix={data.contributionFrequency ? ` / ${data.contributionFrequency === 'monatlich' ? 'Monat' : 'Jahr'}` : ''} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Structure */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-primary" />
            Struktur der Lösung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Versicherungselemente</p>
              <ValueOrUnknown value={data.productType === 'versicherung' || data.productType === 'gemischt' ? 'Ja' : data.productType === 'bank' || data.productType === 'fonds' ? 'Nein' : null} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fondskomponente</p>
              <ValueOrUnknown value={data.funds.length > 0 ? 'Ja' : data.productType ? 'Nein' : null} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Beitragsanpassung</p>
              <ValueOrUnknown value={data.flexibility.contributionAdjustment ? FLEXIBILITY_LABELS[data.flexibility.contributionAdjustment] || data.flexibility.contributionAdjustment : null} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Beitragsstopp</p>
              <ValueOrUnknown value={data.flexibility.pause ? FLEXIBILITY_LABELS[data.flexibility.pause] || data.flexibility.pause : null} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Contributions & Duration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-primary" />
            Beiträge und Laufzeit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Vertragsbeginn</p>
              <ValueOrUnknown value={data.contractStart} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Vertragsende</p>
              <ValueOrUnknown value={data.contractEnd} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Verbleibende Laufzeit</p>
              <ValueOrUnknown value={data.remainingYears !== null ? `${data.remainingYears} Jahre` : null} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Bisher einbezahlt</p>
              <ValueOrUnknown value={data.paidContributions !== null ? `CHF ${data.paidContributions.toLocaleString('de-CH')}` : null} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Aktueller Wert</p>
              <ValueOrUnknown value={data.currentValue !== null ? `CHF ${data.currentValue.toLocaleString('de-CH')}` : null} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Garantierter Wert</p>
              <ValueOrUnknown value={data.guaranteedValue !== null ? `CHF ${data.guaranteedValue.toLocaleString('de-CH')}` : null} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Funds / Strategy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-primary" />
            Fonds / Anlagestrategie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.funds.length > 0 ? (
            <div className="space-y-2">
              {data.funds.map((fund, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{fund.name}</span>
                  {fund.allocation && (
                    <span className="text-sm text-muted-foreground">{fund.allocation}%</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Keine Fondsinformationen aus den Dokumenten extrahierbar.
            </p>
          )}
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Aktienquote</p>
              <ValueOrUnknown value={data.equityQuota !== null ? `${data.equityQuota}%` : null} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Strategieeinordnung</p>
              <ValueOrUnknown value={data.strategyClassification ? STRATEGY_LABELS[data.strategyClassification] || data.strategyClassification : null} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Costs */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="h-4 w-4 text-primary" />
            Kosten und Gebühren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <CostRow position={data.costs.acquisition} />
          <CostRow position={data.costs.ongoing} />
          <CostRow position={data.costs.management} />
          <CostRow position={data.costs.fundFees} />
          <CostRow position={data.costs.other} />

          {/* Missing costs note */}
          {Object.values(data.costs).some(c => c.value === null) && (
            <>
              <Separator className="my-3" />
              <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Diese Kostenposition konnte aus den vorhandenen Unterlagen aktuell nicht eindeutig automatisch ermittelt werden. Für eine verlässliche Beurteilung kann eine manuelle Prüfung notwendig sein.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 6. Issues */}
      {data.issues.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-primary" />
              Auffälligkeiten und mögliche Nachteile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.issues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <IssueIcon severity={issue.severity} />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{issue.title}</span>
                    <IssueBadge severity={issue.severity} />
                  </div>
                  <p className="text-sm text-muted-foreground">{issue.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 7. Initial Assessment */}
      {data.initialAssessment && (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Ersteinschätzung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {data.initialAssessment}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 8. CTA */}
      <Card>
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <h3 className="text-lg font-semibold text-foreground">
            Willst du wissen, wie deine heutige 3a im Vergleich zu einer flexibleren und kosteneffizienteren Lösung abschneidet?
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Falls einzelne Gebühren oder Vertragsdetails nicht automatisch ermittelt werden konnten, kann eine manuelle Prüfung sinnvoll sein. Du kannst eine vertiefte Analyse anfragen.
          </p>
        </CardContent>
      </Card>

      {/* Review Request Form */}
      <ReviewRequestForm analysisId={analysisId} />

      {/* Reset */}
      <div className="text-center pt-4">
        <Button variant="outline" onClick={onReset}>
          Neue Analyse starten
        </Button>
      </div>
    </div>
  );
}
