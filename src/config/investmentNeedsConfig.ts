/**
 * Configuration for "Vorsorgeoptimierung – Bedürfnisse & Fragen"
 * Structured tile data for the interactive needs assessment.
 */

export interface NeedsTile {
  id: string;
  title: string;
  description?: string;
}

export interface NeedsCategory {
  id: string;
  title: string;
  /** If true, tiles in this category get extra visual emphasis */
  highlight?: boolean;
  tiles: NeedsTile[];
}

export const needsCategories: NeedsCategory[] = [
  {
    id: 'trust',
    title: 'Vertrauen & Sicherheit',
    tiles: [
      { id: 'trust-1', title: 'Kann ich dir wirklich vertrauen?', description: 'Grundvertrauen in die Beratungsbeziehung' },
      { id: 'trust-2', title: 'Wo ist der Haken?', description: 'Skepsis gegenüber Finanzprodukten und Beratung' },
      { id: 'trust-3', title: 'Was unterscheidet dich von anderen?', description: 'Alleinstellungsmerkmale der Beratung' },
    ],
  },
  {
    id: 'costs',
    title: 'Kosten & Gebühren',
    tiles: [
      { id: 'costs-1', title: 'Was kostet mich das wirklich?', description: 'Gesamtkostenübersicht und Transparenz' },
      { id: 'costs-2', title: 'Gibt es versteckte Gebühren?', description: 'Vollständige Offenlegung aller Kosten' },
      { id: 'costs-3', title: 'Wie viel verliere ich durch Kosten?', description: 'Auswirkung von Gebühren auf die Rendite' },
    ],
  },
  {
    id: 'risk',
    title: 'Risiko & Sicherheit',
    tiles: [
      { id: 'risk-1', title: 'Kann ich Geld verlieren?', description: 'Verlustrisiken und Kapitalschutz' },
      { id: 'risk-2', title: 'Was passiert bei einem Börsencrash?', description: 'Marktschwankungen und Worst-Case verstehen' },
      { id: 'risk-4', title: 'Wie sicher ist mein Geld?', description: 'Sicherheitsverständnis und Kaufkraftschutz' },
    ],
  },
  {
    id: 'return',
    title: 'Rendite & Entwicklung',
    tiles: [
      { id: 'return-1', title: 'Wie viel Rendite ist realistisch?', description: 'Erwartbare langfristige Erträge' },
      { id: 'return-2', title: 'Wie entwickelt sich mein Geld langfristig?', description: 'Zinseszins und Vermögensaufbau' },
      { id: 'return-3', title: 'Wie wirkt sich Inflation aus?', description: 'Kaufkraftverlust und reale Rendite' },
    ],
  },
  {
    id: 'flexibility',
    title: 'Flexibilität & Umsetzung',
    tiles: [
      { id: 'flex-1', title: 'Kann ich jederzeit kündigen?', description: 'Kündigungsfristen und Bindung' },
      { id: 'flex-2', title: 'Wie flexibel ist die Lösung?', description: 'Anpassungsmöglichkeiten bei Veränderungen' },
      { id: 'flex-3', title: 'Habe ich Zugriff auf mein Geld?', description: 'Liquidität und Verfügbarkeit' },
    ],
  },
  {
    id: 'decision',
    title: 'Entscheidungsfragen',
    highlight: true,
    tiles: [
      { id: 'dec-1', title: 'Was passiert, wenn ich nichts mache?', description: 'Opportunitätskosten der Untätigkeit' },
      { id: 'dec-2', title: 'Was ist für mich die beste Lösung?', description: 'Individuelle Empfehlung und Passung' },
      { id: 'dec-3', title: 'Was würdest du an meiner Stelle tun?', description: 'Persönliche Perspektive des Beraters' },
    ],
  },
];

/** Flat list of all tile IDs for easy iteration */
export const allTileIds = needsCategories.flatMap(c => c.tiles.map(t => t.id));
