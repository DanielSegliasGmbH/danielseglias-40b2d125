/**
 * Converts a PeakScore impact (in months) to a human-readable freedom duration.
 * Examples:
 *   0.1  → "3 Tage"
 *   0.5  → "2 Wochen"
 *   1.0  → "1 Monat"
 *   6.0  → "6 Monate"
 *   12.0 → "1 Jahr"
 *   24.0 → "2 Jahre"
 */
export function formatPeakScoreDuration(months: number): string {
  const abs = Math.abs(months);

  if (abs < 0.03) return '1 Tag';

  // Under ~0.5 months → days
  if (abs < 0.5) {
    const days = Math.round(abs * 30);
    return days === 1 ? '1 Tag' : `${days} Tage`;
  }

  // 0.5 to <1.5 → weeks
  if (abs < 1.5) {
    const weeks = Math.round(abs * 4.33);
    return weeks === 1 ? '1 Woche' : `${weeks} Wochen`;
  }

  // 1.5 to <12 → months
  if (abs < 12) {
    const m = Math.round(abs);
    return m === 1 ? '1 Monat' : `${m} Monate`;
  }

  // 12+ → years (with optional months)
  const years = Math.floor(abs / 12);
  const remainingMonths = Math.round(abs % 12);
  const yearStr = years === 1 ? '1 Jahr' : `${years} Jahre`;
  if (remainingMonths === 0) return yearStr;
  const monthStr = remainingMonths === 1 ? '1 Monat' : `${remainingMonths} Monate`;
  return `${yearStr}, ${monthStr}`;
}

/**
 * Formats a PeakScore impact with gain/loss framing.
 * positive → "X mehr Freiheit"
 * negative → "X Freiheit"
 */
export function formatPeakScoreImpact(months: number): string {
  const duration = formatPeakScoreDuration(months);
  if (months > 0) return `${duration} mehr Freiheit`;
  return `${duration} Freiheit`;
}

/**
 * Full sentence for expense context: "Diese Ausgabe kostet dich X Tage finanzielle Freiheit."
 */
export function formatExpenseImpact(months: number): string {
  const duration = formatPeakScoreDuration(months);
  return `Diese Ausgabe kostet dich ${duration} finanzielle Freiheit.`;
}

/**
 * Full sentence for asset context: "Dieser Vermögenswert gibt dir X mehr Freiheit."
 */
export function formatAssetImpact(months: number): string {
  const duration = formatPeakScoreDuration(months);
  return `Dieser Vermögenswert gibt dir ${duration} mehr Freiheit.`;
}

/**
 * Snapshot trend sentence.
 */
export function formatSnapshotTrend(months: number): string {
  const duration = formatPeakScoreDuration(months);
  if (months > 0) return `Seit deinem letzten Snapshot: +${duration} Freiheit gewonnen`;
  return `Seit deinem letzten Snapshot: ${duration} Freiheit verloren`;
}

/**
 * Goal impact sentence.
 */
export function formatGoalImpact(months: number): string {
  const duration = formatPeakScoreDuration(months);
  return `Wenn du dieses Ziel erreichst, gewinnst du ${duration} Freiheit.`;
}

/**
 * Tool recommendation impact.
 */
export function formatToolImpact(monthsPerYear: number): string {
  const duration = formatPeakScoreDuration(monthsPerYear);
  return `+${duration} Freiheit pro Jahr`;
}
