export interface ProbabilityInputs {
  age: number;
  monthlyIncome: number;
  monthlySavings: number;
  currentWealth: number;
  investmentType: 'sparkonto' | 'versicherung' | 'etf';
  goal: 'early_retirement' | 'financial_freedom' | 'homeownership';
  riskTolerance: number; // 1-5
  discipline: number;    // 1-5
}

export interface ProbabilityResult {
  probability: number;           // 0-100
  optimizedProbability: number;  // 0-100 with ETF
  currentEndWealth: number;
  optimizedEndWealth: number;
  targetCapital: number;
  yearsToGoal: number;
  missedPotential: number;
  factors: {
    label: string;
    score: number;
    weight: number;
  }[];
}

const returnRates: Record<string, number> = {
  sparkonto: 0.005,
  versicherung: 0.02,
  etf: 0.06,
};

const OPTIMIZED_RATE = 0.06;

function futureValue(monthlyContribution: number, annualRate: number, years: number, startCapital: number): number {
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  let value = startCapital;
  for (let m = 0; m < months; m++) {
    value = value * (1 + monthlyRate) + monthlyContribution;
  }
  return value;
}

function getTargetCapital(goal: ProbabilityInputs['goal'], monthlyIncome: number): number {
  const annualIncome = monthlyIncome * 12;
  switch (goal) {
    case 'early_retirement':
      return annualIncome * 25;
    case 'financial_freedom':
      return annualIncome * 25;
    case 'homeownership':
      return 800000 * 0.2; // 20% of 800k
    default:
      return annualIncome * 25;
  }
}

function getTargetAge(goal: ProbabilityInputs['goal']): number {
  switch (goal) {
    case 'early_retirement':
      return 60;
    case 'financial_freedom':
      return 65;
    case 'homeownership':
      return 45;
    default:
      return 65;
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export function calculate(inp: ProbabilityInputs): ProbabilityResult {
  const targetAge = getTargetAge(inp.goal);
  const yearsToGoal = Math.max(1, targetAge - inp.age);
  const targetCapital = getTargetCapital(inp.goal, inp.monthlyIncome);

  const currentRate = returnRates[inp.investmentType];
  const currentEndWealth = futureValue(inp.monthlySavings, currentRate, yearsToGoal, inp.currentWealth);
  const optimizedEndWealth = futureValue(inp.monthlySavings, OPTIMIZED_RATE, yearsToGoal, inp.currentWealth);

  // Factor scoring (each 0-100)
  const savingsRatio = inp.monthlyIncome > 0 ? inp.monthlySavings / inp.monthlyIncome : 0;
  const savingsScore = clamp(savingsRatio * 500, 0, 100); // 20% savings = 100

  const investmentScores: Record<string, number> = { sparkonto: 20, versicherung: 45, etf: 90 };
  const investmentScore = investmentScores[inp.investmentType];

  const ageScore = clamp(((45 - inp.age) / 25) * 100, 10, 100); // younger = better

  const efficiencyScore = clamp((currentEndWealth / targetCapital) * 100, 0, 100);

  const disciplineScore = (inp.discipline / 5) * 100;

  const factors = [
    { label: 'Sparquote', score: Math.round(savingsScore), weight: 25 },
    { label: 'Anlageform', score: Math.round(investmentScore), weight: 25 },
    { label: 'Startalter', score: Math.round(ageScore), weight: 20 },
    { label: 'Effizienz', score: Math.round(efficiencyScore), weight: 15 },
    { label: 'Disziplin', score: Math.round(disciplineScore), weight: 15 },
  ];

  const probability = clamp(
    Math.round(factors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0)),
    2, 98,
  );

  // Optimized probability (same formula but with ETF score)
  const optFactors = factors.map(f =>
    f.label === 'Anlageform' ? { ...f, score: 90 } :
    f.label === 'Effizienz' ? { ...f, score: Math.round(clamp((optimizedEndWealth / targetCapital) * 100, 0, 100)) } :
    f,
  );
  const optimizedProbability = clamp(
    Math.round(optFactors.reduce((sum, f) => sum + (f.score * f.weight) / 100, 0)),
    2, 98,
  );

  return {
    probability,
    optimizedProbability,
    currentEndWealth,
    optimizedEndWealth,
    targetCapital,
    yearsToGoal,
    missedPotential: Math.max(0, optimizedEndWealth - currentEndWealth),
    factors,
  };
}

export function formatCHF(value: number): string {
  return Math.round(value).toLocaleString('de-CH');
}

export function getColor(pct: number): 'destructive' | 'warning' | 'success' {
  if (pct < 40) return 'destructive';
  if (pct < 70) return 'warning';
  return 'success';
}

export function getConsequenceText(pct: number, goal: ProbabilityInputs['goal']): string {
  if (pct >= 70) {
    return 'Du bist auf einem sehr guten Weg. Mit etwas Feintuning kannst du dein Ziel sicher erreichen.';
  }
  switch (goal) {
    case 'early_retirement':
      return pct < 40
        ? 'Mit deiner aktuellen Strategie wirst du voraussichtlich länger als geplant arbeiten müssen.'
        : 'Du bist auf einem ordentlichen Weg, aber es gibt noch Verbesserungspotenzial.';
    case 'financial_freedom':
      return pct < 40
        ? 'Dein aktueller Weg reicht nicht aus, um dein gewünschtes Leben zu finanzieren.'
        : 'Du bist auf dem Weg, aber eine Optimierung würde den Unterschied machen.';
    case 'homeownership':
      return pct < 40
        ? 'Mit deiner aktuellen Sparstrategie wird das Eigenheim schwer erreichbar sein.'
        : 'Du bist nicht weit weg – mit einer besseren Anlageform kommst du deutlich schneller ans Ziel.';
    default:
      return 'Dein aktueller Weg hat Verbesserungspotenzial.';
  }
}
