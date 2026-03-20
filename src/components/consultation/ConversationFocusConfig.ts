/**
 * Configuration for the "Gesprächsfokus & Erwartungen" page.
 * Used by both insurance and investment consulting.
 */

export interface FocusTopic {
  id: string;
  label: string;
}

export const FOCUS_TOPICS: FocusTopic[] = [
  { id: 'situation', label: 'Ausgangslage verstehen' },
  { id: 'analyze', label: 'Bestehende Vorsorge analysieren' },
  { id: 'costs', label: 'Kosten & Gebühren aufdecken' },
  { id: 'returns', label: 'Rendite & langfristige Entwicklung' },
  { id: 'risk', label: 'Risiken & Sicherheit verstehen' },
  { id: 'flexibility', label: 'Flexibilität & Zugriff' },
  { id: 'compare', label: 'Vergleich bestehende Lösung vs. Alternative' },
  { id: 'optimize', label: 'Konkrete Optimierungsmöglichkeiten' },
  { id: 'next-steps', label: 'Nächste Schritte & Entscheidungsbasis' },
];

export type TopicTag = 'customer' | 'recommended' | 'focus';

export interface FocusTopicState {
  selected: boolean;
  tags: TopicTag[];
}

export interface QualificationItem {
  id: string;
  label: string;
  question: string;
}

export const QUALIFICATION_ITEMS: QualificationItem[] = [
  {
    id: 'need',
    label: 'Bedarf vorhanden?',
    question: 'Hat der Kunde ein echtes Interesse an Optimierung?',
  },
  {
    id: 'specified',
    label: 'Bedarf konkretisiert?',
    question: 'Weiss der Kunde, wo seine Unsicherheiten oder Probleme liegen?',
  },
  {
    id: 'decision',
    label: 'Entscheidungsfähigkeit gegeben?',
    question: 'Ist der Kunde alleine entscheidungsfähig?',
  },
  {
    id: 'budget',
    label: 'Budget vorhanden?',
    question: 'Ist der Kunde bereit, für eine gute Lösung zu investieren?',
  },
  {
    id: 'timing',
    label: 'Zeitliche Umsetzbarkeit?',
    question: 'Kann der Kunde zeitnah handeln?',
  },
];

export interface ConversationFocusData {
  focusTopics: Record<string, FocusTopicState>;
  qualification: Record<string, { checked: boolean; notes: string }>;
}

export const generateDefaultFocusData = (): ConversationFocusData => ({
  focusTopics: Object.fromEntries(
    FOCUS_TOPICS.map((t) => [t.id, { selected: false, tags: [] }])
  ),
  qualification: Object.fromEntries(
    QUALIFICATION_ITEMS.map((q) => [q.id, { checked: false, notes: '' }])
  ),
});

export const TIMELINE_STEPS = [
  {
    title: 'Analyse deiner aktuellen Situation',
    description: 'Wir schauen gemeinsam an, wo du heute stehst und was du bereits hast.',
  },
  {
    title: 'Aufdecken von Potenzialen',
    description: 'Ich zeige dir konkret, wo Optimierungsmöglichkeiten liegen können.',
  },
  {
    title: 'Klare Einschätzung',
    description: 'Du verstehst am Ende genau, was gut ist und was nicht optimal läuft.',
  },
  {
    title: 'Individuelle Empfehlung',
    description: 'Wenn es Sinn macht, zeige ich dir eine konkrete Lösung für deine Situation.',
  },
  {
    title: 'Entscheidung',
    description: 'Du entscheidest in Ruhe, ob du etwas verändern möchtest oder nicht.',
  },
];
