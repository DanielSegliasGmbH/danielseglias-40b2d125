/**
 * Journey Nudge Schedule — 365-day guided user journey
 *
 * Each nudge has a day_number, type, title, content, CTA link,
 * and optional conditions for adaptive content.
 */

export type NudgeType = 'micro' | 'weekly' | 'monthly' | 'phase-transition';

export interface JourneyNudge {
  day: number;
  key: string;
  type: NudgeType;
  emoji: string;
  title: string;
  content: string;
  cta: string;
  ctaLabel: string;
  /** Only show if finanz_type matches */
  ifFinanzTyp?: string;
  /** Skip if user already completed this action */
  skipIf?: string;
  /** XP awarded on completion */
  xp?: number;
}

// ─── DAYS 1–90: Onboarding & Klarheit ───────────────────────────

const PHASE_1_NUDGES: JourneyNudge[] = [
  {
    day: 1, key: 'day1-welcome', type: 'phase-transition', emoji: '🌱',
    title: 'Willkommen bei FinLife!',
    content: 'Erstelle deinen Avatar, lies dein Manifest und starte deine erste Aufgabe.',
    cta: '/app/client-portal/avatar', ctaLabel: 'Avatar erstellen',
    xp: 50,
  },
  {
    day: 2, key: 'day2-peakscore', type: 'micro', emoji: '📊',
    title: 'Dein PeakScore',
    content: 'Schau deinen PeakScore heute an — er hat sich vielleicht schon verändert.',
    cta: '/app/client-portal/peak-score', ctaLabel: 'PeakScore ansehen',
  },
  {
    day: 3, key: 'day3-assets', type: 'micro', emoji: '💰',
    content: 'Erfasse deine wichtigsten Vermögenswerte im Snapshot.',
    title: 'Erste Woche — Vermögen erfassen',
    cta: '/app/client-portal/snapshot', ctaLabel: 'Snapshot starten',
    xp: 25,
  },
  {
    day: 5, key: 'day5-article', type: 'micro', emoji: '📖',
    title: 'Erster Artikel für dich',
    content: 'In der Wissensbibliothek wartet ein Artikel, der zu deiner Situation passt.',
    cta: '/app/client-portal/library', ctaLabel: 'Bibliothek öffnen',
  },
  {
    day: 7, key: 'day7-reflection', type: 'weekly', emoji: '🪞',
    title: 'Erste Wochen-Reflexion',
    content: 'Eine Woche dabei! Zeit für deine erste Reflexion — was hast du diese Woche gelernt?',
    cta: '/app/client-portal/journey', ctaLabel: 'Reflexion starten',
    xp: 50,
  },
  {
    day: 10, key: 'day10-streak', type: 'micro', emoji: '🔥',
    title: 'Dein Streak zählt',
    content: 'Schaust du regelmässig? Dein Streak zeigt deine Konstanz.',
    cta: '/app/client-portal', ctaLabel: 'Streak ansehen',
  },
  {
    day: 14, key: 'day14-snapshot', type: 'weekly', emoji: '📸',
    title: '2 Wochen dabei!',
    content: 'Zeit für einen vollständigen Snapshot — wo stehst du finanziell?',
    cta: '/app/client-portal/snapshot', ctaLabel: 'Snapshot erstellen',
    xp: 75,
  },
  {
    day: 21, key: 'day21-habits', type: 'weekly', emoji: '🔁',
    title: 'Gewohnheiten zeigen Wirkung',
    content: 'Drei Wochen aktiv — schau, wie sich dein Verhalten verändert hat.',
    cta: '/app/client-portal/habits', ctaLabel: 'Gewohnheiten ansehen',
    xp: 25,
  },
  {
    day: 30, key: 'day30-phase2', type: 'phase-transition', emoji: '🎉',
    title: 'Phase 2 freigeschaltet!',
    content: 'Ein Monat FinLife! Du hast Phase „Grundlagen" erreicht — neue Tools warten auf dich.',
    cta: '/app/client-portal/journey', ctaLabel: 'Neue Features entdecken',
    xp: 200,
  },
  {
    day: 35, key: 'day35-kontenmodell', type: 'micro', emoji: '🏦',
    title: 'Das Konten-Modell',
    content: 'Dein neues Tool: Wie solltest du deine Konten strukturieren?',
    cta: '/app/client-portal/tools/konten-modell', ctaLabel: 'Tool öffnen',
  },
  {
    day: 42, key: 'day42-coach', type: 'weekly', emoji: '🎓',
    title: '6 Wochen — Coach-Fortschritt',
    content: 'Wie weit bist du im Finanz-Coach? Jedes Modul bringt dich weiter.',
    cta: '/app/client-portal/coach', ctaLabel: 'Coach öffnen',
    xp: 50,
  },
  {
    day: 49, key: 'day49-budget', type: 'weekly', emoji: '📋',
    title: 'Budget-Check',
    content: 'Hast du dein Budget diesen Monat aktualisiert? Ein kurzer Blick reicht.',
    cta: '/app/client-portal/budget', ctaLabel: 'Budget öffnen',
  },
  {
    day: 56, key: 'day56-goals', type: 'weekly', emoji: '🎯',
    title: '8 Wochen — Ziele überprüfen',
    content: 'Bist du auf Kurs? Überprüfe deine Ziele und passe sie an.',
    cta: '/app/client-portal/goals', ctaLabel: 'Ziele ansehen',
    xp: 25,
  },
  {
    day: 60, key: 'day60-phase3', type: 'phase-transition', emoji: '⚡',
    title: 'Phase 3: Optimierung!',
    content: 'Zwei Monate aktiv — du hast Phase „Optimierung" freigeschaltet. Steuer-Check, Versicherungs-Check und mehr!',
    cta: '/app/client-portal/journey', ctaLabel: 'Neue Features entdecken',
    xp: 200,
  },
  {
    day: 65, key: 'day65-steuer', type: 'micro', emoji: '🧾',
    title: 'Steuer-Check',
    content: 'Nutze den neuen Steuer-Check — wie viel könntest du sparen?',
    cta: '/app/client-portal/tools/steuer-check', ctaLabel: 'Steuer-Check starten',
  },
  {
    day: 70, key: 'day70-versicherung', type: 'micro', emoji: '🛡️',
    title: 'Versicherungs-Check',
    content: 'Bist du über- oder unterversichert? Finde es heraus.',
    cta: '/app/client-portal/tools/versicherungs-check', ctaLabel: 'Check starten',
  },
  {
    day: 77, key: 'day77-abo', type: 'weekly', emoji: '💳',
    title: 'Abo-Audit',
    content: 'Welche Abos brauchst du wirklich? Der Abo-Audit zeigt es.',
    cta: '/app/client-portal/tools/abo-audit', ctaLabel: 'Audit starten',
    xp: 50,
  },
  {
    day: 84, key: 'day84-3saeulen', type: 'weekly', emoji: '🏛️',
    title: 'Dein 3-Säulen-Check',
    content: '12 Wochen aktiv — wie stehen deine drei Säulen der Vorsorge?',
    cta: '/app/client-portal/tools/3-saeulen-rechner', ctaLabel: 'Rechner öffnen',
    xp: 50,
  },
  {
    day: 90, key: 'day90-phase4', type: 'phase-transition', emoji: '🚀',
    title: 'Phase 4: Vertiefung!',
    content: 'Drei Monate FinLife! Der fortgeschrittene Finanz-Coach und viele neue Tools sind jetzt verfügbar.',
    cta: '/app/client-portal/journey', ctaLabel: 'Alles entdecken',
    xp: 300,
  },
];

// ─── DAYS 91–180: Intermediate ──────────────────────────────────

const PHASE_2_NUDGES: JourneyNudge[] = [
  {
    day: 100, key: 'day100-finanzplan', type: 'micro', emoji: '📐',
    title: 'Dein Finanzplan',
    content: 'Erstelle deinen persönlichen Finanzplan — Schritt für Schritt.',
    cta: '/app/client-portal/tools/finanzplan', ctaLabel: 'Finanzplan starten',
    xp: 75,
  },
  {
    day: 110, key: 'day110-humankapital', type: 'micro', emoji: '🧠',
    title: 'Dein Humankapital',
    content: 'Was bist du auf dem Arbeitsmarkt wert? Berechne dein Humankapital.',
    cta: '/app/client-portal/tools/humankapital', ctaLabel: 'Berechnen',
  },
  {
    day: 120, key: 'day120-phase5', type: 'phase-transition', emoji: '🏔️',
    title: 'Phase 5: Advanced!',
    content: 'Vier Monate aktiv — fortgeschrittene Features wie AHV-Tracker und Expat-Szenarien warten.',
    cta: '/app/client-portal/journey', ctaLabel: 'Neue Features sehen',
    xp: 300,
  },
  {
    day: 135, key: 'day135-challenge', type: 'weekly', emoji: '⚔️',
    title: 'Fordere jemanden heraus!',
    content: 'Starte eine PeakScore-Challenge mit einem Freund.',
    cta: '/app/client-portal/challenges', ctaLabel: 'Challenge starten',
    xp: 50,
  },
  {
    day: 150, key: 'day150-halftime', type: 'monthly', emoji: '🏅',
    title: 'Halbzeit!',
    content: '150 Tage FinLife — du hast schon so viel erreicht. Schau auf deine Reise zurück.',
    cta: '/app/client-portal/journey', ctaLabel: 'Meine Reise',
    xp: 100,
  },
  {
    day: 180, key: 'day180-lastplan', type: 'monthly', emoji: '📝',
    title: 'Vorsorge planen',
    content: 'Ein halbes Jahr dabei. Zeit für „Mein letzter Plan" — Vorsorgevollmacht und mehr.',
    cta: '/app/client-portal/last-plan', ctaLabel: 'Plan starten',
    xp: 100,
  },
];

// ─── DAYS 181–365: Advanced ─────────────────────────────────────

const PHASE_3_NUDGES: JourneyNudge[] = [
  {
    day: 200, key: 'day200-expat', type: 'micro', emoji: '✈️',
    title: 'Auswandern?',
    content: 'Falls du jemals ans Auswandern denkst — schau dir die Expat-Szenarien an.',
    cta: '/app/client-portal/expat', ctaLabel: 'Expat-Planer öffnen',
  },
  {
    day: 240, key: 'day240-snapshot-refresh', type: 'monthly', emoji: '📸',
    title: 'Snapshot aktualisieren',
    content: '8 Monate — aktualisiere deinen Snapshot und sieh deinen Fortschritt.',
    cta: '/app/client-portal/snapshot', ctaLabel: 'Snapshot öffnen',
    xp: 50,
  },
  {
    day: 270, key: 'day270-review', type: 'monthly', emoji: '📊',
    title: '9-Monats-Review',
    content: 'Drei Quartale geschafft. Wie hat sich dein PeakScore entwickelt?',
    cta: '/app/client-portal/peak-score', ctaLabel: 'PeakScore ansehen',
    xp: 75,
  },
  {
    day: 300, key: 'day300-referral', type: 'micro', emoji: '🤝',
    title: 'Teile FinLife',
    content: '300 Tage! Kennst du jemanden, dem FinLife auch helfen würde?',
    cta: '/app/client-portal/referral', ctaLabel: 'Freund einladen',
    xp: 100,
  },
  {
    day: 330, key: 'day330-prep', type: 'monthly', emoji: '🗓️',
    title: 'Jahresend-Vorbereitung',
    content: 'Bald ist ein Jahr rum — bereite deinen Jahresrückblick vor.',
    cta: '/app/client-portal/journey', ctaLabel: 'Reise ansehen',
    xp: 50,
  },
  {
    day: 365, key: 'day365-anniversary', type: 'phase-transition', emoji: '🏆',
    title: 'Ein Jahr FinLife!',
    content: 'Du hast es geschafft — ein ganzes Jahr finanzielle Klarheit. Zeit für deinen grossen Rückblick.',
    cta: '/app/client-portal/journey', ctaLabel: 'Jahresrückblick starten',
    xp: 500,
  },
];

// ─── Finanz-Typ Adaptations (overlay nudges) ────────────────────

const FINANZTYP_NUDGES: JourneyNudge[] = [
  {
    day: 8, key: 'skeptiker-day8', type: 'micro', emoji: '🏦',
    title: 'Für Sparsame Skeptiker',
    content: 'Du sparst gut — aber investierst du auch? Schau dir die Anlage-Grundlagen an.',
    cta: '/app/client-portal/library', ctaLabel: 'Artikel lesen',
    ifFinanzTyp: 'skeptiker',
  },
  {
    day: 8, key: 'geniesser-day8', type: 'micro', emoji: '🎢',
    title: 'Für Planlose Geniesser',
    content: 'Struktur muss nicht langweilig sein. Starte mit einem einfachen Budget.',
    cta: '/app/client-portal/budget', ctaLabel: 'Budget erstellen',
    ifFinanzTyp: 'geniesser',
  },
  {
    day: 8, key: 'pflichterfueller-day8', type: 'micro', emoji: '✅',
    title: 'Für Pflichterfüller',
    content: 'Du machst alles richtig — aber optimierst du auch? Finde Potenzial.',
    cta: '/app/client-portal/tools', ctaLabel: 'Tools entdecken',
    ifFinanzTyp: 'pflichterfueller',
  },
];

/** All nudges sorted by day */
export const JOURNEY_SCHEDULE: JourneyNudge[] = [
  ...PHASE_1_NUDGES,
  ...PHASE_2_NUDGES,
  ...PHASE_3_NUDGES,
  ...FINANZTYP_NUDGES,
].sort((a, b) => a.day - b.day);

/**
 * Get the nudge for a specific day, considering finanz-typ.
 * Uses skip/delay logic:
 * - Day 1-7: re-deliver next day
 * - Day 8-30: re-deliver in 3 days
 * - Day 31+: queue, show when active
 */
export function getNudgeForDay(
  daysSinceSignup: number,
  deliveredKeys: Set<string>,
  finanzTyp: string | null,
): JourneyNudge | null {
  // Filter by finanz-typ
  const eligible = JOURNEY_SCHEDULE.filter(n => {
    if (n.ifFinanzTyp && n.ifFinanzTyp !== finanzTyp) return false;
    if (deliveredKeys.has(n.key)) return false;
    return true;
  });

  // Exact day match first
  const exact = eligible.find(n => n.day === daysSinceSignup);
  if (exact) return exact;

  // Re-delivery logic: find missed nudges
  const missed = eligible.filter(n => n.day < daysSinceSignup);
  if (missed.length === 0) return null;

  // Pick the most recent missed nudge that's within re-delivery window
  for (let i = missed.length - 1; i >= 0; i--) {
    const nudge = missed[i];
    const daysMissed = daysSinceSignup - nudge.day;

    if (nudge.day <= 7 && daysMissed <= 1) return nudge;
    if (nudge.day <= 30 && daysMissed <= 3) return nudge;
    // Day 31+: always re-deliver missed nudges (queued)
    if (nudge.day > 30) return nudge;
  }

  return null;
}
