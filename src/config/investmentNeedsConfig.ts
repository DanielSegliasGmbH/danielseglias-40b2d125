/**
 * Configuration for "Vorsorgeoptimierung – Bedürfnisse & Fragen"
 * Structured tile data with metadata for tracking, tool linking, and product scoring.
 */

export interface NeedsTile {
  id: string;
  title: string;
  description?: string;
  /** Internal category for grouping & scoring */
  category: string;
  /** Tool keys that can be suggested when this tile is active */
  linkedTools: string[];
  /** Product/service keys that gain score when this tile is selected */
  linkedProducts: string[];
}

export interface NeedsCategory {
  id: string;
  title: string;
  /** If true, tiles in this category get extra visual emphasis */
  highlight?: boolean;
  tiles: NeedsTile[];
}

/** Runtime state for a single tile (persisted in consultation data) */
export interface NeedsTileState {
  selected: boolean;
  note: string;
  /** How often this tile was actively used (selected, discussed, etc.) */
  usageCount: number;
  /** Timestamp of last interaction */
  lastUsedAt?: string;
}

/** Aggregated product scores derived from tile selections */
export interface ProductScores {
  [productKey: string]: number;
}

export const needsCategories: NeedsCategory[] = [
  {
    id: 'trust',
    title: 'Vertrauen & Sicherheit',
    tiles: [
      { id: 'trust-1', title: 'Kann ich dir wirklich vertrauen?', description: 'Vertrauen ist in diesem Bereich extrem wichtig. Was brauchst du, um sagen zu können: Ich kann dir wirklich vertrauen?', category: 'trust', linkedTools: ['transparenz-check'], linkedProducts: ['beratung', 'transparenz'] },
      { id: 'trust-2', title: 'Wo ist der Haken?', description: 'Skepsis gegenüber Finanzprodukten und Beratung', category: 'trust', linkedTools: [], linkedProducts: ['transparenz', 'analyse'] },
      { id: 'trust-3', title: 'Was unterscheidet dich von anderen?', description: 'Alleinstellungsmerkmale der Beratung', category: 'trust', linkedTools: [], linkedProducts: ['beratung'] },
    ],
  },
  {
    id: 'costs',
    title: 'Kosten & Gebühren',
    tiles: [
      { id: 'costs-1', title: 'Was kostet mich das wirklich?', description: 'Gesamtkostenübersicht und Transparenz', category: 'kosten', linkedTools: ['verlustrechner-3a'], linkedProducts: ['optimierung', 'analyse'] },
      { id: 'costs-2', title: 'Gibt es versteckte Gebühren?', description: 'Vollständige Offenlegung aller Kosten', category: 'kosten', linkedTools: ['verlustrechner-3a'], linkedProducts: ['transparenz', 'optimierung'] },
      { id: 'costs-3', title: 'Wie viel verliere ich durch Kosten?', description: 'Auswirkung von Gebühren auf die Rendite', category: 'kosten', linkedTools: ['verlustrechner-3a', 'vergleichsrechner-3a'], linkedProducts: ['optimierung'] },
    ],
  },
  {
    id: 'risk',
    title: 'Risiko & Sicherheit',
    tiles: [
      { id: 'risk-1', title: 'Kann ich Geld verlieren?', description: 'Verlustrisiken und Kapitalschutz', category: 'risiko', linkedTools: ['rendite-risiko'], linkedProducts: ['strategie', 'analyse'] },
      { id: 'risk-2', title: 'Was passiert bei einem Börsencrash?', description: 'Marktschwankungen und Worst-Case verstehen', category: 'risiko', linkedTools: ['rendite-risiko'], linkedProducts: ['strategie'] },
      { id: 'risk-4', title: 'Wie sicher ist mein Geld?', description: 'Sicherheitsverständnis und Kaufkraftschutz', category: 'risiko', linkedTools: ['inflationsrechner'], linkedProducts: ['strategie', 'analyse'] },
    ],
  },
  {
    id: 'return',
    title: 'Rendite & Entwicklung',
    tiles: [
      { id: 'return-1', title: 'Wie viel Rendite ist realistisch?', description: 'Erwartbare langfristige Erträge', category: 'rendite', linkedTools: ['rendite-risiko', 'vergleichsrechner-3a'], linkedProducts: ['strategie', 'optimierung'] },
      { id: 'return-2', title: 'Wie entwickelt sich mein Geld langfristig?', description: 'Zinseszins und Vermögensaufbau', category: 'rendite', linkedTools: ['vergleichsrechner-3a'], linkedProducts: ['strategie'] },
      { id: 'return-3', title: 'Wie wirkt sich Inflation aus?', description: 'Kaufkraftverlust und reale Rendite', category: 'rendite', linkedTools: ['inflationsrechner'], linkedProducts: ['analyse', 'strategie'] },
    ],
  },
  {
    id: 'flexibility',
    title: 'Flexibilität & Umsetzung',
    tiles: [
      { id: 'flex-1', title: 'Kann ich jederzeit kündigen?', description: 'Kündigungsfristen und Bindung', category: 'flexibilitaet', linkedTools: [], linkedProducts: ['optimierung', 'analyse'] },
      { id: 'flex-2', title: 'Wie flexibel ist die Lösung?', description: 'Anpassungsmöglichkeiten bei Veränderungen', category: 'flexibilitaet', linkedTools: [], linkedProducts: ['optimierung'] },
      { id: 'flex-3', title: 'Habe ich Zugriff auf mein Geld?', description: 'Liquidität und Verfügbarkeit', category: 'flexibilitaet', linkedTools: [], linkedProducts: ['analyse'] },
    ],
  },
  {
    id: 'decision',
    title: 'Entscheidungsfragen',
    highlight: true,
    tiles: [
      { id: 'dec-1', title: 'Was passiert, wenn ich nichts mache?', description: 'Opportunitätskosten der Untätigkeit', category: 'entscheidung', linkedTools: ['verlustrechner-3a', 'inflationsrechner'], linkedProducts: ['optimierung', 'strategie'] },
      { id: 'dec-2', title: 'Was ist für mich die beste Lösung?', description: 'Individuelle Empfehlung und Passung', category: 'entscheidung', linkedTools: [], linkedProducts: ['beratung', 'strategie'] },
      { id: 'dec-3', title: 'Was würdest du an meiner Stelle tun?', description: 'Persönliche Perspektive des Beraters', category: 'entscheidung', linkedTools: [], linkedProducts: ['beratung'] },
    ],
  },
];

/** Flat list of all tile IDs for easy iteration */
export const allTileIds = needsCategories.flatMap(c => c.tiles.map(t => t.id));

/** Build a flat lookup map: tileId → NeedsTile */
export const tileMap = Object.fromEntries(
  needsCategories.flatMap(c => c.tiles.map(t => [t.id, t]))
) as Record<string, NeedsTile>;

/** Calculate product scores from current tile states */
export function calculateProductScores(tiles: Record<string, NeedsTileState>): ProductScores {
  const scores: ProductScores = {};
  for (const [tileId, state] of Object.entries(tiles)) {
    if (!state.selected) continue;
    const tile = tileMap[tileId];
    if (!tile) continue;
    for (const product of tile.linkedProducts) {
      scores[product] = (scores[product] ?? 0) + (state.usageCount || 1);
    }
  }
  return scores;
}

/** Get linked tool keys for all selected tiles */
export function getLinkedToolsForSelected(tiles: Record<string, NeedsTileState>): string[] {
  const tools = new Set<string>();
  for (const [tileId, state] of Object.entries(tiles)) {
    if (!state.selected) continue;
    const tile = tileMap[tileId];
    if (!tile) continue;
    tile.linkedTools.forEach(t => tools.add(t));
  }
  return Array.from(tools);
}
