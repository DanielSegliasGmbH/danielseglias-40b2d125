/**
 * Configuration for the dynamic offer page in the investment consulting module.
 * Maps needs-categories to concrete service modules with value pricing.
 * Extended with full module palette and 3-tier package support.
 */

export interface OfferModule {
  id: string;
  title: string;
  description: string;
  /** Display value in CHF */
  value: number;
}

export interface CategoryOfferMapping {
  /** Matches NeedsCategory.id */
  categoryId: string;
  /** Human-readable trigger label */
  triggerLabel: string;
  modules: OfferModule[];
}

/** Package tier type */
export type PackageTier = 'starter' | 'standard' | 'premium';

export interface PackageConfig {
  tier: PackageTier;
  label: string;
  description: string;
  recommended?: boolean;
}

export const packageConfigs: PackageConfig[] = [
  {
    tier: 'starter',
    label: 'Einsteiger',
    description: 'Fokus auf die wichtigsten und dringendsten Themen – ein solider Start.',
  },
  {
    tier: 'standard',
    label: 'Standard',
    description: 'Die empfohlene Hauptlösung – sauberer Aufbau und nachhaltige Umsetzung.',
    recommended: true,
  },
  {
    tier: 'premium',
    label: 'Premium',
    description: 'Maximale Tiefe, Begleitung und Ganzheitlichkeit – alles umfassend sauber aufsetzen.',
  },
];

/**
 * Mapping: when tiles from a category are selected,
 * these offer modules are automatically included.
 */
export const categoryOfferMappings: CategoryOfferMapping[] = [
  {
    categoryId: 'costs',
    triggerLabel: 'Kosten & Transparenz',
    modules: [
      { id: 'fee-analysis', title: 'Gebührenanalyse', description: 'Detaillierte Analyse aller laufenden Kosten und versteckten Gebühren deiner bestehenden Lösungen.', value: 1500 },
      { id: 'cost-optimization', title: 'Kostenoptimierung', description: 'Konkrete Empfehlungen zur Reduktion deiner laufenden Kosten – mit messbarem Einsparungspotenzial.', value: 1200 },
      { id: 'product-comparison', title: 'Produktvergleich', description: 'Unabhängiger Vergleich deiner aktuellen Produkte mit kosteneffizienten Alternativen.', value: 800 },
    ],
  },
  {
    categoryId: 'risk',
    triggerLabel: 'Risiko & Sicherheit',
    modules: [
      { id: 'risk-analysis', title: 'Risikoanalyse', description: 'Systematische Bewertung deines persönlichen Risikoprofils und deiner aktuellen Struktur.', value: 1800 },
      { id: 'strategy-adjustment', title: 'Strategie-Anpassung', description: 'Optimierung deiner Anlagestrategie basierend auf deinem Risikoprofil und Zeithorizont.', value: 1500 },
      { id: 'worst-case-planning', title: 'Worst-Case-Planung', description: 'Szenario-basierte Analyse und Vorbereitung auf extreme Marktsituationen.', value: 1200 },
    ],
  },
  {
    categoryId: 'flexibility',
    triggerLabel: 'Flexibilität & Struktur',
    modules: [
      { id: 'structure-planning', title: 'Strukturplanung', description: 'Aufbau einer flexiblen Vermögensstruktur mit klarer Aufteilung und Zugänglichkeit.', value: 1500 },
      { id: 'liquidity-strategy', title: 'Liquiditätsstrategie', description: 'Sicherstellung, dass du jederzeit Zugriff auf die richtige Menge Kapital hast.', value: 1000 },
    ],
  },
  {
    categoryId: 'trust',
    triggerLabel: 'Orientierung & Vertrauen',
    modules: [
      { id: 'personal-coaching', title: 'Persönliche 1:1 Betreuung', description: 'Langfristige Begleitung mit regelmässigen Check-ins und direktem Kontakt.', value: 2000 },
      { id: 'strategy-development', title: 'Klare Strategieentwicklung', description: 'Individuelle Strategie auf Basis deiner Ziele, Situation und Werte.', value: 2500 },
    ],
  },
  {
    categoryId: 'decision',
    triggerLabel: 'Klarheit & Struktur',
    modules: [
      { id: 'budget-analysis', title: 'Budgetanalyse', description: 'Vollständige Übersicht deiner Einnahmen, Ausgaben und finanziellen Spielräume.', value: 1000 },
      { id: 'wealth-overview', title: 'Gesamtübersicht Vermögen', description: 'Konsolidierte Darstellung deines gesamten Vermögens über alle Konten und Anlagen.', value: 1500 },
    ],
  },
  {
    categoryId: 'return',
    triggerLabel: 'Rendite & Entwicklung',
    modules: [
      { id: 'return-projection', title: 'Renditeprojektion', description: 'Realistische Simulation deiner Vermögensentwicklung über verschiedene Zeithorizonte.', value: 1200 },
      { id: 'investment-plan', title: 'Investitionsplan', description: 'Strukturierter Plan für regelmässige Einzahlungen und langfristigen Vermögensaufbau.', value: 1000 },
    ],
  },
];

/** Complete palette of all offer modules (including extras not tied to categories) */
export const allOfferModules: OfferModule[] = [
  // From categories
  ...categoryOfferMappings.flatMap((m) => m.modules),
  // Additional modules
  { id: '3a-analysis', title: 'Analyse bestehender 3a-Lösungen', description: 'Detaillierte Prüfung deiner Säule-3a-Produkte auf Kosten, Flexibilität und Rendite.', value: 1200 },
  { id: 'tax-optimization', title: 'Steueroptimierte Vorsorgestruktur', description: 'Optimierung deiner Vorsorge unter Berücksichtigung steuerlicher Vorteile und Abzüge.', value: 1800 },
  { id: 'insurance-analysis', title: 'Absicherungsanalyse', description: 'Überprüfung deiner bestehenden Absicherungen (Invalidität, Todesfall, Krankheit).', value: 1500 },
  { id: 'implementation-support', title: 'Umsetzungsbegleitung', description: 'Persönliche Unterstützung bei der konkreten Umsetzung aller empfohlenen Massnahmen.', value: 2000 },
  { id: 'review-meetings', title: 'Laufende Review-Termine', description: 'Regelmässige Überprüfung und Anpassung deiner Strategie an veränderte Lebensumstände.', value: 2500 },
  { id: 'pension-planning', title: 'Pensions- & Entnahmeplanung', description: 'Planung des optimalen Zeitpunkts und der Struktur für Kapitalbezug und Rentenplanung.', value: 1800 },
  { id: 'financial-overview', title: 'Gesamtübersicht Finanzen', description: 'Vollständige Konsolidierung aller finanziellen Positionen in einer klaren Übersicht.', value: 1500 },
  { id: 'priority-planning', title: 'Prioritäten- & Strukturplanung', description: 'Definition der wichtigsten finanziellen Prioritäten und Aufbau einer klaren Handlungsstruktur.', value: 1200 },
];

/** Flat lookup: categoryId → modules */
export const categoryModuleMap = Object.fromEntries(
  categoryOfferMappings.map((m) => [m.categoryId, m.modules])
);

/** Default outcome goals shown in the offer */
export const defaultOutcomeGoals = [
  'Klare Vermögensstrategie',
  'Kosteneffizienter Aufbau',
  'Langfristige Sicherheit',
  'Fundierte Entscheidungen',
];

/** Risk reversal guarantees */
export const riskReversalItems = [
  'Volle Transparenz über alle Kosten und Leistungen.',
  'Kein Mehrwert erkennbar? Geld zurück – ohne Diskussion.',
  'Du entscheidest in deinem Tempo – kein Verkaufsdruck.',
];

/** Format CHF with thousands separator */
export function formatCHF(value: number): string {
  return `CHF ${value.toLocaleString('de-CH')}`;
}
