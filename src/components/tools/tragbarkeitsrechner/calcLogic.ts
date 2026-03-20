export interface MortgageInputs {
  purchasePrice: number;
  equity: number;
  grossIncome: number;
  rate1stRank: number; // %
  rate2ndRank: number; // %
}

export interface MortgageResult {
  mortgage: number;
  ltvPercent: number;
  equityPercent: number;
  firstRankLoan: number;
  secondRankLoan: number;
  interestFirst: number;
  interestSecond: number;
  amortizationMonthly: number;
  maintenanceMonthly: number;
  monthlyCost: number;
  yearlyCost: number;
  stressPercent: number;
  status: 'ok' | 'tight' | 'critical';
}

const STRESS_RATE = 0.05; // 5 % kalkulatorischer Zins
const AMORTIZATION_MONTHS = 180; // 15 Jahre

export function calculate(inp: MortgageInputs): MortgageResult {
  const { purchasePrice, grossIncome, rate1stRank, rate2ndRank } = inp;
  const equity = Math.min(inp.equity, purchasePrice);
  const mortgage = Math.max(0, purchasePrice - equity);

  const ltvPercent = purchasePrice > 0 ? (mortgage / purchasePrice) * 100 : 0;
  const equityPercent = purchasePrice > 0 ? (equity / purchasePrice) * 100 : 0;

  // Aufteilung
  const maxFirst = purchasePrice * 0.65;
  const maxSecond = purchasePrice * 0.15;
  const firstRankLoan = Math.min(mortgage, maxFirst);
  const secondRankLoan = Math.min(Math.max(mortgage - firstRankLoan, 0), maxSecond);

  // Effektive Zinskosten monatlich
  const interestFirst = (firstRankLoan * (rate1stRank / 100)) / 12;
  const interestSecond = (secondRankLoan * (rate2ndRank / 100)) / 12;

  // Amortisation
  const twoThirds = (purchasePrice * 2) / 3;
  const amortizationMonthly =
    mortgage > twoThirds ? (mortgage - twoThirds) / AMORTIZATION_MONTHS : 0;

  // Unterhalt
  const maintenanceMonthly = (purchasePrice * 0.01) / 12;

  const monthlyCost = interestFirst + interestSecond + amortizationMonthly + maintenanceMonthly;
  const yearlyCost = monthlyCost * 12;

  // Tragbarkeit (Stressrechnung)
  const stressInterestYearly = mortgage * STRESS_RATE;
  const amortYearly = amortizationMonthly * 12;
  const maintenanceYearly = maintenanceMonthly * 12;
  const stressCostYearly = stressInterestYearly + amortYearly + maintenanceYearly;
  const stressPercent = grossIncome > 0 ? (stressCostYearly / grossIncome) * 100 : 0;

  let status: MortgageResult['status'] = 'ok';
  if (stressPercent > 40) status = 'critical';
  else if (stressPercent > 33) status = 'tight';

  return {
    mortgage,
    ltvPercent,
    equityPercent,
    firstRankLoan,
    secondRankLoan,
    interestFirst,
    interestSecond,
    amortizationMonthly,
    maintenanceMonthly,
    monthlyCost,
    yearlyCost,
    stressPercent,
    status,
  };
}

export function formatCHF(value: number): string {
  return Math.round(value).toLocaleString('de-CH');
}

export function formatPct(value: number, decimals = 1): string {
  return value.toFixed(decimals).replace('.', ',');
}
