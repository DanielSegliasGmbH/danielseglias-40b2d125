/**
 * Static data for the investment strategy presentation in the client portal.
 */

export interface Platform {
  id: string;
  name: string;
  description: string;
  productCosts: string;
  otherFees: string;
}

export const platforms: Platform[] = [
  {
    id: 'finpension',
    name: 'Finpension 3a',
    description: 'Hohe Flexibilität, tiefe Gebühren',
    productCosts: '0.39%',
    otherFees: '0.00 – 0.20% TER, keine Handelskosten',
  },
  {
    id: 'truewealth',
    name: 'Truewealth 3a',
    description: 'Automatisiert, breit diversifiziert',
    productCosts: 'keine',
    otherFees: '0.13 – 0.20% TER',
  },
  {
    id: 'saxo',
    name: 'Saxo (freies Investieren)',
    description: 'Maximale Kontrolle, individuelle Auswahl',
    productCosts: 'keine',
    otherFees: '0.13 – 0.35% TER + Handelskosten',
  },
];

export interface StrategyAllocation {
  region: string;
  weight: number;
}

export interface Strategy {
  id: string;
  name: string;
  subtitle: string;
  avgReturn: string;
  allocations: StrategyAllocation[];
}

export const strategies: Strategy[] = [
  {
    id: 'marketcap',
    name: 'Marketcap Mix',
    subtitle: 'Passiv, nach Marktkapitalisierung',
    avgReturn: '~8.2% p.a.',
    allocations: [
      { region: 'USA', weight: 60 },
      { region: 'Europa', weight: 14 },
      { region: 'Asien', weight: 10 },
      { region: 'Emerging Markets', weight: 7 },
      { region: 'Schweiz', weight: 4 },
      { region: 'Japan', weight: 3 },
      { region: 'UK', weight: 2 },
    ],
  },
  {
    id: 'factor',
    name: 'Faktorportfolio',
    subtitle: 'Systematische Übergewichtung',
    avgReturn: '~9.1% p.a.',
    allocations: [
      { region: 'Small Cap', weight: 34 },
      { region: 'Value', weight: 34 },
      { region: 'Quality', weight: 20 },
      { region: 'Emerging Markets', weight: 10 },
      { region: 'CH Small Mid', weight: 2 },
    ],
  },
  {
    id: 'bip',
    name: 'BIP Allokation',
    subtitle: 'Makroorientiert, nach Wirtschaftsleistung',
    avgReturn: '~7.8% p.a.',
    allocations: [
      { region: 'Emerging Markets', weight: 42 },
      { region: 'USA', weight: 24 },
      { region: 'Europa', weight: 22 },
      { region: 'Japan', weight: 6 },
      { region: 'UK', weight: 4 },
      { region: 'Schweiz', weight: 2 },
    ],
  },
  {
    id: 'bonds',
    name: 'Obligationen Fokus',
    subtitle: 'Defensiv, kapitalerhaltend',
    avgReturn: '~4.5% p.a.',
    allocations: [
      { region: 'CHF Obligationen', weight: 40 },
      { region: 'Globale Anleihen', weight: 25 },
      { region: 'Aktien Schweiz', weight: 15 },
      { region: 'Aktien Global', weight: 15 },
      { region: 'Liquidität', weight: 5 },
    ],
  },
];

export interface GlidepathRow {
  age: number;
  stocks: number;
  bonds: number;
  liquidity: number;
}

export interface RiskProfile {
  id: string;
  name: string;
  rows: GlidepathRow[];
}

function interpolate(start: number, end: number, steps: number, step: number): number {
  return Math.round(start + ((end - start) * step) / (steps - 1));
}

function buildRows(stockStart: number, stockEnd: number, bondStart: number, bondEnd: number): GlidepathRow[] {
  const ages = [55, 56, 57, 58, 59, 60, 61, 62, 63, 64];
  return ages.map((age, i) => {
    const stocks = interpolate(stockStart, stockEnd, ages.length, i);
    const bonds = interpolate(bondStart, bondEnd, ages.length, i);
    const liquidity = 100 - stocks - bonds;
    return { age, stocks, bonds, liquidity };
  });
}

export const riskProfiles: RiskProfile[] = [
  {
    id: 'conservative',
    name: 'Konservativ',
    rows: buildRows(30, 10, 55, 55),
  },
  {
    id: 'moderate',
    name: 'Mittel',
    rows: buildRows(50, 20, 40, 40),
  },
  {
    id: 'aggressive',
    name: 'Aggressiv',
    rows: buildRows(95, 40, 3, 35),
  },
];

// Colors for donut chart segments using design system scale
export const DONUT_COLORS = [
  'hsl(60 10% 44%)',   // scale-6 primary
  'hsl(60 9% 66%)',    // scale-1
  'hsl(60 10% 53%)',   // scale-4
  'hsl(60 10% 27%)',   // scale-10
  'hsl(60 9% 40%)',    // scale-7
  'hsl(60 10% 57%)',   // scale-3
  'hsl(60 10% 24%)',   // scale-11
];
