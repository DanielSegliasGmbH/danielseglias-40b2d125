/**
 * Fallback translations for tool names/descriptions.
 * Used when i18n keys don't resolve (e.g. timing issues, missing keys).
 */

const toolFallbacks: Record<string, { name: string; description: string }> = {
  steuerCheck: { name: 'Steuer-Check', description: 'Finde Steueroptimierungen: 3a-Potenzial, PK-Einkauf und vergessene Abzüge.' },
  versicherungsCheck: { name: 'Versicherungs-Check', description: 'Identifiziere Versicherungslücken und finde heraus, wo du gut abgesichert bist.' },
  beratungsreise: { name: 'Beratungsreise', description: 'Verstehe deinen Weg zur optimalen Finanzberatung.' },
  finanzcheck: { name: 'Finanz-Check', description: 'Analysiere deine aktuelle finanzielle Situation.' },
  mini3aKurzcheck: { name: '3a Kurzcheck', description: 'Prüfe schnell dein Säule-3a-Potenzial.' },
  transparenzCheck: { name: 'Transparenz-Check', description: 'Erkenne versteckte Kosten in deinen Produkten.' },
  kostenaufschluesselung: { name: 'Kostenaufschlüsselung', description: 'Zeige, was deine Finanzprodukte wirklich kosten.' },
  kostenImpactSimulator: { name: 'Kosten-Impact-Simulator', description: 'Simuliere den Einfluss von Gebühren auf dein Vermögen.' },
  verlustrechner3a: { name: '3a Verlustrechner', description: 'Berechne, was dich eine falsche 3a-Wahl kostet.' },
  sicherheitsvergleich: { name: 'Sicherheitsvergleich', description: 'Vergleiche die Sicherheit verschiedener Anlageformen.' },
  recoveryAnalyse: { name: 'Recovery-Analyse', description: 'Analysiere, wie schnell sich Märkte nach Krisen erholen.' },
  wahrscheinlichkeitsrechner: { name: 'Wahrscheinlichkeitsrechner', description: 'Berechne Wahrscheinlichkeiten für Lebensereignisse.' },
  zufallsRealitaetsCheck: { name: 'Zufalls-Realitäts-Check', description: 'Erkenne den Unterschied zwischen Zufall und Strategie.' },
  zeitverlustSimulator: { name: 'Zeitverlust-Simulator', description: 'Sieh, was Warten beim Investieren wirklich kostet.' },
  inflationsrechner: { name: 'Inflationsrechner', description: 'Berechne die reale Kaufkraft deines Geldes über die Zeit.' },
  renditeRisikoSimulation: { name: 'Rendite-Risiko-Simulation', description: 'Simuliere verschiedene Anlagestrategien und deren Risiko.' },
  glaubenssatzTransformer: { name: 'Glaubenssatz-Transformer', description: 'Transformiere limitierende Glaubenssätze über Geld.' },
  vergleichsrechner3a: { name: '3a Vergleichsrechner', description: 'Vergleiche verschiedene Säule-3a-Anbieter.' },
  finanzEntscheidung: { name: 'Finanz-Entscheidung', description: 'Triff bessere finanzielle Entscheidungen mit Struktur.' },
  tragbarkeitsrechner: { name: 'Tragbarkeitsrechner', description: 'Prüfe, ob du dir eine Immobilie leisten kannst.' },
  vvgLeistungsvergleich: { name: 'VVG-Leistungsvergleich', description: 'Vergleiche Versicherungsleistungen nach VVG.' },
  lebenzeitRechner: { name: 'Lebenszeit-Rechner', description: 'Visualisiere deine verbleibende Lebenszeit.' },
  rolexRechner: { name: 'Rolex-Rechner', description: 'Was wäre dein Luxus-Kauf als Investment wert?' },
  threeAAnalyzer: { name: '3a Analyzer', description: 'Tiefenanalyse deiner bestehenden Säule-3a-Lösung.' },
  caseStudyGenerator: { name: 'Fallstudien-Generator', description: 'Erstelle anonymisierte Fallstudien für die Beratung.' },
  budgetCalculator: { name: 'Budget-Rechner', description: 'Plane und optimiere dein monatliches Budget.' },
  retirementPlanner: { name: 'Vorsorge-Planer', description: 'Plane deine Pensionierung und berechne deine Vorsorgelücke.' },
  investmentSimulator: { name: 'Anlage-Simulator', description: 'Simuliere verschiedene Anlagestrategien über die Zeit.' },
  documentGenerator: { name: 'Dokument-Generator', description: 'Erstelle professionelle Beratungsdokumente.' },
  vorsorgecheck: { name: 'Vorsorge-Check', description: 'Prüfe deine Vorsorgesituation umfassend.' },
  kvgPraemienvergleich: { name: 'KVG-Prämienvergleich', description: 'Vergleiche Krankenkassenprämien in der Schweiz.' },
  savingsPlan3aComparison: { name: '3a Sparplan-Vergleich', description: 'Vergleiche verschiedene 3a-Sparpläne.' },
};

/**
 * Resolves a tool translation key with fallback.
 * If i18n returns the key itself (no translation found), uses the fallback map.
 */
export function resolveToolText(
  t: (key: string) => string,
  key: string,
  field: 'name' | 'description'
): string {
  const translated = t(key);
  // If translation returns the key itself, it wasn't found
  if (translated === key || translated.includes('.')) {
    // Extract the tool identifier from keys like "tools.beratungsreise.name"
    const parts = key.split('.');
    if (parts.length >= 2) {
      const toolKey = parts[1];
      const fallback = toolFallbacks[toolKey];
      if (fallback) return fallback[field];
    }
  }
  return translated;
}
