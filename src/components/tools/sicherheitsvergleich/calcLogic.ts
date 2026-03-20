export interface SimResult {
  year: number;
  savingsReal: number;   // purchasing power of savings account
  savingsNominal: number; // nominal value (stays flat)
  investmentValue: number; // investment with volatility
}

/**
 * Generate year-by-year comparison data.
 * Left: savings account losing purchasing power to inflation.
 * Right: investment with simulated volatility but long-term growth.
 */
export function calculateComparison(
  startCapital: number,
  years: number,
  inflationPct: number,
  returnPct: number,
): SimResult[] {
  const results: SimResult[] = [];
  const inflation = inflationPct / 100;
  const netReturn = returnPct / 100;

  // Deterministic "volatility" pattern for reproducibility
  const volatilityPattern = [
    0.12, -0.04, 0.08, 0.15, -0.10,
    0.18, 0.02, -0.15, 0.22, 0.06,
    -0.08, 0.14, 0.10, -0.03, 0.20,
    -0.12, 0.16, 0.05, -0.06, 0.11,
    0.09, -0.18, 0.25, 0.04, -0.07,
    0.13, 0.08, -0.05, 0.17, 0.03,
    -0.09, 0.19, 0.07, -0.02, 0.14,
    0.06, -0.11, 0.21, 0.01, -0.04,
    0.16, 0.10, -0.08, 0.12, 0.05,
  ];

  let savingsReal = startCapital;
  let savingsNominal = startCapital;
  let investmentValue = startCapital;

  results.push({ year: 0, savingsReal, savingsNominal, investmentValue });

  for (let y = 1; y <= years; y++) {
    // Savings: nominal stays, real loses to inflation
    savingsReal = savingsReal * (1 - inflation);

    // Investment: apply volatility-adjusted return
    // Scale pattern so long-run average ≈ netReturn
    const patternIdx = (y - 1) % volatilityPattern.length;
    const rawReturn = volatilityPattern[patternIdx];
    // Shift pattern so mean matches target return
    const adjustedReturn = rawReturn + (netReturn - 0.05); // pattern averages ~5%
    investmentValue = investmentValue * (1 + adjustedReturn);

    results.push({
      year: y,
      savingsReal: Math.round(savingsReal),
      savingsNominal: Math.round(savingsNominal),
      investmentValue: Math.round(investmentValue),
    });
  }

  return results;
}
