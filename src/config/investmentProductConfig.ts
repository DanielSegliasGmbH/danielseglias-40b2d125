/**
 * Product & Pricing Engine for the Investment Consulting module.
 *
 * 3-phase model:
 *   Phase 1 – Vorleistung (pre-work, always shown, fixed price)
 *   Phase 2 – Umsetzung  (implementation products, scored from conversation)
 *   Phase 3 – Begleitung (ongoing support, optional add-on)
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

/* ── Question → Product linking weights ── */

export interface QuestionProductLink {
  questionId: string;
  productId: string;
  weight: number;
}

/**
 * Maps tile IDs from investmentNeedsConfig to products with weights.
 * When a tile is selected, linked products gain score = weight.
 */
export const questionProductLinks: QuestionProductLink[] = [
  // Costs tiles
  { questionId: 'costs-1', productId: 'fee-analysis',       weight: 3 },
  { questionId: 'costs-1', productId: 'cost-optimization',  weight: 2 },
  { questionId: 'costs-2', productId: 'fee-analysis',       weight: 3 },
  { questionId: 'costs-2', productId: 'product-comparison', weight: 2 },
  { questionId: 'costs-3', productId: 'cost-optimization',  weight: 3 },
  { questionId: 'costs-3', productId: '3a-analysis',        weight: 2 },
  // Risk tiles
  { questionId: 'risk-1',  productId: 'risk-analysis',      weight: 3 },
  { questionId: 'risk-1',  productId: 'strategy-dev',       weight: 1 },
  { questionId: 'risk-2',  productId: 'risk-analysis',      weight: 2 },
  { questionId: 'risk-2',  productId: 'strategy-dev',       weight: 2 },
  { questionId: 'risk-4',  productId: 'insurance-check',    weight: 2 },
  { questionId: 'risk-4',  productId: 'risk-analysis',      weight: 2 },
  // Return tiles
  { questionId: 'return-1', productId: 'return-projection', weight: 3 },
  { questionId: 'return-1', productId: 'strategy-dev',      weight: 2 },
  { questionId: 'return-2', productId: 'investment-plan',   weight: 3 },
  { questionId: 'return-2', productId: 'return-projection', weight: 2 },
  { questionId: 'return-3', productId: 'return-projection', weight: 2 },
  { questionId: 'return-3', productId: 'strategy-dev',      weight: 1 },
  // Trust tiles
  { questionId: 'trust-1', productId: 'personal-coaching',  weight: 2 },
  { questionId: 'trust-2', productId: 'fee-analysis',       weight: 1 },
  { questionId: 'trust-3', productId: 'personal-coaching',  weight: 2 },
  // Flexibility tiles
  { questionId: 'flex-1',  productId: 'structure-planning',  weight: 2 },
  { questionId: 'flex-1',  productId: 'liquidity-strategy',  weight: 2 },
  { questionId: 'flex-2',  productId: 'structure-planning',  weight: 3 },
  { questionId: 'flex-3',  productId: 'liquidity-strategy',  weight: 3 },
  // Decision tiles
  { questionId: 'dec-1',   productId: 'cost-optimization',  weight: 2 },
  { questionId: 'dec-1',   productId: 'strategy-dev',       weight: 2 },
  { questionId: 'dec-2',   productId: 'strategy-dev',       weight: 3 },
  { questionId: 'dec-2',   productId: 'implementation',     weight: 1 },
  { questionId: 'dec-3',   productId: 'strategy-dev',       weight: 2 },
  { questionId: 'dec-3',   productId: 'personal-coaching',  weight: 1 },
];

/* ── Scoring engine ── */

export interface ScoredProduct extends Product {
  score: number;
  tier: 'main' | 'complementary' | 'optional';
}

/**
 * Calculate product scores from selected tile IDs.
 * Returns products sorted by score descending, with tier assignment.
 */
export function scoreProducts(
  selectedTileIds: string[],
  overrides?: Record<string, number>,
  disabledIds?: Set<string>,
): ScoredProduct[] {
  const scores: Record<string, number> = {};

  // Base scores
  products.forEach((p) => {
    if (p.active && !disabledIds?.has(p.id)) {
      scores[p.id] = p.baseScore;
    }
  });

  // Add weights from selected tiles
  const selectedSet = new Set(selectedTileIds);
  questionProductLinks.forEach((link) => {
    if (selectedSet.has(link.questionId) && scores[link.productId] !== undefined) {
      scores[link.productId] += link.weight;
    }
  });

  // Apply manual overrides
  if (overrides) {
    Object.entries(overrides).forEach(([id, bonus]) => {
      if (scores[id] !== undefined) scores[id] += bonus;
    });
  }

  // Sort & tier
  const sorted = Object.entries(scores)
    .filter(([, s]) => s > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([id, score]) => {
      const product = products.find((p) => p.id === id)!;
      return { ...product, score };
    });

  // Assign tiers: top 30% = main, next 40% = complementary, rest = optional
  const total = sorted.length;
  return sorted.map((p, i): ScoredProduct => {
    const position = i / Math.max(total, 1);
    let tier: ScoredProduct['tier'] = 'optional';
    if (position < 0.3) tier = 'main';
    else if (position < 0.7) tier = 'complementary';
    return { ...p, tier };
  });
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
  /** Pre-work is always included */
  includesPreWork: true;
}

/** Min score threshold – products below this are excluded from all packages */
const MIN_SCORE_THRESHOLD = 1;

/**
 * Generate 3 packages from scored products.
 * Starter = main products only
 * Standard = main + complementary
 * Premium = all + betreuung
 */
export function generatePackages(scored: ScoredProduct[]): GeneratedPackage[] {
  const eligible = scored.filter((p) => p.score >= MIN_SCORE_THRESHOLD);

  const main = eligible.filter((p) => p.tier === 'main');
  const complementary = eligible.filter((p) => p.tier === 'complementary');
  const optional = eligible.filter((p) => p.tier === 'optional');
  const betreuung = eligible.filter((p) => p.category === 'betreuung');
  const nonBetreuung = eligible.filter((p) => p.category !== 'betreuung');

  const starterProducts = main.filter((p) => p.category !== 'betreuung');
  const standardProducts = [...main, ...complementary].filter((p) => p.category !== 'betreuung');
  const premiumProducts = [...nonBetreuung, ...betreuung];

  // Deduplicate
  const dedup = (arr: ScoredProduct[]) => {
    const seen = new Set<string>();
    return arr.filter((p) => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
  };

  const calc = (prods: ScoredProduct[]): GeneratedPackage => {
    const unique = dedup(prods);
    return {
      config: packageConfigs[0], // placeholder, overridden below
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

/** Risk reversal guarantees */
export const riskReversalItems = [
  'Volle Transparenz über alle Kosten und Leistungen.',
  'Kein Mehrwert erkennbar? Geld zurück – ohne Diskussion.',
  'Du entscheidest in deinem Tempo – kein Verkaufsdruck.',
];
