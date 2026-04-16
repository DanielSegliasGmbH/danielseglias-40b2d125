/**
 * Progressive Feature Unlock — Journey Phase Configuration
 *
 * Each phase defines which feature-keys it unlocks and the gate conditions.
 * Gate conditions are OR-based: the phase unlocks when ANY condition is met.
 */

export interface PhaseGate {
  /** Minimum days since signup */
  daysSinceSignup?: number;
  /** Minimum PeakScore (months) */
  minPeakScore?: number;
  /** Minimum completed tasks */
  minTasksCompleted?: number;
  /** Minimum completed coach modules */
  minCoachModulesCompleted?: number;
}

export interface JourneyPhase {
  phase: number;
  name: string;
  emoji: string;
  description: string;
  gate: PhaseGate;
  /** Feature keys that unlock with this phase */
  featureKeys: string[];
}

export const JOURNEY_PHASES: JourneyPhase[] = [
  {
    phase: 0,
    name: 'Onboarding',
    emoji: '🌱',
    description: 'Dein Start in die finanzielle Klarheit',
    gate: {}, // always unlocked
    featureKeys: [
      'onboarding',
      'finanz-typ',
      'avatar',
      'lebensfilm',
      'manifest',
      'dashboard',
      'peakscore',
    ],
  },
  {
    phase: 1,
    name: 'Klarheit',
    emoji: '💡',
    description: 'Verstehe wo du stehst',
    gate: {}, // always unlocked from day 1
    featureKeys: [
      'finanzprofil',
      'snapshot',
      'budget',
      'goals',
      'tasks',
      'library',
      'coach-newcomer',
      'chat',
      'erinnerungen',
    ],
  },
  {
    phase: 2,
    name: 'Grundlagen',
    emoji: '📚',
    description: 'Baue dein finanzielles Fundament',
    gate: {
      daysSinceSignup: 30,
      minCoachModulesCompleted: 5,
    },
    featureKeys: [
      'konten-modell',
      'was-kostet-das',
      'jetzt-vs-spaeter',
      'gewohnheiten',
      'community-read',
      'freunde-einladen',
    ],
  },
  {
    phase: 3,
    name: 'Optimierung',
    emoji: '⚡',
    description: 'Optimiere deine Finanzen systematisch',
    gate: {
      daysSinceSignup: 60,
      minPeakScore: 3,
      minTasksCompleted: 10,
    },
    featureKeys: [
      'steuer-check',
      'steuerrechner',
      'versicherungs-check',
      'krankenkassen-tracker',
      'abo-audit',
      'notfall-check',
      '3-saeulen-rechner',
      'guilty-pleasure',
    ],
  },
  {
    phase: 4,
    name: 'Vertiefung',
    emoji: '🚀',
    description: 'Gehe tiefer — für fortgeschrittene Planung',
    gate: {
      daysSinceSignup: 90,
      minPeakScore: 6,
      minCoachModulesCompleted: 2,
    },
    featureKeys: [
      'coach-original',
      'humankapital',
      'finanzplan',
      'lohnerhoher',
      'strategien',
      'community-post',
      'paar-modus',
      'challenges',
    ],
  },
  {
    phase: 5,
    name: 'Advanced',
    emoji: '🏔️',
    description: 'Meistere die fortgeschrittenen Themen',
    gate: {
      daysSinceSignup: 120,
      minPeakScore: 12,
    },
    featureKeys: [
      'ahv-tracker',
      'sozialabgaben',
      'letzter-plan',
      'expat',
      'immobilien',
      'schatten-zwilling',
      'freiheits-goal-advanced',
    ],
  },
  {
    phase: 6,
    name: 'Mastery',
    emoji: '👑',
    description: 'Alle Features freigeschaltet — du bist Finanz-Meister',
    gate: {
      daysSinceSignup: 365,
      minPeakScore: 36,
    },
    featureKeys: [
      'all-remaining',
      'advanced-simulations',
      'finanz-meister-badge',
    ],
  },
];

/** All feature keys that exist across all phases */
export const ALL_FEATURE_KEYS = JOURNEY_PHASES.flatMap(p => p.featureKeys);

/** Get the phase a feature belongs to */
export function getPhaseForFeature(featureKey: string): JourneyPhase | undefined {
  return JOURNEY_PHASES.find(p => p.featureKeys.includes(featureKey));
}

/** Get unlock condition text for a feature */
export function getUnlockConditionText(featureKey: string, currentDays: number): string | null {
  const phase = getPhaseForFeature(featureKey);
  if (!phase) return null;
  const g = phase.gate;
  
  const conditions: string[] = [];
  if (g.daysSinceSignup && g.daysSinceSignup > currentDays) {
    const remaining = g.daysSinceSignup - currentDays;
    conditions.push(`Noch ${remaining} Tag${remaining !== 1 ? 'e' : ''}`);
  }
  if (g.minPeakScore) {
    conditions.push(`PeakScore ≥ ${g.minPeakScore}`);
  }
  if (g.minTasksCompleted) {
    conditions.push(`${g.minTasksCompleted} Aufgaben abschliessen`);
  }
  if (g.minCoachModulesCompleted) {
    conditions.push(`${g.minCoachModulesCompleted} Coach-Module abschliessen`);
  }
  
  return conditions.join(' oder ');
}
