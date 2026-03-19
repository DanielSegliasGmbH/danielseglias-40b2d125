import { useMemo } from 'react';

export type ScenarioKey = 'conservative' | 'realistic' | 'optimistic';

export interface ScenarioConfig {
  key: ScenarioKey;
  label: string;
  description: string;
  annualReturn: number;
  annualVolatility: number;
}

export const SCENARIOS: ScenarioConfig[] = [
  {
    key: 'conservative',
    label: 'Konservativ',
    description: 'Vorsichtige Annahmen bei schwächerer Marktentwicklung',
    annualReturn: 0.07,
    annualVolatility: 0.15,
  },
  {
    key: 'realistic',
    label: 'Realistisch',
    description: 'Langfristiger Durchschnitt globaler Aktienmärkte',
    annualReturn: 0.078,
    annualVolatility: 0.165,
  },
  {
    key: 'optimistic',
    label: 'Optimistisch',
    description: 'Starke Wachstumsphase durch Innovation und Produktivität',
    annualReturn: 0.105,
    annualVolatility: 0.19,
  },
];

export interface SimulationResult {
  buckets: { rangeStart: number; rangeEnd: number; probability: number; isNegative: boolean }[];
  lossProbability: number;
  gainProbability: number;
  meanReturn: number;
  annualizedReturn: number;
  maxReturn: number;
  volatility: number;
  dominantBucket: { rangeStart: number; rangeEnd: number; probability: number };
  annualizedDominantLow: number;
  annualizedDominantHigh: number;
  scenario: ScenarioConfig;
}

const NUM_SIMULATIONS = 5_000;

// Deterministic seeded random for stable results per (year + scenario)
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function boxMullerFromRng(rng: () => number): number {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = rng();
  while (u2 === 0) u2 = rng();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

export function useMonteCarloSimulation(years: number, scenarioKey: ScenarioKey): SimulationResult {
  return useMemo(() => {
    const scenario = SCENARIOS.find((s) => s.key === scenarioKey) ?? SCENARIOS[1];
    const mu = scenario.annualReturn;
    const sigma = scenario.annualVolatility;

    // Seed based on years + scenario for deterministic but varied results
    const seedBase = years * 31337 + (scenarioKey === 'conservative' ? 7 : scenarioKey === 'optimistic' ? 13 : 11);
    const rng = mulberry32(seedBase);

    // Log-normal GBM parameters per year
    // ln(S_t/S_0) ~ N( (mu - sigma^2/2)*t, sigma^2*t )
    const logMu = Math.log(1 + mu) - (sigma * sigma) / 2;
    const logSigma = sigma;

    const totalReturns: number[] = [];

    for (let i = 0; i < NUM_SIMULATIONS; i++) {
      let cumLog = 0;
      // Simulate year-by-year compounding
      for (let y = 0; y < years; y++) {
        const z = boxMullerFromRng(rng);
        cumLog += logMu + logSigma * z;
      }
      // cumLog = ln(S_T / S_0), so total return = exp(cumLog) - 1
      const totalReturn = (Math.exp(cumLog) - 1) * 100; // in %
      totalReturns.push(totalReturn);
    }

    totalReturns.sort((a, b) => a - b);

    // Stats
    const losses = totalReturns.filter((r) => r < 0).length;
    const lossProbability = (losses / NUM_SIMULATIONS) * 100;
    const gainProbability = 100 - lossProbability;
    const meanReturn = totalReturns.reduce((s, r) => s + r, 0) / NUM_SIMULATIONS;
    const maxReturn = totalReturns[totalReturns.length - 1];
    const annualizedReturn = (Math.pow(1 + meanReturn / 100, 1 / years) - 1) * 100;

    // Dynamic bucket sizing based on data range
    const p5 = totalReturns[Math.floor(NUM_SIMULATIONS * 0.02)];
    const p95 = totalReturns[Math.floor(NUM_SIMULATIONS * 0.98)];
    const dataRange = p95 - p5;

    // Choose bucket size to get ~15-25 visible buckets
    let bucketSize = 10;
    if (dataRange > 2000) bucketSize = 200;
    else if (dataRange > 1000) bucketSize = 100;
    else if (dataRange > 500) bucketSize = 50;
    else if (dataRange > 200) bucketSize = 25;
    else if (dataRange > 100) bucketSize = 10;
    else bucketSize = 5;

    const minVal = Math.floor(totalReturns[0] / bucketSize) * bucketSize;
    const maxVal = Math.ceil(totalReturns[totalReturns.length - 1] / bucketSize) * bucketSize;
    const buckets: SimulationResult['buckets'] = [];

    for (let start = minVal; start < maxVal; start += bucketSize) {
      const end = start + bucketSize;
      const count = totalReturns.filter((r) => r >= start && r < end).length;
      buckets.push({
        rangeStart: start,
        rangeEnd: end,
        probability: (count / NUM_SIMULATIONS) * 100,
        isNegative: end <= 0,
      });
    }

    // Find dominant bucket (most probable)
    let dominant = buckets[0];
    for (const b of buckets) {
      if (b.probability > dominant.probability) dominant = b;
    }

    const annualizedDominantLow =
      dominant.rangeStart >= -100
        ? (Math.pow(1 + dominant.rangeStart / 100, 1 / years) - 1) * 100
        : -100;
    const annualizedDominantHigh =
      (Math.pow(1 + dominant.rangeEnd / 100, 1 / years) - 1) * 100;

    return {
      buckets,
      lossProbability: Math.round(lossProbability),
      gainProbability: Math.round(gainProbability),
      meanReturn: Math.round(meanReturn),
      annualizedReturn: Math.round(annualizedReturn * 10) / 10,
      maxReturn: Math.round(maxReturn),
      volatility: Math.round(sigma * 100 * 10) / 10,
      dominantBucket: dominant,
      annualizedDominantLow: Math.round(annualizedDominantLow * 10) / 10,
      annualizedDominantHigh: Math.round(annualizedDominantHigh * 10) / 10,
      scenario,
    };
  }, [years, scenarioKey]);
}
