export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'uploaded' | 'error';
  storagePath?: string;
}

export interface ExtractedField {
  key: string;
  label: string;
  value: string | null;
  confidence: 'verified' | 'estimated' | 'unknown';
  source?: string;
}

export interface FundInfo {
  name: string;
  allocation?: number;
  category?: string;
}

export interface CostPosition {
  label: string;
  value: number | null;
  isVerified: boolean;
  source?: string;
}

export interface AnalysisIssue {
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
}

// ── New structured analysis result from Prompt 3 ──

export interface ScorecardItem {
  wert: string | null;
  begruendung: string | null;
}

export interface AnalysisSection {
  titel: string;
  inhalt: string[];
}

export interface AnalysisResult {
  einordnung: {
    produkttyp: string | null;
    struktur: string | null;
    kurzbewertung: string | null;
  };
  scorecard: {
    transparenz: ScorecardItem;
    flexibilitaet: ScorecardItem;
    kostenklarheit: ScorecardItem;
    anlageklarheit: ScorecardItem;
    gesamt_einordnung: ScorecardItem;
  };
  zusammenfassung: {
    titel: string | null;
    kurztext: string | null;
  };
  struktur_analyse: AnalysisSection;
  beitrags_und_laufzeit_analyse: AnalysisSection;
  anlage_analyse: AnalysisSection;
  kosten_analyse: AnalysisSection;
  auffaelligkeiten: AnalysisSection;
  fehlende_daten_hinweise: AnalysisSection;
  ersteinschaetzung: AnalysisSection;
  naechste_schritte: AnalysisSection;
  cta_hinweis: {
    titel: string | null;
    text: string | null;
  };
}

export interface AnalysisData {
  // Overview
  provider: string | null;
  productName: string | null;
  productType: 'versicherung' | 'bank' | 'fonds' | 'gemischt' | 'unbekannt' | null;

  // Contributions & Duration
  contributionAmount: number | null;
  contributionFrequency: 'monatlich' | 'jaehrlich' | null;
  contractStart: string | null;
  contractEnd: string | null;
  remainingYears: number | null;
  paidContributions: number | null;

  // Values
  currentValue: number | null;
  guaranteedValue: number | null;

  // Funds & Strategy
  funds: FundInfo[];
  equityQuota: number | null;
  strategyClassification: 'defensiv' | 'ausgewogen' | 'chancenorientiert' | null;

  // Costs
  costs: {
    acquisition: CostPosition;
    ongoing: CostPosition;
    management: CostPosition;
    fundFees: CostPosition;
    other: CostPosition;
  };

  // Flexibility
  flexibility: {
    contributionAdjustment: 'flexibel' | 'eingeschraenkt' | 'starr' | null;
    pause: 'moeglich' | 'eingeschraenkt' | 'nicht_moeglich' | null;
    cancellationDisadvantages: string | null;
  };

  // Issues
  issues: AnalysisIssue[];

  // Assessment
  initialAssessment: string | null;

  // Structured analysis result from Prompt 3
  analysisResult: AnalysisResult | null;
}

export interface ReviewRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
  consentGiven: boolean;
}

const EMPTY_SCORECARD_ITEM: ScorecardItem = { wert: null, begruendung: null };
const EMPTY_SECTION: AnalysisSection = { titel: '', inhalt: [] };

export const EMPTY_ANALYSIS: AnalysisData = {
  provider: null,
  productName: null,
  productType: null,
  contributionAmount: null,
  contributionFrequency: null,
  contractStart: null,
  contractEnd: null,
  remainingYears: null,
  paidContributions: null,
  currentValue: null,
  guaranteedValue: null,
  funds: [],
  equityQuota: null,
  strategyClassification: null,
  costs: {
    acquisition: { label: 'Abschlusskosten', value: null, isVerified: false },
    ongoing: { label: 'Laufende Kosten', value: null, isVerified: false },
    management: { label: 'Verwaltungsgebühren', value: null, isVerified: false },
    fundFees: { label: 'Fondsgebühren / TER', value: null, isVerified: false },
    other: { label: 'Sonstige Kosten', value: null, isVerified: false },
  },
  flexibility: {
    contributionAdjustment: null,
    pause: null,
    cancellationDisadvantages: null,
  },
  issues: [],
  initialAssessment: null,
  analysisResult: null,
};

export type AnalyzerStep = 'start' | 'upload' | 'analysis';
