// Types for KVG Premium Calculator

export interface Person {
  id: string;
  birthYear: string;
  franchise: string;
  needsAccidentCoverage: boolean | null;
}

export interface FormData {
  location: string;
  persons: Person[];
  currentInsurer: string;
  currentModel: string;
  compareModels: {
    standard: boolean;
    hausarzt: boolean;
    hmo: boolean;
    weitere: boolean;
  };
}

export interface CalculationResult {
  insurer: string;
  insurerUrl?: string;
  model: string;
  premium: number;
  subsidy: number;
  total: number;
}

export interface PersonSummary {
  id: number;
  category: string;
  birthYear: string;
  franchise: string;
  accidentCoverage: string;
}

// Constants
export const FRANCHISES = [
  { value: '300', label: 'CHF 300' },
  { value: '500', label: 'CHF 500' },
  { value: '1000', label: "CHF 1'000" },
  { value: '1500', label: "CHF 1'500" },
  { value: '2000', label: "CHF 2'000" },
  { value: '2500', label: "CHF 2'500" },
];

export const INSURERS = [
  'Agrisano',
  'Aquilana',
  'Assura',
  'Atupri',
  'Avenir',
  'Concordia',
  'CSS',
  'EGK',
  'Einsiedeln',
  'Galenos',
  'Helsana',
  'KKLH',
  'KPT',
  'Mutuel',
  'ÖKK',
  'Philos',
  'Rhenusana',
  'Sana24',
  'Sanitas',
  'SLKK',
  'Steffisburg',
  'Sumiswalder',
  'Swica',
  'Visana',
  'Vita Surselva',
  'Vivao Sympany',
  'Wädenswil',
];

export const INSURANCE_MODELS: Record<string, { standard: string[]; hausarzt: string[]; weitere: string[] }> = {
  'default': {
    standard: ['Grundversicherung'],
    hausarzt: ['Hausarztmodell'],
    weitere: ['Telmed'],
  },
  'Helsana': {
    standard: ['Grundversicherung'],
    hausarzt: [
      'BeneFit PLUS Flexmed R1',
      'BeneFit PLUS Flexmed R3',
      'BeneFit PLUS Hausarzt R1',
      'BeneFit PLUS Hausarzt R2',
      'BeneFit PLUS Hausarzt R3',
      'BeneFit PLUS Hausarzt R4',
    ],
    weitere: ['BeneFit PLUS Telmed', 'Premed-24'],
  },
  'CSS': {
    standard: ['Grundversicherung'],
    hausarzt: ['Hausarztversicherung Profit'],
    weitere: ['Telmed'],
  },
  'Swica': {
    standard: ['Grundversicherung'],
    hausarzt: ['FAVORIT CASA'],
    weitere: ['FAVORIT MULTICHOICE', 'FAVORIT SANTE'],
  },
};
