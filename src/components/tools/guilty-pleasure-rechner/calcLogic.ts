/**
 * Guilty Pleasure Rechner – calculation logic
 */

export interface Habit {
  key: string;
  emoji: string;
  label: string;
  defaultAmount: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  daysPerWeek?: number; // for daily habits that only apply on weekdays
}

export const PRESET_HABITS: Habit[] = [
  { key: 'kaffee', emoji: '☕', label: 'Täglicher Kaffee to-go', defaultAmount: 5.5, frequency: 'daily' },
  { key: 'rauchen', emoji: '🚬', label: 'Rauchen (1 Packung)', defaultAmount: 9, frequency: 'daily' },
  { key: 'lotto', emoji: '🎰', label: 'Lotto spielen', defaultAmount: 10, frequency: 'weekly' },
  { key: 'mittagessen', emoji: '🍔', label: 'Mittagessen auswärts', defaultAmount: 18, frequency: 'daily', daysPerWeek: 5 },
  { key: 'streaming', emoji: '📺', label: 'Streaming-Abos', defaultAmount: 40, frequency: 'monthly' },
  { key: 'auto', emoji: '🚗', label: 'Auto statt ÖV (Differenz)', defaultAmount: 300, frequency: 'monthly' },
];

function annualCost(amount: number, frequency: 'daily' | 'weekly' | 'monthly', daysPerWeek?: number): number {
  switch (frequency) {
    case 'daily':
      return amount * (daysPerWeek ?? 7) * 52;
    case 'weekly':
      return amount * 52;
    case 'monthly':
      return amount * 12;
  }
}

export interface GuiltyPleasureResult {
  annualCost: number;
  workHoursPerYear: number;
  cost10y: number;
  invested10y: number;
  cost30y: number;
  invested30y: number;
  peakScorePerYear: number; // months of freedom per year
  peakScore10y: number;
  freedomYearsGained: number; // how many years earlier financially free
  comparison: string;
}

function futureValue(annualSaving: number, years: number, rate: number): number {
  // Future value of annuity
  if (rate === 0) return annualSaving * years;
  return annualSaving * ((Math.pow(1 + rate, years) - 1) / rate);
}

function getComparison(value: number): string {
  if (value < 5000) return 'ein neues iPhone 📱';
  if (value < 15000) return 'eine Traumreise um die Welt ✈️';
  if (value < 30000) return 'ein nagelneuer Kleinwagen 🚗';
  if (value < 80000) return 'die Anzahlung für eine Eigentumswohnung 🏠';
  if (value < 200000) return 'ein kleines Ferienhaus am See 🏡';
  if (value < 500000) return 'ein beachtliches Anlageportfolio 📊';
  return 'der Grundstein für finanzielle Freiheit 🏆';
}

export function calculateGuiltyPleasure(
  amount: number,
  frequency: 'daily' | 'weekly' | 'monthly',
  netHourlyRate: number,
  monthlyExpenses: number,
  daysPerWeek?: number,
  returnRate = 0.07,
): GuiltyPleasureResult {
  const annual = annualCost(amount, frequency, daysPerWeek);
  const workHoursPerYear = netHourlyRate > 0 ? annual / netHourlyRate : 0;

  const cost10y = annual * 10;
  const invested10y = futureValue(annual, 10, returnRate);
  const cost30y = annual * 30;
  const invested30y = futureValue(annual, 30, returnRate);

  const monthlyFreedom = monthlyExpenses > 0 ? annual / monthlyExpenses : 0;
  const peakScorePerYear = monthlyFreedom; // months per year
  const peakScore10y = monthlyExpenses > 0 ? invested10y / monthlyExpenses : 0;

  // How many years earlier financially free (simplified: invested30y / (monthlyExpenses*12))
  const freedomYearsGained = monthlyExpenses > 0 ? invested30y / (monthlyExpenses * 12) : 0;

  const comparison = getComparison(invested30y);

  return {
    annualCost: annual,
    workHoursPerYear,
    cost10y,
    invested10y,
    cost30y,
    invested30y,
    peakScorePerYear,
    peakScore10y,
    freedomYearsGained,
    comparison,
  };
}
