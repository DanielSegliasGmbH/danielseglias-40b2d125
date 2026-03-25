export interface LebenzeitInput {
  monthlyNetSalary: number;
  workHoursPerMonth: number;
  purchasePrice: number;
  includeTax: boolean;
  taxPercent: number;
}

export interface LebenzeitResult {
  hourlyRate: number;
  effectiveHourlyRate: number;
  hoursForPurchase: number;
  workDays: number;
  workWeeks: number;
  percentOfMonth: number;
}

export function calculateLebenzeit(input: LebenzeitInput): LebenzeitResult | null {
  const { monthlyNetSalary, workHoursPerMonth, purchasePrice, includeTax, taxPercent } = input;

  if (monthlyNetSalary <= 0 || workHoursPerMonth <= 0 || purchasePrice <= 0) return null;

  const hourlyRate = monthlyNetSalary / workHoursPerMonth;
  const effectiveHourlyRate = includeTax
    ? hourlyRate * (1 - Math.min(taxPercent, 99) / 100)
    : hourlyRate;

  if (effectiveHourlyRate <= 0) return null;

  const hoursForPurchase = purchasePrice / effectiveHourlyRate;
  const workDays = hoursForPurchase / 8;
  const workWeeks = hoursForPurchase / 40;
  const percentOfMonth = (hoursForPurchase / workHoursPerMonth) * 100;

  return {
    hourlyRate: Math.round(hourlyRate * 100) / 100,
    effectiveHourlyRate: Math.round(effectiveHourlyRate * 100) / 100,
    hoursForPurchase: Math.round(hoursForPurchase * 10) / 10,
    workDays: Math.round(workDays * 10) / 10,
    workWeeks: Math.round(workWeeks * 10) / 10,
    percentOfMonth: Math.round(percentOfMonth * 10) / 10,
  };
}
