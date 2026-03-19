/**
 * Configuration mapping each needs-tile to recommended next steps,
 * explanations, and tool links for the "Antworten & Vertiefung" page.
 */

export interface RecommendedStep {
  label: string;
  /** Optional route within the app (tool slug or full path) */
  toolSlug?: string;
  /** Optional external URL */
  externalUrl?: string;
}

/** A structured storyline section for richer explanation blocks */
export interface StorylineSection {
  heading: string;
  /** Paragraphs or bullet points */
  lines: string[];
}

/** Extra checklist block (e.g. "Woran du eine gute Beratung erkennst") */
export interface RecognitionBlock {
  title: string;
  items: string[];
}

export interface TileAnswerConfig {
  /** Matches NeedsTile.id */
  tileId: string;
  /** Simple bullet-point explanation (used when storyline is absent) */
  explanation: string[];
  /** Structured multi-section storyline (takes precedence over explanation) */
  storyline?: StorylineSection[];
  /** Optional recognition / checklist block */
  recognition?: RecognitionBlock;
  /** Optional confirmation prompt shown when status is set to "resolved" */
  resolvedConfirmation?: string;
  /** Recommended tools / actions */
  steps: RecommendedStep[];
  /** Optional sources (togglable) */
  sources?: { title: string; url: string }[];
}

/**
 * Master map – keyed by tile id for O(1) lookup.
 * Add or edit entries here to change what shows for each question.
 */
export const tileAnswerMap: Record<string, TileAnswerConfig> = {
  // ── Vertrauen & Sicherheit ──
  'trust-1': {
    tileId: 'trust-1',
    explanation: [
      'Transparente Offenlegung aller Gebühren und Provisionen.',
      'Unabhängige Beratung ohne Bindung an einzelne Produktanbieter.',
      'Langfristige Kundenbeziehung statt einmaliger Transaktion.',
    ],
    steps: [
      { label: 'Firmenprofil zeigen', toolSlug: undefined },
      { label: 'Referenzen & Kundenstimmen' },
    ],
  },
  'trust-2': {
    tileId: 'trust-2',
    explanation: [
      'Alle Kosten werden vorab offengelegt – keine versteckten Gebühren.',
      'Beratung erfolgt auf Honorar- oder Provisionsbasis – transparent kommuniziert.',
      'Kein Kleingedrucktes: Vertragsbedingungen werden gemeinsam durchgegangen.',
    ],
    steps: [
      { label: 'Kostenübersicht öffnen' },
      { label: 'Vertragsbeispiel zeigen' },
    ],
  },
  'trust-3': {
    tileId: 'trust-3',
    explanation: [
      'Ganzheitlicher Ansatz: Vorsorge, Anlage und Versicherung aus einer Hand.',
      'Evidenzbasierte Strategie statt Bauchgefühl.',
      'Digitale Tools für Transparenz und Nachvollziehbarkeit.',
    ],
    steps: [
      { label: 'Beratungsphilosophie erklären' },
      { label: 'Vergleich mit Bankberatung' },
    ],
  },

  // ── Kosten & Gebühren ──
  'costs-1': {
    tileId: 'costs-1',
    explanation: [
      'Total Expense Ratio (TER) bei ETFs typisch 0.07–0.25 % p.a.',
      'Beratungshonorar oder Courtage transparent dargelegt.',
      'Vergleich: aktive Fonds kosten oft 1.5–2.0 % p.a. – passiv deutlich günstiger.',
    ],
    steps: [
      { label: 'Kostenvergleich-Rechner', toolSlug: 'finanzcheck' },
    ],
  },
  'costs-2': {
    tileId: 'costs-2',
    explanation: [
      'Keine Ausgabeaufschläge, keine Performance Fees bei unserer Strategie.',
      'Depotgebühren und Transaktionskosten werden vorab beziffert.',
      'Steuerliche Auswirkungen werden berücksichtigt.',
    ],
    steps: [
      { label: 'Gebührenübersicht zeigen' },
    ],
  },
  'costs-3': {
    tileId: 'costs-3',
    explanation: [
      'Beispiel: 1% höhere Gebühren reduzieren das Endvermögen nach 30 Jahren um ca. 25%.',
      'Kosteneffekt wird durch den Zinseszins über die Zeit verstärkt.',
      'Visualisierung im Rendite-Risiko-Tool möglich.',
    ],
    steps: [
      { label: 'Rendite- & Risikosimulation öffnen', toolSlug: 'rendite-risiko-simulation' },
    ],
    sources: [
      { title: 'Gerd Kommer – Souverän investieren', url: 'https://gerd-kommer.de/buecher/' },
    ],
  },

  // ── Risiko & Sicherheit ──
  'risk-1': {
    tileId: 'risk-1',
    explanation: [
      'Kurzfristig sind Verluste möglich – langfristig hat der globale Aktienmarkt immer zugelegt.',
      'Diversifikation reduziert das Einzelrisiko erheblich.',
      'Je länger der Anlagehorizont, desto geringer die Verlustwahrscheinlichkeit.',
    ],
    steps: [
      { label: 'Risikosimulation starten', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Historische Marktdaten zeigen' },
    ],
    sources: [
      { title: 'UBS Global Investment Returns Yearbook', url: 'https://www.ubs.com/global/en/investment-bank/in-focus/2024/global-investment-returns-yearbook.html' },
    ],
  },
  'risk-2': {
    tileId: 'risk-2',
    explanation: [
      'Beispiel 2008: MSCI World fiel ca. –40%, erholte sich innerhalb von 4 Jahren vollständig.',
      'Historisch gab es keinen 15-Jahres-Zeitraum mit negativer Rendite am Weltaktienmarkt.',
      'Strategie: Breit diversifiziert investiert bleiben, nicht in Panik verkaufen.',
    ],
    steps: [
      { label: 'Worst-Case-Szenario simulieren', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Historische Crashs zeigen' },
    ],
  },
  'risk-3': {
    tileId: 'risk-3',
    explanation: [
      'Worst Case bei globalem ETF-Portfolio: temporärer Verlust von 40–50% (historisch).',
      'Totalverlust ist bei breiter Diversifikation praktisch ausgeschlossen.',
      'Monte-Carlo-Simulation zeigt die Bandbreite möglicher Szenarien.',
    ],
    steps: [
      { label: 'Monte-Carlo-Simulation öffnen', toolSlug: 'rendite-risiko-simulation' },
    ],
  },

  // ── Rendite & Entwicklung ──
  'return-1': {
    tileId: 'return-1',
    explanation: [
      'Globaler Aktienmarkt: historisch ca. 7–8% p.a. nominal (vor Inflation).',
      'Real (nach Inflation): ca. 5–6% p.a.',
      'Keine Garantie – aber statistisch robuste Langfristerwartung.',
    ],
    steps: [
      { label: 'Renditesimulation starten', toolSlug: 'rendite-risiko-simulation' },
    ],
    sources: [
      { title: 'MSCI World Factsheet', url: 'https://www.msci.com/documents/10199/178e6643-6ae6-47b9-82be-e1fc565ededb' },
    ],
  },
  'return-2': {
    tileId: 'return-2',
    explanation: [
      'Zinseszinseffekt: CHF 500/Monat bei 7% p.a. → ca. CHF 580\'000 nach 30 Jahren.',
      'Je früher der Start, desto stärker der Effekt.',
      'Regelmässiges Investieren glättet Marktschwankungen (Cost Averaging).',
    ],
    steps: [
      { label: 'Langfristprognose berechnen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Vorsorgecheck öffnen', toolSlug: 'vorsorgecheck-3a' },
    ],
  },
  'return-3': {
    tileId: 'return-3',
    explanation: [
      'Schweizer Inflation historisch ca. 1–2% p.a.',
      'Auf dem Sparkonto verliert Geld real an Wert.',
      'Aktienanlage ist einer der wenigen Wege, die Kaufkraft langfristig zu erhalten.',
    ],
    steps: [
      { label: 'Inflationseffekt visualisieren' },
    ],
  },

  // ── Flexibilität & Umsetzung ──
  'flex-1': {
    tileId: 'flex-1',
    explanation: [
      'ETF-Depots können jederzeit teilweise oder vollständig aufgelöst werden.',
      'Keine festen Laufzeiten oder Kündigungsfristen.',
      'Säule 3a: gebundene Vorsorge – Auszahlung an Bedingungen geknüpft.',
    ],
    steps: [
      { label: '3a-Vergleich zeigen', toolSlug: 'kvg-praemienvergleich' },
    ],
  },
  'flex-2': {
    tileId: 'flex-2',
    explanation: [
      'Beiträge können jederzeit angepasst, pausiert oder erhöht werden.',
      'Umschichtungen zwischen Anlageklassen sind möglich.',
      'Strategie wird regelmässig überprüft und bei Bedarf angepasst.',
    ],
    steps: [
      { label: 'Anlagestruktur erklären' },
    ],
  },
  'flex-3': {
    tileId: 'flex-3',
    explanation: [
      'Freies Vermögen: jederzeit verfügbar (T+2 Bankarbeitstage).',
      'Gebundene Vorsorge (3a): Auszahlung bei Pensionierung, Eigenheim, Auswanderung.',
      'Empfehlung: Notgroschen (3–6 Monate) separat auf Sparkonto halten.',
    ],
    steps: [
      { label: 'Liquiditätsplanung erklären' },
    ],
  },

  // ── Entscheidungsfragen ──
  'dec-1': {
    tileId: 'dec-1',
    explanation: [
      'Jedes Jahr ohne Investition kostet durchschnittlich 7–8% entgangene Rendite.',
      'Inflation entwertet Ersparnisse auf dem Sparkonto.',
      'Versicherungslücken können teuer werden, je später man sie schliesst.',
    ],
    steps: [
      { label: 'Opportunitätskosten berechnen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Finanzcheck durchführen', toolSlug: 'finanzcheck' },
    ],
  },
  'dec-2': {
    tileId: 'dec-2',
    explanation: [
      'Basierend auf Kundenprofil, Zielen und Risikobereitschaft.',
      'Evidenzbasierte Strategie: breit diversifiziert, kosteneffizient, langfristig.',
      'Individuelle Anpassung an Lebenssituation.',
    ],
    steps: [
      { label: 'Zusammenfassung erstellen' },
    ],
  },
  'dec-3': {
    tileId: 'dec-3',
    explanation: [
      'Persönliche Empfehlung des Beraters basierend auf Erfahrung und Analyse.',
      'Transparenz: gleiche Strategie, die der Berater selbst verfolgt.',
      'Entscheidung liegt immer beim Kunden – Berater gibt Orientierung.',
    ],
    steps: [
      { label: 'Beratungsempfehlung zusammenfassen' },
    ],
  },
};
