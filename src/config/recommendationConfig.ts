/**
 * Recommendation Engine – Static Mapping
 * Maps coach modules and tool slugs to recommended next steps.
 * Extensible for future AI-based personalisation.
 */

export interface Recommendation {
  type: 'tool' | 'article';
  /** tool slug or article id */
  ref: string;
  title: string;
  description: string;
}

// ─── Coach module → recommendations ──────────────────────────────

export const COACH_MODULE_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  mindset: [
    { type: 'tool', ref: 'glaubenssatz-transformer', title: 'Glaubenssatz-Transformer', description: 'Verwandle limitierende Überzeugungen in stärkende Gedanken.' },
    { type: 'tool', ref: 'finanz-entscheidung', title: 'Finanz-Entscheidung', description: 'Trainiere deine finanzielle Entscheidungsfähigkeit.' },
    { type: 'article', ref: 'drei-saeulen-system', title: 'Das 3-Säulen-System', description: 'Verstehe die Grundlagen deiner Vorsorge.' },
  ],
  klarheit: [
    { type: 'tool', ref: 'finanzcheck', title: 'Finanzcheck', description: 'Mach dir ein vollständiges Bild deiner finanziellen Gesundheit.' },
    { type: 'tool', ref: 'vorsorgecheck-3a', title: 'Vorsorgecheck 3a', description: 'Prüfe, wie gut deine Vorsorge aufgestellt ist.' },
    { type: 'article', ref: 'vorsorgeluecke', title: 'Die Vorsorgelücke verstehen', description: 'Erkenne, was dir im Alter fehlen könnte.' },
  ],
  ziele: [
    { type: 'tool', ref: 'lebenzeit-rechner', title: 'Lebenzeit-Rechner', description: 'Setze deine Lebenszeit in Relation zu deinen Zielen.' },
    { type: 'tool', ref: 'tragbarkeitsrechner', title: 'Tragbarkeitsrechner', description: 'Prüfe, ob du dir dein Eigenheimziel leisten kannst.' },
    { type: 'article', ref: '3a-steuervorteile', title: 'Steuervorteile der Säule 3a', description: 'Nutze die besten Steuerspar-Möglichkeiten.' },
  ],
  struktur: [
    { type: 'tool', ref: 'kostenaufschluesselung', title: 'Kostenaufschlüsselung', description: 'Verstehe, wohin dein Geld fliesst.' },
    { type: 'tool', ref: 'mini-3a-kurzcheck', title: 'Mini-3A-Kurzcheck', description: 'Schnellcheck deiner 3a-Lösung.' },
    { type: 'article', ref: 'vorsorgeluecke', title: 'Die Vorsorgelücke verstehen', description: 'Warum Struktur den Unterschied macht.' },
  ],
  absicherung: [
    { type: 'tool', ref: 'sicherheitsvergleich', title: 'Sicherheitsvergleich', description: 'Vergleiche, wie sicher deine Anlagen wirklich sind.' },
    { type: 'tool', ref: 'wahrscheinlichkeitsrechner', title: 'Wahrscheinlichkeitsrechner', description: 'Verstehe die Wahrscheinlichkeit von Risiken.' },
    { type: 'article', ref: 'ahv-grundlagen', title: 'AHV – Was bekommst du wirklich?', description: 'Reicht die staatliche Rente aus?' },
  ],
  optimierung: [
    { type: 'tool', ref: 'kosten-impact-simulator', title: 'Kosten-Impact-Simulator', description: 'Sieh, wie sich versteckte Kosten langfristig auswirken.' },
    { type: 'tool', ref: 'vergleichsrechner-3a', title: '3a-Vergleichsrechner', description: 'Vergleiche verschiedene 3a-Anbieter.' },
    { type: 'tool', ref: 'verlustrechner-3a', title: 'Verlustrechner 3a', description: 'Berechne, was dich Nichtstun kostet.' },
  ],
  investment: [
    { type: 'tool', ref: 'rendite-risiko-simulation', title: 'Rendite-Risiko-Simulation', description: 'Simuliere verschiedene Anlagestrategien.' },
    { type: 'tool', ref: 'recovery-analyse', title: 'Recovery-Analyse', description: 'Verstehe, wie sich Märkte nach Krisen erholen.' },
    { type: 'tool', ref: 'zufalls-realitaets-check', title: 'Zufalls-Realitäts-Check', description: 'Teste dein Bauchgefühl gegen die Realität.' },
  ],
  skalierung: [
    { type: 'tool', ref: 'rolex-rechner', title: 'Rolex-Rechner', description: 'Was kosten deine Gewohnheiten langfristig?' },
    { type: 'tool', ref: 'inflationsrechner', title: 'Inflationsrechner', description: 'Sieh, wie Inflation dein Geld beeinflusst.' },
    { type: 'article', ref: '3a-steuervorteile', title: 'Steuervorteile der Säule 3a', description: 'Maximiere deine Steuerersparnis.' },
  ],
  freiheit: [
    { type: 'tool', ref: 'lebenzeit-rechner', title: 'Lebenzeit-Rechner', description: 'Was bedeutet Freiheit in Lebenszeit?' },
    { type: 'tool', ref: 'beratungsreise', title: 'Beratungsreise', description: 'Erlebe den gesamten Beratungsprozess.' },
    { type: 'article', ref: 'drei-saeulen-system', title: 'Das 3-Säulen-System', description: 'Ganzheitliche Sicherheit verstehen.' },
  ],
  review: [
    { type: 'tool', ref: 'finanzcheck', title: 'Finanzcheck', description: 'Mach einen neuen Finanzcheck nach deiner Reise.' },
    { type: 'tool', ref: 'transparenz-check', title: 'Transparenz-Check', description: 'Wie transparent ist dein Finanzprodukt?' },
  ],
};

// ─── Tool → recommendations ──────────────────────────────────────

export const TOOL_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  'finanzcheck': [
    { type: 'tool', ref: 'mini-3a-kurzcheck', title: 'Mini-3A-Kurzcheck', description: 'Dein 3a-Produkt auf dem Prüfstand.' },
    { type: 'tool', ref: 'kosten-impact-simulator', title: 'Kosten-Impact-Simulator', description: 'Verstehe versteckte Kosten.' },
    { type: 'article', ref: 'vorsorgeluecke', title: 'Die Vorsorgelücke', description: 'Warum früh handeln sich lohnt.' },
  ],
  'inflationsrechner': [
    { type: 'tool', ref: 'rendite-risiko-simulation', title: 'Rendite-Risiko-Simulation', description: 'Simuliere, wie du Inflation schlägst.' },
    { type: 'tool', ref: 'zeitverlust-simulator', title: 'Zeitverlust-Simulator', description: 'Was kostet dich jeder Tag Warten?' },
    { type: 'article', ref: '3a-steuervorteile', title: 'Steuervorteile Säule 3a', description: 'Steuern sparen gegen Inflation.' },
  ],
  'vorsorgecheck-3a': [
    { type: 'tool', ref: 'mini-3a-kurzcheck', title: 'Mini-3A-Kurzcheck', description: 'Detailanalyse deiner 3a-Lösung.' },
    { type: 'tool', ref: 'vergleichsrechner-3a', title: '3a-Vergleichsrechner', description: 'Vergleiche Anbieter direkt.' },
  ],
  'rendite-risiko-simulation': [
    { type: 'tool', ref: 'recovery-analyse', title: 'Recovery-Analyse', description: 'Wie erholen sich Märkte nach Krisen?' },
    { type: 'tool', ref: 'zufalls-realitaets-check', title: 'Zufalls-Realitäts-Check', description: 'Teste dein Bauchgefühl.' },
  ],
  'kosten-impact-simulator': [
    { type: 'tool', ref: 'kostenaufschluesselung', title: 'Kostenaufschlüsselung', description: 'Jede Gebühr sichtbar machen.' },
    { type: 'tool', ref: 'transparenz-check', title: 'Transparenz-Check', description: 'Wie transparent ist dein Anbieter?' },
  ],
  'vergleichsrechner-3a': [
    { type: 'tool', ref: 'mini-3a-kurzcheck', title: 'Mini-3A-Kurzcheck', description: 'Bewerte deine aktuelle 3a-Lösung.' },
    { type: 'tool', ref: 'verlustrechner-3a', title: 'Verlustrechner 3a', description: 'Was kostet dich der falsche Anbieter?' },
  ],
  'mini-3a-kurzcheck': [
    { type: 'tool', ref: 'three-a-analyzer', title: '3a-Analyzer', description: 'Tiefenanalyse deines 3a-Produkts.' },
    { type: 'tool', ref: 'vergleichsrechner-3a', title: '3a-Vergleichsrechner', description: 'Finde die beste Alternative.' },
  ],
  'zeitverlust-simulator': [
    { type: 'tool', ref: 'inflationsrechner', title: 'Inflationsrechner', description: 'Sieh den Inflationseffekt über die Jahre.' },
    { type: 'tool', ref: 'verlustrechner-3a', title: 'Verlustrechner 3a', description: 'Was kostet dich Nichtstun konkret?' },
  ],
  'lebenzeit-rechner': [
    { type: 'tool', ref: 'rolex-rechner', title: 'Rolex-Rechner', description: 'Was kosten deine Gewohnheiten in Lebenszeit?' },
    { type: 'tool', ref: 'finanz-entscheidung', title: 'Finanz-Entscheidung', description: 'Bessere Entscheidungen treffen.' },
  ],
  'rolex-rechner': [
    { type: 'tool', ref: 'kosten-impact-simulator', title: 'Kosten-Impact-Simulator', description: 'Verstehe die langfristigen Kosten.' },
    { type: 'tool', ref: 'lebenzeit-rechner', title: 'Lebenzeit-Rechner', description: 'Rechne in Lebenszeit, nicht nur in Geld.' },
  ],
  'sicherheitsvergleich': [
    { type: 'tool', ref: 'wahrscheinlichkeitsrechner', title: 'Wahrscheinlichkeitsrechner', description: 'Verstehe Risiken mit Zahlen.' },
    { type: 'tool', ref: 'recovery-analyse', title: 'Recovery-Analyse', description: 'Wie schnell erholen sich Anlagen?' },
  ],
  'wahrscheinlichkeitsrechner': [
    { type: 'tool', ref: 'zufalls-realitaets-check', title: 'Zufalls-Realitäts-Check', description: 'Teste dein Bauchgefühl.' },
    { type: 'tool', ref: 'rendite-risiko-simulation', title: 'Rendite-Risiko-Simulation', description: 'Simuliere verschiedene Szenarien.' },
  ],
  'transparenz-check': [
    { type: 'tool', ref: 'kostenaufschluesselung', title: 'Kostenaufschlüsselung', description: 'Verstehe jede Gebühr.' },
    { type: 'tool', ref: 'kosten-impact-simulator', title: 'Kosten-Impact-Simulator', description: 'Was kosten versteckte Gebühren langfristig?' },
  ],
  'verlustrechner-3a': [
    { type: 'tool', ref: 'vergleichsrechner-3a', title: '3a-Vergleichsrechner', description: 'Finde eine bessere Lösung.' },
    { type: 'tool', ref: 'zeitverlust-simulator', title: 'Zeitverlust-Simulator', description: 'Was kostet dich jeder Tag Warten?' },
  ],
  'recovery-analyse': [
    { type: 'tool', ref: 'rendite-risiko-simulation', title: 'Rendite-Risiko-Simulation', description: 'Simuliere deine Anlagestrategie.' },
    { type: 'tool', ref: 'sicherheitsvergleich', title: 'Sicherheitsvergleich', description: 'Wie sicher ist deine Anlage?' },
  ],
  'glaubenssatz-transformer': [
    { type: 'tool', ref: 'finanz-entscheidung', title: 'Finanz-Entscheidung', description: 'Trainiere deine Entscheidungsfähigkeit.' },
    { type: 'tool', ref: 'lebenzeit-rechner', title: 'Lebenzeit-Rechner', description: 'Was zählt wirklich im Leben?' },
  ],
  'finanz-entscheidung': [
    { type: 'tool', ref: 'glaubenssatz-transformer', title: 'Glaubenssatz-Transformer', description: 'Was bremst deine Entscheidungen?' },
    { type: 'tool', ref: 'finanzcheck', title: 'Finanzcheck', description: 'Vollständiger Finanz-Überblick.' },
  ],
  'kostenaufschluesselung': [
    { type: 'tool', ref: 'kosten-impact-simulator', title: 'Kosten-Impact-Simulator', description: 'Verstehe die langfristige Wirkung.' },
    { type: 'tool', ref: 'transparenz-check', title: 'Transparenz-Check', description: 'Prüfe die Transparenz deines Anbieters.' },
  ],
  'tragbarkeitsrechner': [
    { type: 'tool', ref: 'finanzcheck', title: 'Finanzcheck', description: 'Überblick über deine Gesamtfinanzen.' },
    { type: 'tool', ref: 'inflationsrechner', title: 'Inflationsrechner', description: 'Wie ändert sich der Wert über die Jahre?' },
  ],
  'three-a-analyzer': [
    { type: 'tool', ref: 'vergleichsrechner-3a', title: '3a-Vergleichsrechner', description: 'Vergleiche Alternativen.' },
    { type: 'tool', ref: 'kosten-impact-simulator', title: 'Kosten-Impact-Simulator', description: 'Verstehe die Kostenstruktur.' },
  ],
  'zufalls-realitaets-check': [
    { type: 'tool', ref: 'wahrscheinlichkeitsrechner', title: 'Wahrscheinlichkeitsrechner', description: 'Vertiefe dein Risikoverständnis.' },
    { type: 'tool', ref: 'rendite-risiko-simulation', title: 'Rendite-Risiko-Simulation', description: 'Simuliere verschiedene Szenarien.' },
  ],
};
