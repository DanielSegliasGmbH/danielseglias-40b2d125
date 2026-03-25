export interface RolexInput {
  targetPrice: number;
  annualReturn: number; // as decimal, e.g. 0.07
  startCapital: number;
  monthlyContribution: number;
}

export interface RolexResult {
  requiredCapital: number;
  yearsToGoal: number;
  totalInvested: number;
  annualInterestAtGoal: number;
  currentProgress: number; // percentage 0-100
  wealthOverTime: { year: number; wealth: number }[];
}

export interface RolexDelayResult {
  yearsToGoalDelayed: number;
  extraYears: number;
  totalInvestedDelayed: number;
  opportunityCost: number;
}

export function calculateRolex(input: RolexInput): RolexResult | null {
  const { targetPrice, annualReturn, startCapital, monthlyContribution } = input;

  if (targetPrice <= 0 || annualReturn <= 0) return null;
  if (startCapital < 0 || monthlyContribution < 0) return null;
  if (startCapital === 0 && monthlyContribution === 0) return null;

  const requiredCapital = targetPrice / annualReturn;
  const monthlyRate = annualReturn / 12;

  // Simulate month by month
  let wealth = startCapital;
  let months = 0;
  const maxMonths = 100 * 12; // 100 years cap
  const wealthOverTime: { year: number; wealth: number }[] = [{ year: 0, wealth: startCapital }];

  while (wealth < requiredCapital && months < maxMonths) {
    wealth = wealth * (1 + monthlyRate) + monthlyContribution;
    months++;
    if (months % 12 === 0) {
      wealthOverTime.push({ year: months / 12, wealth: Math.round(wealth) });
    }
  }

  // Add final point if not on a year boundary
  const years = months / 12;
  if (months % 12 !== 0) {
    wealthOverTime.push({ year: Math.round(years * 10) / 10, wealth: Math.round(wealth) });
  }

  const totalInvested = startCapital + monthlyContribution * months;
  const currentProgress = Math.min((startCapital / requiredCapital) * 100, 100);

  return {
    requiredCapital: Math.round(requiredCapital),
    yearsToGoal: Math.round(years * 10) / 10,
    totalInvested: Math.round(totalInvested),
    annualInterestAtGoal: Math.round(requiredCapital * annualReturn),
    currentProgress: Math.round(currentProgress * 10) / 10,
    wealthOverTime,
  };
}

export function calculateDelay(input: RolexInput, delayYears: number): RolexDelayResult | null {
  const base = calculateRolex(input);
  if (!base) return null;

  const delayed = calculateRolex({
    ...input,
    startCapital: 0, // after delay, startCapital didn't grow
  });
  if (!delayed) return null;

  const yearsToGoalDelayed = delayed.yearsToGoal + delayYears;
  const extraYears = yearsToGoalDelayed - base.yearsToGoal;

  // Opportunity cost: what the start capital + contributions would have earned during delay
  const monthlyRate = input.annualReturn / 12;
  let lostWealth = input.startCapital;
  for (let m = 0; m < delayYears * 12; m++) {
    lostWealth = lostWealth * (1 + monthlyRate) + input.monthlyContribution;
  }
  const opportunityCost = Math.round(lostWealth - input.startCapital - input.monthlyContribution * delayYears * 12);

  return {
    yearsToGoalDelayed: Math.round(yearsToGoalDelayed * 10) / 10,
    extraYears: Math.round(extraYears * 10) / 10,
    totalInvestedDelayed: Math.round(input.monthlyContribution * delayed.yearsToGoal * 12),
    opportunityCost,
  };
}
