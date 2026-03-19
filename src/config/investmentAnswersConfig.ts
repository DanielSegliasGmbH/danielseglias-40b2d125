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
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Eine der wichtigsten Fragen überhaupt – und absolut berechtigt.',
          'Am Ende geht es nicht nur um Zahlen, sondern darum, ob du dich auf die Person gegenüber verlassen kannst.',
        ],
      },
      {
        heading: 'Transparenz',
        lines: [
          'Ich zeige dir transparent, wie ich arbeite und wie ich Geld verdiene.',
          'Keine versteckten Interessen – du sollst jederzeit verstehen, warum wir etwas machen.',
        ],
      },
      {
        heading: 'Was uns unterscheidet',
        lines: [
          'Keine produktgetriebene Beratung – Fokus auf Strategie statt Abschluss.',
          'Langfristige Begleitung statt einmaliger Verkauf.',
          'Evidenzbasierte Empfehlungen statt Bauchgefühl.',
        ],
      },
      {
        heading: 'Vertrauensanker',
        lines: [
          'Echte Kundenstimmen und Erfahrungen – keine leeren Versprechen.',
          'Reale Beispiele aus der Beratungspraxis.',
          'Nachvollziehbare Resultate und langfristige Kundenbeziehungen.',
        ],
      },
      {
        heading: 'Überleitung',
        lines: [
          'Am Ende musst du dich nicht heute entscheiden – sondern verstehen, ob das für dich Sinn ergibt.',
        ],
      },
    ],
    recognition: {
      title: 'Woran du eine gute Beratung erkennst',
      items: [
        'Du verstehst alle Kosten.',
        'Du kannst jede Entscheidung nachvollziehen.',
        'Du fühlst dich nicht unter Druck gesetzt.',
        'Es geht um deine Situation, nicht um ein Produkt.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde aktiv bestätigt, dass Vertrauen vorhanden ist?',
    steps: [
      { label: 'Firmenprofil zeigen' },
      { label: 'Referenzen & Kundenstimmen' },
      { label: 'Beratungsprozess erklären' },
      { label: 'Beispiel-Kundenfall zeigen' },
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
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Die meisten Menschen unterschätzen nicht die Rendite – sondern die Kosten.',
          'Gebühren spürt man oft nicht direkt, aber sie fehlen später im Vermögen.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Kosten reduzieren die Rendite – nicht einmalig, sondern laufend.',
          'Über viele Jahre entsteht daraus ein grosser Unterschied.',
          'Total Expense Ratio (TER) bei ETFs typisch 0.07–0.25 % p.a. – aktive Fonds kosten oft 1.5–2.0 % p.a.',
        ],
      },
      {
        heading: 'Arten von Kosten',
        lines: [
          'Abschlusskosten – oft einmalig, aber spürbar.',
          'Laufende Verwaltungsgebühren – jährlich vom Vermögen abgezogen.',
          'Produktkosten (TER) – im Fonds versteckt.',
          'Mögliche versteckte Kosten – z. B. Depotgebühren, Transaktionskosten.',
        ],
      },
      {
        heading: 'Beratungslogik',
        lines: [
          'Zuerst Verständnis schaffen – dann Unterschiede zeigen.',
          'Danach die aktuelle Lösung des Kunden konkret einordnen.',
          'Beratungshonorar oder Courtage wird transparent dargelegt.',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«War dir bewusst, dass solche Kosten überhaupt anfallen?»',
          '«Wie wichtig ist dir volle Transparenz bei so einer Entscheidung?»',
          '«Möchtest du lieber tiefe Kosten oder ein Produkt, das sich nur gut anhört?»',
        ],
      },
    ],
    recognition: {
      title: 'Worauf du bei Kosten achten solltest',
      items: [
        'Kosten reduzieren deine Rendite.',
        'Kleine Unterschiede wirken langfristig stark.',
        'Transparenz ist wichtiger als schöne Verpackung.',
        'Entscheidend ist, was am Ende bei dir bleibt.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde die Kostenlogik verstanden und fühlt sich informiert?',
    steps: [
      { label: 'Gebührenvergleich anzeigen', toolSlug: 'finanzcheck' },
      { label: 'Langfristige Kostenwirkung zeigen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Meine aktuelle Lösung analysieren' },
      { label: 'Unterschied zwischen teuer und effizient zeigen' },
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
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Sehr wichtige Frage – und absolut berechtigt.',
          'Die meisten Menschen haben nicht Angst vor schlechten Produkten, sondern vor Verlust.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Risiko ist real, aber steuerbar.',
          'Schwankung ≠ permanenter Verlust.',
          'Zeit reduziert Risiko erheblich.',
          'Falsche Struktur kann ein grösseres Risiko sein als die Börse selbst.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Unterschied zwischen Volatilität (kurzfristige Schwankung) und echtem Verlust.',
          'Diversifikation reduziert das Einzelrisiko erheblich.',
          'Je länger der Anlagehorizont, desto geringer die Verlustwahrscheinlichkeit.',
          'Historisch gab es keinen 15-Jahres-Zeitraum mit negativer Rendite am Weltaktienmarkt.',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Was genau macht dir am meisten Sorgen – kurzfristige Schwankungen oder langfristiger Verlust?»',
          '«Wie würdest du reagieren, wenn dein Portfolio zwischenzeitlich sinkt?»',
          '«Ist dir wichtiger: keine Schwankung oder bessere langfristige Chancen?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Angst in Verständnis umwandeln.',
          'Emotionale Sicherheit schaffen.',
          'Rationale Entscheidungsbasis schaffen.',
        ],
      },
    ],
    recognition: {
      title: 'Was du über Risiko wissen solltest',
      items: [
        'Schwankungen gehören zum Investieren dazu.',
        'Kurzfristige Verluste sind möglich.',
        'Langfristig gleichen sich viele Schwankungen aus.',
        'Entscheidend ist die richtige Struktur und Zeit.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde das Risiko verstanden und fühlt sich sicher genug?',
    steps: [
      { label: 'Worst-Case-Szenario anschauen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Historische Marktentwicklung sehen' },
      { label: 'Unterschied zwischen Risiko und Verlust verstehen' },
      { label: 'Wie sich Zeit auf Risiko auswirkt', toolSlug: 'rendite-risiko-simulation' },
    ],
    sources: [
      { title: 'UBS Global Investment Returns Yearbook', url: 'https://www.ubs.com/global/en/investment-bank/in-focus/2024/global-investment-returns-yearbook.html' },
    ],
  },
  'risk-2': {
    tileId: 'risk-2',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Das ist die konkrete Form von Risiko, die viele im Kopf haben.',
          'Die Frage ist nicht, ob ein Crash passiert – sondern wie man damit umgeht.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Crashs passieren regelmässig – sie sind Teil des Systems.',
          'Historisch haben sich Märkte immer wieder erholt.',
          'Entscheidend ist das Verhalten währenddessen, nicht der Crash selbst.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Beispiel 2008: MSCI World fiel ca. –40 %, erholte sich innerhalb von 4 Jahren vollständig.',
          'Typische Rückgänge von –20 % bis –30 % kommen alle paar Jahre vor.',
          'Unterschied zwischen Panikverkauf (Verlust realisieren) und investiert bleiben (Erholung mitnehmen).',
          'Historisch gab es keinen 15-Jahres-Zeitraum mit negativer Rendite am Weltaktienmarkt.',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Wie würdest du reagieren, wenn dein Portfolio kurzfristig 20–30 % fällt?»',
          '«Was wäre dein erster Impuls?»',
          '«Was wäre langfristig die bessere Entscheidung?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Emotionale Reaktion bewusst machen.',
          'Rationale Strategie aufbauen.',
          'Vertrauen in den Prozess stärken.',
        ],
      },
    ],
    recognition: {
      title: 'Was bei einem Crash wichtig ist',
      items: [
        'Rückgänge gehören zur Börse dazu.',
        'Märkte haben sich historisch immer erholt.',
        'Verhalten in solchen Phasen ist entscheidend.',
        'Langfristig zählt die Strategie, nicht der Moment.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde verstanden, wie er bei einem Crash reagieren sollte?',
    steps: [
      { label: 'Typische Crashs anschauen' },
      { label: 'Erholung nach Crashs sehen' },
      { label: 'Was passiert, wenn man investiert bleibt', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Vergleich: Panikverkauf vs. ruhig bleiben', toolSlug: 'rendite-risiko-simulation' },
    ],
  },
  'risk-3': {
    tileId: 'risk-3',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Das ist eine der extremsten, aber wichtigen Fragen.',
          'Viele denken das, sprechen es aber nicht immer aus.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Totalverlust ist theoretisch möglich, aber extrem unwahrscheinlich bei breiter Streuung.',
          'Unterschied: Einzelaktie (hohes Risiko) vs. global diversifiziertes Portfolio (deutlich stabiler).',
          'Worst Case bei globalem ETF-Portfolio: temporärer Verlust von 40–50 % (historisch).',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Was müsste passieren, damit alles auf 0 fällt? – Zusammenbruch der gesamten Weltwirtschaft.',
          'Globale Wirtschaft vs. einzelnes Unternehmen: völlig unterschiedliche Risikoklasse.',
          'Diversifikation verteilt das Risiko auf Tausende Unternehmen weltweit.',
          'Totalverlust ist bei breiter Diversifikation praktisch ausgeschlossen.',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Wovor genau hast du Angst – kurzfristige Verluste oder wirklich alles zu verlieren?»',
          '«Was müsste passieren, damit die gesamte Weltwirtschaft zusammenbricht?»',
          '«Wie realistisch schätzt du dieses Szenario ein?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Worst Case bewusst machen – nicht lächerlich machen.',
          'Irrationalen Angstanteil reduzieren.',
          'Rationales Verständnis aufbauen.',
        ],
      },
    ],
    recognition: {
      title: 'Was du über Totalverlust wissen solltest',
      items: [
        'Einzelne Anlagen können ausfallen.',
        'Breite Streuung reduziert das Risiko massiv.',
        'Ein Totalverlust bedeutet Zusammenbruch ganzer Märkte.',
        'Solche Szenarien sind extrem selten.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde den Unterschied zwischen Einzel- und Marktrisiko verstanden?',
    steps: [
      { label: 'Unterschied: Einzelaktie vs. Gesamtmarkt' },
      { label: 'Was müsste passieren für einen Totalverlust' },
      { label: 'Wie Diversifikation schützt' },
      { label: 'Realistische vs. extreme Szenarien', toolSlug: 'rendite-risiko-simulation' },
    ],
  },

  'risk-4': {
    tileId: 'risk-4',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Sicherheit ist für jeden wichtig – aber viele verstehen darunter etwas anderes.',
          'Die Frage ist nicht nur, ob dein Geld sicher ist, sondern wovor es geschützt sein soll.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Es gibt verschiedene Arten von Sicherheit: kurzfristige Stabilität, langfristige Kaufkraft, strukturelle Sicherheit.',
          'Vermeintlich sichere Lösungen können langfristig riskant sein (Inflation, tiefe Rendite).',
          'Sicherheit entsteht durch Struktur, nicht durch Stillstand.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Geld auf dem Konto: stabil, aber Kaufkraftverlust durch Inflation (1–2 % p.a.).',
          'Investition: schwankt kurzfristig, bietet aber langfristiges Wachstum.',
          'Diversifikation und Struktur geben Stabilität, ohne auf Rendite zu verzichten.',
          'Rolle der Inflation: CHF 100\'000 sind in 20 Jahren nur noch ca. CHF 67\'000 wert (bei 2 % Inflation).',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Was bedeutet für dich Sicherheit?»',
          '«Ist dir wichtiger, dass es sich ruhig anfühlt oder dass es langfristig funktioniert?»',
          '«Hast du schon einmal darüber nachgedacht, dass Stillstand auch ein Risiko sein kann?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Sicherheitsverständnis erweitern.',
          'Perspektive verändern: Stillstand ≠ Sicherheit.',
          'Vertrauen in langfristige Lösung schaffen.',
        ],
      },
    ],
    recognition: {
      title: 'Was Sicherheit wirklich bedeutet',
      items: [
        'Sicherheit ist nicht nur Stabilität.',
        'Inflation kann Kaufkraft reduzieren.',
        'Wachstum schützt langfristig besser.',
        'Struktur und Diversifikation geben Stabilität.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde ein erweitertes Verständnis von Sicherheit gewonnen?',
    steps: [
      { label: 'Unterschied zwischen sicher und sinnvoll' },
      { label: 'Einfluss von Inflation verstehen' },
      { label: 'Vergleich: Konto vs. Investition' },
      { label: 'Wie Struktur Sicherheit gibt' },
    ],
  },

  // ── Rendite & Entwicklung ──
  'return-1': {
    tileId: 'return-1',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Die meisten unterschätzen nicht die Rendite – sondern die Zeit.',
          'Es geht nicht darum, schnell viel zu gewinnen, sondern langfristig sinnvoll zu wachsen.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Rendite ist eine Erwartung, kein Versprechen.',
          'Zeit ist der wichtigste Hebel – der Zinseszins entfaltet seine Wirkung über Jahre.',
          'Struktur (Kosten, Diversifikation) entscheidet stark über das Endergebnis.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Globaler Aktienmarkt: historisch ca. 7–8 % p.a. nominal (vor Inflation).',
          'Real (nach Inflation): ca. 5–6 % p.a. – keine Garantie, aber statistisch robust.',
          'Kurzfristige Schwankungen sind normal – langfristig zeigt der Trend nach oben.',
          'Regelmässige Einzahlungen glätten das Risiko (Cost Averaging).',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Was wäre für dich ein gutes Ergebnis in 20–30 Jahren?»',
          '«Ist dir Sicherheit wichtiger oder Wachstum?»',
          '«Hast du schon einmal gesehen, wie sich Geld über Zeit entwickelt?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Realistische Erwartung setzen – keine unrealistischen Versprechen.',
          'Motivation erzeugen durch konkrete Beispiele.',
          'Klarheit schaffen: gute Entscheidungen wirken langfristig.',
        ],
      },
    ],
    recognition: {
      title: 'Was bei Rendite entscheidend ist',
      items: [
        'Rendite entsteht über Zeit, nicht kurzfristig.',
        'Schwankungen gehören dazu.',
        'Struktur und Kosten beeinflussen das Ergebnis stark.',
        'Entscheidend ist, was langfristig bei dir ankommt.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde eine realistische Renditeerwartung und versteht den Zeithorizont?',
    steps: [
      { label: 'Entwicklung über Zeit anschauen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Unterschied zwischen Sparen und Investieren sehen' },
      { label: 'Best- / Worst-Case vergleichen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Meine mögliche Entwicklung berechnen', toolSlug: 'rendite-risiko-simulation' },
    ],
    sources: [
      { title: 'MSCI World Factsheet', url: 'https://www.msci.com/documents/10199/178e6643-6ae6-47b9-82be-e1fc565ededb' },
      { title: 'UBS Global Investment Returns Yearbook', url: 'https://www.ubs.com/global/en/investment-bank/in-focus/2024/global-investment-returns-yearbook.html' },
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
