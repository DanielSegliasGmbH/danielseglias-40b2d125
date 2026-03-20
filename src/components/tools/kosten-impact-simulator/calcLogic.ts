export interface ImpactInputs {
  startCapital: number;
  annualContribution: number;
  years: number;
  expectedReturn: number;
  costA: number;
  costB: number;
}

export interface YearlyDataPoint {
  year: number;
  valueA: number;
  valueB: number;
}

export interface ImpactResult {
  finalA: number;
  finalB: number;
  difference: number;
  costDiffPct: number;
  years: number;
  chartData: YearlyDataPoint[];
}

export const MAX_CONTRIBUTION = 7258;

function buildSeries(
  rate: number,
  years: number,
  annual: number,
  start: number,
): number[] {
  const values: number[] = [start];
  let v = start;
  for (let i = 1; i <= years; i++) {
    v = v * (1 + rate) + annual;
    values.push(v);
  }
  return values;
}

export function calculate(inp: ImpactInputs): ImpactResult {
  const rateA = Math.max(0, (inp.expectedReturn - inp.costA) / 100);
  const rateB = Math.max(0, (inp.expectedReturn - inp.costB) / 100);

  const seriesA = buildSeries(rateA, inp.years, inp.annualContribution, inp.startCapital);
  const seriesB = buildSeries(rateB, inp.years, inp.annualContribution, inp.startCapital);

  const chartData: YearlyDataPoint[] = seriesA.map((vA, i) => ({
    year: i,
    valueA: Math.round(vA),
    valueB: Math.round(seriesB[i]),
  }));

  const finalA = seriesA[seriesA.length - 1];
  const finalB = seriesB[seriesB.length - 1];

  return {
    finalA,
    finalB,
    difference: Math.max(0, finalB - finalA),
    costDiffPct: Math.abs(inp.costA - inp.costB),
    years: inp.years,
    chartData,
  };
}

export function formatCHF(value: number): string {
  return Math.round(value).toLocaleString('de-CH');
}
