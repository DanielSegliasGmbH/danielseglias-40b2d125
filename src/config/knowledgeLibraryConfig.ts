/**
 * Wissensbibliothek – Konfiguration
 * Strukturierte Inhalte für das Finanzberatungs-Tool
 * Fokus: Schweizer Vorsorgesystem, Investieren, Versicherungen, Steuern
 */

export interface KnowledgeArticle {
  id: string;
  categoryId: string;
  title: string;
  shortDescription: string;
  whyImportant: string;
  practiceExample: string;
  visualization: string;
  commonMistakes: string[];
  customerRelevance: string;
  linkedToolKey?: string;
  linkedToolLabel?: string;
  sources?: { title: string; url?: string }[];
  internalNotes?: string;
  technicalDetails?: string;
  /** Estimated reading time in minutes */
  readingMinutes: number;
  /** XP awarded for reading */
  xpReward: number;
  /** ISO date string when article was added – for "Neu" badge */
  addedAt?: string;
}

export interface KnowledgeCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  emoji: string;
  color: string;
  articles: KnowledgeArticle[];
}

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  // ─── 1. Säulen & Vorsorge ───
  {
    id: 'saeulen-vorsorge',
    title: 'Säulen & Vorsorge',
    description: 'Das Schweizer 3-Säulen-System & private Vorsorge',
    icon: 'Building2',
    emoji: '🏦',
    color: 'scale-6',
    articles: [
      {
        id: 'drei-saeulen-system',
        categoryId: 'saeulen-vorsorge',
        title: 'Das 3-Säulen-System der Schweiz',
        shortDescription: 'Die Schweizer Vorsorge basiert auf drei Säulen: staatliche AHV, berufliche Vorsorge und private Vorsorge.',
        whyImportant: 'Nur wer das Gesamtsystem versteht, kann gezielt die richtigen Entscheidungen treffen.',
        practiceExample: 'Anna (35) verdient CHF 85\'000 pro Jahr. Ihre AHV-Rente wird rund CHF 2\'390/Monat betragen, die Pensionskasse zahlt etwa CHF 1\'800. Die 3. Säule schliesst diese Lücke.',
        visualization: 'Dreistufige Darstellung: Säule 1 (AHV/IV) als Basis, Säule 2 (BVG) als mittlere Schicht, Säule 3 als Dach.',
        commonMistakes: [
          'Viele glauben, AHV und Pensionskasse reichen aus',
          'Der Unterschied zwischen Säule 3a und 3b wird oft verwechselt',
          'Die Vorsorgelücke wird erst kurz vor der Pensionierung bemerkt',
        ],
        customerRelevance: 'Verstehst du, wie dein Einkommen im Alter zusammengesetzt sein wird?',
        sources: [
          { title: 'BSV – Bundesamt für Sozialversicherungen', url: 'https://www.bsv.admin.ch' },
        ],
        readingMinutes: 4,
        xpReward: 20,
        addedAt: '2025-01-15',
      },
      {
        id: 'vorsorgeluecke',
        categoryId: 'saeulen-vorsorge',
        title: 'Die Vorsorgelücke verstehen',
        shortDescription: 'Die Differenz zwischen deinem letzten Lohn und der tatsächlichen Rente kann erheblich sein.',
        whyImportant: 'Wer die eigene Vorsorgelücke kennt, kann gezielt handeln.',
        practiceExample: 'Thomas (42) verdient CHF 120\'000. Seine projizierte Rente beträgt ca. CHF 5\'200/Monat. Sein Lebensstil kostet CHF 7\'500/Monat. Die Lücke: CHF 2\'300.',
        visualization: 'Balkenvergleich: Aktuelles Einkommen vs. projizierte Rente, mit rot markierter Lücke.',
        commonMistakes: [
          'Die Vorsorgelücke wird unterschätzt',
          'Inflation wird nicht berücksichtigt',
          'Erwartete Rente wird zu hoch eingeschätzt',
        ],
        customerRelevance: 'Weisst du, wie viel dir im Alter tatsächlich fehlen wird?',
        linkedToolKey: 'vorsorgecheck',
        linkedToolLabel: 'Vorsorge-Check starten',
        readingMinutes: 3,
        xpReward: 20,
      },
      {
        id: 'ahv-grundlagen',
        categoryId: 'saeulen-vorsorge',
        title: 'AHV – Was bekommst du wirklich?',
        shortDescription: 'Die maximale Einzelrente beträgt CHF 2\'450/Monat – egal, wie viel du verdient hast.',
        whyImportant: 'Viele Menschen überschätzen ihre AHV-Rente.',
        practiceExample: 'Marc hat 40 Jahre eingezahlt und verdient CHF 150\'000. Seine AHV-Rente: maximal CHF 2\'450/Monat – nur 20% seines Einkommens.',
        visualization: 'Kreisdiagramm: Anteil der AHV am Gesamteinkommen bei verschiedenen Lohnklassen.',
        commonMistakes: [
          '«Die AHV wird schon reichen» – ein häufiger Irrtum',
          'Beitragslücken durch Auslandsjahre werden vergessen',
          'Unterschied zwischen Einzel- und Ehepaarrente ist unklar',
        ],
        customerRelevance: 'Kennst du deine voraussichtliche AHV-Rente?',
        readingMinutes: 3,
        xpReward: 20,
      },
      {
        id: '3a-steuervorteile',
        categoryId: 'saeulen-vorsorge',
        title: 'Steuervorteile der Säule 3a',
        shortDescription: 'Einzahlungen in die Säule 3a kannst du vollständig vom steuerbaren Einkommen abziehen.',
        whyImportant: 'Die Säule 3a ist eines der wenigen legalen Steuerspar-Instrumente in der Schweiz.',
        practiceExample: 'Lisa (30) zahlt den Maximalbetrag von CHF 7\'056 ein. Bei einem Grenzsteuersatz von 30% spart sie CHF 2\'117 Steuern – jedes Jahr.',
        visualization: 'Vergleichstabelle: Steuerersparnis bei verschiedenen Einkommen und Kantonen.',
        commonMistakes: [
          'Einzahlung wird vergessen oder aufgeschoben',
          'Maximalbetrag wird nicht ausgeschöpft',
          'Steuerersparnis beim Bezug wird nicht eingeplant',
        ],
        customerRelevance: 'Nutzt du den Steuervorteil bereits voll aus?',
        linkedToolKey: 'finanzcheck',
        linkedToolLabel: 'Finanzcheck starten',
        sources: [
          { title: 'Eidg. Steuerverwaltung – Säule 3a', url: 'https://www.estv.admin.ch' },
        ],
        readingMinutes: 4,
        xpReward: 20,
      },
      {
        id: '3a-anbieter-vergleich',
        categoryId: 'saeulen-vorsorge',
        title: 'Bank vs. Versicherung – Wohin mit dem 3a-Geld?',
        shortDescription: 'Banklösung (flexibel) oder Versicherungslösung (mit Schutz) – beide haben Vor- und Nachteile.',
        whyImportant: 'Die Wahl des 3a-Anbieters beeinflusst Rendite, Flexibilität und Kosten über Jahrzehnte.',
        practiceExample: 'Sarah wählte eine Versicherungslösung mit 0.8% Gebühren. Nach 30 Jahren: CHF 18\'000 mehr an Gebühren als bei einer günstigen Banklösung.',
        visualization: 'Gegenüberstellung: Bank vs. Versicherung.',
        commonMistakes: [
          'Versicherungslösung wird ohne Alternativen abgeschlossen',
          'Versteckte Gebühren werden nicht beachtet',
          'Kündigungsfristen und Rückkaufswerte sind unklar',
        ],
        customerRelevance: 'Weisst du, was deine aktuelle 3a-Lösung kostet?',
        linkedToolKey: 'kvg-praemienvergleich',
        linkedToolLabel: '3a-Vergleich öffnen',
        readingMinutes: 5,
        xpReward: 20,
      },
      {
        id: '3a-splitting',
        categoryId: 'saeulen-vorsorge',
        title: 'Gestaffelter Bezug (3a-Splitting)',
        shortDescription: 'Wer mehrere 3a-Konten führt und gestaffelt bezieht, spart bei der Auszahlung massiv Steuern.',
        whyImportant: 'Ohne Splitting kann die Steuer beim Bezug schnell mehrere tausend Franken betragen.',
        practiceExample: 'Peter hat CHF 200\'000 auf einem Konto. Alles auf einmal: CHF 12\'000 Steuern. Verteilt auf 4 Konten: nur CHF 6\'800.',
        visualization: 'Zeitstrahl mit 4 Konten und gestaffelten Bezugsjahren.',
        commonMistakes: [
          'Nur ein 3a-Konto eröffnet',
          'Splitting wird zu spät begonnen',
          'Kantonale Unterschiede werden ignoriert',
        ],
        customerRelevance: 'Hast du bereits mehrere 3a-Konten? Falls nicht – es lohnt sich, heute damit zu beginnen.',
        readingMinutes: 3,
        xpReward: 20,
      },
      {
        id: 'case-fruehpensionierung',
        categoryId: 'saeulen-vorsorge',
        title: 'Praxis: 5 Jahre früher in Pension',
        shortDescription: 'Mit einer gezielten Strategie konnte dieses Paar 5 Jahre vor dem ordentlichen Pensionsalter aufhören.',
        whyImportant: 'Frühpensionierung ist eine Frage der Planung.',
        practiceExample: 'Sandra (52) und Reto (54) haben CHF 600\'000 aufgebaut. Durch optimale Entnahmestrategie können sie mit 60 aufhören.',
        visualization: 'Kapitalverlauf: Aufbauphase, Übergangsphase, Entnahmephase.',
        commonMistakes: [
          'Lebenshaltungskosten im Alter unterschätzen',
          'Keine Brückenrente einplanen',
          'Steuern beim Bezug nicht optimieren',
        ],
        customerRelevance: 'Hast du den Wunsch, früher aufzuhören? Wir zeigen dir, ob und wie das möglich ist.',
        readingMinutes: 5,
        xpReward: 20,
        addedAt: '2026-03-01',
      },
    ],
  },

  // ─── 2. Investieren & ETFs ───
  {
    id: 'investieren-etfs',
    title: 'Investieren & ETFs',
    description: 'Renditechancen verstehen und nutzen',
    icon: 'TrendingUp',
    emoji: '📈',
    color: 'scale-8',
    articles: [
      {
        id: 'was-ist-rendite',
        categoryId: 'investieren-etfs',
        title: 'Was bedeutet Rendite eigentlich?',
        shortDescription: 'Rendite ist der Gewinn, den dein investiertes Geld über die Zeit erwirtschaftet.',
        whyImportant: 'Ohne Rendite verliert dein Geld durch Inflation an Wert.',
        practiceExample: 'CHF 10\'000 mit 1% Zins ergeben nach 30 Jahren CHF 13\'478. Mit 5%: CHF 43\'219.',
        visualization: 'Wachstumskurven: CHF 10\'000 bei 1%, 3%, 5% und 7% über 30 Jahre.',
        commonMistakes: [
          'Rendite wird mit Gewinn verwechselt',
          'Gebühren werden bei der Renditeberechnung vergessen',
          'Historische Rendite wird als Garantie missverstanden',
        ],
        customerRelevance: 'Verstehst du, wie dein Geld für dich arbeiten kann?',
        linkedToolKey: 'rendite-risiko',
        linkedToolLabel: 'Risiko- & Renditesimulation öffnen',
        readingMinutes: 3,
        xpReward: 20,
      },
      {
        id: 'etf-grundlagen',
        categoryId: 'investieren-etfs',
        title: 'ETFs – Die einfachste Art zu investieren',
        shortDescription: 'Ein ETF bildet einen Index wie den MSCI World ab – breit gestreut und kostengünstig.',
        whyImportant: 'ETFs sind die beliebteste Anlageform für langfristigen Vermögensaufbau.',
        practiceExample: 'Ein MSCI World ETF enthält über 1\'500 Unternehmen aus 23 Ländern. Durchschnittliche Rendite: rund 8% pro Jahr.',
        visualization: 'Weltkarte mit eingefärbten Regionen.',
        commonMistakes: [
          'ETFs werden mit Einzelaktien verwechselt',
          'Zu viele verschiedene ETFs im Portfolio',
          'Unterschied zwischen physisch und synthetisch ist unklar',
        ],
        customerRelevance: 'ETFs können ein einfacher Einstieg in die Welt des Investierens sein.',
        linkedToolKey: 'rendite-risiko',
        linkedToolLabel: 'Simulation starten',
        readingMinutes: 4,
        xpReward: 20,
        addedAt: '2026-02-15',
      },
      {
        id: 'zinseszins',
        categoryId: 'investieren-etfs',
        title: 'Die Macht des Zinseszins',
        shortDescription: 'Der Zinseszins sorgt dafür, dass dein Geld exponentiell wächst – je länger, desto stärker.',
        whyImportant: 'Wer früh beginnt, profitiert überproportional.',
        practiceExample: 'Mit 25 Jahren CHF 200/Monat bei 6% → mit 65 rund CHF 400\'000. Start mit 35: nur CHF 200\'000.',
        visualization: 'Zwei Wachstumskurven: Start mit 25 vs. Start mit 35.',
        commonMistakes: [
          '«Ich fange später an» – jedes Jahr zählt',
          'Zu früh Gewinne entnehmen unterbricht den Zinseszins',
          'Effekt wird bei kleinen Beträgen unterschätzt',
        ],
        customerRelevance: 'Je früher du startest, desto mehr arbeitet die Zeit für dich.',
        readingMinutes: 3,
        xpReward: 20,
      },
      {
        id: 'sparplan-strategie',
        categoryId: 'investieren-etfs',
        title: 'Sparplan – Regelmässig investieren',
        shortDescription: 'Ein Sparplan investiert automatisch jeden Monat einen festen Betrag.',
        whyImportant: 'Regelmässigkeit schlägt Timing.',
        practiceExample: 'Julia investiert CHF 500/Monat in einen globalen ETF. Nach 15 Jahren: über CHF 135\'000.',
        visualization: 'Monatliche Balken mit unterschiedlichen Kaufpreisen und Gesamtwert-Linie.',
        commonMistakes: [
          'Sparplan in Krisenzeiten stoppen',
          'Zu kleine oder zu grosse Beträge wählen',
          'Sparplan nie überprüfen oder anpassen',
        ],
        customerRelevance: 'Ein Sparplan ist der einfachste Weg, mit dem Investieren zu beginnen.',
        readingMinutes: 3,
        xpReward: 20,
      },
      {
        id: 'diversifikation',
        categoryId: 'investieren-etfs',
        title: 'Diversifikation – Nicht alles auf eine Karte',
        shortDescription: 'Verteile dein Geld auf verschiedene Anlageklassen, Regionen und Branchen.',
        whyImportant: 'Diversifikation schützt langfristig.',
        practiceExample: 'Portfolio nur Schweizer Aktien: 2022 -18%. Global diversifiziert: nur -8%.',
        visualization: 'Kuchendiagramm eines diversifizierten Portfolios.',
        commonMistakes: [
          'Nur in bekannte Firmen investieren (Home Bias)',
          'Über-Diversifikation mit 20+ ETFs',
          'Diversifikation nur innerhalb einer Anlageklasse',
        ],
        customerRelevance: 'Eine gute Streuung ist die Grundlage jeder soliden Anlagestrategie.',
        readingMinutes: 4,
        xpReward: 20,
      },
      {
        id: 'rebalancing',
        categoryId: 'investieren-etfs',
        title: 'Rebalancing – Portfolio in Balance halten',
        shortDescription: 'Regelmässiges Rebalancing stellt die ursprüngliche Portfolio-Aufteilung wieder her.',
        whyImportant: 'Ohne Rebalancing wird dein Portfolio unbemerkt risikoreicher.',
        practiceExample: 'Markus hat 60/40 Aktien/Obligationen. Nach Börsenboom: 75/25 – viel risikoreicher als geplant.',
        visualization: 'Vorher/Nachher-Diagramm: Aufteilung vor und nach Rebalancing.',
        commonMistakes: [
          'Rebalancing wird vergessen',
          'Zu häufiges Rebalancing verursacht Kosten',
          'Emotionales statt regelbasiertes Anpassen',
        ],
        customerRelevance: 'Wir kümmern uns darum, dass dein Portfolio immer in Balance bleibt.',
        readingMinutes: 3,
        xpReward: 20,
      },
    ],
  },

  // ─── 3. Versicherungen ───
  {
    id: 'versicherungen',
    title: 'Versicherungen',
    description: 'Richtige Absicherung für jede Lebenslage',
    icon: 'ShieldCheck',
    emoji: '🛡️',
    color: 'scale-5',
    articles: [
      {
        id: 'boersencrash-mythos',
        categoryId: 'versicherungen',
        title: '«Die Börse ist wie ein Casino» – Wirklich?',
        shortDescription: 'Kurzfristig schwanken die Märkte. Langfristig steigen sie seit über 100 Jahren.',
        whyImportant: 'Angst vor Verlusten ist der häufigste Grund, nicht zu investieren.',
        practiceExample: 'Wer 2008 CHF 100\'000 investiert hatte und blieb: 2023 über CHF 350\'000.',
        visualization: 'Langfristiger Aktienchart mit markierten Krisen.',
        commonMistakes: [
          'Bei Kursrückgängen panisch verkaufen',
          'Medien-Headlines als Anlageentscheid nutzen',
          'Kurzfristige Schwankungen mit Risiko verwechseln',
        ],
        customerRelevance: 'Verstehst du den Unterschied zwischen Schwankung und echtem Risiko?',
        linkedToolKey: 'rendite-risiko',
        linkedToolLabel: 'Risikosimulation öffnen',
        readingMinutes: 4,
        xpReward: 20,
      },
      {
        id: 'faq-sicherheit',
        categoryId: 'versicherungen',
        title: '«Ist mein Geld sicher, wenn ich investiere?»',
        shortDescription: 'Langfristig ja – kurzfristig gibt es Schwankungen. Dafür gibt es Strategien.',
        whyImportant: 'Sicherheit ist ein Grundbedürfnis.',
        practiceExample: 'In jedem 15-Jahres-Zeitraum seit 1970 hat ein diversifiziertes Portfolio noch nie einen Verlust erzielt.',
        visualization: 'Rollierende 15-Jahres-Renditen des MSCI World.',
        commonMistakes: [
          'Sicherheit mit Liquidität verwechseln',
          'Kurzfristige Schwankungen als Verlust betrachten',
          'Keine Notreserve vor dem Investieren aufbauen',
        ],
        customerRelevance: 'Dein Geld ist gut aufgehoben – wenn die Strategie stimmt.',
        readingMinutes: 3,
        xpReward: 20,
      },
    ],
  },

  // ─── 4. Budgeting & Sparen ───
  {
    id: 'budgeting-sparen',
    title: 'Budgeting & Sparen',
    description: 'Finanzen im Griff, Sparziele erreichen',
    icon: 'PiggyBank',
    emoji: '💰',
    color: 'scale-3',
    articles: [
      {
        id: 'inflation-risiko',
        categoryId: 'budgeting-sparen',
        title: 'Das unsichtbare Risiko: Inflation',
        shortDescription: 'Dein Geld auf dem Sparkonto verliert jedes Jahr an Kaufkraft.',
        whyImportant: 'Nicht investieren ist auch ein Risiko.',
        practiceExample: 'CHF 50\'000 auf dem Sparkonto (0.5% Zins, 2% Inflation): real über 20 Jahre rund CHF 13\'000 Verlust.',
        visualization: 'Zwei Linien: Nominaler Kontowert vs. realer Wert über 20 Jahre.',
        commonMistakes: [
          '«Mein Geld ist sicher auf der Bank»',
          'Inflation wird als abstraktes Konzept abgetan',
          'Nur nominale Rendite wird betrachtet',
        ],
        customerRelevance: 'Auch Nichtstun hat Kosten.',
        readingMinutes: 3,
        xpReward: 20,
      },
      {
        id: 'case-junge-familie',
        categoryId: 'budgeting-sparen',
        title: 'Praxis: Vorsorge für eine junge Familie',
        shortDescription: 'Wie eine junge Familie mit zwei Kindern CHF 3\'200 pro Jahr an Steuern spart.',
        whyImportant: 'Junge Familien haben die grössten Hebel – aber oft die wenigste Zeit.',
        practiceExample: 'Die Müllers (beide 34): 3a-Splitting, ETF-Sparplan, optimierte Versicherung.',
        visualization: 'Vorher/Nachher-Vergleich: Kosten, Steuerersparnis, Vermögensentwicklung.',
        commonMistakes: [
          '«Wir sind zu jung für Vorsorge»',
          'Kinder-Absicherung wird vergessen',
          'Steuervorteile werden nicht genutzt',
        ],
        customerRelevance: 'Erkennst du dich wieder?',
        readingMinutes: 4,
        xpReward: 20,
        addedAt: '2026-03-20',
      },
      {
        id: 'case-karrierewechsel',
        categoryId: 'budgeting-sparen',
        title: 'Praxis: Neustart in der Lebensmitte',
        shortDescription: 'Berufswechsel, Scheidung, keine Finanzstrategie – wie Marco seine Finanzen in 6 Monaten neu aufstellte.',
        whyImportant: 'Lebensereignisse können die Vorsorge durcheinanderbringen.',
        practiceExample: 'Marco hatte nach Scheidung CHF 80\'000 in der PK verloren. Danach: Freizügigkeitsgeld optimiert, neuer Sparplan.',
        visualization: 'Timeline: Lebensereignisse und finanzielle Massnahmen.',
        commonMistakes: [
          'PK-Teilung bei Scheidung wird nicht optimiert',
          'Neustart ohne Finanzplan',
          'Emotionale Entscheidungen nach Lebensumbruch',
        ],
        customerRelevance: 'Ein Neustart ist die Chance, es richtig aufzusetzen.',
        readingMinutes: 4,
        xpReward: 20,
      },
    ],
  },

  // ─── 5. Wohneigentum ───
  {
    id: 'wohneigentum',
    title: 'Wohneigentum',
    description: 'Immobilien, Hypotheken & Finanzierung',
    icon: 'Home',
    emoji: '🏠',
    color: 'scale-7',
    articles: [
      {
        id: 'timing-fehler',
        categoryId: 'wohneigentum',
        title: 'Market Timing – Warum niemand den richtigen Moment kennt',
        shortDescription: 'Selbst Profis können den Markt nicht zuverlässig timen. Regelmässig investieren schlägt Warten.',
        whyImportant: 'Wer auf den «perfekten Zeitpunkt» wartet, verpasst oft die besten Renditetage.',
        practiceExample: 'Ein Investor, der die 10 besten Börsentage der letzten 20 Jahre verpasste: statt 7.5% nur 3.5%.',
        visualization: 'Balkendiagramm: Rendite bei vollem Investment vs. Verpassung der besten Tage.',
        commonMistakes: [
          '«Ich warte, bis die Märkte fallen»',
          'Einmalinvestition statt Sparplan',
          'Emotionale statt rationale Entscheidungen',
        ],
        customerRelevance: 'Der beste Zeitpunkt zu investieren war gestern. Der zweitbeste ist heute.',
        readingMinutes: 3,
        xpReward: 20,
      },
    ],
  },

  // ─── 6. Steuern Schweiz ───
  {
    id: 'steuern-schweiz',
    title: 'Steuern Schweiz',
    description: 'Steueroptimierung und Abzüge verstehen',
    icon: 'FileText',
    emoji: '📋',
    color: 'scale-9',
    articles: [
      {
        id: 'faq-kosten',
        categoryId: 'steuern-schweiz',
        title: '«Was kostet mich die Beratung?»',
        shortDescription: 'Transparente Beratung hat ihren Preis – aber der Mehrwert übersteigt die Kosten.',
        whyImportant: 'Kunden wollen wissen, wofür sie bezahlen.',
        practiceExample: 'Beratung kostet CHF 490–1\'990. Durchschnittliche Steuerersparnis im ersten Jahr: CHF 2\'400.',
        visualization: 'Vergleich: Beratungskosten vs. erzielte Einsparungen über 5 Jahre.',
        commonMistakes: [
          'Gratisberatung als neutral annehmen',
          'Kosten der Beratung mit Produktkosten verwechseln',
          'Wert einer Strategie unterschätzen',
        ],
        customerRelevance: 'Gute Beratung ist eine Investition.',
        readingMinutes: 3,
        xpReward: 20,
      },
      {
        id: 'faq-zu-spaet',
        categoryId: 'steuern-schweiz',
        title: '«Bin ich nicht zu alt, um etwas zu ändern?»',
        shortDescription: 'Auch mit 50+ gibt es wirkungsvolle Massnahmen für Vorsorge und Steuern.',
        whyImportant: 'Die letzten 10–15 Jahre vor der Pension sind entscheidend.',
        practiceExample: 'Hans (55): In 10 Jahren CHF 70\'560 in die 3a eingezahlt, CHF 21\'000 Steuern gespart.',
        visualization: 'Zeitleiste: Was in 10 Jahren noch möglich ist.',
        commonMistakes: [
          '«Es lohnt sich nicht mehr»',
          'PK-Einkäufe werden nicht geprüft',
          'Entnahmestrategie wird nicht geplant',
        ],
        customerRelevance: 'Auch mit 50+ kannst du noch viel bewegen.',
        readingMinutes: 3,
        xpReward: 20,
        addedAt: '2026-04-01',
      },
      {
        id: 'unsere-quellen',
        categoryId: 'steuern-schweiz',
        title: 'Unsere Datenquellen und Methodik',
        shortDescription: 'Alle Informationen basieren auf offiziellen Quellen und bewährten Finanzgrundsätzen.',
        whyImportant: 'Transparenz schafft Vertrauen.',
        practiceExample: 'Unsere Renditeannahmen basieren auf dem UBS Global Investment Returns Yearbook.',
        visualization: 'Liste der wichtigsten Quellen mit Kurzbeschreibung.',
        commonMistakes: [
          'Quellen nicht hinterfragen',
          'Marketing-Zahlen als neutrale Daten nehmen',
          'Historische Daten als Zukunftsgarantie sehen',
        ],
        customerRelevance: 'Du kannst darauf vertrauen, dass unsere Empfehlungen auf soliden Grundlagen basieren.',
        sources: [
          { title: 'UBS Global Investment Returns Yearbook', url: 'https://www.ubs.com/global/en/investment-bank/in-focus/2024/global-investment-returns-yearbook.html' },
          { title: 'Bundesamt für Sozialversicherungen (BSV)', url: 'https://www.bsv.admin.ch' },
          { title: 'Eidg. Steuerverwaltung (ESTV)', url: 'https://www.estv.admin.ch' },
        ],
        readingMinutes: 2,
        xpReward: 20,
      },
      {
        id: 'unabhaengigkeit',
        categoryId: 'steuern-schweiz',
        title: 'Unsere Unabhängigkeit',
        shortDescription: 'Wir sind nicht an einen Anbieter gebunden. Empfehlungen basieren auf deinen Bedürfnissen.',
        whyImportant: 'Unabhängige Beratung ist die Grundlage für objektive Empfehlungen.',
        practiceExample: 'Wir vergleichen Angebote von über 15 Anbietern.',
        visualization: 'Vergleichsmatrix: Unabhängige Beratung vs. Bankberatung vs. Versicherungsverkauf.',
        commonMistakes: [
          'Beratung bei eigener Bank als neutral annehmen',
          'Nicht nachfragen, wie der Berater vergütet wird',
          'Angebote nicht vergleichen',
        ],
        customerRelevance: 'Bei uns steht dein Interesse im Zentrum.',
        readingMinutes: 2,
        xpReward: 20,
      },
      {
        id: 'haftungshinweis',
        categoryId: 'steuern-schweiz',
        title: 'Wichtige Hinweise und Haftungsausschluss',
        shortDescription: 'Alle Informationen dienen der Bildung und ersetzen keine individuelle Beratung.',
        whyImportant: 'Rechtliche Klarheit schützt beide Seiten.',
        practiceExample: 'Renditen sind Durchschnittswerte aus historischen Daten. Zukünftige Entwicklungen können abweichen.',
        visualization: 'Infobox mit rechtlichen Hinweisen.',
        commonMistakes: [
          'Allgemeine Informationen als persönliche Beratung verstehen',
          'Beispielrechnungen als verbindlich annehmen',
          'Entscheidungen ohne professionelle Begleitung treffen',
        ],
        customerRelevance: 'Für deine persönliche Strategie empfehlen wir ein individuelles Gespräch.',
        readingMinutes: 2,
        xpReward: 20,
      },
    ],
  },
];

/** Alle Artikel als flache Liste */
export function getAllArticles(): KnowledgeArticle[] {
  return KNOWLEDGE_CATEGORIES.flatMap(cat => cat.articles);
}

/** Artikel nach ID finden */
export function getArticleById(id: string): KnowledgeArticle | undefined {
  return getAllArticles().find(a => a.id === id);
}

/** Kategorie nach ID finden */
export function getCategoryById(id: string): KnowledgeCategory | undefined {
  return KNOWLEDGE_CATEGORIES.find(c => c.id === id);
}
