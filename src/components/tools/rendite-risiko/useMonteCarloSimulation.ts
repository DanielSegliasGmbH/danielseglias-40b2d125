import { useMemo } from 'react';

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
}

const NUM_SIMULATIONS = 10_000;
const ANNUAL_RETURN = 0.105;
const ANNUAL_VOLATILITY = 0.21;

// Deterministic seeded random for stable results per year
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

export function useMonteCarloSimulation(years: number): SimulationResult {
  return useMemo(() => {
    const rng = mulberry32(years * 31337);
    const mu = ANNUAL_RETURN;
    const sigma = ANNUAL_VOLATILITY;

    // Log-normal parameters per year
    const logMu = Math.log(1 + mu) - (sigma * sigma) / 2;
    const logSigma = sigma;

    const totalReturns: number[] = [];

    for (let i = 0; i < NUM_SIMULATIONS; i++) {
      let cumLog = 0;
      for (let y = 0; y < years; y++) {
        const z = boxMullerFromRng(rng);
        cumLog += logMu + logSigma * z;
      }
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

    // Dynamic bucket sizing
    const minVal = Math.floor(totalReturns[0] / 50) * 50;
    const maxVal = Math.ceil(totalReturns[totalReturns.length - 1] / 50) * 50;
    const bucketSize = 50;
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

    // Find dominant bucket
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
      volatility: ANNUAL_VOLATILITY * 100,
      dominantBucket: dominant,
      annualizedDominantLow: Math.round(annualizedDominantLow * 10) / 10,
      annualizedDominantHigh: Math.round(annualizedDominantHigh * 10) / 10,
    };
  }, [years]);
}
