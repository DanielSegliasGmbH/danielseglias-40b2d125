export interface VerlustInputs {
  currentAge: number;
  retirementAge: number;
  annualContribution: number;
  currentSolution: 'versicherung' | 'bank' | 'investiert';
  startCapital: number;
}

export interface VerlustResult {
  years: number;
  currentValue: number;
  optimizedValue: number;
  loss: number;
}

export const MAX_CONTRIBUTION = 7258;

const rates: Record<string, number> = {
  versicherung: 0.02,
  bank: 0.01,
  investiert: 0.035,
  optimiert: 0.06,
};

function futureValue(rate: number, years: number, annual: number, start: number): number {
  let value = start;
  for (let i = 0; i < years; i++) {
    value = value * (1 + rate) + annual;
  }
  return value;
}

export function calculate(inp: VerlustInputs): VerlustResult {
  const years = Math.max(0, inp.retirementAge - inp.currentAge);
  const currentValue = futureValue(rates[inp.currentSolution], years, inp.annualContribution, inp.startCapital);
  const optimizedValue = futureValue(rates.optimiert, years, inp.annualContribution, inp.startCapital);
  return {
    years,
    currentValue,
    optimizedValue,
    loss: Math.max(0, optimizedValue - currentValue),
  };
}

export function formatCHF(value: number): string {
  return Math.round(value).toLocaleString('de-CH');
}
