export interface ScenarioInputs {
  r: number;       // Rendite nominal %
  ter: number;     // TER %
  prod: number;    // Produktkosten p.a. %
  aa: number;      // Ausgabeaufschlag %
  rueckk: number;  // Rücknahmekommission %
  mantel: number;  // Mantelkosten %
  fee: number;     // Fix CHF (Honorar or Gesellschaftsprognose)
  start: number;   // Startkapital or Rückkaufswert
  rate: number;    // Monatliche Rate
  years: number;   // Laufzeit
}

export interface ScenarioResult {
  existingCapital: number;
  newDeposits: number;
  totalDeposits: number;
  prodCost: number;
  terCost: number;
  costAA: number;
  mantelTotal: number;
  rueckCost: number;
  fee: number;
  totalCosts: number;
  endPayout: number;
  monthlyPension: number;
}

export function scenario(inp: ScenarioInputs): ScenarioResult {
  const { r, ter, prod, aa, rueckk, mantel, fee, start, rate, years } = inp;

  const yearlyDeposit = rate * 12;
  const costAAPerYear = yearlyDeposit * (aa / 100);
  const netDepositPerYear = yearlyDeposit - costAAPerYear;
  const mantelTotal = yearlyDeposit * years * (mantel / 100);

  let bal = start;
  let totalTer = 0;
  let totalProd = 0;

  for (let i = 0; i < years; i++) {
    const interest = bal * (r / 100);
    const terY = bal * (ter / 100);
    const prodY = bal * (prod / 100);
    totalTer += terY;
    totalProd += prodY;
    bal = bal + netDepositPerYear + interest - terY - prodY;
  }

  const bruttoPayout = bal;
  const rueckCost = bruttoPayout * (rueckk / 100);
  const endPayout = Math.max(0, bruttoPayout - rueckCost - mantelTotal - fee);
  const monthlyPension = endPayout / 300;

  const totalCostAA = costAAPerYear * years;

  const totalCosts = totalProd + totalTer + totalCostAA + mantelTotal + rueckCost + fee;

  return {
    existingCapital: start,
    newDeposits: yearlyDeposit * years,
    totalDeposits: start + yearlyDeposit * years,
    prodCost: totalProd,
    terCost: totalTer,
    costAA: totalCostAA,
    mantelTotal,
    rueckCost,
    fee,
    totalCosts,
    endPayout,
    monthlyPension,
  };
}

export function solveRateForTarget(
  target: number,
  inp: Omit<ScenarioInputs, 'rate'>
): number {
  let lo = 0;
  let hi = 50000;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const res = scenario({ ...inp, rate: mid });
    if (res.endPayout < target) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return (lo + hi) / 2;
}

export function formatCHF(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return rounded.toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
