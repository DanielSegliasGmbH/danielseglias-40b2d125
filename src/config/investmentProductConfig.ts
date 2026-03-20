/**
 * Product & Pricing Engine for the Investment Consulting module.
 *
 * 3-phase model:
 *   Phase 1 – Vorleistung (pre-work, always shown, fixed price)
 *   Phase 2 – Umsetzung  (implementation products, scored from conversation)
 *   Phase 3 – Begleitung (ongoing support, optional add-on)
 *
 * Scoring uses category weights and absolute thresholds for tier assignment.
 */

/* ── Product definition ── */

export type ProductCategory = 'optimierung' | 'strategie' | 'umsetzung' | 'betreuung';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  /** Base value in CHF (before discounts) */
  baseValue: number;
  /** Whether this product is available for selection at all */
  active: boolean;
  /** Default score before conversation input */
  baseScore: number;
}

/* ── Pre-work (Phase 1) ── */

export interface PreWorkItem {
  label: string;
}

export const preWork = {
  title: 'Standortbestimmung & Analyse',
  value: 400,
  status: 'bereits erhalten' as const,
  items: [
    { label: 'Analyse der aktuellen Situation' },
    { label: 'Aufdecken von Kosten, Risiken und Chancen' },
    { label: 'Erste Optimierungsansätze' },
  ] as PreWorkItem[],
};

/* ── Product catalogue (Phase 2 + 3) ── */

export const products: Product[] = [
  // Phase 2 – Umsetzung
  { id: 'fee-analysis',       name: 'Gebührenanalyse',                    description: 'Detaillierte Analyse aller laufenden Kosten und versteckten Gebühren.',                       category: 'optimierung', baseValue: 1500, active: true, baseScore: 0 },
  { id: 'cost-optimization',  name: 'Kostenoptimierung',                  description: 'Konkrete Empfehlungen zur Reduktion deiner laufenden Kosten.',                                category: 'optimierung', baseValue: 1200, active: true, baseScore: 0 },
  { id: 'risk-analysis',      name: 'Risikoanalyse',                      description: 'Systematische Bewertung deines Risikoprofils und deiner aktuellen Struktur.',                  category: 'strategie',   baseValue: 1800, active: true, baseScore: 0 },
  { id: 'strategy-dev',       name: 'Strategieentwicklung',               description: 'Individuelle Anlagestrategie auf Basis deiner Ziele, Situation und Werte.',                    category: 'strategie',   baseValue: 2500, active: true, baseScore: 0 },
  { id: 'product-comparison', name: 'Produktvergleich',                    description: 'Unabhängiger Vergleich deiner aktuellen Produkte mit kosteneffizienten Alternativen.',          category: 'optimierung', baseValue: 800,  active: true, baseScore: 0 },
  { id: '3a-analysis',        name: 'Analyse bestehender 3a-Lösungen',    description: 'Detaillierte Prüfung deiner Säule-3a-Produkte auf Kosten, Flexibilität und Rendite.',           category: 'optimierung', baseValue: 1200, active: true, baseScore: 0 },
  { id: 'tax-optimization',   name: 'Steueroptimierte Vorsorgestruktur',  description: 'Optimierung deiner Vorsorge unter Berücksichtigung steuerlicher Vorteile.',                    category: 'strategie',   baseValue: 1800, active: true, baseScore: 0 },
  { id: 'insurance-check',    name: 'Absicherungsanalyse',                description: 'Überprüfung deiner bestehenden Absicherungen (Invalidität, Todesfall, Krankheit).',             category: 'strategie',   baseValue: 1500, active: true, baseScore: 0 },
  { id: 'structure-planning', name: 'Strukturplanung',                    description: 'Aufbau einer flexiblen Vermögensstruktur mit klarer Aufteilung und Zugänglichkeit.',             category: 'umsetzung',   baseValue: 1500, active: true, baseScore: 0 },
  { id: 'liquidity-strategy', name: 'Liquiditätsstrategie',               description: 'Sicherstellung, dass du jederzeit Zugriff auf die richtige Menge Kapital hast.',               category: 'umsetzung',   baseValue: 1000, active: true, baseScore: 0 },
  { id: 'return-projection',  name: 'Renditeprojektion',                  description: 'Realistische Simulation deiner Vermögensentwicklung über verschiedene Zeithorizonte.',           category: 'strategie',   baseValue: 1200, active: true, baseScore: 0 },
  { id: 'investment-plan',    name: 'Investitionsplan',                    description: 'Strukturierter Plan für regelmässige Einzahlungen und langfristigen Vermögensaufbau.',          category: 'umsetzung',   baseValue: 1000, active: true, baseScore: 0 },
  { id: 'pension-planning',   name: 'Pensions- & Entnahmeplanung',        description: 'Planung des optimalen Zeitpunkts und der Struktur für Kapitalbezug und Rentenplanung.',          category: 'strategie',   baseValue: 1800, active: true, baseScore: 0 },
  // Phase 3 – Begleitung
  { id: 'implementation',     name: 'Umsetzungsbegleitung',               description: 'Persönliche Unterstützung bei der konkreten Umsetzung aller empfohlenen Massnahmen.',           category: 'betreuung',   baseValue: 2000, active: true, baseScore: 0 },
  { id: 'review-meetings',    name: 'Laufende Review-Termine',            description: 'Regelmässige Überprüfung und Anpassung deiner Strategie an veränderte Lebensumstände.',          category: 'betreuung',   baseValue: 2500, active: true, baseScore: 0 },
  { id: 'personal-coaching',  name: 'Persönliche 1:1 Betreuung',          description: 'Langfristige Begleitung mit regelmässigen Check-ins und direktem Kontakt.',                     category: 'betreuung',   baseValue: 2000, active: true, baseScore: 0 },
];

/* ── Category weights ── */

/** Question category keys (from investmentNeedsConfig tile categories) */
export type QuestionCategory = 'kosten' | 'risiko' | 'rendite' | 'trust' | 'flexibilitaet' | 'entscheidung';

/** Default category multipliers – can be overridden by admin */
export const defaultCategoryWeights: Record<QuestionCategory, number> = {
  kosten: 1.5,
  risiko: 1.2,
  rendite: 1.0,
  trust: 0.8,
  flexibilitaet: 1.0,
  entscheidung: 1.3,
};

/** Human-readable labels for categories */
export const categoryLabels: Record<QuestionCategory, string> = {
  kosten: 'Kosten & Gebühren',
  risiko: 'Risiko & Sicherheit',
  rendite: 'Rendite & Entwicklung',
  trust: 'Vertrauen',
  flexibilitaet: 'Flexibilität',
  entscheidung: 'Entscheidung',
};

/* ── Question → Product linking weights ── */

export interface QuestionProductLink {
  questionId: string;
  productId: string;
  weight: number;
  /** Category for applying category weight multiplier */
  category: QuestionCategory;
}

export const questionProductLinks: QuestionProductLink[] = [
  // Costs tiles
  { questionId: 'costs-1', productId: 'fee-analysis',       weight: 3, category: 'kosten' },
  { questionId: 'costs-1', productId: 'cost-optimization',  weight: 2, category: 'kosten' },
  { questionId: 'costs-2', productId: 'fee-analysis',       weight: 3, category: 'kosten' },
  { questionId: 'costs-2', productId: 'product-comparison', weight: 2, category: 'kosten' },
  { questionId: 'costs-3', productId: 'cost-optimization',  weight: 3, category: 'kosten' },
  { questionId: 'costs-3', productId: '3a-analysis',        weight: 2, category: 'kosten' },
  // Risk tiles
  { questionId: 'risk-1',  productId: 'risk-analysis',      weight: 3, category: 'risiko' },
  { questionId: 'risk-1',  productId: 'strategy-dev',       weight: 1, category: 'risiko' },
  { questionId: 'risk-2',  productId: 'risk-analysis',      weight: 2, category: 'risiko' },
  { questionId: 'risk-2',  productId: 'strategy-dev',       weight: 2, category: 'risiko' },
  { questionId: 'risk-4',  productId: 'insurance-check',    weight: 2, category: 'risiko' },
  { questionId: 'risk-4',  productId: 'risk-analysis',      weight: 2, category: 'risiko' },
  // Return tiles
  { questionId: 'return-1', productId: 'return-projection', weight: 3, category: 'rendite' },
  { questionId: 'return-1', productId: 'strategy-dev',      weight: 2, category: 'rendite' },
  { questionId: 'return-2', productId: 'investment-plan',   weight: 3, category: 'rendite' },
  { questionId: 'return-2', productId: 'return-projection', weight: 2, category: 'rendite' },
  { questionId: 'return-3', productId: 'return-projection', weight: 2, category: 'rendite' },
  { questionId: 'return-3', productId: 'strategy-dev',      weight: 1, category: 'rendite' },
  // Trust tiles
  { questionId: 'trust-1', productId: 'personal-coaching',  weight: 2, category: 'trust' },
  { questionId: 'trust-2', productId: 'fee-analysis',       weight: 1, category: 'trust' },
  { questionId: 'trust-3', productId: 'personal-coaching',  weight: 2, category: 'trust' },
  // Flexibility tiles
  { questionId: 'flex-1',  productId: 'structure-planning',  weight: 2, category: 'flexibilitaet' },
  { questionId: 'flex-1',  productId: 'liquidity-strategy',  weight: 2, category: 'flexibilitaet' },
  { questionId: 'flex-2',  productId: 'structure-planning',  weight: 3, category: 'flexibilitaet' },
  { questionId: 'flex-3',  productId: 'liquidity-strategy',  weight: 3, category: 'flexibilitaet' },
  // Decision tiles
  { questionId: 'dec-1',   productId: 'cost-optimization',  weight: 2, category: 'entscheidung' },
  { questionId: 'dec-1',   productId: 'strategy-dev',       weight: 2, category: 'entscheidung' },
  { questionId: 'dec-2',   productId: 'strategy-dev',       weight: 3, category: 'entscheidung' },
  { questionId: 'dec-2',   productId: 'implementation',     weight: 1, category: 'entscheidung' },
  { questionId: 'dec-3',   productId: 'strategy-dev',       weight: 2, category: 'entscheidung' },
  { questionId: 'dec-3',   productId: 'personal-coaching',  weight: 1, category: 'entscheidung' },
];

/* ── Score thresholds (absolute) ── */

export const SCORE_THRESHOLDS = {
  /** Below this → not shown at all */
  hidden: 2,
  /** 2–4 → optional */
  optional: 4,
  /** 4–6 → complementary */
  complementary: 6,
  /** > 6 → main focus */
} as const;

/* ── Scoring engine ── */

export interface ScoredProduct extends Product {
  score: number;
  /** Raw score before rounding (for display) */
  rawScore: number;
  tier: 'main' | 'complementary' | 'optional';
}

/** Category scores derived from conversation */
export interface CategoryScores {
  [category: string]: number;
}

export interface ScoringResult {
  products: ScoredProduct[];
  categoryScores: CategoryScores;
  /** Max score across all products (for percentage calculation) */
  maxScore: number;
}

/**
 * Calculate product scores from selected tile IDs with category weight multipliers.
 */
export function scoreProducts(
  selectedTileIds: string[],
  overrides?: Record<string, number>,
  disabledIds?: Set<string>,
  categoryWeights?: Record<QuestionCategory, number>,
): ScoringResult {
  const weights = categoryWeights ?? defaultCategoryWeights;
  const scores: Record<string, number> = {};
  const catScores: CategoryScores = {};

  // Base scores
  products.forEach((p) => {
    if (p.active && !disabledIds?.has(p.id)) {
      scores[p.id] = p.baseScore;
    }
  });

  // Add weighted scores from selected tiles
  const selectedSet = new Set(selectedTileIds);
  questionProductLinks.forEach((link) => {
    if (!selectedSet.has(link.questionId)) return;
    if (scores[link.productId] === undefined) return;

    const catMultiplier = weights[link.category] ?? 1.0;
    const weightedScore = link.weight * catMultiplier;

    scores[link.productId] += weightedScore;
    catScores[link.category] = (catScores[link.category] ?? 0) + weightedScore;
  });

  // Apply manual overrides
  if (overrides) {
    Object.entries(overrides).forEach(([id, bonus]) => {
      if (scores[id] !== undefined) scores[id] += bonus;
    });
  }

  // Sort by score descending, filter out hidden (< threshold)
  const sorted = Object.entries(scores)
    .filter(([, s]) => s >= SCORE_THRESHOLDS.hidden)
    .sort(([, a], [, b]) => b - a)
    .map(([id, score]): ScoredProduct => {
      const product = products.find((p) => p.id === id)!;
      let tier: ScoredProduct['tier'] = 'optional';
      if (score > SCORE_THRESHOLDS.complementary) tier = 'main';
      else if (score > SCORE_THRESHOLDS.optional) tier = 'complementary';
      return { ...product, score: Math.round(score * 10) / 10, rawScore: score, tier };
    });

  const maxScore = sorted.length > 0 ? sorted[0].score : 1;

  return { products: sorted, categoryScores: catScores, maxScore };
}

/* ── Package generation ── */

export type PackageTier = 'starter' | 'standard' | 'premium';

export interface PackageConfig {
  tier: PackageTier;
  label: string;
  description: string;
  recommended?: boolean;
}

export const packageConfigs: PackageConfig[] = [
  { tier: 'starter',  label: 'Einsteiger', description: 'Fokus auf die wichtigsten und dringendsten Themen.' },
  { tier: 'standard', label: 'Standard',   description: 'Die empfohlene Lösung – sauberer Aufbau und Umsetzung.', recommended: true },
  { tier: 'premium',  label: 'Premium',    description: 'Maximale Tiefe und Begleitung – alles umfassend aufsetzen.' },
];

export interface GeneratedPackage {
  config: PackageConfig;
  products: ScoredProduct[];
  totalValue: number;
  includesPreWork: true;
}

export function generatePackages(scored: ScoredProduct[]): GeneratedPackage[] {
  const main = scored.filter((p) => p.tier === 'main');
  const complementary = scored.filter((p) => p.tier === 'complementary');
  const betreuung = scored.filter((p) => p.category === 'betreuung');
  const nonBetreuung = scored.filter((p) => p.category !== 'betreuung');

  const starterProducts = main.filter((p) => p.category !== 'betreuung');
  const standardProducts = [...main, ...complementary].filter((p) => p.category !== 'betreuung');
  const premiumProducts = [...nonBetreuung, ...betreuung];

  const dedup = (arr: ScoredProduct[]) => {
    const seen = new Set<string>();
    return arr.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
  };

  const calc = (prods: ScoredProduct[]): GeneratedPackage => {
    const unique = dedup(prods);
    return {
      config: packageConfigs[0],
      products: unique,
      totalValue: unique.reduce((s, p) => s + p.baseValue, 0) + preWork.value,
      includesPreWork: true,
    };
  };

  return [
    { ...calc(starterProducts),  config: packageConfigs[0] },
    { ...calc(standardProducts), config: packageConfigs[1] },
    { ...calc(premiumProducts),  config: packageConfigs[2] },
  ];
}

/* ── Helpers ── */

export function formatCHF(value: number): string {
  return `CHF ${value.toLocaleString('de-CH')}`;
}

export const riskReversalItems = [
  'Volle Transparenz über alle Kosten und Leistungen.',
  'Kein Mehrwert erkennbar? Geld zurück – ohne Diskussion.',
  'Du entscheidest in deinem Tempo – kein Verkaufsdruck.',
];

/** Reset all scoring state to defaults */
export function getDefaultOfferState() {
  return {
    overrides: {} as Record<string, number>,
    disabledProducts: [] as string[],
    categoryWeights: { ...defaultCategoryWeights },
    priceOverrides: { starter: null, standard: null, premium: null } as Record<PackageTier, number | null>,
    recommendedTier: 'standard' as PackageTier,
    internalNote: '',
    readiness: '',
  };
}
