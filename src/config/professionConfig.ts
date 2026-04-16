/**
 * Profession-specific financial guidance configuration.
 * Each profession maps to adapted limits, tips, tools, and warnings.
 */

export type ProfessionalStatus =
  | 'angestellt'
  | 'selbststaendig'
  | 'geschaeftsfuehrer'
  | 'beamter'
  | 'arzt'
  | 'anwalt'
  | 'lehrer'
  | 'student'
  | 'rentner'
  | 'arbeitslos'
  | 'hausfrau'
  | 'andere';

export interface ProfessionInfo {
  key: ProfessionalStatus;
  label: string;
  emoji: string;
  saeule3aLimit: number;
  tips: string[];
  warnings: string[];
  highlightedTools: string[];
  learningTopics: string[];
  dashboardHint: string;
}

export const PROFESSION_OPTIONS: { value: ProfessionalStatus; label: string }[] = [
  { value: 'angestellt', label: 'Angestellt' },
  { value: 'selbststaendig', label: 'Selbstständig / Freelancer' },
  { value: 'geschaeftsfuehrer', label: 'Geschäftsführer / Inhaber GmbH/AG' },
  { value: 'beamter', label: 'Beamter / Öffentlicher Dienst' },
  { value: 'arzt', label: 'Arzt / Zahnarzt' },
  { value: 'anwalt', label: 'Anwalt / Notar' },
  { value: 'lehrer', label: 'Lehrer' },
  { value: 'student', label: 'Student / In Ausbildung' },
  { value: 'rentner', label: 'Rentner' },
  { value: 'arbeitslos', label: 'Arbeitslos' },
  { value: 'hausfrau', label: 'Hausfrau/-mann' },
  { value: 'andere', label: 'Andere' },
];

const PROFESSIONS: Record<ProfessionalStatus, ProfessionInfo> = {
  angestellt: {
    key: 'angestellt',
    label: 'Angestellt',
    emoji: '💼',
    saeule3aLimit: 7258,
    tips: [
      'Prüfe einen freiwilligen PK-Einkauf — das senkt deine Steuerlast direkt.',
      'Nutze den Lohnerhöher-Rechner, um zu sehen, wie viel netto bei dir ankommt.',
      'Achte auf den überobligatorischen PK-Teil — dort liegt oft Optimierungspotenzial.',
    ],
    warnings: [],
    highlightedTools: ['lohnerhoeher', 'pk-einkauf', 'steuerrechner'],
    learningTopics: ['PK-Einkauf Optimierung', 'Lohnnebenkosten verstehen', 'BVG-Ausweis lesen'],
    dashboardHint: 'PK-Einkauf und Lohnoptimierung sind deine grössten Hebel.',
  },
  selbststaendig: {
    key: 'selbststaendig',
    label: 'Selbstständig',
    emoji: '🚀',
    saeule3aLimit: 36288,
    tips: [
      'Als Selbstständige/r ohne PK kannst du bis CHF 36\'288 in die Säule 3a einzahlen.',
      'AHV-Beiträge musst du selbst quartalsweise bezahlen — plane das Budget ein.',
      'Prüfe eine Säule 3b als Ergänzung zur 3a für zusätzliche Vorsorge.',
      'Eine freiwillige BVG-Lösung über eine Sammelstiftung kann sich lohnen.',
    ],
    warnings: [
      'Quartalsweise AHV-Rechnung nicht vergessen!',
      'Ohne PK bist du bei Invalidität deutlich weniger abgesichert.',
    ],
    highlightedTools: ['vorsorgecheck', 'steuerrechner', 'versicherungs-check'],
    learningTopics: ['Säule 3b vs. 3a', 'AHV selbst managen', 'BVG-Sammelstiftung', 'Betriebshaftpflicht'],
    dashboardHint: 'Dein 3a-Limit ist CHF 36\'288. Nutze den Steuervorteil voll aus.',
  },
  geschaeftsfuehrer: {
    key: 'geschaeftsfuehrer',
    label: 'Geschäftsführer',
    emoji: '🏢',
    saeule3aLimit: 7258,
    tips: [
      'Optimiere die Aufteilung zwischen Lohn und Dividende — die Teilbesteuerung spart Steuern.',
      'Ein PK-Einkauf für Top-Verdiener kann bis zu fünfstellig Steuern sparen.',
      'Prüfe Kapitalerhöhung vs. Darlehen an die Firma — steuerliche Konsequenzen beachten.',
    ],
    warnings: [
      'Dividenden über 10% des Firmenwerts können als verdeckte Gewinnausschüttung gelten.',
    ],
    highlightedTools: ['steuerrechner', 'pk-einkauf', 'finanzcheck'],
    learningTopics: ['Dividenden vs. Lohn', 'Dividenden-Teilbesteuerung', 'BVG-Einkauf für Top-Verdiener', 'Kapitalerhöhung'],
    dashboardHint: 'Lohn-Dividenden-Mix und PK-Einkauf sind deine wichtigsten Hebel.',
  },
  beamter: {
    key: 'beamter',
    label: 'Beamter',
    emoji: '🏛️',
    saeule3aLimit: 7258,
    tips: [
      'Deine Pensionskasse (z.B. Publica) bietet meist überdurchschnittliche Leistungen.',
      'Prüfe die spezifischen Einkaufsmöglichkeiten deiner PK — oft gibt es Sonderkonditionen.',
      'Die Beamten-Rente bietet meist besseren Schutz als die Privatwirtschaft.',
    ],
    warnings: [],
    highlightedTools: ['pk-einkauf', 'vorsorgecheck'],
    learningTopics: ['Publica / Öffentliche PK', 'Beamten-Rente verstehen', 'BVG Vergleich'],
    dashboardHint: 'Deine PK ist meist besser als in der Privatwirtschaft — trotzdem Einkauf prüfen.',
  },
  arzt: {
    key: 'arzt',
    label: 'Arzt / Zahnarzt',
    emoji: '🩺',
    saeule3aLimit: 7258,
    tips: [
      'Eine Berufshaftpflichtversicherung ist für dich essentiell — prüfe die Deckungssumme.',
      'BVG-Sammelstiftungen für Ärzte bieten oft bessere Konditionen.',
      'Bei einer Praxisgemeinschaft gibt es spezielle Steueroptimierungen.',
    ],
    warnings: [
      'Ohne ausreichende Berufshaftpflicht riskierst du dein gesamtes Privatvermögen.',
    ],
    highlightedTools: ['versicherungs-check', 'steuerrechner', 'pk-einkauf'],
    learningTopics: ['Berufshaftpflicht für Ärzte', 'BVG-Sammelstiftung', 'Steueroptimierung Praxisgemeinschaft', 'Risikoversicherungen'],
    dashboardHint: 'Haftpflicht und Vorsorge sind als Arzt besonders wichtig.',
  },
  anwalt: {
    key: 'anwalt',
    label: 'Anwalt / Notar',
    emoji: '⚖️',
    saeule3aLimit: 7258,
    tips: [
      'Berufshaftpflicht mit ausreichender Deckung ist Pflicht.',
      'Bei Kanzlei-Partnerschaft: Steueroptimierung der Gewinnverteilung prüfen.',
      'BVG-Sammelstiftungen für Freiberufler bieten flexible Lösungen.',
    ],
    warnings: [
      'Haftpflichtversicherung regelmässig auf Deckungslücken prüfen.',
    ],
    highlightedTools: ['versicherungs-check', 'steuerrechner', 'vorsorgecheck'],
    learningTopics: ['Berufshaftpflicht', 'Kanzlei-Steueroptimierung', 'BVG für Freiberufler'],
    dashboardHint: 'Haftpflicht und Steueroptimierung der Kanzlei im Fokus behalten.',
  },
  lehrer: {
    key: 'lehrer',
    label: 'Lehrer',
    emoji: '📚',
    saeule3aLimit: 7258,
    tips: [
      'Kantonale Pensionskassen haben spezifische Regelungen — informiere dich über deine.',
      'Weiterbildungskosten können steuerlich abgezogen werden.',
      'Plane dein 13. Monatsgehalt oder Ferienbonus gezielt für Vorsorge ein.',
    ],
    warnings: [],
    highlightedTools: ['steuerrechner', 'pk-einkauf', 'vorsorgecheck'],
    learningTopics: ['Kantonale PK-Besonderheiten', 'Weiterbildungs-Abzug', 'Ferienbonus-Planung'],
    dashboardHint: 'Weiterbildungsabzüge und kantonale PK-Regeln sind deine Besonderheiten.',
  },
  student: {
    key: 'student',
    label: 'Student',
    emoji: '🎓',
    saeule3aLimit: 7258,
    tips: [
      'Starte früh mit Spargewohnheiten — auch kleine Beträge machen über die Zeit einen grossen Unterschied.',
      'Dein Steuerbedarf ist meist minimal — nutze die einfache Steuererklärung.',
      'Informiere dich über AHV-Beitragslücken: Ab 21 bist du beitragspflichtig.',
    ],
    warnings: [],
    highlightedTools: ['budgetrechner', 'sparrechner'],
    learningTopics: ['Erste Spargewohnheiten', 'Steuern minimal', 'AHV-Beiträge ab 21'],
    dashboardHint: 'Kleine Gewohnheiten heute = grosse Wirkung morgen. Starte einfach.',
  },
  rentner: {
    key: 'rentner',
    label: 'Rentner',
    emoji: '🌅',
    saeule3aLimit: 0,
    tips: [
      'Fokussiere auf Ausgabenoptimierung statt Einnahmenmaximierung.',
      'Prüfe deine Vermögensverzehr-Strategie: Wie lange reicht dein Kapital?',
      'Erbschaftsplanung jetzt angehen — es spart deinen Erben Steuern und Stress.',
    ],
    warnings: [],
    highlightedTools: ['finanzcheck', 'vorsorgecheck'],
    learningTopics: ['Rentenoptimierung', 'Vermögensverzehr-Strategien', 'Erbschaftsplanung', 'Kapitalrente vs. Leibrente'],
    dashboardHint: 'Vermögensverzehr und Erbschaftsplanung sind jetzt am wichtigsten.',
  },
  arbeitslos: {
    key: 'arbeitslos',
    label: 'Arbeitslos',
    emoji: '🔄',
    saeule3aLimit: 7258,
    tips: [
      'Dein Freizügigkeitsguthaben bleibt sicher — lass dich nicht unter Druck setzen.',
      'Nutze die Zeit für eine Standortbestimmung deiner Finanzen.',
      'AHV-Beiträge werden über die Arbeitslosenversicherung weiter bezahlt.',
    ],
    warnings: [
      'Prüfe, ob dein BVG-Schutz bei Invalidität weiterhin besteht.',
    ],
    highlightedTools: ['budgetrechner', 'finanzcheck'],
    learningTopics: ['Freizügigkeit verstehen', 'Budget in der Übergangsphase', 'BVG bei Arbeitslosigkeit'],
    dashboardHint: 'Fokus auf Budget und Absicherung in der Übergangsphase.',
  },
  hausfrau: {
    key: 'hausfrau',
    label: 'Hausfrau/-mann',
    emoji: '🏠',
    saeule3aLimit: 7258,
    tips: [
      'Prüfe, ob du über den Ehepartner bei der AHV mitversichert bist.',
      'Ein eigenes Säule-3a-Konto ist möglich, wenn du Erwerbseinkommen hast.',
      'Achte auf deine eigene Vorsorge — bei Scheidung zählt jedes Beitragsjahr.',
    ],
    warnings: [
      'Ohne eigenes Einkommen: Keine eigene 3a möglich. Vorsorgelücke prüfen!',
    ],
    highlightedTools: ['vorsorgecheck', 'finanzcheck'],
    learningTopics: ['Vorsorge ohne Erwerbseinkommen', 'AHV-Splitting bei Scheidung', 'Erziehungsgutschriften'],
    dashboardHint: 'Eigene Vorsorge und AHV-Beiträge nicht vergessen — auch ohne Lohn.',
  },
  andere: {
    key: 'andere',
    label: 'Andere',
    emoji: '✦',
    saeule3aLimit: 7258,
    tips: [
      'Nutze die Tools, um deine individuelle Situation zu analysieren.',
    ],
    warnings: [],
    highlightedTools: ['finanzcheck', 'vorsorgecheck'],
    learningTopics: [],
    dashboardHint: 'Starte mit einem Finanzcheck für deine persönliche Übersicht.',
  },
};

export function getProfessionInfo(status: ProfessionalStatus | string | null | undefined): ProfessionInfo | null {
  if (!status) return null;
  return PROFESSIONS[status as ProfessionalStatus] ?? null;
}

export function getProfessionLabel(status: ProfessionalStatus | string | null | undefined): string {
  const info = getProfessionInfo(status);
  return info ? `${info.emoji} ${info.label}` : '';
}
