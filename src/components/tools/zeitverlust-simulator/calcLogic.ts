/**
 * Zeitverlust-Simulator – Calculation Logic
 * Compares "start today" vs "start later" to show the cost of waiting.
 */

export interface ZeitverlustInputs {
  currentAge: number;
  targetAge: number;
  monthlyContribution: number;
  annualReturnPct: number;
  delayYears: number;
  startCapital: number;
}

export interface YearDataPoint {
  age: number;
  earlyValue: number;
  lateValue: number;
}

export interface ScenarioResult {
  startAge: number;
  years: number;
  totalContributions: number;
  endValue: number;
  profit: number;
}

export interface ZeitverlustResult {
  early: ScenarioResult;
  late: ScenarioResult;
  lostWealth: number;
  lostProfit: number;
  lostYearsAtMarket: number;
  requiredMonthlyToMatch: number;
  chartData: YearDataPoint[];
}

function futureValue(startCapital: number, monthly: number, years: number, annualRate: number): number {
  if (years <= 0) return startCapital;
  const r = annualRate / 12;
  if (r === 0) return startCapital + monthly * years * 12;
  // FV of lump sum + FV of annuity
  const n = years * 12;
  const fvLump = startCapital * Math.pow(1 + r, n);
  const fvAnnuity = monthly * ((Math.pow(1 + r, n) - 1) / r);
  return fvLump + fvAnnuity;
}

/**
 * Find the monthly contribution needed to reach a target FV over a given period.
 */
function requiredMonthly(targetFV: number, startCapital: number, years: number, annualRate: number): number {
  if (years <= 0) return 0;
  const r = annualRate / 12;
  const n = years * 12;
  if (r === 0) {
    return Math.max(0, (targetFV - startCapital) / n);
  }
  const fvLump = startCapital * Math.pow(1 + r, n);
  const remaining = targetFV - fvLump;
  if (remaining <= 0) return 0;
  const annuityFactor = (Math.pow(1 + r, n) - 1) / r;
  return remaining / annuityFactor;
}

export function calculate(inputs: ZeitverlustInputs): ZeitverlustResult {
  const { currentAge, targetAge, monthlyContribution, annualReturnPct, delayYears, startCapital } = inputs;

  const earlyYears = Math.max(targetAge - currentAge, 0);
  const lateStartAge = currentAge + delayYears;
  const lateYears = Math.max(targetAge - lateStartAge, 0);

  const rate = annualReturnPct / 100;

  const earlyEnd = futureValue(startCapital, monthlyContribution, earlyYears, rate);
  const lateEnd = futureValue(startCapital, monthlyContribution, lateYears, rate);

  const earlyContributions = startCapital + monthlyContribution * earlyYears * 12;
  const lateContributions = startCapital + monthlyContribution * lateYears * 12;

  // Chart data – year by year from currentAge to targetAge
  const chartData: YearDataPoint[] = [];
  for (let age = currentAge; age <= targetAge; age++) {
    const earlyElapsed = age - currentAge;
    const earlyVal = futureValue(startCapital, monthlyContribution, earlyElapsed, rate);

    let lateVal = startCapital; // during delay, capital sits idle (no growth assumed)
    if (age >= lateStartAge) {
      const lateElapsed = age - lateStartAge;
      lateVal = futureValue(startCapital, monthlyContribution, lateElapsed, rate);
    }

    chartData.push({
      age,
      earlyValue: Math.round(earlyVal),
      lateValue: Math.round(lateVal),
    });
  }

  const reqMonthly = requiredMonthly(earlyEnd, startCapital, lateYears, rate);

  return {
    early: {
      startAge: currentAge,
      years: earlyYears,
      totalContributions: Math.round(earlyContributions),
      endValue: Math.round(earlyEnd),
      profit: Math.round(earlyEnd - earlyContributions),
    },
    late: {
      startAge: lateStartAge,
      years: lateYears,
      totalContributions: Math.round(lateContributions),
      endValue: Math.round(lateEnd),
      profit: Math.round(lateEnd - lateContributions),
    },
    lostWealth: Math.round(earlyEnd - lateEnd),
    lostProfit: Math.round((earlyEnd - earlyContributions) - (lateEnd - lateContributions)),
    lostYearsAtMarket: delayYears,
    requiredMonthlyToMatch: Math.round(reqMonthly),
    chartData,
  };
}

export function formatCHF(value: number): string {
  return value.toLocaleString('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 });
}
