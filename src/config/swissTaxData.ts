/**
 * Swiss Tax Data 2026 (simplified approximation)
 * Sources: ESTV, cantonal tax administrations
 * These are simplified brackets — real taxes use more granular tables.
 */

// Federal tax brackets (Bundessteuer) — same for all cantons
export const FEDERAL_TAX_BRACKETS = [
  { from: 0, to: 14500, rate: 0 },
  { from: 14500, to: 31600, rate: 0.77 },
  { from: 31600, to: 41400, rate: 0.88 },
  { from: 41400, to: 55200, rate: 2.64 },
  { from: 55200, to: 72500, rate: 2.97 },
  { from: 72500, to: 78100, rate: 5.94 },
  { from: 78100, to: 103600, rate: 6.60 },
  { from: 103600, to: 134600, rate: 8.80 },
  { from: 134600, to: 176000, rate: 11.00 },
  { from: 176000, to: 755200, rate: 13.20 },
  { from: 755200, to: Infinity, rate: 11.50 },
];

// Married federal brackets (doubled thresholds, lower rates)
export const FEDERAL_TAX_BRACKETS_MARRIED = [
  { from: 0, to: 28300, rate: 0 },
  { from: 28300, to: 50900, rate: 1.0 },
  { from: 50900, to: 58400, rate: 2.0 },
  { from: 58400, to: 75300, rate: 3.0 },
  { from: 75300, to: 90300, rate: 4.0 },
  { from: 90300, to: 103400, rate: 5.0 },
  { from: 103400, to: 114700, rate: 6.0 },
  { from: 114700, to: 124200, rate: 7.0 },
  { from: 124200, to: 131700, rate: 8.0 },
  { from: 131700, to: 141200, rate: 9.0 },
  { from: 141200, to: 151700, rate: 10.0 },
  { from: 151700, to: 163200, rate: 11.0 },
  { from: 163200, to: 174700, rate: 12.0 },
  { from: 174700, to: 895900, rate: 13.0 },
  { from: 895900, to: Infinity, rate: 11.50 },
];

export interface CantonTaxConfig {
  name: string;
  code: string;
  /** Canton base tax rate as % of taxable income (simplified) */
  cantonBaseRate: number;
  /** Average Gemeinde multiplier (as fraction, e.g. 1.19 = 119%) */
  avgGemeindeMultiplier: number;
  /** Church tax as % of cantonal tax */
  churchTaxRate: number;
  /** Canton-specific deductions */
  childDeduction: number;
  marriedDeduction: number;
  /** Social insurance deduction % (AHV, ALV, BVG, etc.) */
  socialInsuranceRate: number;
  /** Default professional expenses deduction */
  defaultProfExpenses: number;
  /** Max 3a deduction (employed) */
  max3a: number;
}

export const CANTON_TAX_DATA: Record<string, CantonTaxConfig> = {
  ZH: {
    name: 'Zürich',
    code: 'ZH',
    cantonBaseRate: 8.0,
    avgGemeindeMultiplier: 1.19,
    churchTaxRate: 10,
    childDeduction: 9000,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
  BE: {
    name: 'Bern',
    code: 'BE',
    cantonBaseRate: 9.5,
    avgGemeindeMultiplier: 1.54,
    churchTaxRate: 10,
    childDeduction: 8000,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
  AG: {
    name: 'Aargau',
    code: 'AG',
    cantonBaseRate: 7.5,
    avgGemeindeMultiplier: 1.09,
    churchTaxRate: 10,
    childDeduction: 7000,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
  SG: {
    name: 'St. Gallen',
    code: 'SG',
    cantonBaseRate: 8.5,
    avgGemeindeMultiplier: 1.44,
    churchTaxRate: 10,
    childDeduction: 7800,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
  LU: {
    name: 'Luzern',
    code: 'LU',
    cantonBaseRate: 6.5,
    avgGemeindeMultiplier: 1.75,
    churchTaxRate: 10,
    childDeduction: 6700,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
  ZG: {
    name: 'Zug',
    code: 'ZG',
    cantonBaseRate: 4.0,
    avgGemeindeMultiplier: 0.82,
    churchTaxRate: 10,
    childDeduction: 12000,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
  SZ: {
    name: 'Schwyz',
    code: 'SZ',
    cantonBaseRate: 5.0,
    avgGemeindeMultiplier: 1.10,
    churchTaxRate: 10,
    childDeduction: 9200,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
  BS: {
    name: 'Basel-Stadt',
    code: 'BS',
    cantonBaseRate: 10.0,
    avgGemeindeMultiplier: 1.0,
    churchTaxRate: 8,
    childDeduction: 7800,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
  BL: {
    name: 'Basel-Landschaft',
    code: 'BL',
    cantonBaseRate: 8.5,
    avgGemeindeMultiplier: 1.30,
    churchTaxRate: 10,
    childDeduction: 7800,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
  GR: {
    name: 'Graubünden',
    code: 'GR',
    cantonBaseRate: 7.0,
    avgGemeindeMultiplier: 1.00,
    churchTaxRate: 10,
    childDeduction: 6000,
    marriedDeduction: 2600,
    socialInsuranceRate: 12.5,
    defaultProfExpenses: 2000,
    max3a: 7258,
  },
};

// Swiss average for unsupported cantons
export const SWISS_AVERAGE_CONFIG: CantonTaxConfig = {
  name: 'Schweizer Durchschnitt',
  code: 'CH',
  cantonBaseRate: 7.5,
  avgGemeindeMultiplier: 1.20,
  churchTaxRate: 10,
  childDeduction: 7500,
  marriedDeduction: 2600,
  socialInsuranceRate: 12.5,
  defaultProfExpenses: 2000,
  max3a: 7258,
};

export const ALL_CANTONS = [
  { code: 'ZH', name: 'Zürich' },
  { code: 'BE', name: 'Bern' },
  { code: 'LU', name: 'Luzern' },
  { code: 'UR', name: 'Uri' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'OW', name: 'Obwalden' },
  { code: 'NW', name: 'Nidwalden' },
  { code: 'GL', name: 'Glarus' },
  { code: 'ZG', name: 'Zug' },
  { code: 'FR', name: 'Freiburg' },
  { code: 'SO', name: 'Solothurn' },
  { code: 'BS', name: 'Basel-Stadt' },
  { code: 'BL', name: 'Basel-Landschaft' },
  { code: 'SH', name: 'Schaffhausen' },
  { code: 'AR', name: 'Appenzell Ausserrhoden' },
  { code: 'AI', name: 'Appenzell Innerrhoden' },
  { code: 'SG', name: 'St. Gallen' },
  { code: 'GR', name: 'Graubünden' },
  { code: 'AG', name: 'Aargau' },
  { code: 'TG', name: 'Thurgau' },
  { code: 'TI', name: 'Tessin' },
  { code: 'VD', name: 'Waadt' },
  { code: 'VS', name: 'Wallis' },
  { code: 'NE', name: 'Neuenburg' },
  { code: 'GE', name: 'Genf' },
  { code: 'JU', name: 'Jura' },
];

export const SUPPORTED_CANTONS = Object.keys(CANTON_TAX_DATA);

/**
 * Calculate progressive federal tax
 */
export function calculateFederalTax(taxableIncome: number, married: boolean): number {
  const brackets = married ? FEDERAL_TAX_BRACKETS_MARRIED : FEDERAL_TAX_BRACKETS;
  let tax = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.from) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.to) - bracket.from;
    tax += taxableInBracket * (bracket.rate / 100);
  }

  return Math.round(tax);
}

/**
 * Calculate cantonal + municipal tax (simplified)
 */
export function calculateCantonalTax(taxableIncome: number, config: CantonTaxConfig): number {
  const cantonTax = taxableIncome * (config.cantonBaseRate / 100);
  const gemeindeTax = cantonTax * config.avgGemeindeMultiplier;
  return Math.round(cantonTax + gemeindeTax);
}

/**
 * Full tax calculation
 */
export interface TaxInput {
  canton: string;
  civilStatus: 'single' | 'married' | 'partnership';
  children: number;
  confession: 'reformiert' | 'katholisch' | 'andere' | 'keine';
  grossIncome: number;
  contribution3a: number;
  pkEinkauf: number;
  professionalExpenses: number;
  furtherEducation: number;
  healthCosts: number;
  donations: number;
  mortgageInterest: number;
}

export interface TaxResult {
  taxableIncome: number;
  federalTax: number;
  cantonalTax: number;
  municipalTax: number;
  churchTax: number;
  totalTax: number;
  effectiveRate: number;
  cantonConfig: CantonTaxConfig;
  isApproximation: boolean;
  // optimization
  remaining3a: number;
  savings3aMax: number;
  savingsPkExample: number;
}

export function calculateSwissTax(input: TaxInput): TaxResult {
  const config = CANTON_TAX_DATA[input.canton] || SWISS_AVERAGE_CONFIG;
  const isApproximation = !CANTON_TAX_DATA[input.canton];
  const married = input.civilStatus === 'married' || input.civilStatus === 'partnership';

  // 1. Social insurance deduction
  const socialDeduction = input.grossIncome * (config.socialInsuranceRate / 100);

  // 2. Total deductions
  const totalDeductions =
    socialDeduction +
    input.contribution3a +
    input.pkEinkauf +
    input.professionalExpenses +
    input.furtherEducation +
    input.healthCosts +
    input.donations +
    input.mortgageInterest +
    (married ? config.marriedDeduction : 0) +
    input.children * config.childDeduction;

  // 3. Taxable income
  const taxableIncome = Math.max(0, input.grossIncome - totalDeductions);

  // 4. Federal tax
  const federalTax = calculateFederalTax(taxableIncome, married);

  // 5. Cantonal tax (base)
  const cantonalBase = taxableIncome * (config.cantonBaseRate / 100);
  const cantonalTax = Math.round(cantonalBase);
  const municipalTax = Math.round(cantonalBase * config.avgGemeindeMultiplier);

  // 6. Church tax
  const churchTax = input.confession !== 'keine'
    ? Math.round(cantonalTax * (config.churchTaxRate / 100))
    : 0;

  const totalTax = federalTax + cantonalTax + municipalTax + churchTax;
  const effectiveRate = input.grossIncome > 0 ? (totalTax / input.grossIncome) * 100 : 0;

  // Optimization: 3a savings
  const remaining3a = Math.max(0, config.max3a - input.contribution3a);
  const marginalRate = effectiveRate > 0 ? effectiveRate / 100 : 0.25;
  const savings3aMax = Math.round(remaining3a * marginalRate);

  // PK Einkauf savings estimate (using 10k example)
  const savingsPkExample = input.pkEinkauf === 0 ? Math.round(10000 * marginalRate) : 0;

  return {
    taxableIncome: Math.round(taxableIncome),
    federalTax,
    cantonalTax,
    municipalTax,
    churchTax,
    totalTax,
    effectiveRate: Math.round(effectiveRate * 10) / 10,
    cantonConfig: config,
    isApproximation,
    remaining3a,
    savings3aMax,
    savingsPkExample,
  };
}
