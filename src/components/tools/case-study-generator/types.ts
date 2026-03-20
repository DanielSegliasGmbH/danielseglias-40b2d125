export type CustomerType = 'angestellt' | 'selbststaendig' | 'familie' | 'paar' | 'student' | 'rentner';
export type AgeRange = '20-25' | '25-30' | '30-35' | '35-40' | '40-45';
export type CaseStudyStatus = 'entwurf' | 'freigabe' | 'freigegeben' | 'veroeffentlicht';
export type AcquisitionSource = 'werbeanzeige' | 'linkedin' | 'instagram' | 'netzwerk' | 'empfehlung' | 'website' | 'sonstiges';
export type Duration = '<3' | '3-6' | '6-12' | '12+';
export type PreviousSolution = 'versicherung' | 'bank' | 'kombination' | 'unklar';
export type MainProblem = 'hohe-gebuehren' | 'keine-strategie' | 'falsche-produkte' | 'keine-vorsorge' | 'steueroptimierung' | 'andere';

export const GLOBAL_CTA_LINK = 'https://calendar.app.google/LrIPZDNzivnrfq9w7';

export const BENEFIT_OPTIONS = [
  'Mehr Flexibilität',
  'Tiefere Gebührenstruktur',
  'Bessere Renditechancen',
  'Klare Strategie & Verständnis',
  'Strukturierte Vorsorgeplanung',
  'Zugang zur Online-Akademie',
  'Zugang zur Wissensbibliothek',
  '1:1 Betreuung',
  'Wöchentlicher Austausch',
  'Teilnahme an Live Calls',
  'Mehr Sicherheit im Entscheidungsprozess',
  'Transparenz über Kosten & Entwicklung',
] as const;

export interface MediaItem {
  type: 'image' | 'pdf';
  url: string;
  name: string;
}

export interface CaseStudyData {
  id: string;
  internalTitle: string;
  publicTitle: string;
  customerType: CustomerType;
  ageRange: AgeRange;
  acquisitionSource: AcquisitionSource;
  startDate: string;
  duration: Duration;
  status: CaseStudyStatus;

  initialSituation: string;
  previousSolution: PreviousSolution;
  mainProblem: MainProblem;
  mainProblemCustom: string;

  estimatedValueCHF: number;
  feeSavings: number;
  roiMonths: number;
  expectedImprovement: string;
  benefits: string[];

  testimonialName: string;
  testimonialText: string;
  testimonialGoogleLink: string;
  showTestimonial: boolean;

  roundNumbers: boolean;
  publishingAllowed: boolean;

  ctaButtonText: string;
  customerImageUrl: string;
  media: MediaItem[];
}

let _counter = 0;
export function generateId(): string {
  return `cs_${Date.now()}_${++_counter}`;
}

export function generateAutoTitle(customerType: CustomerType, feeSavings: number): string {
  if (feeSavings <= 0) return '';
  const label = CUSTOMER_TYPE_LABELS[customerType];
  const formatted = `CHF ${Math.round(feeSavings).toLocaleString('de-CH')}`;
  return `Wie ${label === 'Angestellt' ? 'ein Angestellter' : label === 'Selbstständig' ? 'eine Selbstständige' : label === 'Familie' ? 'eine Familie' : label === 'Paar' ? 'ein Paar' : label === 'Student/in' ? 'ein/e Student/in' : 'ein/e Rentner/in'} ${formatted} pro Jahr spart`;
}

export const EMPTY_CASE_STUDY: CaseStudyData = {
  id: '',
  internalTitle: '',
  publicTitle: '',
  customerType: 'angestellt',
  ageRange: '30-35',
  acquisitionSource: 'website',
  startDate: '',
  duration: '3-6',
  status: 'entwurf',
  initialSituation: '',
  previousSolution: 'bank',
  mainProblem: 'hohe-gebuehren',
  mainProblemCustom: '',
  estimatedValueCHF: 0,
  feeSavings: 0,
  roiMonths: 0,
  expectedImprovement: '',
  benefits: [],
  testimonialName: '',
  testimonialText: '',
  testimonialGoogleLink: '',
  showTestimonial: false,
  roundNumbers: true,
  publishingAllowed: false,
  ctaButtonText: '15 Minuten Gespräch buchen',
  customerImageUrl: '',
  media: [],
};

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  angestellt: 'Angestellt',
  selbststaendig: 'Selbstständig',
  familie: 'Familie',
  paar: 'Paar',
  student: 'Student/in',
  rentner: 'Rentner/in',
};

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  '20-25': '20–25 Jahre',
  '25-30': '25–30 Jahre',
  '30-35': '30–35 Jahre',
  '35-40': '35–40 Jahre',
  '40-45': '40–45 Jahre',
};

export const STATUS_LABELS: Record<CaseStudyStatus, string> = {
  entwurf: 'Entwurf',
  freigabe: 'Zur Freigabe',
  freigegeben: 'Freigegeben',
  veroeffentlicht: 'Veröffentlicht',
};

export const ACQUISITION_SOURCE_LABELS: Record<AcquisitionSource, string> = {
  werbeanzeige: 'Werbeanzeige',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  netzwerk: 'Netzwerk',
  empfehlung: 'Empfehlung',
  website: 'Website',
  sonstiges: 'Sonstiges',
};

export const DURATION_LABELS: Record<Duration, string> = {
  '<3': '< 3 Monate',
  '3-6': '3–6 Monate',
  '6-12': '6–12 Monate',
  '12+': '12+ Monate',
};

export const PREVIOUS_SOLUTION_LABELS: Record<PreviousSolution, string> = {
  versicherung: 'Versicherungslösung',
  bank: 'Banklösung',
  kombination: 'Kombination',
  unklar: 'Unklar / keine Lösung',
};

export const MAIN_PROBLEM_LABELS: Record<MainProblem, string> = {
  'hohe-gebuehren': 'Hohe Gebühren',
  'keine-strategie': 'Keine klare Strategie',
  'falsche-produkte': 'Falsche Produkte',
  'keine-vorsorge': 'Keine Vorsorge',
  steueroptimierung: 'Fehlende Steueroptimierung',
  andere: 'Anderes Problem',
};

export const MOCK_CASE_STUDIES: CaseStudyData[] = [
  {
    ...EMPTY_CASE_STUDY,
    id: 'mock-1',
    internalTitle: 'Familie Meier – 3a Optimierung',
    publicTitle: 'Wie eine junge Familie CHF 2\'400 pro Jahr spart',
    customerType: 'familie',
    ageRange: '30-35',
    acquisitionSource: 'empfehlung',
    startDate: '2025-01-15',
    duration: '3-6',
    status: 'veroeffentlicht',
    initialSituation: 'Beide Partner hatten eine teure Versicherungslösung für die Säule 3a mit hohen Gebühren und intransparenten Kosten.',
    previousSolution: 'versicherung',
    mainProblem: 'hohe-gebuehren',
    estimatedValueCHF: 48000,
    feeSavings: 2400,
    roiMonths: 2,
    expectedImprovement: 'Deutlich tiefere Gebühren, höhere erwartete Rendite, bessere Flexibilität.',
    benefits: ['Tiefere Gebührenstruktur', 'Mehr Flexibilität', 'Transparenz über Kosten & Entwicklung'],
    showTestimonial: true,
    testimonialText: 'Wir hätten nie gedacht, dass der Wechsel so einfach ist – und so viel bringt.',
    testimonialName: 'Familie M., Zürich',
    testimonialGoogleLink: 'https://g.co/kgs/example1',
    publishingAllowed: true,
  },
  {
    ...EMPTY_CASE_STUDY,
    id: 'mock-2',
    internalTitle: 'Marco S. – Neustart nach Scheidung',
    publicTitle: 'Neustart mit klarer Finanzstrategie',
    customerType: 'angestellt',
    ageRange: '40-45',
    acquisitionSource: 'linkedin',
    startDate: '2024-09-01',
    duration: '6-12',
    status: 'freigegeben',
    initialSituation: 'Nach einer Scheidung war die finanzielle Situation unklar. Pensionskasse geteilt, kein Sparplan vorhanden.',
    previousSolution: 'unklar',
    mainProblem: 'keine-strategie',
    estimatedValueCHF: 35000,
    feeSavings: 1200,
    roiMonths: 4,
    expectedImprovement: 'Klare Struktur, automatisiertes Sparen, optimierte Vorsorge.',
    benefits: ['Klare Strategie & Verständnis', 'Strukturierte Vorsorgeplanung', '1:1 Betreuung'],
  },
  {
    ...EMPTY_CASE_STUDY,
    id: 'mock-3',
    internalTitle: 'Entwurf – Selbstständige Designerin',
    publicTitle: 'Als Selbstständige optimal vorsorgen',
    customerType: 'selbststaendig',
    ageRange: '25-30',
    acquisitionSource: 'instagram',
    startDate: '2025-03-01',
    duration: '<3',
    status: 'entwurf',
    initialSituation: 'Keine Pensionskasse, keine strukturierte Vorsorge, unregelmässiges Einkommen.',
    previousSolution: 'unklar',
    mainProblem: 'keine-vorsorge',
    estimatedValueCHF: 15000,
    feeSavings: 800,
    roiMonths: 3,
    expectedImprovement: 'Grundlegende Absicherung und strukturierter Vermögensaufbau.',
    benefits: ['Strukturierte Vorsorgeplanung', 'Mehr Sicherheit im Entscheidungsprozess'],
  },
  {
    ...EMPTY_CASE_STUDY,
    id: 'mock-4',
    internalTitle: 'Junger Angestellter – 3a Sparkonto zu Anlagelösung',
    publicTitle: 'Vom stillgelegten 3a-Konto zur klaren Vermögensperspektive mit langfristigem Millionenpotenzial',
    customerType: 'angestellt',
    ageRange: '25-30',
    acquisitionSource: 'empfehlung',
    startDate: '2026-02-01',
    duration: '<3',
    status: 'veroeffentlicht',
    initialSituation: 'Der Kunde zahlte über mehrere Jahre konsequent in seine Säule 3a ein, nutzte jedoch lediglich ein klassisches Sparkonto ohne nennenswerte Verzinsung. Sein Geld war faktisch „parkiert" und entwickelte sich kaum weiter. Er ging davon aus, dass dies eine sichere und ausreichende Lösung für seine Vorsorge sei, ohne die langfristigen Auswirkungen zu kennen.',
    previousSolution: 'bank',
    mainProblem: 'keine-strategie',
    estimatedValueCHF: 500000,
    feeSavings: 0,
    roiMonths: 12,
    expectedImprovement: 'Der Kunde profitiert heute von einer deutlich höheren erwarteten Kapitalentwicklung und hat erstmals eine klare, nachvollziehbare Perspektive für seine finanzielle Zukunft. Statt Stillstand arbeitet sein Geld nun aktiv für ihn, was langfristig einen massiven Unterschied im Vermögensaufbau macht.',
    benefits: ['Bessere Renditechancen', 'Klare Strategie & Verständnis', 'Strukturierte Vorsorgeplanung', 'Mehr Sicherheit im Entscheidungsprozess', 'Transparenz über Kosten & Entwicklung'],
    showTestimonial: true,
    testimonialText: 'Ich bin mega froh, dass das jetzt geklärt ist. Ich verstehe endlich, wie das Ganze funktioniert, und es nimmt mir nicht mehr unnötig Zeit und Energie weg.',
    testimonialName: 'Anonymer Kunde, Schweiz',
    publishingAllowed: false,
    ctaButtonText: 'Möchtest du wissen, wie deine Situation aussieht?',
  },
];
