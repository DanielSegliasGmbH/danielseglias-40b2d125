export interface Mini3aInputs {
  kundenname: string;
  firma: string;
  produkt: string;
  typ: 'bank' | 'versicherung';
  bankArt: 'digital' | 'hausbank';
  alter: number;
  pensionsalter: number;
  monatlicheEinzahlung: number;
  inAktienInvestiert: boolean;
  aktienquote: number;
  technischerZins: number;
  verwaltungsgebuehren: number;
  abschlusskosten: number;
  ausgabeaufschlag: number;
  ruecknahmekommission: number;
  transparenzAufwand: number;
  renditeAnnahme: number;
  renditeErklaerung: string;
}

export interface CategoryScore {
  key: string;
  label: string;
  score: number;
  rating: 'gut' | 'mittel' | 'schwach';
  vorteile: string[];
  nachteile: string[];
  fazit: string;
}

export interface Mini3aResult {
  gesamtscore: number;
  sterne: number;
  jahreBisPension: number;
  categories: CategoryScore[];
  empfehlung: string;
  costBreakdown: {
    einzahlungen: number;
    abschlusskosten: number;
    laufendeKosten: number;
    ausgabeaufschlag: number;
    ruecknahmekommission: number;
    zinsen: number;
  };
  bewertungsText: string;
}

export interface CategoryLink {
  titel: string;
  url: string;
}

export interface CategoryLinks {
  [category: string]: CategoryLink[];
}

export const CATEGORY_KEYS = [
  'struktur',
  'kosten',
  'renditechancen',
  'flexibilitaet',
  'transparenz',
  'vorsorgeluecke',
  'zufriedenheit',
  'optimierungspotenzial',
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  struktur: 'Struktur',
  kosten: 'Kosten',
  renditechancen: 'Renditechancen',
  flexibilitaet: 'Flexibilität',
  transparenz: 'Transparenz',
  vorsorgeluecke: 'Wahrscheinlichkeit: Vorsorgelücke schliessen',
  zufriedenheit: 'Erwartete Zufriedenheit',
  optimierungspotenzial: 'Optimierungspotenzial',
};

export const DEFAULT_INPUTS: Mini3aInputs = {
  kundenname: '',
  firma: '',
  produkt: '',
  typ: 'bank',
  bankArt: 'digital',
  alter: 30,
  pensionsalter: 65,
  monatlicheEinzahlung: 600,
  inAktienInvestiert: true,
  aktienquote: 60,
  technischerZins: 1.0,
  verwaltungsgebuehren: 1.2,
  abschlusskosten: 0,
  ausgabeaufschlag: 0,
  ruecknahmekommission: 0,
  transparenzAufwand: 5,
  renditeAnnahme: 0,
  renditeErklaerung: '',
};
