export type CustomerType = 'angestellt' | 'selbststaendig' | 'familie' | 'paar' | 'student' | 'rentner';
export type AgeRange = '20-25' | '25-30' | '30-35' | '35-40' | '40-45';
export type CaseStudyStatus = 'entwurf' | 'freigabe' | 'freigegeben' | 'veroeffentlicht';
export type StrategyType = 'market-cap' | 'faktor' | 'passiv' | 'aktiv' | 'hybrid';
export type PreviousSolution = 'versicherung' | 'bank' | 'keine' | 'eigenstaendig' | 'andere';
export type MainProblem = 'hohe-gebuehren' | 'keine-strategie' | 'falsche-produkte' | 'keine-vorsorge' | 'steueroptimierung' | 'andere';
export type CtaType = 'zweitmeinung' | 'situation-pruefen' | 'termin-buchen';

export interface CaseStudyData {
  // Grunddaten
  internalTitle: string;
  publicTitle: string;
  customerType: CustomerType;
  ageRange: AgeRange;
  lifeSituation: string;
  region: string;
  status: CaseStudyStatus;

  // Ausgangssituation
  initialSituation: string;
  previousSolution: PreviousSolution;
  mainProblem: MainProblem;
  mainProblemCustom: string;

  // Lösung / Strategie
  recommendedSolution: string;
  strategyType: StrategyType;
  structure: string;

  // Resultate
  estimatedValueCHF: number;
  feeSavings: number;
  expectedImprovement: string;
  additionalBenefits: string[];

  // Anonymisierung & Freigabe
  showCompanyName: boolean;
  roundNumbers: boolean;
  showTestimonial: boolean;
  publishingAllowed: boolean;

  // CTA
  ctaType: CtaType;

  // Testimonial
  testimonialText: string;
  testimonialAuthor: string;
}

export const EMPTY_CASE_STUDY: CaseStudyData = {
  internalTitle: '',
  publicTitle: '',
  customerType: 'angestellt',
  ageRange: '30-35',
  lifeSituation: '',
  region: '',
  status: 'entwurf',
  initialSituation: '',
  previousSolution: 'bank',
  mainProblem: 'hohe-gebuehren',
  mainProblemCustom: '',
  recommendedSolution: '',
  strategyType: 'passiv',
  structure: '',
  estimatedValueCHF: 0,
  feeSavings: 0,
  expectedImprovement: '',
  additionalBenefits: [''],
  showCompanyName: false,
  roundNumbers: true,
  showTestimonial: false,
  publishingAllowed: false,
  ctaType: 'zweitmeinung',
  testimonialText: '',
  testimonialAuthor: '',
};

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  'angestellt': 'Angestellt',
  'selbststaendig': 'Selbstständig',
  'familie': 'Familie',
  'paar': 'Paar',
  'student': 'Student/in',
  'rentner': 'Rentner/in',
};

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  '20-25': '20–25 Jahre',
  '25-30': '25–30 Jahre',
  '30-35': '30–35 Jahre',
  '35-40': '35–40 Jahre',
  '40-45': '40–45 Jahre',
};

export const STATUS_LABELS: Record<CaseStudyStatus, string> = {
  'entwurf': 'Entwurf',
  'freigabe': 'Zur Freigabe',
  'freigegeben': 'Freigegeben',
  'veroeffentlicht': 'Veröffentlicht',
};

export const STRATEGY_LABELS: Record<StrategyType, string> = {
  'market-cap': 'Market Cap',
  'faktor': 'Faktor-Strategie',
  'passiv': 'Passiv (Index)',
  'aktiv': 'Aktiv verwaltet',
  'hybrid': 'Hybrid',
};

export const PREVIOUS_SOLUTION_LABELS: Record<PreviousSolution, string> = {
  'versicherung': 'Versicherungslösung',
  'bank': 'Banklösung',
  'keine': 'Keine bisherige Lösung',
  'eigenstaendig': 'Eigenständig verwaltet',
  'andere': 'Andere',
};

export const MAIN_PROBLEM_LABELS: Record<MainProblem, string> = {
  'hohe-gebuehren': 'Hohe Gebühren',
  'keine-strategie': 'Keine klare Strategie',
  'falsche-produkte': 'Falsche Produkte',
  'keine-vorsorge': 'Keine Vorsorge',
  'steueroptimierung': 'Fehlende Steueroptimierung',
  'andere': 'Anderes Problem',
};

export const CTA_LABELS: Record<CtaType, string> = {
  'zweitmeinung': 'Zweitmeinung anfragen',
  'situation-pruefen': 'Situation prüfen',
  'termin-buchen': 'Termin buchen',
};

// Mock case studies for overview
export const MOCK_CASE_STUDIES: CaseStudyData[] = [
  {
    ...EMPTY_CASE_STUDY,
    internalTitle: 'Familie Meier – 3a Optimierung',
    publicTitle: 'Wie eine junge Familie CHF 2\'400 pro Jahr spart',
    customerType: 'familie',
    ageRange: '30-35',
    lifeSituation: 'Verheiratet, 2 Kinder',
    region: 'Zürich',
    status: 'veroeffentlicht',
    initialSituation: 'Beide Partner hatten eine teure Versicherungslösung für die Säule 3a mit hohen Gebühren und intransparenten Kosten.',
    previousSolution: 'versicherung',
    mainProblem: 'hohe-gebuehren',
    recommendedSolution: 'Umstellung auf eine kostengünstige ETF-basierte 3a-Lösung mit klarer Splitting-Strategie.',
    strategyType: 'passiv',
    structure: '4 separate 3a-Konten pro Person, gestaffelter Bezug geplant',
    estimatedValueCHF: 48000,
    feeSavings: 2400,
    expectedImprovement: 'Deutlich tiefere Gebühren, höhere erwartete Rendite, bessere Flexibilität und Steueroptimierung beim Bezug.',
    additionalBenefits: ['Steueroptimierung durch Splitting', 'Höhere Renditechancen', 'Volle Transparenz'],
    showTestimonial: true,
    testimonialText: 'Wir hätten nie gedacht, dass der Wechsel so einfach ist – und so viel bringt.',
    testimonialAuthor: 'Familie M., Zürich',
    publishingAllowed: true,
    ctaType: 'situation-pruefen',
  },
  {
    ...EMPTY_CASE_STUDY,
    internalTitle: 'Marco S. – Neustart nach Scheidung',
    publicTitle: 'Neustart mit klarer Finanzstrategie',
    customerType: 'angestellt',
    ageRange: '40-45',
    status: 'freigegeben',
    initialSituation: 'Nach einer Scheidung war die finanzielle Situation unklar. Pensionskasse geteilt, kein Sparplan vorhanden.',
    previousSolution: 'keine',
    mainProblem: 'keine-strategie',
    recommendedSolution: 'Kompletter Finanzplan mit Sparplan, 3a-Splitting und optimierter Freizügigkeitsstrategie.',
    strategyType: 'hybrid',
    estimatedValueCHF: 35000,
    feeSavings: 1200,
    expectedImprovement: 'Klare Struktur, automatisiertes Sparen, optimierte Vorsorge.',
    additionalBenefits: ['Klarheit über Gesamtsituation', 'Automatisiertes Sparen'],
    ctaType: 'termin-buchen',
  },
  {
    ...EMPTY_CASE_STUDY,
    internalTitle: 'Entwurf – Selbstständige Designerin',
    publicTitle: 'Als Selbstständige optimal vorsorgen',
    customerType: 'selbststaendig',
    ageRange: '25-30',
    status: 'entwurf',
    initialSituation: 'Keine Pensionskasse, keine strukturierte Vorsorge, unregelmässiges Einkommen.',
    previousSolution: 'keine',
    mainProblem: 'keine-vorsorge',
    recommendedSolution: 'Flexible 3a-Strategie mit angepasstem Sparplan.',
    strategyType: 'passiv',
    estimatedValueCHF: 15000,
    feeSavings: 800,
    expectedImprovement: 'Grundlegende Absicherung und strukturierter Vermögensaufbau.',
    additionalBenefits: ['Flexibel anpassbar', 'Steuerersparnis ab Tag 1'],
    ctaType: 'zweitmeinung',
  },
];
