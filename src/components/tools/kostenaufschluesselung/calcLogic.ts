export interface KostenInputs {
  currentCapital: number;
  annualContribution: number;
  years: number;
  grossReturn: number;
  productType: 'sparkonto' | 'versicherung' | 'wertschriften';
  customCost: number | null;
}

export interface KostenResult {
  idealValue: number;
  inefficientValue: number;
  visibleCosts: number;
  hiddenCosts: number;
  totalDifference: number;
  years: number;
}

const productCosts: Record<string, { visible: number; hidden: number }> = {
  sparkonto: { visible: 0.002, hidden: 0.015 },
  versicherung: { visible: 0.008, hidden: 0.025 },
  wertschriften: { visible: 0.005, hidden: 0.01 },
};

function futureValue(rate: number, years: number, annual: number, start: number): number {
  let v = start;
  for (let i = 0; i < years; i++) {
    v = v * (1 + rate) + annual;
  }
  return v;
}

export function calculate(inp: KostenInputs): KostenResult {
  const costs = productCosts[inp.productType];
  const totalCostRate = inp.customCost !== null ? inp.customCost / 100 : costs.visible + costs.hidden;
  const visibleRate = inp.customCost !== null ? (costs.visible / (costs.visible + costs.hidden)) * totalCostRate : costs.visible;
  const hiddenRate = totalCostRate - visibleRate;

  const idealRate = inp.grossReturn / 100;
  const inefficientRate = Math.max(0, idealRate - totalCostRate);

  const idealValue = futureValue(idealRate, inp.years, inp.annualContribution, inp.currentCapital);
  const inefficientValue = futureValue(inefficientRate, inp.years, inp.annualContribution, inp.currentCapital);
  const totalDifference = Math.max(0, idealValue - inefficientValue);

  const noHiddenRate = Math.max(0, idealRate - visibleRate);
  const noHiddenValue = futureValue(noHiddenRate, inp.years, inp.annualContribution, inp.currentCapital);

  const visibleCosts = Math.max(0, idealValue - noHiddenValue);
  const hiddenCosts = Math.max(0, noHiddenValue - inefficientValue);

  return {
    idealValue,
    inefficientValue,
    visibleCosts,
    hiddenCosts,
    totalDifference,
    years: inp.years,
  };
}

export function formatCHF(value: number): string {
  return Math.round(value).toLocaleString('de-CH');
}

export const MAX_CONTRIBUTION = 7258;
