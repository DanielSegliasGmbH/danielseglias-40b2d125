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
          'Ich verstehe diese Frage extrem gut – gerade in der Finanzbranche.',
          'Vertrauen ist hier nicht selbstverständlich, und das ist völlig normal.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Vertrauen entsteht nicht durch Worte – sondern durch Transparenz.',
          'Du sollst nichts glauben müssen. Du kannst alles überprüfen.',
        ],
      },
      {
        heading: 'Arbeitsweise & Vergütung',
        lines: [
          'Ich lege offen, wie ich arbeite und wie ich Geld verdiene.',
          'Mein Vergütungsmodell ist transparent – keine versteckten Provisionen, keine Interessenskonflikte.',
          'Im Unterschied zu klassischen Verkaufsmodellen stehe ich nicht unter Druck, dir ein bestimmtes Produkt zu empfehlen.',
          'Du kannst meine Registrierung, Qualifikationen und Arbeitsweise jederzeit extern überprüfen.',
        ],
      },
      {
        heading: 'Was das konkret bedeutet',
        lines: [
          'Kein Lebenslauf, keine Selbstdarstellung – nur Nachvollziehbarkeit.',
          'Du verstehst jede Entscheidung, jeden Kostenpunkt, jeden Schritt.',
          'Und wenn etwas unklar ist, fragen wir gemeinsam nach.',
        ],
      },
      {
        heading: 'Überleitung',
        lines: [
          'Am Ende musst du dich nicht heute entscheiden.',
          'Aber du sollst das Gefühl haben: Ich kann dem vertrauen, weil ich alles selbst prüfen kann.',
        ],
      },
    ],
    recognition: {
      title: 'Woran du eine vertrauenswürdige Beratung erkennst',
      items: [
        'Du verstehst alle Kosten.',
        'Du kannst jede Entscheidung nachvollziehen.',
        'Du fühlst dich nicht unter Druck gesetzt.',
        'Alle Angaben sind extern überprüfbar.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde aktiv bestätigt, dass Vertrauen vorhanden ist?',
    steps: [
      { label: 'Alles überprüfen', toolSlug: 'transparenz-check' },
      { label: 'Firmenprofil zeigen', externalUrl: 'https://danielseglias.ch' },
      { label: 'Beratungsprozess erklären', toolSlug: 'beratungsreise' },
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
      { label: 'Vertragsbeispiel zeigen', externalUrl: 'https://drive.google.com/file/d/1uHrEHm1ZBDaDbVNMQ88bewaOuu9QXg_5/view?usp=drive_link' },
    ],
  },
  'trust-3': {
    tileId: 'trust-3',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Die meisten Unterschiede sind nicht sofort sichtbar.',
          'Auf den ersten Blick wirken viele Anbieter ähnlich – der Unterschied zeigt sich meist erst im Detail.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Der grösste Unterschied liegt nicht im Produkt – sondern in der Art, wie beraten wird.',
        ],
      },
      {
        heading: 'Klassische Beratung',
        lines: [
          'Fokus auf Produktverkauf.',
          'Provisionen im Hintergrund.',
          'Wenig Transparenz bei Kosten und Entscheidungen.',
          'Anbieter und Abschluss stehen im Mittelpunkt.',
        ],
      },
      {
        heading: 'Mein Ansatz',
        lines: [
          'Fokus auf Verständnis – du sollst nachvollziehen können, warum etwas empfohlen wird.',
          'Transparente Struktur – Kosten, Vergütung und Prozess sind offen.',
          'Klare Aufklärung – keine Verkaufsrhetorik, sondern ehrliche Einordnung.',
          'Du stehst im Mittelpunkt – nicht ein Produkt.',
        ],
      },
      {
        heading: 'Überleitung',
        lines: [
          'Am Ende geht es nicht darum, ob etwas gut klingt – sondern ob du es wirklich verstehst und dahinter stehen kannst.',
        ],
      },
    ],
    recognition: {
      title: 'Woran du den Unterschied erkennst',
      items: [
        'Du verstehst, warum etwas empfohlen wird.',
        'Es gibt keine versteckten Interessen.',
        'Du fühlst dich aufgeklärt, nicht überredet.',
        'Die Beratung dreht sich um dich, nicht um ein Produkt.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde den Unterschied klar erkannt?',
    steps: [
      { label: 'Unterschiede sehen', toolSlug: 'transparenz-check' },
      { label: 'Beratungsphilosophie erklären' },
      { label: 'Vergleich mit klassischer Beratung' },
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
          'Die meisten schauen auf das, was sie einzahlen – nicht auf das, was sie verlieren.',
          'Kosten spürt man nicht sofort. Aber sie fehlen am Ende – und zwar deutlich.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Die eigentlichen Kosten sieht man oft nicht direkt – sondern erst über Zeit.',
          'Das Problem ist nicht, dass Kosten existieren. Sondern dass sie unsichtbar bleiben.',
        ],
      },
      {
        heading: 'Kostenarten',
        lines: [
          'Direkte Gebühren – Verwaltungskosten, Abschlussgebühren, TER.',
          'Indirekte Kosten – Einschränkungen bei Flexibilität, Wechselgebühren, versteckte Margen.',
          'Opportunitätskosten – die verpasste Rendite, die du nie siehst.',
          'Über mehrere Jahrzehnte kann das einen Unterschied von mehreren hunderttausend Franken machen.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Die entscheidende Frage ist nicht, ob Kosten existieren – sondern ob du sie kennst und verstehst.',
          'Wer seine Kosten kennt, trifft bessere Entscheidungen. Wer sie nicht kennt, zahlt doppelt.',
        ],
      },
      {
        heading: 'Gesprächsleitfaden',
        lines: [
          'Ruhig bleiben – keine Überforderung erzeugen.',
          'Den Kunden selbst erkennen lassen, nicht überreden.',
          '«War dir bewusst, dass solche Kosten überhaupt anfallen?»',
          '«Weisst du, was dich deine aktuelle Lösung langfristig wirklich kostet?»',
        ],
      },
    ],
    recognition: {
      title: 'Worauf du bei Kosten achten solltest',
      items: [
        'Kosten reduzieren deine Rendite – nicht einmalig, sondern laufend.',
        'Kleine Unterschiede wirken langfristig enorm durch den Zinseszinseffekt.',
        'Transparenz ist wichtiger als schöne Produktverpackung.',
        'Entscheidend ist, was am Ende bei dir bleibt – nicht was auf dem Papier steht.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde die Kostenlogik verstanden und fühlt sich informiert?',
    steps: [
      { label: 'Kosten konkret anschauen', toolSlug: 'vergleichsrechner-3a' },
      { label: 'Langfristige Kostenwirkung zeigen', toolSlug: 'verlustrechner-3a' },
      { label: 'Meine aktuelle Lösung analysieren', toolSlug: 'mini-3a-kurzcheck' },
    ],
  },
  'costs-2': {
    tileId: 'costs-2',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Die meisten Kosten sind nicht direkt versteckt – aber sie sind auch nicht immer offensichtlich.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Viele Kosten sind indirekt eingebaut – und werden deshalb oft unterschätzt.',
        ],
      },
      {
        heading: 'Was oft übersehen wird',
        lines: [
          'Fondskosten (TER), die nicht separat ausgewiesen werden.',
          'Strukturkosten, die in der Produktgestaltung stecken.',
          'Eingebaute Provisionen, die den Ertrag schmälern.',
          'Produktabhängige Gebühren, die erst bei genauerem Hinsehen sichtbar werden.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Das Problem ist nicht, dass es diese Kosten gibt – sondern dass sie selten klar ausgewiesen werden.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Die entscheidende Frage ist: Weisst du wirklich, wo überall Kosten entstehen?',
        ],
      },
      {
        heading: 'Gesprächsleitfaden (intern)',
        lines: [
          'Ruhig bleiben – kein Angriff auf bestehende Lösung.',
          'Aufklären statt kritisieren.',
          'Kunden selbst erkennen lassen.',
        ],
      },
    ],
    steps: [
      { label: 'Kostenstruktur anschauen', toolSlug: 'vergleichsrechner-3a' },
      { label: 'Kostenaufschlüsselung öffnen', toolSlug: 'kostenaufschluesselung' },
    ],
  },
  'costs-3': {
    tileId: 'costs-3',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Auf den ersten Blick wirken Kosten oft klein – 1% klingt nicht nach viel.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Über Zeit wirken Kosten wie ein stiller Gegenspieler.',
          'Sie reduzieren nicht nur deine Rendite – sie reduzieren auch den Zinseszins auf diese Rendite.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Kosten wirken jährlich – nicht einmalig.',
          'Sie reduzieren die Rendite direkt.',
          'Und sie wirken exponentiell: Weniger Rendite → weniger Zinseszins → weniger Endkapital.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Ein Unterschied von 1–2% kann über mehrere Jahrzehnte mehrere hunderttausend Franken ausmachen.',
          'Das klingt abstrakt – aber genau das zeigen die Zahlen.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Die entscheidende Frage ist nicht, ob du Kosten hast – sondern wie stark sie dein Ergebnis beeinflussen.',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Ruhig erklären – nicht überfordern.',
          '📊 Visuell arbeiten – Kosten-Impact-Simulator nutzen.',
          '💡 Kunde soll selbst erkennen, nicht belehrt werden.',
          '📦 Möglicher Angebotsbaustein: Optimierung.',
        ],
      },
    ],
    steps: [
      { label: 'Unterschied berechnen', toolSlug: 'kosten-impact-simulator' },
      { label: '3a Vergleichsrechner öffnen', toolSlug: 'vergleichsrechner-3a' },
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
          'Die ehrliche Antwort ist: Ja – kurzfristig kann dein Geld schwanken.',
          'Das ist wahrscheinlich die wichtigste Frage überhaupt.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Die entscheidende Frage ist nicht, ob es Schwankungen gibt – sondern wie du damit umgehst.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Kurzfristige Schwankungen sind normal und gehören zum Investieren dazu.',
          'Die langfristige Entwicklung breit diversifizierter Märkte war historisch positiv.',
          'Das Verhalten des Anlegers ist oft entscheidender als der Markt selbst.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Die grössten Verluste entstehen oft nicht durch den Markt – sondern durch falsche Entscheidungen im falschen Moment.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Die entscheidende Frage ist nicht, ob es schwankt – sondern ob du eine Strategie hast, damit umzugehen.',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Ehrlich bleiben – keine Verharmlosung.',
          '🛡️ Sicherheit durch Verständnis schaffen, nicht durch Versprechen.',
          '📊 Visualisierung nutzen: Recovery-Analyse zeigen.',
          '💡 Angst in rationale Entscheidungsbasis umwandeln.',
        ],
      },
    ],
    recognition: {
      title: 'Was du über Risiko wissen solltest',
      items: [
        'Schwankungen gehören zum Investieren dazu.',
        'Kurzfristige Verluste sind möglich – aber historisch haben sich breite Märkte erholt.',
        'Entscheidend ist die richtige Struktur, Zeit und Verhalten.',
        'Panik-Verkäufe sind oft gefährlicher als der Markt selbst.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde das Risiko verstanden und fühlt sich sicher genug?',
    steps: [
      { label: 'Risiko verstehen', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Recovery-Analyse anschauen', toolSlug: 'recovery-analyse' },
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
          'Ein Börsencrash klingt im ersten Moment extrem – und fühlt sich auch so an.',
          'Was passiert mit deinem Geld, wenn die Märkte plötzlich stark fallen?',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Crashs gehören zum System – sie sind nicht die Ausnahme, sondern Teil davon.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          'Märkte können kurzfristig stark fallen – das ist historisch mehrfach passiert.',
          'Sie haben sich bisher jedoch immer wieder erholt.',
          'Zeit ist der entscheidende Faktor: Je länger der Horizont, desto geringer das Risiko.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Ein Crash ist kein dauerhafter Verlust – sondern eine Phase.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Die entscheidende Frage ist nicht, ob es Crashs gibt – sondern wie du darauf vorbereitet bist.',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Ruhig bleiben – keine Dramatisierung.',
          '📊 Beispiele zeigen: Recovery-Analyse nutzen.',
          '🖥️ Visuell erklären – Crash-Verläufe und Erholungsphasen zeigen.',
          '💡 Verhalten als entscheidenden Faktor hervorheben.',
        ],
      },
    ],
    recognition: {
      title: 'Was bei Crashs wichtig ist',
      items: [
        'Rückgänge gehören zur Börse dazu – sie sind Teil des Systems.',
        'Märkte haben sich historisch immer erholt.',
        'Ein Crash ist eine Phase, kein dauerhafter Verlust.',
        'Entscheidend ist Vorbereitung und Verhalten, nicht der Crash selbst.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde Crashs als Teil des Systems verstanden und fühlt sich vorbereitet?',
    steps: [
      { label: 'Crash-Verlauf anschauen', toolSlug: 'recovery-analyse' },
      { label: 'Risiko simulieren', toolSlug: 'rendite-risiko-simulation' },
    ],
  },

  'risk-4': {
    tileId: 'risk-4',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Sicherheit ist eines der wichtigsten Themen – aber viele verstehen darunter etwas Unterschiedliches.',
          'Was bedeutet für dich eigentlich Sicherheit – keine Schwankung oder langfristige Stabilität?',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Es gibt nicht die eine Sicherheit – sondern verschiedene Arten von Sicherheit.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Kurzfristige Sicherheit: kaum Schwankung, aber tiefe Rendite.',
          '2. Langfristige Sicherheit: Wachstum und Kaufkraft erhalten.',
          '3. System-Sicherheit: Struktur, Verwaltung, Zugriff.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Das vermeintlich sicherste Geld ist oft das, das langfristig am meisten verliert.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Die entscheidende Frage ist nicht, ob es sicher ist – sondern welche Art von Sicherheit du möchtest.',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Sicherheit nicht versprechen – sondern differenzieren.',
          '📊 Unterschiede erklären: kurzfristig vs. langfristig vs. strukturell.',
          '💡 Verständnis schaffen statt falsche Versprechen.',
        ],
      },
    ],
    recognition: {
      title: 'Was Sicherheit wirklich bedeutet',
      items: [
        'Sicherheit ist mehrdimensional – nicht nur Stabilität.',
        'Inflation kann Kaufkraft still und leise auffressen.',
        'Wachstum schützt langfristig besser als Stillstand.',
        'Struktur und Diversifikation geben echte Stabilität.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde ein erweitertes Verständnis von Sicherheit gewonnen?',
    steps: [
      { label: 'Sicherheitsvergleich anschauen', toolSlug: 'sicherheitsvergleich' },
      { label: 'Inflation berechnen', toolSlug: 'inflationsrechner' },
      { label: 'Risiko simulieren', toolSlug: 'rendite-risiko-simulation' },
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
          'Lass uns das kurz realistisch einordnen – ohne Marketing, ohne Versprechen.',
          'Was glaubst du – wie viel Rendite ist langfristig realistisch?',
          'Viele denken entweder zu wenig (Angst) oder viel zu viel (Gier). Die Wahrheit liegt irgendwo dazwischen.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Langfristiger Vermögensaufbau basiert auf stabiler, realistischer Rendite – nicht auf Glück.',
          'Rendite ist kein Zufall, sondern systematisch.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Historische Realität: Globale Aktienmärkte lieferten ca. 6–8 % pro Jahr langfristig.',
          '2. Schwankungen gehören dazu: Kurzfristig hoch und runter, langfristig klarer Aufwärtstrend.',
          '3. Rendite ist der Preis für Risiko: Kein Risiko = keine Rendite. Aber kontrolliertes Risiko = planbarer Erfolg.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Es geht nicht darum, die beste Rendite zu finden – sondern eine, die zuverlässig funktioniert.',
          'Nicht die Rendite entscheidet – sondern die Konstanz.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Weg von Spekulation – hin zu Strategie.',
          'Die meisten verlieren Geld, weil sie falsche Erwartungen haben.',
          'Zeit ist wichtiger als Timing.',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Frage stellen und Kunde selbst schätzen lassen.',
          '📊 Extreme spiegeln: zu hoch / zu tief.',
          '📈 Realität einordnen: 6–8 % langfristig.',
          '🔗 Verbindung zu Strategie herstellen: breit diversifizierte Lösung, marktorientierte Strategie, langfristige Planung.',
          '💡 «Die meisten verlieren Geld, weil sie falsche Erwartungen haben.»',
          '💡 «Nicht die Rendite entscheidet – sondern die Konstanz.»',
          '💡 «Zeit ist wichtiger als Timing.»',
          '📌 Angebotsbausteine: Strategie, Optimierung.',
          '📝 Konzeptidee: «Rendite-Bandbreiten-Visualizer» – 3 Szenarien (pessimistisch / realistisch / optimistisch) nebeneinander, visuell verständlich, emotional klar. Noch NICHT umsetzen.',
        ],
      },
    ],
    recognition: {
      title: 'Was bei Rendite entscheidend ist',
      items: [
        'Realistische Erwartung: 6–8 % p.a. langfristig.',
        'Rendite ist kein Zufall, sondern systematisch.',
        'Schwankungen gehören dazu – Konstanz ist entscheidend.',
        'Kontrolliertes Risiko = planbarer Erfolg.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde eine realistische Renditeerwartung und versteht, dass Konstanz wichtiger ist als maximale Rendite?',
    steps: [
      { label: 'Rendite & Risiko simulieren', toolSlug: 'rendite-risiko-simulation' },
      { label: 'Zinseszins-Wirkung berechnen', toolSlug: 'kosten-impact-simulator' },
    ],
    sources: [
      { title: 'MSCI World Factsheet', url: 'https://www.msci.com/documents/10199/178e6643-6ae6-47b9-82be-e1fc565ededb' },
      { title: 'UBS Global Investment Returns Yearbook (DMS)', url: 'https://www.ubs.com/global/en/investment-bank/in-focus/2024/global-investment-returns-yearbook.html' },
    ],
  },
  'return-2': {
    tileId: 'return-2',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Die meisten unterschätzen komplett, was Zeit mit Geld macht.',
          'Hast du dir schon mal überlegt, wie sich dein Geld über 10, 20 oder 30 Jahre entwickelt? Nicht in der Theorie – sondern konkret?',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Zeit ist der grösste Hebel im Vermögensaufbau.',
          'Nicht dein Einsatz entscheidet – sondern wie lange dein Geld arbeitet.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Zinseszins-Effekt: Erträge erzeugen neue Erträge – Wachstum wird mit der Zeit immer schneller.',
          '2. Zeit schlägt Timing: Früher starten ist wichtiger als perfekt starten. Wer wartet, verliert exponentiell.',
          '3. Konstanz gewinnt: Regelmässig investieren > einmalige Entscheidung. Disziplin schlägt Emotion.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Nicht dein Einsatz entscheidet – sondern wie lange dein Geld arbeitet.',
          'Die ersten Jahre fühlen sich langsam an – danach explodiert es.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Weg von «wann einsteigen?» – hin zu «wie lange investiert bleiben?».',
          'Die meisten starten zu spät, nicht zu schlecht.',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Kunde fragen: «Wie stellst du dir dein Geld in 20 Jahren vor?»',
          '📊 Visualisierung mit Zinseszinsrechner zeigen – konkret, nicht abstrakt.',
          '📈 Unterschied zeigen: früh vs. spät starten.',
          '⏸️ Emotionalen Effekt wirken lassen (Pause!).',
          '💡 «Zeit ist der wichtigste Faktor – nicht die Rendite.»',
          '💡 «Die ersten Jahre fühlen sich langsam an – danach explodiert es.»',
          '💡 «Die meisten starten zu spät, nicht zu schlecht.»',
          '📌 Angebotsbausteine: automatisierte Investition, langfristige Strategie, disziplinierte Umsetzung.',
          '📝 Konzeptidee: «Zeitverlust-Simulator» – zeigt Unterschied Start heute vs. Start in 5 Jahren. Tool existiert bereits im Werkzeugkasten.',
          '🔗 Diese Frage baut direkt auf 10.10 auf und bereitet vor für: Inflation, Opportunitätskosten, «nichts tun».',
        ],
      },
    ],
    recognition: {
      title: 'Was langfristig den Unterschied macht',
      items: [
        'Zeit ist der grösste Hebel – nicht die Rendite.',
        'Zinseszins wirkt exponentiell über lange Zeiträume.',
        'Früher starten schlägt perfekt starten.',
        'Konstanz und Disziplin gewinnen langfristig.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde die langfristige Wirkung von Zeit verstanden und ist motiviert, früh zu starten?',
    steps: [
      { label: 'Zinseszins-Wirkung berechnen', toolSlug: 'kosten-impact-simulator' },
      { label: 'Zeitverlust simulieren', toolSlug: 'zeitverlust-simulator' },
      { label: '3a-Vergleich langfristig anschauen', toolSlug: 'vergleichsrechner-3a' },
    ],
  },
  'return-3': {
    tileId: 'return-3',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Inflation ist wie ein unsichtbarer Gegner – du siehst ihn nicht, aber er wirkt jeden Tag.',
          'Was glaubst du – wird dein Geld auf dem Konto in Zukunft mehr wert… oder weniger?',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Wenn dein Geld nicht wächst, wird es automatisch weniger wert.',
          'Stillstand ist kein Stillstand – es ist ein schleichender Rückschritt.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Kaufkraftverlust: Preise steigen → Geld kauft weniger. Gleiche 100 CHF = weniger Leistung.',
          '2. Real vs. nominal: Konto zeigt gleiche Zahl, aber der reale Wert sinkt.',
          '3. Langfristiger Effekt: 2–3 % Inflation über Jahre = massiver Verlust. Oft komplett unterschätzt.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Stillstand ist kein Stillstand – es ist ein schleichender Rückschritt.',
          'Nicht investieren ist auch eine Entscheidung – mit Konsequenzen.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Weg von «Ich verliere ja nichts» – hin zu «Ich verliere jeden Tag Kaufkraft».',
          'Weg von «Sicherheit auf dem Konto» – hin zu «Kaufkraft erhalten und steigern».',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Frage stellen: «Wird dein Geld mehr oder weniger wert?» – Kunden antworten lassen.',
          '📊 Inflation einfach erklären – kein Fachjargon! Alltagsbeispiele bringen.',
          '🔧 Tool einsetzen: Inflationsrechner zeigen (Kaufkraftverlust über Zeit).',
          '💡 «Inflation ist die grösste, leiseste Enteignung.»',
          '💡 «Du siehst es nicht auf dem Konto – aber du spürst es im Alltag.»',
          '💡 «Nicht investieren ist auch eine Entscheidung.»',
          '📌 Angebotsbausteine: reale Rendite (nach Inflation!), langfristige Kaufkraftsicherung, inflationsresistente Anlagen.',
          '⚠️ Diese Frage ist ein «Schmerzverstärker» – erhöht die Dringlichkeit massiv.',
          '🔗 Baut auf Rendite (10.10) und Zeit (10.11) auf. Führt direkt zu «Was passiert, wenn ich nichts mache?» (10.16).',
        ],
      },
    ],
    recognition: {
      title: 'Was Inflation wirklich bedeutet',
      items: [
        'Preise steigen – Geld kauft weniger.',
        'Konto zeigt gleiche Zahl, Wert sinkt real.',
        'Stillstand = schleichender Rückschritt.',
        'Wachstum ist nötig, um Kaufkraft zu erhalten.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde verstanden, dass Nichtstun real Geld kostet und Inflation ein unsichtbarer Gegner ist?',
    steps: [
      { label: 'Kaufkraftverlust berechnen', toolSlug: 'inflationsrechner' },
      { label: 'Inflation vs. Wachstum vergleichen', toolSlug: 'kosten-impact-simulator' },
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
          'Das ist einer der grössten Unterschiede zwischen guten und schlechten Lösungen.',
          'Was passiert eigentlich, wenn du das Ganze wieder beenden willst? Bist du flexibel… oder gebunden?',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Eine gute Lösung gibt dir jederzeit Kontrolle – keine Einschränkung.',
          'Flexibilität ist kein Bonus – sie ist Voraussetzung.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Unterschied der Systeme: Flexible Lösungen sind jederzeit anpassbar/stoppbar. Starre Lösungen haben lange Bindung, oft teuer beim Ausstieg.',
          '2. Transparenz entscheidend: Viele Produkte wirken flexibel, sind es aber nicht. Details liegen oft im Kleingedruckten.',
          '3. Entscheidungsfreiheit: Du solltest jederzeit reagieren können. Leben verändert sich → Lösung muss mitgehen.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Nicht die Rendite ist das Risiko – sondern fehlende Flexibilität.',
          'Viele merken erst beim Ausstieg, wie unflexibel ihre Lösung ist.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Weg von «Hoffentlich passt das langfristig» – hin zu «Ich kann jederzeit reagieren».',
          'Weg von «Ich binde mich und bin ausgeliefert» – hin zu «Ich entscheide jederzeit selbst».',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Frage bewusst platzieren – Vertrauensmoment!',
          '📊 Unterschied erklären: flexibel vs. gebunden (Versicherung vs. Konto/Depot).',
          '📋 Beispiele nennen: Versicherung mit 10-Jahres-Bindung vs. ETF-Depot ohne Laufzeit.',
          '✅ Klar Position beziehen: Flexibilität ist Voraussetzung.',
          '💡 «Du solltest nie in etwas investieren, aus dem du nicht rauskommst.»',
          '💡 «Flexibilität ist kein Bonus – sie ist Voraussetzung.»',
          '💡 «Viele merken erst beim Ausstieg, wie unflexibel ihre Lösung ist.»',
          '📌 Angebotsbausteine: flexible 3a-Lösungen (Konto/Depot), keine langfristigen Verpflichtungen, jederzeitige Anpassbarkeit.',
          '🔗 Baut Vertrauen auf, reduziert Abschlusswiderstand. Bereitet vor für Flexibilität (10.14) und Zugriff (10.15).',
        ],
      },
    ],
    recognition: {
      title: 'Was bei Flexibilität entscheidend ist',
      items: [
        'Gute Lösungen geben jederzeit Kontrolle.',
        'Starre Produkte sind oft teuer beim Ausstieg.',
        'Flexibilität ist Voraussetzung, nicht Bonus.',
        'Leben verändert sich – Lösung muss mitgehen.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde verstanden, dass eine gute Lösung jederzeit Kontrolle und Flexibilität bietet?',
    steps: [
      { label: 'Flexible vs. starre Lösungen vergleichen', toolSlug: 'vergleichsrechner-3a' },
    ],
  },
  'flex-2': {
    tileId: 'flex-2',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Flexibilität ist einer der meist unterschätzten Faktoren – bis man sie braucht.',
          'Dein Leben wird sich in den nächsten Jahren verändern – oder? Die entscheidende Frage ist: Passt sich deine Lösung daran an… oder musst du dich der Lösung anpassen?',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Eine gute Lösung passt sich deinem Leben an – nicht umgekehrt.',
          'Flexibilität ist keine Option – sie ist Absicherung gegen dein zukünftiges Leben.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Lebensveränderungen: Jobwechsel, Familie, Einkommen, Ziele – die Lösung muss darauf reagieren können.',
          '2. Anpassungsmöglichkeiten: Beiträge erhöhen / reduzieren / pausieren, Strategie verändern.',
          '3. Zukunftsoffenheit: Niemand weiss, was kommt. Flexibilität = Sicherheit für Ungewissheit.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Flexibilität ist keine Option – sie ist Absicherung gegen dein zukünftiges Leben.',
          'Flexibilität merkst du erst, wenn du sie brauchst.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Weg von «Hauptsache gestartet» – hin zu «richtige Struktur von Anfang an».',
          'Weg von «passt schon irgendwie» – hin zu «ich brauche eine Lösung, die sich meinem Leben anpasst».',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Zukunftsfrage stellen: «Wird sich dein Leben verändern?» – Kunden zustimmen lassen.',
          '📊 Problem aufzeigen: starre Lösungen → Risiko bei Veränderung.',
          '✅ Lösung positionieren: flexibel = überlegen.',
          '💡 «Die meisten Fehler passieren nicht beim Start – sondern später.»',
          '💡 «Flexibilität merkst du erst, wenn du sie brauchst.»',
          '💡 «Dein Leben ist dynamisch – deine Lösung sollte es auch sein.»',
          '📌 Angebotsbausteine: flexible Einzahlungen, Anpassbarkeit der Strategie, keine starren Verpflichtungen.',
          '🔗 Baut direkt auf 10.13 auf (Kündbarkeit → Flexibilität). Bereitet vor für Zugriff (10.15).',
        ],
      },
    ],
    recognition: {
      title: 'Was Flexibilität wirklich bedeutet',
      items: [
        'Gute Lösungen passen sich dem Leben an.',
        'Starre Produkte sind ein Risiko bei Veränderung.',
        'Flexibilität ist Absicherung, nicht Bonus.',
        'Beiträge und Strategie müssen anpassbar sein.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde erkannt, dass Flexibilität eine Voraussetzung ist und seine Lösung sich dem Leben anpassen muss?',
    steps: [
      { label: 'Flexible vs. starre Lösungen vergleichen', toolSlug: 'vergleichsrechner-3a' },
    ],
  },
  'flex-3': {
    tileId: 'flex-3',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Hier ist es extrem wichtig, sauber zu unterscheiden – weil viele ein falsches Bild haben.',
          'Kommst du eigentlich jederzeit wieder an dein Geld ran? Oder gibt es Einschränkungen, die du kennen solltest?',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Zugriff ist geregelt – und genau das hat einen Grund.',
          'Die Einschränkung ist kein Nachteil – sie ist Teil des Systems.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Unterschied freie vs. gebundene Vorsorge: Freies Vermögen ist jederzeit verfügbar. Säule 3a ist bewusst eingeschränkt.',
          '2. Warum diese Einschränkung existiert: Steuerliche Vorteile → klare Regeln. System basiert auf langfristigem Denken.',
          '3. Spezielle Bezugsgründe: z. B. Selbstständigkeit, Eigenheim, Auswanderung. Zugriff ist möglich – aber definiert.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Die Einschränkung ist kein Nachteil – sie ist Teil des Systems.',
          'Du bekommst Vorteile – dafür gibt es klare Regeln.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Weg von «Ich komme nicht mehr ran» – hin zu «Ich nutze ein System mit klaren Regeln und Vorteilen».',
          'Weg von «Ich verliere die Kontrolle» – hin zu «Ich weiss genau, wann und wie ich Zugriff habe».',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Frage stellen: «Hast du jederzeit Zugriff?» – Missverständnisse aufdecken.',
          '📊 System erklären: 3a vs. freies Vermögen – Unterschied klar machen.',
          '📋 Gründe logisch herleiten: Steuervorteil = Regeln. Vorteile betonen.',
          '💡 «Eingeschränkt bedeutet nicht schlecht – sondern gezielt gesteuert.»',
          '💡 «Du bekommst Vorteile – dafür gibt es klare Regeln.»',
          '💡 «Die Frage ist nicht: jederzeit Zugriff – sondern sinnvoller Zugriff.»',
          '📌 Angebotsbausteine: Kombination freies Vermögen + 3a, strategische Aufteilung, steueroptimierte Struktur.',
          '🔗 Reduziert Unsicherheit, klärt häufiges Missverständnis. Bereitet vor für «Was passiert, wenn ich nichts mache?» (10.16).',
        ],
      },
    ],
    recognition: {
      title: 'Was beim Zugriff wichtig ist',
      items: [
        'Freies Vermögen: jederzeit verfügbar.',
        'Gebundene Vorsorge: geregelt, nicht gesperrt.',
        'Einschränkungen haben einen klaren Grund (Steuervorteile).',
        'Strategische Aufteilung gibt Sicherheit und Struktur.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde verstanden, wann und wie er Zugriff hat und warum die Regeln sinnvoll sind?',
    steps: [
      { label: '3a vs. freies Vermögen vergleichen', toolSlug: 'vergleichsrechner-3a' },
    ],
  },

  // ── Entscheidungsfragen ──
  'dec-1': {
    tileId: 'dec-1',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Die meisten denken, Nichtstun sei neutral… ist es aber nicht.',
          'Was passiert eigentlich… wenn du einfach nichts machst? Also alles genau so lässt, wie es heute ist?',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Nicht zu handeln hat oft die grössten Kosten.',
          'Das grösste Risiko ist oft, nichts zu tun.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Inflation wirkt weiter: Kaufkraft sinkt jeden Tag. Geld verliert real an Wert.',
          '2. Zeitverlust: Zinseszins arbeitet nicht. Verpasste Jahre kommen nicht zurück.',
          '3. Opportunitätskosten: Chancen werden nicht genutzt. Unterschied wird mit der Zeit massiv.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Das grösste Risiko ist oft, nichts zu tun.',
          'Die meisten bereuen nicht ihre Entscheidung – sondern ihr Zögern.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Weg von «abwarten» – hin zu «bewusst entscheiden».',
          'Weg von «Ich kann ja später entscheiden» – hin zu «Nicht entscheiden hat auch Konsequenzen».',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Frage stellen → Pause zulassen (wichtig!). Kunden selbst nachdenken lassen.',
          '📊 Dann logisch auflösen: Inflation + Zeit + Chancen.',
          '⚠️ KEIN Druck → nur Klarheit schaffen!',
          '💡 «Nicht entscheiden ist auch eine Entscheidung.»',
          '💡 «Zeit arbeitet entweder für dich… oder gegen dich.»',
          '💡 «Die meisten bereuen nicht ihre Entscheidung – sondern ihr Zögern.»',
          '📌 Angebotsbausteine: sofortiger Start (auch klein), schrittweise Umsetzung, Begleitung statt Perfektion.',
          '🔥 Diese Frage ist ein «Entscheidungs-Trigger» – sehr hohe Priorität!',
          '🔗 Kombiniert Rendite (10.10) + Zeit (10.11) + Inflation (10.12). Führt direkt zu «Was ist für mich die beste Lösung?» (10.17).',
        ],
      },
    ],
    recognition: {
      title: 'Was Stillstand wirklich bedeutet',
      items: [
        'Nichtstun ist nicht neutral – es hat Kosten.',
        'Inflation, Zeitverlust und Opportunitätskosten wirken gleichzeitig.',
        'Zeit arbeitet – ob du handelst oder nicht.',
        'Die meisten bereuen das Zögern, nicht die Entscheidung.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde erkannt, dass Nichtstun aktive Kosten verursacht und ist bereit, bewusst zu entscheiden?',
    steps: [
      { label: 'Zeitverlust simulieren', toolSlug: 'zeitverlust-simulator' },
      { label: 'Kaufkraftverlust berechnen', toolSlug: 'inflationsrechner' },
      { label: 'Zinseszins-Wirkung sehen', toolSlug: 'kosten-impact-simulator' },
    ],
  },
  'dec-2': {
    tileId: 'dec-2',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Die Wahrheit ist: Es gibt nicht DIE eine beste Lösung für alle.',
          'Jetzt die entscheidende Frage: Was ist eigentlich die beste Lösung… für dich persönlich? Nicht für alle – sondern wirklich für deine Situation.',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Die beste Lösung ist immer individuell – abhängig von deiner Situation.',
          'Es geht nicht darum, das Beste zu finden – sondern das Passende.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Ausgangslage: Einkommen, Ziele, Alter, bestehende Lösungen – alles spielt eine Rolle.',
          '2. Prioritäten: Sicherheit vs. Rendite, Flexibilität vs. Struktur.',
          '3. Strategie statt Produkt: Es geht nicht um «das beste Produkt», sondern um die richtige Kombination.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Es geht nicht darum, das Beste zu finden – sondern das Passende.',
          'Es geht nicht um richtig oder falsch – sondern um passend.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Weg von «Was ist generell gut?» – hin zu «Was ist für MICH sinnvoll?».',
          'Weg von Vergleich – hin zu individueller Strategie.',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Übergang schaffen: von Problem → Lösung.',
          '📊 Individualität betonen – keine Standardempfehlung.',
          '📋 Keine Überforderung → klare Struktur bieten.',
          '🔜 Empfehlung vorbereiten (noch nicht final!).',
          '💡 «Die beste Lösung ist immer individuell.»',
          '💡 «Es geht nicht um richtig oder falsch – sondern um passend.»',
          '💡 «Ich zeige dir gleich, was für dich konkret Sinn macht.»',
          '📌 Angebotsbausteine: individuelle Strategie, Kombination verschiedener Bausteine, klare Struktur und Umsetzung.',
          '🔥 Diese Frage ist die Brücke zum Abschluss – bündelt alle vorherigen Erkenntnisse!',
          '🔗 Bereitet direkt vor für Empfehlung (10.18). Sehr hoher Prioritäts-Übergang.',
        ],
      },
    ],
    recognition: {
      title: 'Was eine gute Lösung ausmacht',
      items: [
        'Sie passt individuell zur Situation.',
        'Es gibt keine Standardlösung für alle.',
        'Strategie ist wichtiger als einzelne Produkte.',
        'Die richtige Kombination macht den Unterschied.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde verstanden, dass seine Lösung individuell sein muss und ist er offen für eine klare Empfehlung?',
    steps: [
      { label: 'Lösungsvergleich anschauen', toolSlug: 'vergleichsrechner-3a' },
      { label: 'Risiko & Rendite abstimmen', toolSlug: 'rendite-risiko-simulation' },
    ],
  },
  'dec-3': {
    tileId: 'dec-3',
    explanation: [],
    storyline: [
      {
        heading: 'Einstieg',
        lines: [
          'Ich gebe dir jetzt keine allgemeine Antwort – sondern eine klare Empfehlung.',
          'Wenn ich das alles zusammenfasse… und du mich ganz ehrlich fragst: Was würde ich an deiner Stelle tun?',
        ],
      },
      {
        heading: 'Kernbotschaft',
        lines: [
          'Basierend auf deiner Situation gibt es eine sinnvolle nächste Entscheidung.',
          'Das ist nicht kompliziert – es ist klar.',
        ],
      },
      {
        heading: 'Erklärung',
        lines: [
          '1. Situation zusammenfassen: kurz, präzise, relevant – zeigt Verständnis.',
          '2. Empfehlung aussprechen: klar, einfach, umsetzbar – keine 10 Optionen.',
          '3. Begründung: logisch + emotional – warum genau diese Lösung passt.',
        ],
      },
      {
        heading: 'Aha-Moment',
        lines: [
          'Das ist nicht kompliziert – es ist klar.',
          'Du musst es nicht perfekt machen – aber anfangen.',
        ],
      },
      {
        heading: 'Shift',
        lines: [
          'Weg von «Ich überlege noch» – hin zu «Ich will eine klare Empfehlung».',
          'Weg von Unsicherheit – hin zu Entscheidungsbereitschaft.',
        ],
      },
      {
        heading: 'Interner Leitfaden',
        lines: [
          '🎯 Übergang von 10.17 nutzen – Situation des Kunden spiegeln.',
          '✅ Klare Empfehlung geben – keine Unsicherheit zeigen!',
          '⏸️ Danach: Pause → wirken lassen.',
          '💡 «Wenn ich in deiner Situation wäre, würde ich…»',
          '💡 «Das ist aus meiner Sicht der sinnvollste nächste Schritt.»',
          '💡 «Du musst es nicht perfekt machen – aber anfangen.»',
          '📌 Angebotsbausteine: konkrete Umsetzung, klarer nächster Schritt, Begleitung anbieten.',
          '🔥 Finale Frage der Sequenz – wandelt Verständnis → Entscheidung. Abschlussmoment!',
        ],
      },
    ],
    recognition: {
      title: 'Worauf die Empfehlung basiert',
      items: [
        'Deine persönliche Situation und Ziele.',
        'Alle besprochenen Erkenntnisse gebündelt.',
        'Eine klare, umsetzbare Strategie.',
        'Kein Produkt-Verkauf, sondern individuelle Lösung.',
      ],
    },
    resolvedConfirmation: 'Hat der Kunde die Empfehlung verstanden und ist bereit, eine Entscheidung zu treffen?',
    steps: [
      { label: 'Lösung bestätigen', toolSlug: 'vergleichsrechner-3a' },
    ],
  },
};
