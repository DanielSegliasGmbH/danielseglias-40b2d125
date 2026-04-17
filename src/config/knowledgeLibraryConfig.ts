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
        shortDescription: 'Die Schweizer Altersvorsorge ruht auf drei Säulen: der staatlichen AHV/IV (Existenzsicherung), der beruflichen Vorsorge BVG (Pensionskasse) und der privaten Vorsorge (Säule 3a/3b). Erst alle drei zusammen sichern deinen gewohnten Lebensstandard im Alter.',
        whyImportant: 'AHV und Pensionskasse zusammen ersetzen meist nur 50–60 % deines letzten Lohns – wer mehr verdient, hat eine noch grössere Lücke. Wer das System nicht versteht, merkt zu spät, dass die staatliche Vorsorge nicht reicht. Mit klarem Verständnis kannst du gezielt eingreifen, statt nur zu hoffen.',
        practiceExample: 'Anna (35) verdient CHF 85\'000 brutto. Mit 65 erhält sie ca. CHF 2\'100/Monat AHV (gekürzt wegen Teilzeit) und ca. CHF 1\'800/Monat aus der PK – zusammen rund CHF 3\'900. Ihr heutiger Nettolohn liegt bei CHF 5\'800. Lücke: ~CHF 1\'900/Monat. Über 25 Pensionsjahre sind das CHF 570\'000, die sie mit Säule 3a und ETF-Sparplan selbst aufbauen muss. Bei CHF 150\'000 Lohn (Marc) wird die Lücke noch grösser, weil AHV bei CHF 2\'520/Monat gedeckelt ist.',
        visualization: 'Dreistufige Pyramide: Säule 1 (AHV/IV – Existenzsicherung, max. CHF 2\'520) als Basis, Säule 2 (BVG – Lebensstandard, ca. 60% des versicherten Lohns) in der Mitte, Säule 3 (3a/3b – individuelle Ergänzung) als Spitze.',
        commonMistakes: [
          'Glauben, AHV + PK reichen automatisch für den gewohnten Lebensstandard',
          'Säule 3a und 3b verwechseln (3a = steuerbegünstigt, gebunden / 3b = frei verfügbar)',
          'Vorsorgelücke erst mit 55+ bemerken – dann ist Aufholen teuer',
          'Beitragslücken in der AHV (Auslandjahre, Studium) nicht prüfen',
          'Als Selbständige(r) ohne PK keine eigene Lösung aufbauen',
        ],
        customerRelevance: 'Verstehst du, woraus dein Einkommen mit 65 wirklich besteht – und kennst du deine konkrete Lücke in CHF? Genau das beantwortet dein Vorsorge-Check.',
        linkedToolKey: 'vorsorgecheck',
        linkedToolLabel: 'Vorsorge-Check starten',
        sources: [
          { title: 'BSV – Bundesamt für Sozialversicherungen', url: 'https://www.bsv.admin.ch' },
          { title: 'admin.ch – Altersvorsorge', url: 'https://www.ch.ch/de/altersvorsorge/' },
          { title: 'BFS – Statistik berufliche Vorsorge', url: 'https://www.bfs.admin.ch' },
        ],
        readingMinutes: 6,
        xpReward: 30,
        addedAt: '2026-04-17',
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
        shortDescription: 'Die maximale Einzelrente beträgt CHF 2\'520/Monat – egal, wie viel du verdient hast.',
        whyImportant: 'Viele Menschen überschätzen ihre AHV-Rente.',
        practiceExample: 'Marc hat 44 Jahre eingezahlt und verdient CHF 150\'000. Seine AHV-Rente: maximal CHF 2\'520/Monat – nur 20% seines Einkommens.',
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
        id: 'pensionskasse-verstehen',
        categoryId: 'saeulen-vorsorge',
        title: 'Pensionskasse verstehen',
        shortDescription: 'Die Pensionskasse (BVG) ist nach AHV deine zweitgrösste Renteneinkommensquelle – aber sie ist komplex: Koordinationsabzug, obligatorischer vs. überobligatorischer Teil, Umwandlungssatz und PK-Einkauf bestimmen, was am Ende rauskommt. Wer den eigenen PK-Ausweis lesen kann, hat einen entscheidenden Vorteil.',
        whyImportant: 'Die meisten Schweizer:innen schauen ihren PK-Ausweis nie genau an – und übersehen so legale Steuersparmöglichkeiten in fünfstelliger Höhe sowie strategische Hebel für die Frühpensionierung. Deine PK ist oft der grösste Vermögensposten in deinem Leben.',
        practiceExample: 'Lena (40) verdient CHF 90\'000. Vom Lohn wird der Koordinationsabzug von CHF 26\'460 abgezogen → versicherter Lohn CHF 63\'540. Ihr PK-Guthaben beträgt CHF 180\'000. Bei einem Umwandlungssatz von 6.0 % ergibt das mit 65 eine Jahresrente von CHF 10\'800 (CHF 900/Monat) auf dem heute angesparten Teil. Mit zusätzlichem PK-Einkauf von CHF 30\'000 spart sie bei Grenzsteuer 32 % rund CHF 9\'600 Steuern – und erhöht später ihre Rente.',
        visualization: 'PK-Ausweis-Schema: versicherter Lohn → Sparbeiträge (AN+AG) → Altersguthaben → × Umwandlungssatz = Jahresrente. Markiert: obligatorisch (gelb) vs. überobligatorisch (grün).',
        commonMistakes: [
          'PK-Ausweis nie gelesen – Höhe des Guthabens und Einkaufspotenzial unbekannt',
          'Koordinationsabzug ignoriert – bei tiefen Löhnen wird ein grosser Teil gar nicht versichert',
          'PK-Einkauf erst kurz vor Pensionierung statt gestaffelt über mehrere Jahre',
          'Bei Jobwechsel das Freizügigkeitsguthaben passiv liegen lassen statt strategisch anzulegen',
          'Umwandlungssatz mit Rendite verwechseln – er bestimmt nur, wie aus Kapital eine Rente wird',
        ],
        customerRelevance: 'Hast du deinen letzten PK-Ausweis griffbereit? Wir gehen ihn gemeinsam durch und identifizieren konkrete Optimierungen.',
        linkedToolKey: 'vorsorgecheck',
        linkedToolLabel: 'PK-Optimierung prüfen',
        sources: [
          { title: 'BSV – Berufliche Vorsorge', url: 'https://www.bsv.admin.ch/bsv/de/home/sozialversicherungen/bv.html' },
          { title: 'admin.ch – BVG-Übersicht', url: 'https://www.ch.ch/de/altersvorsorge/zweite-saule/' },
        ],
        readingMinutes: 6,
        xpReward: 30,
        addedAt: '2026-04-17',
      },
      {
        id: '3a-steuervorteile',
        categoryId: 'saeulen-vorsorge',
        title: 'Die Säule 3a richtig nutzen',
        shortDescription: 'Die Säule 3a ist das stärkste legale Steuerspar-Instrument der Schweiz: 2026 darfst du als Angestellte(r) bis CHF 7\'258 und als Selbständige(r) ohne PK bis CHF 36\'288 (20 % des Nettoeinkommens) einzahlen – und alles vom steuerbaren Einkommen abziehen. Über 30+ Jahre wird daraus ein sechsstelliges Vermögen.',
        whyImportant: 'Wer den Maximalbetrag konsequent einzahlt, spart pro Jahr je nach Kanton CHF 1\'800–2\'600 Steuern – und zusätzlich wachsen die Beiträge steuerfrei. Wer 10 Jahre verpasst, verschenkt schnell CHF 25\'000 Steuern UND CHF 30\'000 entgangene Rendite. Es ist die Massnahme mit dem besten Aufwand-Nutzen-Verhältnis im ganzen System.',
        practiceExample: 'Lisa (30, Zürich, Grenzsteuer 28 %) zahlt 35 Jahre lang CHF 7\'258/Jahr ein → CHF 254\'030 eingezahlt. Steuerersparnis: CHF 2\'032/Jahr × 35 = CHF 71\'120. Bei Wertschriftenlösung mit 5 % Rendite: Endkapital ca. CHF 670\'000 statt CHF 290\'000 auf einem 0.05 %-3a-Konto. Differenz Banklösung vs. Wertschriften: über CHF 380\'000.',
        visualization: 'Vergleichstabelle: 3a-Bank-Konto (0.05 %) vs. 3a-Wertschriften (VIAC/Finpension/Frankly, ~5 %) über 10/20/30 Jahre. Plus Steuerersparnis nach Kanton (ZH/BE/ZG/GE).',
        commonMistakes: [
          'Nur ein 3a-Konto führen statt 3–5 zu staffeln (verteilter Bezug spart 5-stellig Steuern)',
          'Geld auf 3a-Bank-Konto liegen lassen statt in Wertschriften (3a) zu investieren',
          'Maximalbetrag nicht bis 31. Dezember überweisen – verpasste Jahre können nicht nachgeholt werden',
          'Bei Versicherungs-3a hohe versteckte Gebühren übersehen (oft 1–1.5 % p.a.)',
          'Selbständig ohne PK – aber nicht den höheren Max-Betrag (CHF 36\'288) ausschöpfen',
        ],
        customerRelevance: 'Zahlst du bereits den Maximalbetrag ein? Und liegt das Geld in günstigen Wertschriften – oder verzinslos auf einem Bankkonto?',
        linkedToolKey: 'vergleichsrechner-3a',
        linkedToolLabel: '3a-Vergleichsrechner',
        sources: [
          { title: 'ESTV – Säule 3a Maximalbeträge', url: 'https://www.estv.admin.ch' },
          { title: 'BSV – Gebundene Vorsorge 3a', url: 'https://www.bsv.admin.ch' },
          { title: 'VIAC – 3a-Lösung', url: 'https://viac.ch' },
          { title: 'finpension – 3a-Lösung', url: 'https://finpension.ch' },
        ],
        readingMinutes: 7,
        xpReward: 30,
        addedAt: '2026-04-17',
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
        linkedToolKey: 'vergleichsrechner-3a',
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
        title: 'ETF-Sparplan für Einsteiger',
        shortDescription: 'Ein ETF (Exchange Traded Fund) bündelt hunderte oder tausende Aktien in einem einzigen Wertpapier und bildet einen Index wie den MSCI World ab. Mit einem Sparplan investierst du jeden Monat automatisch einen festen Betrag – ideal für den langfristigen Vermögensaufbau, breit diversifiziert und mit minimalen Kosten.',
        whyImportant: 'ETFs sind der einfachste, transparenteste und günstigste Weg, langfristig am globalen Wirtschaftswachstum teilzuhaben. Wer mit CHF 100/Monat startet, kann nach 30 Jahren bei 6 % Rendite über CHF 100\'000 aufgebaut haben – ohne Stockpicking, ohne Markttiming, ohne Vorwissen. Aktive Fonds schlagen den Index langfristig in über 80 % der Fälle nicht.',
        practiceExample: 'Tim (28) startet einen Sparplan mit CHF 200/Monat in einen MSCI-World-ETF (z. B. iShares Core MSCI World, TER 0.20 %) auf Swissquote. Nach 35 Jahren bei durchschnittlich 6 % p.a.: ca. CHF 285\'000 (eingezahlt: CHF 84\'000). Bei CHF 500/Monat: CHF 715\'000. Plattform-Vergleich: Swissquote (Schweizer Bank, ca. CHF 9/Trade), Interactive Brokers (sehr günstig, USD-basiert) oder Saxo Bank.',
        visualization: 'Sparplan-Kurve: monatliche Einzahlung CHF 200 vs. Endkapital nach 10/20/30 Jahren bei 4/6/8 % Rendite. Dazu Welt-Diversifikation eines MSCI-World-ETFs (1\'500+ Unternehmen aus 23 Ländern).',
        commonMistakes: [
          'Bei Börsentief in Panik den Sparplan stoppen – genau dann werden Anteile günstig gekauft',
          'Zu viele ETFs kombinieren – ein einziger Welt-ETF reicht oft (KISS-Prinzip)',
          'Hohe Plattformgebühren übersehen (z. B. Banken mit 1.5 %+ p.a. Depotgebühr)',
          'Nur in Schweizer Aktien (SPI) investieren – Home Bias mindert Diversifikation',
          'Auf den «richtigen Einstieg» warten – Time in the market schlägt Timing the market',
        ],
        customerRelevance: 'Hast du bereits einen Sparplan – oder liegt dein Vermögen unverzinst auf dem Sparkonto? Schon CHF 100/Monat machen über Jahrzehnte einen sechsstelligen Unterschied.',
        linkedToolKey: 'rendite-risiko',
        linkedToolLabel: 'Renditesimulation starten',
        sources: [
          { title: 'FINMA – Anlagefonds', url: 'https://www.finma.ch' },
          { title: 'SIX Swiss Exchange – ETF', url: 'https://www.six-group.com' },
          { title: 'BlackRock iShares', url: 'https://www.ishares.com/ch' },
        ],
        readingMinutes: 6,
        xpReward: 30,
        addedAt: '2026-04-17',
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
        id: 'krankenkasse-optimieren',
        categoryId: 'versicherungen',
        title: 'Krankenkasse optimieren',
        shortDescription: 'Die Krankenkassen-Grundversicherung ist überall identisch – aber die Prämien unterscheiden sich pro Kanton um bis zu 50 %. Mit der richtigen Franchise (CHF 300–2\'500) und dem passenden Modell (Standard, Hausarzt, HMO, Telmed) kannst du jährlich CHF 500–2\'000 sparen, ohne Leistungsverlust.',
        whyImportant: 'Die Krankenkasse ist für die meisten Schweizer:innen einer der grössten Fixposten – oft CHF 4\'000–6\'000 pro Jahr und Person. Wer nie wechselt, zahlt im Schnitt CHF 800/Jahr zu viel. Der Wechsel ist einmal im Jahr möglich – Kündigung muss bis spätestens 30. November bei der bisherigen Kasse eingehen.',
        practiceExample: 'Familie Müller (2 Erwachsene + 2 Kinder, Kanton Bern) zahlt aktuell CHF 1\'180/Monat (Standard, Franchise CHF 300). Wechsel zu günstigerem Anbieter mit Hausarzt-Modell und Franchise CHF 2\'500 für die Eltern: neu CHF 820/Monat. Jährliche Ersparnis: CHF 4\'320. Selbst wenn die Eltern die Franchise voll ausschöpfen (CHF 4\'400 Mehrkosten ggü. CHF 600), bleiben sie pro Jahr im Plus, weil sie die Franchise statistisch nicht erreichen.',
        visualization: 'Matrix: Prämie pro Modell × Franchise. Plus Spar-Beispiel: aktueller Anbieter vs. günstigster Anbieter im Kanton (Quelle priminfo.admin.ch).',
        commonMistakes: [
          'Nie wechseln, weil «zu kompliziert» – der Wechsel ist gesetzlich garantiert und nahtlos',
          'Hohe Franchise wählen, obwohl regelmässig Arztbesuche nötig sind',
          'Tiefe Franchise behalten, obwohl man jahrelang gesund war (Risiko-Eigentragung lohnt sich)',
          'Nur die Grundversicherung vergleichen – Zusatzversicherungen können bei einem Wechsel kompliziert werden',
          'Die Frist 30. November verpassen – dann gilt der Vertrag automatisch ein weiteres Jahr',
        ],
        customerRelevance: 'Hast du in den letzten 3 Jahren deine Krankenkasse verglichen? Wir zeigen dir auf priminfo.admin.ch in 5 Minuten dein Sparpotenzial.',
        sources: [
          { title: 'priminfo.admin.ch – Offizieller Prämienvergleich', url: 'https://www.priminfo.admin.ch' },
          { title: 'BAG – Krankenversicherung', url: 'https://www.bag.admin.ch/bag/de/home/versicherungen/krankenversicherung.html' },
          { title: 'admin.ch – KV wechseln', url: 'https://www.ch.ch/de/krankenversicherung-wechseln/' },
        ],
        readingMinutes: 5,
        xpReward: 30,
        addedAt: '2026-04-17',
      },
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
        title: 'Inflation verstehen',
        shortDescription: 'Inflation bedeutet, dass Geld jedes Jahr an Kaufkraft verliert. In der Schweiz lag die Teuerung 2024 bei rund 1.1 %, langfristig bei ca. 1.5–2 %. Geld auf dem Sparkonto mit 0.1 % Zins verliert real fast die gesamte Inflation – schleichend, aber verlässlich.',
        whyImportant: 'Inflation ist das «unsichtbare Steuer» auf untätiges Vermögen. Was heute CHF 1\'000 kostet, kostet bei 2 % Inflation in 20 Jahren CHF 1\'486 – das gleiche Geld kauft also ein Drittel weniger. Wer sein Vermögen «sicher» auf dem Sparkonto liegen lässt, wird systematisch ärmer, ohne es zu merken.',
        practiceExample: 'Markus hat CHF 80\'000 auf dem Sparkonto (0.1 % Zins). Bei 1.8 % durchschnittlicher Inflation verliert er real ca. 1.7 % pro Jahr → nach 20 Jahren entspricht das nur noch der Kaufkraft von CHF 56\'800. Wäre derselbe Betrag in einem global diversifizierten ETF mit 5 % Rendite angelegt: nominaler Wert CHF 212\'000, real (nach Inflation) noch CHF 150\'000. Differenz: CHF 93\'000 entgangene reale Kaufkraft.',
        visualization: 'Zwei Linien über 30 Jahre: nominaler Kontostand (flach) vs. realer Kaufkraftwert (sinkend) vs. ETF-Portfolio (steigend, real).',
        commonMistakes: [
          '«Mein Geld ist sicher auf der Bank» – nominal ja, real nein',
          'Inflation als kurzfristiges Phänomen abtun, statt 20+ Jahre zu denken',
          'Nur Nominalrenditen vergleichen, ohne Realrendite zu berechnen (Rendite − Inflation)',
          'Bargeld zuhause horten statt zu investieren',
          'Kurzfristige Inflationsspitzen (z. B. 2022/23) mit langfristigem Trend verwechseln',
        ],
        customerRelevance: 'Wie viel deines Vermögens liegt heute auf Sparkonten? Jeder Franken dort verliert messbar an Kaufkraft – jedes Jahr.',
        linkedToolKey: 'rendite-risiko',
        linkedToolLabel: 'Inflations-Simulation öffnen',
        sources: [
          { title: 'BFS – Landesindex der Konsumentenpreise', url: 'https://www.bfs.admin.ch/bfs/de/home/statistiken/preise/landesindex-konsumentenpreise.html' },
          { title: 'SNB – Inflationsdaten', url: 'https://www.snb.ch/de/iabout/stat/statpub/statmon/stats/statmon' },
        ],
        readingMinutes: 5,
        xpReward: 30,
        addedAt: '2026-04-17',
      },
      {
        id: 'notgroschen-aufbauen',
        categoryId: 'budgeting-sparen',
        title: 'Notgroschen aufbauen',
        shortDescription: 'Der Notgroschen (auch: Notreserve oder Liquiditätspuffer) sind 3–6 Monatsausgaben, die jederzeit verfügbar auf einem separaten Konto liegen. Er schützt dich vor unvorhergesehenen Ereignissen wie Jobverlust, grösserer Reparatur oder Krankheit – ohne dass du Investments mit Verlust verkaufen oder Kredite aufnehmen musst.',
        whyImportant: 'Ohne Notgroschen wird jede Krise zur Existenzfrage. Wer in einem Börsentief seine ETFs verkaufen muss, um die Waschmaschine zu zahlen, realisiert Verluste, die sich vermeiden liessen. Der Notgroschen ist das Fundament aller weiteren Vermögensaufbau-Schritte – ohne ihn ist jede Anlage instabil.',
        practiceExample: 'Sarah hat monatliche Fixkosten von CHF 3\'200 (Miete, Krankenkasse, Versicherungen, Lebensmittel). Ihr Ziel: 4 Monatsausgaben = CHF 12\'800 als Notgroschen auf einem separaten Sparkonto bei einer anderen Bank (damit sie nicht in Versuchung kommt). Aufbau: CHF 500/Monat über 26 Monate. Erst danach beginnt sie mit dem ETF-Sparplan.',
        visualization: 'Stufenmodell: Stufe 1 = CHF 5\'000 Mini-Notgroschen, Stufe 2 = 3 Monatsausgaben, Stufe 3 = 6 Monatsausgaben → dann Investieren beginnen.',
        commonMistakes: [
          'Notgroschen mit Investments mischen (z. B. ETF) – im Crash nicht verfügbar',
          'Notgroschen auf dem Hauptkonto liegen lassen – wird «aus Versehen» ausgegeben',
          'Den Notgroschen für Anschaffungen plündern statt einen separaten Spartopf anzulegen',
          'Zu hohen Notgroschen halten (z. B. 12 Monate) – Geld verliert dort an Wert',
          'Erst investieren, ohne Notgroschen aufgebaut zu haben',
        ],
        customerRelevance: 'Wie viele Monate könntest du heute ohne Einkommen überstehen? Falls die Antwort unter 3 Monaten liegt – das ist deine erste Mission.',
        linkedToolKey: 'konten-modell',
        linkedToolLabel: 'Konten-Modell öffnen',
        sources: [
          { title: 'admin.ch – Persönliches Budget', url: 'https://www.ch.ch/de/budget/' },
          { title: 'budgetberatung.ch – Schweizer Budget-Plattform', url: 'https://www.budgetberatung.ch' },
        ],
        readingMinutes: 5,
        xpReward: 30,
        addedAt: '2026-04-17',
      },
      {
        id: 'budgetierung-50-30-20',
        categoryId: 'budgeting-sparen',
        title: 'Budgetierung: Der 50/30/20-Ansatz',
        shortDescription: 'Die 50/30/20-Regel teilt dein Nettoeinkommen in drei einfache Töpfe: 50 % Bedürfnisse (Miete, Krankenkasse, Lebensmittel), 30 % Wünsche (Hobbys, Restaurants, Reisen) und 20 % Sparen/Investieren. Eine bewährte Faustregel, die in der Schweiz angepasst werden muss – wegen hoher Fixkosten oft eher 60/20/20.',
        whyImportant: 'Wer ohne System budgetiert, lebt entweder unter seinem Wert oder über seinen Verhältnissen. Die 50/30/20-Regel gibt dir in 5 Minuten einen Sparmechanismus, der ohne ständige Disziplin funktioniert. Sie eliminiert das «am Ende des Monats ist das Geld weg»-Problem.',
        practiceExample: 'Lara verdient CHF 6\'200 netto. 50/30/20 würde bedeuten: CHF 3\'100 für Bedürfnisse, CHF 1\'860 für Wünsche, CHF 1\'240 fürs Sparen. Realität in der Schweiz: Miete CHF 1\'800 + KK CHF 380 + Versicherungen CHF 250 + Essen CHF 500 = CHF 2\'930 (47 %). Sie passt an: 60/20/20 → CHF 3\'720 / CHF 1\'240 / CHF 1\'240. Die CHF 1\'240 Sparrate fliessen automatisch am Monatsanfang in 3a (CHF 605) und ETF-Sparplan (CHF 635).',
        visualization: 'Drei farbige Töpfe (Bedürfnisse / Wünsche / Sparen) mit konkretem CHF-Beispiel und Anpassung an Schweizer Realität.',
        commonMistakes: [
          'Sparen erst am Monatsende (dann ist meist nichts mehr übrig) – stattdessen Pay-Yourself-First',
          'Fixkosten ignorieren – in der Schweiz oft >50 % des Einkommens',
          'Wünsche als Bedürfnisse umdeklarieren (Netflix ist kein Bedürfnis)',
          'Nur einmal budgetieren und nie überprüfen',
          'Kein separates Sparkonto – das Geld bleibt auf dem Hauptkonto und wird verbraucht',
        ],
        customerRelevance: 'Kennst du deine echten Anteile pro Topf? Das Konten-Modell macht es in 10 Minuten sichtbar.',
        linkedToolKey: 'konten-modell',
        linkedToolLabel: 'Konten-Modell starten',
        sources: [
          { title: 'budgetberatung.ch – Budgetvorlagen', url: 'https://www.budgetberatung.ch' },
          { title: 'admin.ch – Budgetplanung', url: 'https://www.ch.ch/de/budget/' },
        ],
        readingMinutes: 5,
        xpReward: 30,
        addedAt: '2026-04-17',
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
        id: 'wohneigentum-schweiz',
        categoryId: 'wohneigentum',
        title: 'Wohneigentum in der Schweiz',
        shortDescription: 'Wohneigentum erfordert in der Schweiz mindestens 20 % Eigenkapital (davon mind. 10 % aus eigenen Mitteln, der Rest darf aus 3a/PK kommen) und eine «Tragbarkeit» unter 33 % des Bruttoeinkommens. Die Hürden sind hoch – aber WEF-Vorbezug aus 3a oder PK kann der Schlüssel sein.',
        whyImportant: 'Die Eigentumsquote in der Schweiz liegt bei nur 36 % – die niedrigste in Europa. Das hat Gründe: hohe Preise, strenge Vorgaben und oft wirtschaftlich kein Vorteil ggü. Mieten. Wer Eigentum erwerben will, muss die 3 Hürden (Eigenkapital, Tragbarkeit, kalkulatorischer Zins) genau verstehen, sonst scheitert die Finanzierung – oder wird zur lebenslangen Last.',
        practiceExample: 'Familie Keller will eine Wohnung für CHF 900\'000 kaufen. Eigenkapital nötig: CHF 180\'000 (mind. CHF 90\'000 hart, max. CHF 90\'000 aus 3a/PK-Vorbezug). Hypothek: CHF 720\'000. Tragbarkeit: kalkulatorischer Zins 5 % + 1 % Unterhalt + 1 % Amortisation 2. Hypothek = CHF 50\'400/Jahr. Damit das ≤ 33 % des Bruttolohns ist, müssen sie CHF 152\'700 jährlich verdienen. Vergleich Miete vs. Kauf: Bei aktueller Mietzinsbelastung CHF 2\'400/Monat und Hypozins 1.8 % oft fast gleich – aber Kaufpreis-Risiko und Klumpenrisiko bleiben.',
        visualization: 'Drei-Hürden-Schema: Eigenkapital (20 %) → Tragbarkeit (≤33 %) → Belehnung (max. 80 %). Plus Vergleich Miete vs. Kauf über 20 Jahre.',
        commonMistakes: [
          'Mit der Tragbarkeit zum Bank-Sollzins (z. B. 1.8 %) statt zum kalkulatorischen Zins (5 %) rechnen',
          'PK komplett für Eigenkapital plündern – Vorsorgelücke entsteht',
          'WEF-Vorbezug ohne Steuerplanung – beim Kauf fallen Kapitalbezugssteuern an',
          'Kaufnebenkosten (Notar, Grundbuch, Steuern: ca. 4–5 %) vergessen',
          'Klumpenrisiko unterschätzen: 70 % des Vermögens in einer einzigen Immobilie',
          'Annahme, Eigentum sei immer günstiger als Miete – stimmt selten in Hochpreislagen',
        ],
        customerRelevance: 'Spielst du mit dem Gedanken an Wohneigentum? Wir prüfen mit dir realistisch, ob es finanziell wirklich sinnvoll ist – oder Mieten + Investieren stärker wäre.',
        linkedToolKey: 'tragbarkeitsrechner',
        linkedToolLabel: 'Tragbarkeit prüfen',
        sources: [
          { title: 'admin.ch – Wohneigentumsförderung', url: 'https://www.ch.ch/de/wohneigentum/' },
          { title: 'BFS – Wohneigentumsquote', url: 'https://www.bfs.admin.ch' },
          { title: 'FINMA – Selbstregulierung Hypothekarfinanzierung', url: 'https://www.finma.ch' },
        ],
        readingMinutes: 7,
        xpReward: 30,
        addedAt: '2026-04-17',
      },
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
        id: 'steuern-sparen-schweiz',
        categoryId: 'steuern-schweiz',
        title: 'Steuern sparen in der Schweiz',
        shortDescription: 'In der Schweiz gibt es eine Handvoll legaler Hebel, um die Steuerlast jährlich um CHF 2\'000–10\'000 zu senken: Säule 3a, PK-Einkauf, Berufskosten, Weiterbildung und Unterhaltskosten für Eigentum. Wer alle Hebel kennt und timing-optimiert einsetzt, spart über 30 Berufsjahre schnell sechsstellige Beträge.',
        whyImportant: 'Steuern sind nach Wohnen und Krankenkasse oft der dritt- oder zweitgrösste Ausgabeposten – und der einzige, den du aktiv steuern kannst. Jeder Franken Steuerersparnis ist Netto-Vermögen, ohne dass du mehr arbeiten musst. Trotzdem nutzen viele Schweizer:innen nicht einmal die Hälfte der Möglichkeiten.',
        practiceExample: 'Daniel (38, Zürich, Bruttolohn CHF 110\'000, Grenzsteuer 30 %) optimiert: 3a-Maximalbeitrag CHF 7\'258 → Steuerersparnis CHF 2\'177. PK-Einkauf CHF 10\'000 → CHF 3\'000. Weiterbildung CIFA-Diplom CHF 8\'000 → CHF 2\'400. Berufskosten Pendel/Verpflegung CHF 4\'200 (statt Pauschale) → CHF 700 Mehrabzug. Unterhalt Eigentum (effektiv statt pauschal) CHF 6\'000 → CHF 1\'200. Total Steuerersparnis: ca. CHF 9\'500 in einem einzigen Jahr.',
        visualization: 'Top-5-Abzüge mit CHF-Wirkung bei Grenzsteuer 25/30/35 %, plus optimales Timing über das Jahr (3a bis 31.12., PK-Einkauf bis 31.12., Weiterbildung wann immer möglich).',
        commonMistakes: [
          'Pauschalabzüge nehmen, obwohl effektive Kosten höher wären (besonders bei Berufskosten und Liegenschaftsunterhalt)',
          'PK-Einkauf in einem Jahr statt gestaffelt – Progression wird nicht optimal genutzt',
          '3a vergessen oder erst im Januar einzahlen statt im Dezember (Liquiditätsoptimierung)',
          'Weiterbildungskosten (bis CHF 12\'900) nicht abziehen',
          'Krankheits-/Behindertenkosten oder Spendenabzüge übersehen',
          'Kapitalbezug (PK + 3a) im selben Jahr → wird zusammengerechnet, höhere Progression',
        ],
        customerRelevance: 'Wann hast du zuletzt eine systematische Steueroptimierung gemacht? Wir zeigen dir konkret die 3 grössten Hebel für deine Situation.',
        sources: [
          { title: 'ESTV – Eidg. Steuerverwaltung', url: 'https://www.estv.admin.ch' },
          { title: 'admin.ch – Steuern in der Schweiz', url: 'https://www.ch.ch/de/steuern-und-finanzen/' },
        ],
        readingMinutes: 6,
        xpReward: 30,
        addedAt: '2026-04-17',
      },
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
