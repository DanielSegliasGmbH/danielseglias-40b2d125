// Finanzcheck MVP Constants

export const TERMIN_URL = 'https://calendar.app.google/Lr1PZDNzivnrfq9w7';

export interface Category {
  id: string;
  label: string;
  icon: string;
}

export interface Question {
  id: string;
  categoryId: string;
  text: string;
  recommendation: string;
}

export const CATEGORIES: Category[] = [
  { id: 'vorsorge', label: 'Vorsorge & Altersplanung', icon: 'Umbrella' },
  { id: 'vermoegenAufbau', label: 'Vermögensaufbau & Anlage', icon: 'TrendingUp' },
  { id: 'absicherung', label: 'Absicherung & Versicherung', icon: 'Shield' },
  { id: 'steuern', label: 'Steuern & Optimierung', icon: 'Receipt' },
  { id: 'immobilien', label: 'Immobilien & Wohneigentum', icon: 'Home' },
  { id: 'nachlass', label: 'Nachlass & Erbschaft', icon: 'FileText' },
];

export const QUESTIONS: Question[] = [
  // Vorsorge
  {
    id: 'v1',
    categoryId: 'vorsorge',
    text: 'Wissen Sie, wie hoch Ihre AHV-Rente im Alter voraussichtlich sein wird?',
    recommendation: 'Bestellen Sie einen AHV-Auszug, um Ihre Beitragslücken und Rentenprognose zu kennen.',
  },
  {
    id: 'v2',
    categoryId: 'vorsorge',
    text: 'Haben Sie in den letzten 3 Jahren einen Pensionskassen-Auszug angefordert?',
    recommendation: 'Fordern Sie Ihren PK-Auszug an, um Ihr Altersguthaben und allfällige Einkaufsmöglichkeiten zu prüfen.',
  },
  {
    id: 'v3',
    categoryId: 'vorsorge',
    text: 'Kennen Sie Ihre voraussichtliche Vorsorgelücke im Alter?',
    recommendation: 'Lassen Sie Ihre Vorsorgelücke berechnen, um frühzeitig gegensteuern zu können.',
  },
  {
    id: 'v4',
    categoryId: 'vorsorge',
    text: 'Zahlen Sie regelmässig in die Säule 3a ein?',
    recommendation: 'Prüfen Sie die maximalen 3a-Einzahlungen – sie senken Steuern und bauen Vermögen auf.',
  },

  // Vermögensaufbau
  {
    id: 'a1',
    categoryId: 'vermoegenAufbau',
    text: 'Haben Sie einen Notgroschen von mind. 3 Monatslöhnen?',
    recommendation: 'Bauen Sie eine Liquiditätsreserve auf, bevor Sie langfristig investieren.',
  },
  {
    id: 'a2',
    categoryId: 'vermoegenAufbau',
    text: 'Legen Sie regelmässig einen festen Betrag zur Seite?',
    recommendation: 'Richten Sie einen automatischen Sparplan ein – auch kleine Beträge zählen.',
  },
  {
    id: 'a3',
    categoryId: 'vermoegenAufbau',
    text: 'Haben Sie eine definierte Anlagestrategie?',
    recommendation: 'Definieren Sie Ihre Risikotoleranz und einen klaren Anlageplan.',
  },
  {
    id: 'a4',
    categoryId: 'vermoegenAufbau',
    text: 'Wissen Sie, wie hoch Ihre jährlichen Anlagekosten (TER) sind?',
    recommendation: 'Prüfen Sie Ihre Fondskosten – bereits kleine Unterschiede wirken langfristig stark.',
  },

  // Absicherung
  {
    id: 's1',
    categoryId: 'absicherung',
    text: 'Haben Sie eine Erwerbsunfähigkeitsversicherung?',
    recommendation: 'Prüfen Sie Ihre Absicherung bei Krankheit/Unfall – gerade wenn Sie selbstständig sind.',
  },
  {
    id: 's2',
    categoryId: 'absicherung',
    text: 'Ist Ihre Privathaftpflicht auf dem neuesten Stand?',
    recommendation: 'Vergleichen Sie Ihre Privathaftpflicht – viele zahlen zu viel für zu wenig.',
  },
  {
    id: 's3',
    categoryId: 'absicherung',
    text: 'Haben Sie in den letzten 2 Jahren Ihre Krankenkasse verglichen?',
    recommendation: 'Prüfen Sie jährlich Ihre Grundversicherung – oft lässt sich viel sparen.',
  },
  {
    id: 's4',
    categoryId: 'absicherung',
    text: 'Wäre Ihre Familie bei Ihrem Todesfall finanziell abgesichert?',
    recommendation: 'Prüfen Sie eine Todesfallversicherung, falls Partner oder Kinder abhängig sind.',
  },

  // Steuern
  {
    id: 't1',
    categoryId: 'steuern',
    text: 'Schöpfen Sie alle legalen Steuerabzüge aus (z.B. Berufsauslagen, Weiterbildung)?',
    recommendation: 'Erstellen Sie eine Checkliste Ihrer möglichen Abzüge – oft wird Geld verschenkt.',
  },
  {
    id: 't2',
    categoryId: 'steuern',
    text: 'Haben Sie Einkäufe in die Pensionskasse geprüft?',
    recommendation: 'Prüfen Sie freiwillige PK-Einkäufe – sie senken die Steuerlast erheblich.',
  },
  {
    id: 't3',
    categoryId: 'steuern',
    text: 'Nutzen Sie steuerbegünstigte Anlageformen (z.B. 3a-Wertschriften)?',
    recommendation: 'Investieren Sie Ihre 3a-Gelder – langfristig bringt das mehr als das Sparkonto.',
  },
  {
    id: 't4',
    categoryId: 'steuern',
    text: 'Kennen Sie Ihren Grenzsteuersatz?',
    recommendation: 'Berechnen Sie Ihren Grenzsteuersatz, um Optimierungen richtig einzuschätzen.',
  },

  // Immobilien
  {
    id: 'i1',
    categoryId: 'immobilien',
    text: 'Haben Sie einen langfristigen Plan für Wohneigentum?',
    recommendation: 'Definieren Sie, ob und wann Sie Wohneigentum anstreben möchten.',
  },
  {
    id: 'i2',
    categoryId: 'immobilien',
    text: 'Kennen Sie die Tragbarkeitsregeln der Banken?',
    recommendation: 'Informieren Sie sich über Eigenkapital- und Einkommensanforderungen.',
  },
  {
    id: 'i3',
    categoryId: 'immobilien',
    text: 'Haben Sie schon geprüft, ob Sie 2./3. Säule-Gelder fürs Wohneigentum nutzen könnten?',
    recommendation: 'Prüfen Sie Vorbezug/Verpfändung Ihrer Vorsorgegelder – aber Vorsicht bei Risiken.',
  },
  {
    id: 'i4',
    categoryId: 'immobilien',
    text: 'Falls Sie bereits Wohneigentum besitzen: Haben Sie die Hypothek kürzlich optimiert?',
    recommendation: 'Vergleichen Sie Ihre Hypothekenkonditionen regelmässig.',
  },

  // Nachlass
  {
    id: 'n1',
    categoryId: 'nachlass',
    text: 'Haben Sie ein Testament oder Erbvertrag erstellt?',
    recommendation: 'Erstellen Sie ein Testament, um Ihren Willen rechtlich abzusichern.',
  },
  {
    id: 'n2',
    categoryId: 'nachlass',
    text: 'Haben Sie eine Vorsorgevollmacht und Patientenverfügung?',
    recommendation: 'Erstellen Sie diese Dokumente, um im Ernstfall abgesichert zu sein.',
  },
  {
    id: 'n3',
    categoryId: 'nachlass',
    text: 'Wissen Sie, wer im Erbfall was erhalten würde?',
    recommendation: 'Informieren Sie sich über die gesetzliche Erbfolge in Ihrer Situation.',
  },
  {
    id: 'n4',
    categoryId: 'nachlass',
    text: 'Haben Sie wichtige Dokumente und Zugangsdaten an einem sicheren Ort hinterlegt?',
    recommendation: 'Erstellen Sie einen digitalen Nachlass-Ordner für Ihre Angehörigen.',
  },
];

export const THIRD_PILLAR_TYPES = [
  { value: 'bank', label: 'Bank (Sparkonto)' },
  { value: 'insurance', label: 'Versicherung (3a-Police)' },
  { value: 'app', label: 'App (z.B. Viac, Frankly)' },
  { value: 'other', label: 'Sonstiges' },
];

export const ANSWER_OPTIONS = [
  { value: 'yes', label: 'Ja', points: 2 },
  { value: 'unsure', label: 'Nicht sicher', points: 1 },
  { value: 'no', label: 'Nein', points: 0 },
  { value: 'na', label: 'Betrifft mich nicht', points: null },
];

export function getScoreText(score: number): { text: string; color: string } {
  if (score < 50) {
    return { text: 'erheblicher Handlungsbedarf', color: 'text-red-600' };
  } else if (score < 75) {
    return { text: 'Optimierungspotenzial', color: 'text-yellow-600' };
  } else {
    return { text: 'sehr gut aufgestellt', color: 'text-green-600' };
  }
}
