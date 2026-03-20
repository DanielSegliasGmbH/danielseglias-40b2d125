// Zufalls-Realitäts-Check – plausible probability logic

export interface MarketData {
  banks: number;
  insurers: number;
  brokers: number;
  commissionBasedPct: number;
  independentPct: number;
}

export const MARKET_DATA: MarketData = {
  banks: 243,
  insurers: 200,
  brokers: 3500,
  commissionBasedPct: 90,
  independentPct: 8,
};

export type InitiativeAnswer = 'yes' | 'rather_not';
export type TimingAnswer = 'months' | 'years' | 'never';

export interface Step2Answers {
  initiative: InitiativeAnswer;
  timing: TimingAnswer;
}

export interface LifeEvent {
  key: string;
  label: string;
  icon: string;
  reductionPct: number; // how much each event reduces the probability of acting later
}

export const LIFE_EVENTS: LifeEvent[] = [
  { key: 'relationship', label: 'Beziehung / Familie', icon: '❤️', reductionPct: 8 },
  { key: 'children', label: 'Kinder', icon: '👶', reductionPct: 12 },
  { key: 'career', label: 'Karriere / Jobwechsel', icon: '💼', reductionPct: 7 },
  { key: 'stress', label: 'Stress / Alltag', icon: '⏰', reductionPct: 10 },
  { key: 'unexpected', label: 'Unerwartete Ereignisse', icon: '⚡', reductionPct: 8 },
];

export interface FinalResult {
  actLaterPct: number;        // probability of seriously acting later
  independentAdvisorPct: number; // probability of finding truly independent advice
  combinedPct: number;         // combined probability
}

/**
 * Calculate the probability that someone acts on finances later AND finds independent advice.
 */
export function calculateResult(answers: Step2Answers): FinalResult {
  // Base probability of acting later: 50%
  let actLaterPct = 50;

  // Step 2 adjustments
  if (answers.initiative === 'rather_not') {
    actLaterPct -= 15;
  }

  if (answers.timing === 'years') {
    actLaterPct -= 10;
  } else if (answers.timing === 'never') {
    actLaterPct -= 20;
  }

  // Step 3: life events collectively reduce the chance
  const totalReduction = LIFE_EVENTS.reduce((sum, e) => sum + e.reductionPct, 0);
  // Apply reduction as a percentage of remaining probability
  actLaterPct = actLaterPct * (1 - totalReduction / 100);

  // Clamp
  actLaterPct = Math.max(5, Math.min(95, Math.round(actLaterPct)));

  // Independent advisor probability is always market-based
  const independentAdvisorPct = MARKET_DATA.independentPct;

  // Combined probability
  const combinedPct = Math.round((actLaterPct / 100) * (independentAdvisorPct / 100) * 100);

  return {
    actLaterPct,
    independentAdvisorPct,
    combinedPct: Math.max(1, combinedPct),
  };
}
