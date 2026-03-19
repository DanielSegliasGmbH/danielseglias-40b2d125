/**
 * Wissensbibliothek – Konfiguration
 * Strukturierte Inhalte für das Finanzberatungs-Tool
 * Fokus: Schweizer Vorsorgesystem (Säule 3a) & Investieren
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
  /** Tool-Key für Verlinkung (z.B. 'rendite-risiko', 'finanzcheck') */
  linkedToolKey?: string;
  linkedToolLabel?: string;
  /** Quellenangaben – nur im öffentlichen Modus sichtbar */
  sources?: { title: string; url?: string }[];
  /** Interne Notizen – nur im Privatmodus NICHT sichtbar */
  internalNotes?: string;
  /** Technische Details – nur im öffentlichen Modus sichtbar */
  technicalDetails?: string;
}

export interface KnowledgeCategory {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  color: string; // tailwind color token
  articles: KnowledgeArticle[];
}

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  // ─── 1. Grundlagen Vorsorge ───
  {
    id: 'grundlagen-vorsorge',
    title: 'Grundlagen Vorsorge',
    description: 'Das Schweizer 3-Säulen-System einfach erklärt',
    icon: 'Building2',
    color: 'scale-6',
    articles: [
      {
        id: 'drei-saeulen-system',
        categoryId: 'grundlagen-vorsorge',
        title: 'Das 3-Säulen-System der Schweiz',
        shortDescription: 'Die Schweizer Vorsorge basiert auf drei Säulen: staatliche AHV, berufliche Vorsorge und private Vorsorge. Zusammen bilden sie Ihr finanzielles Sicherheitsnetz.',
        whyImportant: 'Nur wer das Gesamtsystem versteht, kann gezielt die richtigen Entscheidungen treffen – und weiss, wo Lücken entstehen können.',
        practiceExample: 'Anna (35) verdient CHF 85\'000 pro Jahr. Ihre AHV-Rente wird rund CHF 2\'390/Monat betragen, die Pensionskasse zahlt etwa CHF 1\'800. Zusammen ist das deutlich weniger als ihr aktuelles Einkommen – die 3. Säule schliesst diese Lücke.',
        visualization: 'Dreistufige Darstellung: Säule 1 (AHV/IV) als Basis, Säule 2 (BVG/Pensionskasse) als mittlere Schicht, Säule 3 (Private Vorsorge) als Dach – jeweils mit Anteil am Gesamteinkommen.',
        commonMistakes: [
          'Viele glauben, AHV und Pensionskasse reichen aus',
          'Der Unterschied zwischen Säule 3a und 3b wird oft verwechselt',
          'Die Vorsorgelücke wird erst kurz vor der Pensionierung bemerkt',
        ],
        customerRelevance: 'Verstehen Sie, wie Ihr Einkommen im Alter zusammengesetzt sein wird – und wo Sie heute aktiv werden können.',
        sources: [
          { title: 'BSV – Bundesamt für Sozialversicherungen', url: 'https://www.bsv.admin.ch' },
          { title: 'AHV/IV Informationsstelle' },
        ],
        internalNotes: 'Guter Einstieg für Erstberatung. Häufig fehlt Grundverständnis.',
      },
      {
        id: 'vorsorgeluecke',
        categoryId: 'grundlagen-vorsorge',
        title: 'Die Vorsorgelücke verstehen',
        shortDescription: 'Die Differenz zwischen dem letzten Lohn und der tatsächlichen Rente kann erheblich sein. Diese Lücke frühzeitig zu kennen, ist entscheidend.',
        whyImportant: 'Wer die eigene Vorsorgelücke kennt, kann gezielt handeln – statt im Alter überrascht zu werden.',
        practiceExample: 'Thomas (42) verdient CHF 120\'000. Seine projizierte Rente (AHV + PK) beträgt ca. CHF 5\'200/Monat. Sein aktueller Lebensstil kostet CHF 7\'500/Monat. Die Lücke: CHF 2\'300 jeden Monat.',
        visualization: 'Balkenvergleich: Aktuelles Einkommen vs. projizierte Rente, mit rot markierter Lücke dazwischen.',
        commonMistakes: [
          'Die Vorsorgelücke wird unterschätzt',
          'Inflation wird nicht berücksichtigt',
          'Erwartete Rente wird zu hoch eingeschätzt',
        ],
        customerRelevance: 'Wissen Sie, wie viel Ihnen im Alter tatsächlich fehlen wird? Gemeinsam berechnen wir Ihre persönliche Lücke.',
        linkedToolKey: 'vorsorgecheck',
        linkedToolLabel: 'Vorsorge-Check starten',
      },
      {
        id: 'ahv-grundlagen',
        categoryId: 'grundlagen-vorsorge',
        title: 'AHV – Was bekomme ich wirklich?',
        shortDescription: 'Die AHV ist die Basisrente der Schweiz. Die maximale Einzelrente beträgt CHF 2\'450/Monat – unabhängig davon, wie viel Sie verdient haben.',
        whyImportant: 'Viele Menschen überschätzen ihre AHV-Rente. Die Realität: Sie deckt nur einen Bruchteil des gewohnten Lebensstandards.',
        practiceExample: 'Marc hat 40 Jahre lang eingezahlt und verdient CHF 150\'000. Seine AHV-Rente: maximal CHF 2\'450/Monat. Das sind nur 20% seines aktuellen Einkommens.',
        visualization: 'Kreisdiagramm: Anteil der AHV am Gesamteinkommen bei verschiedenen Lohnklassen (50k, 80k, 120k, 200k).',
        commonMistakes: [
          '«Die AHV wird schon reichen» – ein häufiger Irrtum',
          'Beitragslücken durch Auslandsjahre werden vergessen',
          'Der Unterschied zwischen Einzel- und Ehepaarrente ist unklar',
        ],
        customerRelevance: 'Kennen Sie Ihre voraussichtliche AHV-Rente? Das ist der erste Schritt zu einer realistischen Finanzplanung.',
      },
    ],
  },

  // ─── 2. Säule 3a im Detail ───
  {
    id: 'saeule-3a',
    title: 'Säule 3a im Detail',
    description: 'Alles über die private Vorsorge mit Steuervorteilen',
    icon: 'PiggyBank',
    color: 'scale-8',
    articles: [
      {
        id: '3a-steuervorteile',
        categoryId: 'saeule-3a',
        title: 'Steuervorteile der Säule 3a',
        shortDescription: 'Einzahlungen in die Säule 3a können vollständig vom steuerbaren Einkommen abgezogen werden. Das spart je nach Kanton mehrere tausend Franken pro Jahr.',
        whyImportant: 'Die Säule 3a ist eines der wenigen legalen Steuerspar-Instrumente in der Schweiz – und wird dennoch von vielen nicht voll genutzt.',
        practiceExample: 'Lisa (30) zahlt den Maximalbetrag von CHF 7\'056 in die Säule 3a ein. Bei einem Grenzsteuersatz von 30% spart sie CHF 2\'117 Steuern – jedes Jahr.',
        visualization: 'Vergleichstabelle: Steuerersparnis bei verschiedenen Einkommen und Kantonen (ZH, BE, AG, LU).',
        commonMistakes: [
          'Einzahlung wird vergessen oder aufgeschoben',
          'Maximalbetrag wird nicht ausgeschöpft',
          'Steuerersparnis beim Bezug wird nicht eingeplant',
        ],
        customerRelevance: 'Nutzen Sie den Steuervorteil bereits voll aus? Jedes Jahr ohne Einzahlung ist ein verlorener Steuervorteil.',
        linkedToolKey: 'finanzcheck',
        linkedToolLabel: 'Finanzcheck starten',
        sources: [
          { title: 'Eidg. Steuerverwaltung – Säule 3a', url: 'https://www.estv.admin.ch' },
        ],
      },
      {
        id: '3a-anbieter-vergleich',
        categoryId: 'saeule-3a',
        title: 'Bank vs. Versicherung – Wohin mit dem 3a-Geld?',
        shortDescription: 'Es gibt zwei Wege für die Säule 3a: Banklösung (flexibel) oder Versicherungslösung (mit Schutz). Beide haben Vor- und Nachteile.',
        whyImportant: 'Die Wahl des richtigen 3a-Anbieters beeinflusst Rendite, Flexibilität und Kosten über Jahrzehnte.',
        practiceExample: 'Sarah wählte eine Versicherungslösung mit 0.8% Gebühren. Nach 30 Jahren hat sie CHF 18\'000 mehr an Gebühren bezahlt als bei einer günstigen Banklösung.',
        visualization: 'Gegenüberstellung zweier Spalten: Bank (Flexibilität, Kosten, Rendite) vs. Versicherung (Schutz, Bindung, Kosten).',
        commonMistakes: [
          'Versicherungslösung wird abgeschlossen, ohne Alternativen zu kennen',
          'Versteckte Gebühren werden nicht beachtet',
          'Kündigungsfristen und Rückkaufswerte sind unklar',
        ],
        customerRelevance: 'Wissen Sie, was Ihre aktuelle 3a-Lösung kostet – und ob es bessere Alternativen gibt?',
        linkedToolKey: 'kvg-praemienvergleich',
        linkedToolLabel: '3a-Vergleich öffnen',
      },
      {
        id: '3a-splitting',
        categoryId: 'saeule-3a',
        title: 'Gestaffelter Bezug (3a-Splitting)',
        shortDescription: 'Wer mehrere 3a-Konten führt und diese gestaffelt bezieht, spart bei der Auszahlung massiv Steuern.',
        whyImportant: 'Ohne Splitting kann die Steuer beim Bezug schnell mehrere tausend Franken betragen. Die richtige Strategie spart bares Geld.',
        practiceExample: 'Peter hat CHF 200\'000 auf einem Konto. Bezieht er alles auf einmal, zahlt er ca. CHF 12\'000 Steuern. Verteilt auf 4 Konten über 4 Jahre: nur CHF 6\'800.',
        visualization: 'Zeitstrahl mit 4 Konten und gestaffelten Bezugsjahren, jeweils mit Steuerlast pro Bezug.',
        commonMistakes: [
          'Nur ein 3a-Konto eröffnet',
          'Splitting wird zu spät begonnen',
          'Kantonale Unterschiede werden ignoriert',
        ],
        customerRelevance: 'Haben Sie bereits mehrere 3a-Konten? Falls nicht – es lohnt sich, heute damit zu beginnen.',
      },
    ],
  },

  // ─── 3. Investieren & Rendite ───
  {
    id: 'investieren-rendite',
    title: 'Investieren & Rendite',
    description: 'Renditechancen verstehen und nutzen',
    icon: 'TrendingUp',
    color: 'scale-5',
    articles: [
      {
        id: 'was-ist-rendite',
        categoryId: 'investieren-rendite',
        title: 'Was bedeutet Rendite eigentlich?',
        shortDescription: 'Rendite ist der Gewinn, den Ihr investiertes Geld über die Zeit erwirtschaftet – ausgedrückt in Prozent pro Jahr.',
        whyImportant: 'Ohne Rendite verliert Ihr Geld durch Inflation an Wert. Schon kleine Unterschiede haben über Jahrzehnte eine massive Wirkung.',
        practiceExample: 'CHF 10\'000 mit 1% Zins ergeben nach 30 Jahren CHF 13\'478. Mit 5% Rendite: CHF 43\'219. Der Unterschied: über CHF 30\'000 – nur durch den Zinseszins.',
        visualization: 'Wachstumskurven: CHF 10\'000 bei 1%, 3%, 5% und 7% über 30 Jahre.',
        commonMistakes: [
          'Rendite wird mit Gewinn verwechselt',
          'Gebühren werden bei der Renditeberechnung vergessen',
          'Historische Rendite wird als Garantie missverstanden',
        ],
        customerRelevance: 'Verstehen Sie, wie Ihr Geld für Sie arbeiten kann – und was der Unterschied zwischen Sparen und Investieren wirklich ausmacht.',
        linkedToolKey: 'rendite-risiko',
        linkedToolLabel: 'Risiko- & Renditesimulation öffnen',
      },
      {
        id: 'etf-grundlagen',
        categoryId: 'investieren-rendite',
        title: 'ETFs – Die einfachste Art zu investieren',
        shortDescription: 'Ein ETF (Exchange Traded Fund) bildet einen Index wie den SMI oder MSCI World ab. So investieren Sie breit gestreut und kostengünstig.',
        whyImportant: 'ETFs sind die beliebteste Anlageform für langfristigen Vermögensaufbau – einfach, transparent und günstig.',
        practiceExample: 'Ein MSCI World ETF enthält über 1\'500 Unternehmen aus 23 Ländern. Die durchschnittliche Rendite der letzten 20 Jahre: rund 8% pro Jahr.',
        visualization: 'Weltkarte mit eingefärbten Regionen, die zeigt, wie breit ein MSCI World ETF diversifiziert ist.',
        commonMistakes: [
          'ETFs werden mit Einzelaktien verwechselt',
          'Zu viele verschiedene ETFs im Portfolio',
          'Der Unterschied zwischen physisch und synthetisch ist unklar',
        ],
        customerRelevance: 'ETFs können ein einfacher Einstieg in die Welt des Investierens sein. Wir zeigen Ihnen, worauf es ankommt.',
        linkedToolKey: 'rendite-risiko',
        linkedToolLabel: 'Simulation starten',
      },
      {
        id: 'zinseszins',
        categoryId: 'investieren-rendite',
        title: 'Die Macht des Zinseszins',
        shortDescription: 'Der Zinseszins ist das mächtigste Werkzeug beim Investieren. Er sorgt dafür, dass Ihr Geld exponentiell wächst – je länger, desto stärker.',
        whyImportant: 'Wer früh beginnt, profitiert überproportional. Jedes Jahr Verzögerung kostet erheblich.',
        practiceExample: 'Wer mit 25 Jahren CHF 200/Monat bei 6% investiert, hat mit 65 rund CHF 400\'000. Wer erst mit 35 startet: nur CHF 200\'000 – bei gleicher Einzahlung.',
        visualization: 'Zwei Wachstumskurven: Start mit 25 vs. Start mit 35, beide mit CHF 200/Monat bei 6% Rendite.',
        commonMistakes: [
          '«Ich fange später an» – jedes Jahr zählt',
          'Zu früh Gewinne entnehmen unterbricht den Zinseszins',
          'Der Effekt wird bei kleinen Beträgen unterschätzt',
        ],
        customerRelevance: 'Je früher Sie starten, desto mehr arbeitet die Zeit für Sie. Selbst kleine Beträge machen langfristig einen grossen Unterschied.',
      },
    ],
  },

  // ─── 4. Risiken, Fehler & Mythen ───
  {
    id: 'risiken-fehler-mythen',
    title: 'Risiken, Fehler & Mythen',
    description: 'Häufige Irrtümer erkennen und vermeiden',
    icon: 'AlertTriangle',
    color: 'scale-3',
    articles: [
      {
        id: 'boersencrash-mythos',
        categoryId: 'risiken-fehler-mythen',
        title: '«Die Börse ist wie ein Casino» – Wirklich?',
        shortDescription: 'Kurzfristig schwanken die Märkte. Langfristig aber steigen sie seit über 100 Jahren zuverlässig. Wer investiert bleibt, gewinnt.',
        whyImportant: 'Angst vor Verlusten ist der häufigste Grund, gar nicht erst zu investieren – und damit die grösste verpasste Chance.',
        practiceExample: 'Wer 2008 (Finanzkrise) CHF 100\'000 investiert hatte und investiert blieb, hatte 2023 über CHF 350\'000. Wer panisch verkaufte, realisierte den Verlust.',
        visualization: 'Langfristiger Aktienchart mit markierten Krisen (2000, 2008, 2020) – jeweils mit Erholung danach.',
        commonMistakes: [
          'Bei Kursrückgängen panisch verkaufen',
          'Medien-Headlines als Anlageentscheid nutzen',
          'Kurzfristige Schwankungen mit langfristigem Risiko verwechseln',
        ],
        customerRelevance: 'Verstehen Sie den Unterschied zwischen kurzfristiger Schwankung und echtem Risiko. So treffen Sie bessere Entscheidungen.',
        linkedToolKey: 'rendite-risiko',
        linkedToolLabel: 'Risikosimulation öffnen',
      },
      {
        id: 'timing-fehler',
        categoryId: 'risiken-fehler-mythen',
        title: 'Market Timing – Warum «den richtigen Moment» niemand kennt',
        shortDescription: 'Studien zeigen: Selbst Profis können den Markt nicht zuverlässig timen. Regelmässiges Investieren schlägt Warten fast immer.',
        whyImportant: 'Wer auf den «perfekten Zeitpunkt» wartet, verpasst oft die besten Renditetage – und verliert langfristig Geld.',
        practiceExample: 'Ein Investor, der die 10 besten Börsentage der letzten 20 Jahre verpasst hat, hätte statt 7.5% nur 3.5% pro Jahr erzielt.',
        visualization: 'Balkendiagramm: Rendite bei vollem Investment vs. Verpassung der 10/20/30 besten Tage.',
        commonMistakes: [
          '«Ich warte, bis die Märkte fallen»',
          'Einmalinvestition statt regelmässigem Sparplan',
          'Emotionale statt rationale Entscheidungen',
        ],
        customerRelevance: 'Der beste Zeitpunkt zu investieren war gestern. Der zweitbeste ist heute. Wir helfen Ihnen, einen Rhythmus zu finden.',
      },
      {
        id: 'inflation-risiko',
        categoryId: 'risiken-fehler-mythen',
        title: 'Das unsichtbare Risiko: Inflation',
        shortDescription: 'Ihr Geld auf dem Sparkonto verliert jedes Jahr an Kaufkraft. Bei 2% Inflation sind CHF 100\'000 in 20 Jahren nur noch CHF 67\'000 wert.',
        whyImportant: 'Nicht investieren ist auch ein Risiko. Die Inflation frisst stille Ersparnisse auf – besonders bei tiefen Zinsen.',
        practiceExample: 'Wer CHF 50\'000 auf dem Sparkonto lässt (0.5% Zins, 2% Inflation), verliert real über 20 Jahre rund CHF 13\'000 an Kaufkraft.',
        visualization: 'Zwei Linien: Nominaler Kontowert (stabil) vs. realer Wert (sinkend) über 20 Jahre.',
        commonMistakes: [
          '«Mein Geld ist sicher auf der Bank»',
          'Inflation wird als abstraktes Konzept abgetan',
          'Nur nominale Rendite wird betrachtet, nicht reale',
        ],
        customerRelevance: 'Auch Nichtstun hat Kosten. Verstehen Sie, warum eine kluge Strategie besser schützt als ein Sparkonto.',
      },
    ],
  },

  // ─── 5. Strategien & Umsetzung ───
  {
    id: 'strategien-umsetzung',
    title: 'Strategien & Umsetzung',
    description: 'Konkrete Wege für Ihren Vermögensaufbau',
    icon: 'Map',
    color: 'scale-7',
    articles: [
      {
        id: 'sparplan-strategie',
        categoryId: 'strategien-umsetzung',
        title: 'Sparplan – Regelmässig investieren statt alles auf einmal',
        shortDescription: 'Ein Sparplan investiert automatisch jeden Monat einen festen Betrag. So kaufen Sie manchmal günstig und manchmal teuer – im Schnitt profitieren Sie.',
        whyImportant: 'Regelmässigkeit schlägt Timing. Ein Sparplan nimmt Emotionen aus dem Investieren und baut Disziplin auf.',
        practiceExample: 'Julia investiert CHF 500/Monat in einen globalen ETF. In Krisenmonaten kauft sie automatisch mehr Anteile. Nach 15 Jahren hat sie über CHF 135\'000.',
        visualization: 'Monatliche Balken mit unterschiedlichen Kaufpreisen und Gesamtwert-Linie darüber.',
        commonMistakes: [
          'Sparplan in Krisenzeiten stoppen',
          'Zu kleine oder zu grosse Beträge wählen',
          'Sparplan nie überprüfen oder anpassen',
        ],
        customerRelevance: 'Ein Sparplan ist der einfachste Weg, mit dem Investieren zu beginnen. Selbst CHF 100/Monat machen langfristig einen Unterschied.',
      },
      {
        id: 'diversifikation',
        categoryId: 'strategien-umsetzung',
        title: 'Diversifikation – Nicht alles auf eine Karte',
        shortDescription: 'Verteilen Sie Ihr Geld auf verschiedene Anlageklassen, Regionen und Branchen. So reduzieren Sie das Risiko, ohne auf Rendite zu verzichten.',
        whyImportant: 'Konzentriertes Investieren kann hohe Gewinne bringen – aber auch hohe Verluste. Diversifikation schützt langfristig.',
        practiceExample: 'Ein Portfolio mit nur Schweizer Aktien schwankte 2022 um -18%. Ein global diversifiziertes Portfolio: nur -8%.',
        visualization: 'Kuchendiagramm eines diversifizierten Portfolios: Aktien (50%), Obligationen (25%), Immobilien (15%), Cash (10%).',
        commonMistakes: [
          'Nur in bekannte Firmen investieren (Home Bias)',
          'Über-Diversifikation mit 20+ ETFs',
          'Diversifikation nur innerhalb einer Anlageklasse',
        ],
        customerRelevance: 'Eine gute Streuung ist die Grundlage jeder soliden Anlagestrategie. Wir bauen Ihr Portfolio so auf, dass es zu Ihnen passt.',
      },
      {
        id: 'rebalancing',
        categoryId: 'strategien-umsetzung',
        title: 'Rebalancing – Ihr Portfolio in Balance halten',
        shortDescription: 'Durch Kursschwankungen verschiebt sich die Gewichtung Ihres Portfolios. Regelmässiges Rebalancing stellt die ursprüngliche Aufteilung wieder her.',
        whyImportant: 'Ohne Rebalancing wird Ihr Portfolio unbemerkt risikoreicher. Regelmässiges Anpassen hält die Strategie auf Kurs.',
        practiceExample: 'Markus hat 60% Aktien und 40% Obligationen. Nach einem Börsenboom: 75% Aktien, 25% Obligationen – viel risikoreicher als geplant.',
        visualization: 'Vorher/Nachher-Diagramm: Aufteilung vor und nach Rebalancing.',
        commonMistakes: [
          'Rebalancing wird komplett vergessen',
          'Zu häufiges Rebalancing verursacht unnötige Kosten',
          'Emotionales statt regelbasiertes Anpassen',
        ],
        customerRelevance: 'Wir kümmern uns darum, dass Ihr Portfolio immer in der richtigen Balance bleibt – automatisch und regelmässig.',
      },
    ],
  },

  // ─── 6. Praxisbeispiele (Case Studies) ───
  {
    id: 'praxisbeispiele',
    title: 'Praxisbeispiele',
    description: 'Echte Situationen – echte Lösungen',
    icon: 'Users',
    color: 'scale-9',
    articles: [
      {
        id: 'case-junge-familie',
        categoryId: 'praxisbeispiele',
        title: 'Familie Müller – Vorsorge für die nächste Generation',
        shortDescription: 'Wie eine junge Familie mit zwei Kindern ihre Vorsorge neu aufgestellt hat und heute CHF 3\'200 pro Jahr an Steuern spart.',
        whyImportant: 'Junge Familien haben oft die grössten Hebel – aber auch die wenigste Zeit, sich darum zu kümmern.',
        practiceExample: 'Die Müllers (beide 34) hatten keine 3a, kein strukturiertes Sparen und eine teure Versicherungslösung. Nach der Beratung: 3a-Splitting, ETF-Sparplan, optimierte Versicherung.',
        visualization: 'Vorher/Nachher-Vergleich: Kosten, Steuerersparnis, Vermögensentwicklung über 25 Jahre.',
        commonMistakes: [
          '«Wir sind zu jung für Vorsorge»',
          'Kinder-Absicherung wird vergessen',
          'Steuervorteile werden nicht genutzt',
        ],
        customerRelevance: 'Erkennen Sie sich wieder? Viele junge Familien stehen vor ähnlichen Fragen. Wir haben passende Lösungen.',
      },
      {
        id: 'case-karrierewechsel',
        categoryId: 'praxisbeispiele',
        title: 'Marco (45) – Neustart in der Lebensmitte',
        shortDescription: 'Ein Berufswechsel, eine Scheidung und keine klare Finanzstrategie. Wie Marco seine Finanzen in 6 Monaten komplett neu aufgestellt hat.',
        whyImportant: 'Lebensereignisse wie Scheidung, Jobwechsel oder Krankheit können die Vorsorge durcheinanderbringen. Genau dann braucht es einen Plan.',
        practiceExample: 'Marco hatte nach der Scheidung CHF 80\'000 in der Pensionskasse verloren und keinen Sparplan. Nach der Beratung: Freizügigkeitsgeld optimiert, neuer Sparplan, 3a-Splitting gestartet.',
        visualization: 'Timeline: Lebensereignisse und finanzielle Massnahmen über 3 Jahre.',
        commonMistakes: [
          'Pensionskassen-Teilung bei Scheidung wird nicht optimiert',
          'Neustart ohne Finanzplan',
          'Emotionale Entscheidungen nach Lebensumbruch',
        ],
        customerRelevance: 'Ein Neustart ist kein Nachteil – sondern die Chance, es diesmal richtig aufzusetzen.',
      },
      {
        id: 'case-fruehpensionierung',
        categoryId: 'praxisbeispiele',
        title: 'Sandra & Reto – 5 Jahre früher in Pension',
        shortDescription: 'Mit einer gezielten Strategie konnte dieses Paar 5 Jahre vor dem ordentlichen Pensionsalter aufhören zu arbeiten – ohne Abstriche beim Lebensstandard.',
        whyImportant: 'Frühpensionierung ist keine Utopie, sondern eine Frage der Planung. Je früher man beginnt, desto realistischer wird es.',
        practiceExample: 'Sandra (52) und Reto (54) haben gemeinsam CHF 600\'000 aufgebaut. Durch optimale Entnahmestrategie und 3a-Bezugsplanung können sie mit 60 aufhören.',
        visualization: 'Kapitalverlauf: Aufbauphase, Übergangsphase, Entnahmephase – mit Markierung des vorzeitigen Pensionsalters.',
        commonMistakes: [
          'Lebenshaltungskosten im Alter unterschätzen',
          'Keine Brückenrente einplanen',
          'Steuern beim Bezug nicht optimieren',
        ],
        customerRelevance: 'Haben Sie auch den Wunsch, früher aufzuhören? Wir zeigen Ihnen, ob und wie das möglich ist.',
      },
    ],
  },

  // ─── 7. FAQ & Einwände ───
  {
    id: 'faq-einwaende',
    title: 'FAQ & Einwände',
    description: 'Die häufigsten Fragen und Bedenken',
    icon: 'HelpCircle',
    color: 'scale-4',
    articles: [
      {
        id: 'faq-sicherheit',
        categoryId: 'faq-einwaende',
        title: '«Ist mein Geld sicher, wenn ich investiere?»',
        shortDescription: 'Eine der häufigsten Fragen. Die Antwort: Langfristig ja – kurzfristig gibt es Schwankungen. Aber genau dafür gibt es Strategien.',
        whyImportant: 'Sicherheit ist das Grundbedürfnis jedes Kunden. Wer es ernst nimmt und erklärt, baut Vertrauen auf.',
        practiceExample: 'In jedem 15-Jahres-Zeitraum seit 1970 hat ein diversifiziertes Portfolio noch nie einen Verlust erzielt – trotz aller Krisen.',
        visualization: 'Rollierende 15-Jahres-Renditen des MSCI World: alle positiv.',
        commonMistakes: [
          'Sicherheit mit Liquidität verwechseln',
          'Kurzfristige Schwankungen als Verlust betrachten',
          'Keine Notreserve vor dem Investieren aufbauen',
        ],
        customerRelevance: 'Ihr Geld ist gut aufgehoben – wenn die Strategie stimmt. Wir sorgen dafür, dass Sie ruhig schlafen können.',
      },
      {
        id: 'faq-kosten',
        categoryId: 'faq-einwaende',
        title: '«Was kostet mich die Beratung?»',
        shortDescription: 'Transparente Beratung hat ihren Preis – aber der Mehrwert übersteigt die Kosten in den meisten Fällen deutlich.',
        whyImportant: 'Kunden wollen wissen, wofür sie bezahlen. Offenheit bei den Kosten schafft Vertrauen.',
        practiceExample: 'Unsere Beratung kostet je nach Paket CHF 490–1\'990. Die durchschnittliche Steuerersparnis unserer Kunden im ersten Jahr: CHF 2\'400.',
        visualization: 'Vergleich: Beratungskosten vs. erzielte Einsparungen und Mehrwert über 5 Jahre.',
        commonMistakes: [
          'Gratisberatung als neutral annehmen (oft provisionsgetrieben)',
          'Kosten der Beratung mit Kosten der Produkte verwechseln',
          'Den Wert einer Strategie unterschätzen',
        ],
        customerRelevance: 'Gute Beratung ist eine Investition. Wir zeigen Ihnen transparent, was Sie bekommen – und was es kostet.',
      },
      {
        id: 'faq-zu-spaet',
        categoryId: 'faq-einwaende',
        title: '«Bin ich nicht zu alt, um noch etwas zu ändern?»',
        shortDescription: 'Es ist nie zu spät. Auch mit 50+ gibt es wirkungsvolle Massnahmen, die Ihre Vorsorge und Steuersituation deutlich verbessern.',
        whyImportant: 'Viele Menschen geben auf, weil sie denken, es sei zu spät. Dabei sind gerade die letzten 10–15 Jahre vor der Pension entscheidend.',
        practiceExample: 'Hans (55) hat in 10 Jahren noch CHF 70\'560 in die 3a eingezahlt und damit CHF 21\'000 Steuern gespart. Zusätzlich hat er seine Pensionskasse optimiert.',
        visualization: 'Zeitleiste: Was in 10 Jahren noch alles möglich ist (3a, PK-Einkauf, Anlageoptimierung).',
        commonMistakes: [
          '«Es lohnt sich nicht mehr»',
          'PK-Einkäufe werden nicht geprüft',
          'Entnahmestrategie wird nicht geplant',
        ],
        customerRelevance: 'Auch mit 50+ können Sie noch viel bewegen. Wir zeigen Ihnen, welche Hebel jetzt die grösste Wirkung haben.',
      },
    ],
  },

  // ─── 8. Quellen & Transparenz ───
  {
    id: 'quellen-transparenz',
    title: 'Quellen & Transparenz',
    description: 'Woher unsere Informationen stammen',
    icon: 'BookCheck',
    color: 'scale-10',
    articles: [
      {
        id: 'unsere-quellen',
        categoryId: 'quellen-transparenz',
        title: 'Unsere Datenquellen und Methodik',
        shortDescription: 'Alle Informationen in dieser Bibliothek basieren auf offiziellen Quellen, wissenschaftlichen Studien und bewährten Finanzgrundsätzen.',
        whyImportant: 'Transparenz schafft Vertrauen. Wir zeigen offen, woher unsere Zahlen und Empfehlungen stammen.',
        practiceExample: 'Unsere Renditeannahmen basieren auf dem UBS Global Investment Returns Yearbook (Dimson, Marsh, Staunton) – einer der umfassendsten Langzeitstudien weltweit.',
        visualization: 'Liste der wichtigsten Quellen mit Logos und Kurzbeschreibung.',
        commonMistakes: [
          'Quellen nicht hinterfragen',
          'Marketing-Zahlen als neutrale Daten nehmen',
          'Historische Daten als Zukunftsgarantie sehen',
        ],
        customerRelevance: 'Sie können darauf vertrauen, dass unsere Empfehlungen auf soliden, überprüfbaren Grundlagen basieren.',
        sources: [
          { title: 'UBS Global Investment Returns Yearbook', url: 'https://www.ubs.com/global/en/investment-bank/in-focus/2024/global-investment-returns-yearbook.html' },
          { title: 'Bundesamt für Sozialversicherungen (BSV)', url: 'https://www.bsv.admin.ch' },
          { title: 'Eidg. Steuerverwaltung (ESTV)', url: 'https://www.estv.admin.ch' },
          { title: 'MSCI Index Factsheets', url: 'https://www.msci.com' },
        ],
      },
      {
        id: 'unabhaengigkeit',
        categoryId: 'quellen-transparenz',
        title: 'Unsere Unabhängigkeit',
        shortDescription: 'Wir sind nicht an einen bestimmten Anbieter gebunden. Unsere Empfehlungen basieren auf Ihren Bedürfnissen – nicht auf Provisionen.',
        whyImportant: 'Unabhängige Beratung ist die Grundlage für objektive Empfehlungen. Kunden sollen wissen, dass wir in ihrem Interesse handeln.',
        practiceExample: 'Wir vergleichen Angebote von über 15 verschiedenen Anbietern und wählen die beste Lösung für Ihre Situation.',
        visualization: 'Vergleichsmatrix: Unabhängige Beratung vs. Bankberatung vs. Versicherungsverkauf.',
        commonMistakes: [
          'Beratung bei der eigenen Bank als «neutral» annehmen',
          'Nicht nachfragen, wie der Berater vergütet wird',
          'Angebote nicht vergleichen',
        ],
        customerRelevance: 'Bei uns steht Ihr Interesse im Zentrum. Wir verkaufen keine Produkte – wir finden die beste Lösung für Sie.',
      },
      {
        id: 'haftungshinweis',
        categoryId: 'quellen-transparenz',
        title: 'Wichtige Hinweise und Haftungsausschluss',
        shortDescription: 'Alle Informationen dienen der Bildung und Orientierung. Sie ersetzen keine individuelle Beratung.',
        whyImportant: 'Rechtliche Klarheit schützt beide Seiten – den Kunden und den Berater.',
        practiceExample: 'Die genannten Renditen sind Durchschnittswerte aus historischen Daten. Zukünftige Entwicklungen können davon abweichen.',
        visualization: 'Infobox mit den wichtigsten rechtlichen Hinweisen.',
        commonMistakes: [
          'Allgemeine Informationen als persönliche Beratung verstehen',
          'Beispielrechnungen als verbindlich annehmen',
          'Entscheidungen ohne professionelle Begleitung treffen',
        ],
        customerRelevance: 'Diese Bibliothek gibt Ihnen Orientierung. Für Ihre persönliche Strategie empfehlen wir ein individuelles Gespräch.',
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
