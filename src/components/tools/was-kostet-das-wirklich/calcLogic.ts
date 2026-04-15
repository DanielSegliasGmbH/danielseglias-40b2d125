/**
 * "Was kostet das wirklich?" – calculation logic
 */

// Swiss social security deductions ~13%
const SOZIALVERSICHERUNG_RATE = 0.13;

// Tax brackets based on gross annual income (simplified Swiss model)
function estimateTaxRate(grossMonthlyIncome: number): number {
  const annual = grossMonthlyIncome * 12;
  if (annual <= 30000) return 0.05;
  if (annual <= 50000) return 0.10;
  if (annual <= 80000) return 0.15;
  if (annual <= 120000) return 0.20;
  return 0.25;
}

export interface WorkTimeInput {
  price: number;
  grossHourlyRate: number;
  monthlyIncome: number;
}

export interface WorkTimeResult {
  grossHourlyRate: number;
  afterSozial: number;
  taxRate: number;
  afterTax: number;
  netHourlyRate: number;
  hoursNeeded: number;
  fullHours: number;
  remainingMinutes: number;
}

export function calculateWorkTime(input: WorkTimeInput): WorkTimeResult {
  const { price, grossHourlyRate, monthlyIncome } = input;
  const afterSozial = grossHourlyRate * (1 - SOZIALVERSICHERUNG_RATE);
  const taxRate = estimateTaxRate(monthlyIncome);
  const afterTax = afterSozial * (1 - taxRate);
  const netHourlyRate = Math.max(afterTax, 0.01);
  const hoursNeeded = price / netHourlyRate;
  const fullHours = Math.floor(hoursNeeded);
  const remainingMinutes = Math.round((hoursNeeded - fullHours) * 60);

  return {
    grossHourlyRate,
    afterSozial,
    taxRate,
    afterTax,
    netHourlyRate,
    hoursNeeded,
    fullHours,
    remainingMinutes,
  };
}

export interface FutureValueInput {
  price: number;
  years: number;
  returnRate: number; // e.g. 0.07
  monthlyExpenses: number;
}

export interface FutureValueResult {
  futureValue: number;
  opportunityCost: number; // future_value - price
  freedomDays: number;
  comparison: string;
}

export function calculateFutureValue(input: FutureValueInput): FutureValueResult {
  const { price, years, returnRate, monthlyExpenses } = input;
  const futureValue = price * Math.pow(1 + returnRate, years);
  const opportunityCost = futureValue - price;

  const dailyExpenses = monthlyExpenses > 0 ? monthlyExpenses / 30 : 100;
  const freedomDays = Math.round(futureValue / dailyExpenses);

  let comparison: string;
  if (futureValue < 500) comparison = 'Das ist ein Wochenende Wellness 🧖';
  else if (futureValue < 2000) comparison = 'Das ist ein Kurzurlaub ✈️';
  else if (futureValue < 10000) comparison = 'Das ist eine Traumreise 🌴';
  else if (futureValue < 50000) comparison = 'Das ist ein Gebrauchtwagen 🚗';
  else comparison = 'Das ist der Anfang einer Anzahlung für ein Eigenheim 🏡';

  return { futureValue, opportunityCost, freedomDays, comparison };
}

// Growth data for chart
export function getFutureValueOverTime(price: number, returnRate: number, maxYears: number) {
  const data = [];
  for (let y = 0; y <= maxYears; y++) {
    data.push({
      year: y,
      value: Math.round(price * Math.pow(1 + returnRate, y)),
    });
  }
  return data;
}
