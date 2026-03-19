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
          'Sehr wichtige Frage – die sich viele stellen, aber selten konkret anschauen.',
          'Der Worst Case wirkt oft schlimmer im Kopf als in der Realität.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Es gibt immer ein negatives Szenario.',
          'Entscheidend ist: wie wahrscheinlich es ist, wie stark es ausfällt und wie man damit umgeht.',
          'Worst Case bei globalem ETF-Portfolio: temporärer Verlust von 40–50 % (historisch).',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Typische negative Szenarien: Markt fällt –20 % bis –40 %, Erholung dauert 2–5 Jahre.',
          'Unterschied zwischen temporärem Rückgang und dauerhaftem Schaden.',
          'Panikverkauf macht temporäre Verluste dauerhaft – investiert bleiben ermöglicht Erholung.',
          'Strategie und Verhalten entscheiden über das Ergebnis, nicht der Crash selbst.',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Was wäre für dich persönlich ein Worst Case?»',
          '«Wie würdest du reagieren, wenn dein Vermögen vorübergehend sinkt?»',
          '«Was wäre schlimmer: kurzfristiger Rückgang oder langfristig zu wenig Wachstum?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Worst Case konkretisieren – nicht abstrakt lassen.',
          'Angst reduzieren durch Klarheit.',
          'Entscheidungsfähigkeit stärken.',
        ],
      },
    ],
    recognition: {
      title: 'Was im Worst Case wichtig ist',
      items: [
        'Rückgänge sind möglich.',
        'Sie sind meist temporär.',
        'Verhalten entscheidet über das Ergebnis.',
        'Strategie hilft, ruhig zu bleiben.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde den Worst Case verstanden und fühlt sich handlungsfähig?',
    steps: [
      { label: 'Realistische Worst-Case-Szenarien anschauen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Entwicklung nach schwierigen Phasen sehen' },
      { label: 'Unterschied: kurzfristiger Rückgang vs. langfristiger Schaden' },
      { label: 'Wie man mit solchen Phasen umgeht' },
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
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Jetzt wird es spannend – wir schauen nicht nur auf heute, sondern auf deine Zukunft.',
          'Die meisten unterschätzen, was über Zeit möglich ist.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Zeit ist der wichtigste Faktor beim Vermögensaufbau.',
          'Regelmässige Einzahlungen verstärken den Effekt enorm.',
          'Struktur + Disziplin = langfristiger Erfolg.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Zinseszins-Effekt: CHF 500/Monat bei 7 % p.a. → ca. CHF 580\'000 nach 30 Jahren.',
          'Je früher der Start, desto stärker der Effekt – 10 Jahre Unterschied können Hunderttausende ausmachen.',
          'Regelmässiges Investieren glättet Marktschwankungen (Cost Averaging).',
          'Kosten und Strategie beeinflussen das Endergebnis erheblich.',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Was wäre für dich ein gutes Ergebnis in 20–30 Jahren?»',
          '«Hast du dir schon einmal konkret vorgestellt, wie sich dein Geld entwickeln könnte?»',
          '«Was würde es für dich verändern, wenn das funktioniert?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Zukunft visualisieren – konkret, nicht abstrakt.',
          'Motivation erzeugen durch greifbare Zahlen.',
          'Klarheit schaffen: gute Entscheidungen wirken langfristig.',
        ],
      },
    ],
    recognition: {
      title: 'Was langfristig den Unterschied macht',
      items: [
        'Zeit verstärkt den Effekt.',
        'Regelmässige Einzahlungen sind entscheidend.',
        'Kleine Unterschiede werden über Jahre gross.',
        'Struktur und Disziplin zahlen sich aus.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde die langfristige Entwicklung verstanden und ist motiviert?',
    steps: [
      { label: 'Entwicklung über Zeit anschauen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Unterschied zwischen früh starten und warten' },
      { label: 'Einfluss von regelmässigem Investieren sehen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Meine persönliche Entwicklung berechnen', toolSlug: 'rendite-risiko-simulation' },
    ],
  },
  'return-3': {
    tileId: 'return-3',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Ein Thema, das viele unterschätzen – weil man es nicht direkt sieht.',
          'Inflation passiert leise – aber konstant.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Geld verliert über Zeit an Kaufkraft.',
          'Scheinbare Sicherheit kann real Verlust bedeuten.',
          'Wachstum ist notwendig, um Kaufkraft zu erhalten.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Schweizer Inflation historisch ca. 1–2 % p.a.',
          'Unterschied: nominaler Geldwert (bleibt gleich) vs. reale Kaufkraft (sinkt).',
          'Beispiel: CHF 100\'000 sind bei 2 % Inflation in 20 Jahren nur noch ca. CHF 67\'000 wert.',
          'Auf dem Sparkonto verliert Geld real an Wert – Aktienanlage ist einer der wenigen Wege, die Kaufkraft zu erhalten.',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Hast du dir schon einmal überlegt, was dein Geld in 20 Jahren noch wert ist?»',
          '«Ist dir wichtiger, dass dein Geld gleich bleibt oder dass es seine Kaufkraft behält?»',
          '«War dir bewusst, dass Stillstand real Verlust bedeuten kann?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Unsichtbares Risiko sichtbar machen.',
          'Verständnis schaffen: Inflation ist ein stiller Wertverlust.',
          'Motivation für sinnvolle Struktur erzeugen.',
        ],
      },
    ],
    recognition: {
      title: 'Was Inflation bedeutet',
      items: [
        'Preise steigen über Zeit.',
        'Geld verliert an Kaufkraft.',
        'Stillstand kann real Verlust sein.',
        'Wachstum schützt langfristig.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde den Einfluss von Inflation verstanden?',
    steps: [
      { label: 'Kaufkraftverlust über Zeit sehen' },
      { label: 'Unterschied zwischen nominal und real verstehen' },
      { label: 'Beispiel: Geld heute vs. in Zukunft' },
      { label: 'Warum Stillstand ein Risiko ist' },
    ],
  },

  // ── Flexibilität & Umsetzung ──
  'flex-1': {
    tileId: 'flex-1',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Sehr wichtige Frage – vor allem, wenn man schlechte Erfahrungen gemacht hat.',
          'Niemand möchte in einer Lösung feststecken.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Nicht alle Lösungen sind gleich flexibel.',
          'Banklösungen (ETF-Depots) sind meist jederzeit auflösbar – keine festen Laufzeiten.',
          'Versicherungslösungen (z. B. 3a-Police) sind oft gebunden – Auszahlung an Bedingungen geknüpft.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Kündigungsfristen: bei Bankprodukten meist T+2 Bankarbeitstage.',
          'Laufzeiten: bei Versicherungen oft 5–10+ Jahre.',
          'Konsequenzen bei Kündigung: mögliche Rückkaufsverluste bei Versicherungsprodukten.',
          'Unterschied zwischen stoppen (keine neuen Einzahlungen), pausieren (vorübergehend) und kündigen (Auflösung).',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Wie wichtig ist dir Flexibilität auf einer Skala von 1–10?»',
          '«Möchtest du jederzeit reagieren können oder lieber eine fixe Struktur haben?»',
          '«Hattest du schon einmal eine negative Erfahrung mit Bindung?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Vertrauen schaffen durch Transparenz.',
          'Entscheidungsfreiheit betonen.',
          'Unterschiede klar aufzeigen.',
        ],
      },
    ],
    recognition: {
      title: 'Was bei Kündigung wichtig ist',
      items: [
        'Nicht jede Lösung ist gleich flexibel.',
        'Kündigung kann Konsequenzen haben.',
        'Pausieren ist oft möglich.',
        'Flexibilität hängt vom Produkt ab.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde die Flexibilität seiner Lösung verstanden?',
    steps: [
      { label: 'Unterschied zwischen flexibel und gebunden' },
      { label: 'Kündigungsbedingungen verstehen' },
      { label: 'Was passiert bei Kündigung?' },
      { label: 'Alternative: pausieren statt kündigen' },
    ],
  },
  'flex-2': {
    tileId: 'flex-2',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Das Leben verändert sich – und eine gute Lösung sollte das auch können.',
          'Es geht nicht nur darum, heute die richtige Entscheidung zu treffen, sondern auch morgen noch flexibel zu bleiben.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Flexibilität bedeutet Anpassbarkeit.',
          'Gute Lösungen lassen sich verändern – starre Produkte können langfristig problematisch sein.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Beiträge können jederzeit angepasst, pausiert oder erhöht werden.',
          'Umschichtungen zwischen Anlageklassen sind möglich.',
          'Strategie wird regelmässig überprüft und bei Bedarf angepasst.',
          'Unterschied zwischen flexiblen Lösungen (Bank/ETF) und starren Produkten (Versicherungspolicen).',
        ],
      },
      {
        heading: 'Gesprächsfragen',
        lines: [
          '«Wie wichtig ist dir, dass du deine Lösung später anpassen kannst?»',
          '«Rechnest du damit, dass sich deine Situation verändern wird?»',
          '«Möchtest du Spielraum haben oder eine fixe Struktur?»',
        ],
      },
      {
        heading: 'Ziel des Gesprächs',
        lines: [
          'Flexibilität als Mehrwert positionieren.',
          'Vertrauen schaffen.',
          'Langfristige Perspektive stärken.',
        ],
      },
    ],
    recognition: {
      title: 'Was Flexibilität bedeutet',
      items: [
        'Deine Situation kann sich ändern.',
        'Gute Lösungen passen sich an.',
        'Anpassungen sollten möglich sein.',
        'Flexibilität gibt dir Kontrolle.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde die Flexibilität der Lösung verstanden?',
    steps: [
      { label: 'Welche Anpassungen sind möglich?' },
      { label: 'Beitrag erhöhen oder reduzieren' },
      { label: 'Strategie jederzeit anpassen' },
      { label: 'Was passiert bei Lebensveränderungen?' },
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
