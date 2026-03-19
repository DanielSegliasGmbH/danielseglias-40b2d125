/**
 * Static data for the investment strategy presentation in the client portal.
 * Structured: Platform → Strategies → Allocations
 */

export interface Platform {
  id: string;
  name: string;
  privateName: string; // shown in privacy mode
  badge?: string;
  description: string;
  productCosts: string;
  otherFees: string;
  learnMoreUrl?: string;
  websiteUrl?: string;
}

export const platforms: Platform[] = [
  {
    id: 'finpension',
    name: 'Finpension | 3a',
    privateName: 'Plattform A',
    description: 'Hohe Flexibilität, tiefe Gebühren.',
    productCosts: '0.39%',
    otherFees: '0.00 – 0.20% TER + keine Handelskommission',
  },
  {
    id: 'truewealth',
    name: 'Truewealth | 3a',
    privateName: 'Plattform B',
    badge: 'Neu',
    description: 'Die günstigste Lösung am Markt.',
    productCosts: 'Keine',
    otherFees: '0.13 – 0.20% TER + keine Handelskommission',
  },
  {
    id: 'saxo',
    name: 'Saxo | Investieren',
    privateName: 'Plattform C',
    badge: 'Neu',
    description: 'Lösung für freies Vermögen.',
    productCosts: 'Keine',
    otherFees: '0.13 – 0.35% TER + Handelskommission',
  },
];

export interface StrategyAllocation {
  fundName: string;
  region: string; // short label for chart
  weight: number;
}

export interface Strategy {
  id: string;
  name: string;
  subtitle: string;
  avgReturn: string;
  returnSince: string;
  allocations: StrategyAllocation[];
}

export interface PlatformStrategies {
  platformId: string;
  strategies: Strategy[];
}

export const platformStrategies: PlatformStrategies[] = [
  {
    platformId: 'finpension',
    strategies: [
      {
        id: 'factor',
        name: 'Faktorportfolio',
        subtitle: 'Systematische Übergewichtung',
        avgReturn: '11.93% p.a.',
        returnSince: 'Seit 2021',
        allocations: [
          { fundName: 'UBS (CH) Index Fund – Equities Emerging Markets NSL I-B-acc', region: 'Emerging Markets', weight: 10 },
          { fundName: 'UBS (CH) Index Fund 3 – Equities World ex CH Small NSL Multi Investor (CHF hedged) I-B-acc Funds', region: 'Small Cap', weight: 34 },
          { fundName: 'UBS (CH) Index Fund 3 – Equities World ex CH Value Weighted (CHF hedged) I-B-acc', region: 'Value', weight: 34 },
          { fundName: 'UBS (CH) Index Fund – Equities Switzerland Small & Mid I-X-acc', region: 'CH Small Mid', weight: 2 },
          { fundName: 'UBS (CH) Index Fund 3 – Equities World ex CH Quality (CHF hedged) I-B-acc Funds', region: 'Quality', weight: 20 },
        ],
      },
      {
        id: 'marketcap',
        name: 'Marketcap Mix',
        subtitle: 'Passive Marktabbildung',
        avgReturn: '12.45% p.a.',
        returnSince: 'Seit 2021',
        allocations: [
          { fundName: 'UBS AST 2 Global Equities (ex CH) Passive II (hedged in CHF) I-X', region: 'Global ex CH', weight: 90 },
          { fundName: 'Swisscanto (CH) Index Equity Fund Emerging Markets NT CHF', region: 'Emerging Markets', weight: 8 },
          { fundName: 'UBS (CH) Index Fund – Equities Switzerland All NSL I-X-acc', region: 'Schweiz', weight: 2 },
        ],
      },
      {
        id: 'bip',
        name: 'BIP Allokation',
        subtitle: 'Makroorientierte Gewichtung',
        avgReturn: '9.56% p.a.',
        returnSince: 'Seit 2021',
        allocations: [
          { fundName: 'UBS (CH) Index Fund – Equities Emerging Markets NSL I-B-acc', region: 'Emerging Markets', weight: 42 },
          { fundName: 'UBS (CH) Index Fund 2 – Equities Europe ex CH Selection NSL (CHF hedged) I-X-acc Funds', region: 'Europa', weight: 22 },
          { fundName: 'UBS (CH) Index Fund 3 – Equities USA Selection NSL (CHF hedged) I-X-acc Funds', region: 'USA', weight: 24 },
          { fundName: 'UBS (CH) Index Fund – Equities Canada NSL I-X-acc', region: 'Kanada', weight: 2 },
          { fundName: 'UBS (CH) Index Fund – Equities Switzerland All ESG NSL I-X-acc', region: 'Schweiz', weight: 1 },
          { fundName: 'UBS (CH) Index Fund – Equities Pacific ex Japan NSL I-X-acc', region: 'Pazifik ex Japan', weight: 3 },
          { fundName: 'Swisscanto (CH) IPF I Index Equity Fund Japan NTHI CHF', region: 'Japan', weight: 5 },
        ],
      },
    ],
  },
  {
    platformId: 'truewealth',
    strategies: [
      {
        id: 'marketcap-tw',
        name: 'Marketcap Mix',
        subtitle: 'Passive Marktabbildung',
        avgReturn: '13.41% p.a.',
        returnSince: 'Seit 2021',
        allocations: [
          { fundName: 'UBS (CH) Index Fund 3 – Equities USA NSL I-A-acc', region: 'USA', weight: 60 },
          { fundName: 'HSBC EURO STOXX 50 UCITS ETF', region: 'Europa', weight: 14 },
          { fundName: 'Vanguard FTSE Developed Asia Pacific ex Japan UCITS ETF', region: 'Asien-Pazifik', weight: 10 },
          { fundName: 'iShares Core MSCI EM IMI UCITS ETF USD (Acc)', region: 'Schwellenländer', weight: 7 },
          { fundName: 'UBS (CH) Index Fund – Equities Switzerland All NSL IA-acc', region: 'Schweiz', weight: 4 },
          { fundName: 'UBS (CH) Index Fund – Equities Japan NSL', region: 'Japan', weight: 3 },
          { fundName: 'iShares Core FTSE 100 UCITS ETF GBP (Dist)', region: 'UK', weight: 2 },
        ],
      },
    ],
  },
  {
    platformId: 'saxo',
    strategies: [],
  },
];

export function getStrategiesForPlatform(platformId: string): Strategy[] {
  return platformStrategies.find((p) => p.platformId === platformId)?.strategies ?? [];
}

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

export const riskProfiles: RiskProfile[] = [
  {
    id: 'conservative',
    name: 'Konservativ',
    rows: [
      { age: 55, stocks: 30, bonds: 55, liquidity: 15 },
      { age: 56, stocks: 28, bonds: 55, liquidity: 17 },
      { age: 57, stocks: 26, bonds: 55, liquidity: 19 },
      { age: 58, stocks: 24, bonds: 55, liquidity: 21 },
      { age: 59, stocks: 22, bonds: 55, liquidity: 23 },
      { age: 60, stocks: 20, bonds: 55, liquidity: 25 },
      { age: 61, stocks: 18, bonds: 55, liquidity: 27 },
      { age: 62, stocks: 16, bonds: 55, liquidity: 29 },
      { age: 63, stocks: 12, bonds: 55, liquidity: 33 },
      { age: 64, stocks: 10, bonds: 55, liquidity: 35 },
    ],
  },
  {
    id: 'moderate',
    name: 'Mittel',
    rows: [
      { age: 55, stocks: 50, bonds: 40, liquidity: 10 },
      { age: 56, stocks: 48, bonds: 40, liquidity: 12 },
      { age: 57, stocks: 46, bonds: 40, liquidity: 14 },
      { age: 58, stocks: 43, bonds: 40, liquidity: 17 },
      { age: 59, stocks: 40, bonds: 40, liquidity: 20 },
      { age: 60, stocks: 37, bonds: 40, liquidity: 23 },
      { age: 61, stocks: 34, bonds: 40, liquidity: 26 },
      { age: 62, stocks: 30, bonds: 40, liquidity: 30 },
      { age: 63, stocks: 25, bonds: 40, liquidity: 35 },
      { age: 64, stocks: 20, bonds: 40, liquidity: 40 },
    ],
  },
  {
    id: 'aggressive',
    name: 'Aggressiv',
    rows: [
      { age: 55, stocks: 95, bonds: 3, liquidity: 2 },
      { age: 56, stocks: 92, bonds: 5, liquidity: 3 },
      { age: 57, stocks: 88, bonds: 7, liquidity: 5 },
      { age: 58, stocks: 82, bonds: 8, liquidity: 10 },
      { age: 59, stocks: 75, bonds: 10, liquidity: 15 },
      { age: 60, stocks: 65, bonds: 12, liquidity: 23 },
      { age: 61, stocks: 55, bonds: 15, liquidity: 30 },
      { age: 62, stocks: 50, bonds: 20, liquidity: 30 },
      { age: 63, stocks: 45, bonds: 22, liquidity: 33 },
      { age: 64, stocks: 40, bonds: 25, liquidity: 35 },
    ],
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
  'hsl(60 9% 72%)',    // lighter variant
  'hsl(60 10% 35%)',   // darker variant
];

export const LAST_UPDATE_DATE = '3.2.2026';
