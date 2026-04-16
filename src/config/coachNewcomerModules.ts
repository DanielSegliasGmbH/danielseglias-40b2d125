import { Eye, Target, LayoutGrid, CheckCircle2, Flame } from 'lucide-react';

export interface NewcomerQuestion {
  id: string;
  question: string;
  placeholder?: string;
  type: 'text' | 'choice';
  choices?: string[];
}

export interface NewcomerModule {
  id: number;
  key: string;       // stored as "newcomer_<key>" in coach_progress
  icon: any;
  title: string;
  desc: string;
  xp: number;
  time: string;
  intro: string;
  questions: NewcomerQuestion[];
  actionLink: { label: string; path: string };
  summary: string;
}

export const NEWCOMER_MODULES: NewcomerModule[] = [
  {
    id: 1,
    key: 'where',
    icon: Eye,
    title: 'Wo stehst du jetzt?',
    desc: 'Ein einfacher Finanz-Check in 10 Minuten.',
    xp: 50,
    time: '10 Min.',
    intro: 'Bevor du loslegst, verschaffen wir uns einen kurzen Überblick. Keine komplizierten Zahlen — nur ein ehrlicher Blick auf deine aktuelle Situation.',
    questions: [
      { id: 'q1', question: 'Wie würdest du deine aktuelle finanzielle Lage beschreiben?', type: 'choice', choices: ['Sehr gut — alles im Griff', 'Okay, aber wenig Überblick', 'Eher knapp', 'Keine Ahnung, ehrlich gesagt'] },
      { id: 'q2', question: 'Hast du einen Notgroschen (3+ Monatsausgaben gespart)?', type: 'choice', choices: ['Ja', 'Teilweise', 'Nein'] },
      { id: 'q3', question: 'Weisst du, wie viel du monatlich ausgibst?', type: 'choice', choices: ['Ja, ziemlich genau', 'Ungefähr', 'Nicht wirklich'] },
    ],
    actionLink: { label: 'Finanz-Snapshot erstellen', path: '/app/client-portal/tools/finanz-snapshot' },
    summary: 'Super — du hast einen ersten Blick auf deine Situation geworfen. Das ist der wichtigste Schritt.',
  },
  {
    id: 2,
    key: 'goals',
    icon: Target,
    title: 'Wohin willst du?',
    desc: 'Definiere 1–3 einfache finanzielle Ziele.',
    xp: 50,
    time: '10 Min.',
    intro: 'Ohne Ziel kein Plan. Aber keine Sorge — wir fangen klein an. Was wünschst du dir finanziell?',
    questions: [
      { id: 'q1', question: 'Was ist dein wichtigstes finanzielles Ziel gerade?', type: 'choice', choices: ['Schulden abbauen', 'Notgroschen aufbauen', 'Für etwas Grosses sparen', 'Einfach weniger Stress mit Geld'] },
      { id: 'q2', question: 'In welchem Zeitraum möchtest du das erreichen?', type: 'choice', choices: ['In 3 Monaten', 'In 6 Monaten', 'In 1 Jahr', 'Weiss ich noch nicht'] },
    ],
    actionLink: { label: 'Ziel erstellen', path: '/app/client-portal/goals' },
    summary: 'Sehr gut — mit einem klaren Ziel vor Augen fällt alles leichter.',
  },
  {
    id: 3,
    key: 'lever',
    icon: LayoutGrid,
    title: 'Der wichtigste Hebel',
    desc: 'Lerne das Konten-Modell und baue deinen Notgroschen auf.',
    xp: 75,
    time: '15 Min.',
    intro: 'Es gibt EINEN Hebel, der alles verändert: dein Geld auf verschiedene Konten aufteilen. Klingt simpel — ist es auch. Und es wirkt.',
    questions: [
      { id: 'q1', question: 'Hast du separate Konten für verschiedene Zwecke (Sparen, Ausgaben, Spass)?', type: 'choice', choices: ['Ja, mehrere', 'Teilweise', 'Nein, alles auf einem Konto'] },
      { id: 'q2', question: 'Wie viel könntest du ab sofort monatlich zur Seite legen?', type: 'choice', choices: ['CHF 50–100', 'CHF 100–300', 'CHF 300–500', 'Mehr als CHF 500', 'Aktuell gar nichts'] },
      { id: 'q3', question: 'Was hält dich am meisten vom Sparen ab?', type: 'choice', choices: ['Zu wenig Einkommen', 'Zu viele Ausgaben', 'Keine Disziplin', 'Weiss nicht wo anfangen'] },
    ],
    actionLink: { label: 'Konten-Modell entdecken', path: '/app/client-portal/tools/kontenmodell' },
    summary: 'Der Konten-Trick ist der einfachste Weg, um sofort besser mit Geld umzugehen. Probiere es aus!',
  },
  {
    id: 4,
    key: 'firststep',
    icon: CheckCircle2,
    title: 'Dein erster Schritt',
    desc: 'Wähle EINE konkrete Aktion und setze sie um.',
    xp: 75,
    time: '10 Min.',
    intro: 'Jetzt wird\'s konkret. Wähle EINE Sache, die du diese Woche umsetzen wirst. Nur eine — aber die richtig.',
    questions: [
      { id: 'q1', question: 'Welche Aktion willst du als Erstes umsetzen?', type: 'choice', choices: ['Sparkonto eröffnen', 'Dauerauftrag einrichten', 'Ausgaben der letzten Woche aufschreiben', 'Versicherungen prüfen', 'Etwas anderes'] },
      { id: 'q2', question: 'Wann wirst du das tun?', type: 'choice', choices: ['Heute noch', 'Diese Woche', 'Am Wochenende'] },
    ],
    actionLink: { label: 'Aufgabe erstellen', path: '/app/client-portal/tasks' },
    summary: 'Perfekt. Eine Aufgabe, ein Termin, eine Entscheidung. Das ist alles, was du brauchst.',
  },
  {
    id: 5,
    key: 'habit',
    icon: Flame,
    title: 'Deine Gewohnheit',
    desc: 'Setze eine tägliche Gewohnheit auf und schaffe Momentum.',
    xp: 50,
    time: '5 Min.',
    intro: 'Der letzte Baustein: eine kleine tägliche Gewohnheit. Nicht perfekt — nur regelmässig. Das ist das Geheimnis.',
    questions: [
      { id: 'q1', question: 'Welche Finanz-Gewohnheit möchtest du aufbauen?', type: 'choice', choices: ['Ausgaben notieren', 'Budget-Check machen', 'Spar-Transfer prüfen', 'Kurz Finanznews lesen'] },
      { id: 'q2', question: 'Wann passt dir das am besten?', type: 'choice', choices: ['Morgens', 'Mittags', 'Abends'] },
    ],
    actionLink: { label: 'Gewohnheit einrichten', path: '/app/client-portal/habits' },
    summary: 'Du hast den Grundstein gelegt. Ab jetzt baust du jeden Tag ein kleines Stück weiter — automatisch.',
  },
];

export const NEWCOMER_DB_PREFIX = 'newcomer_';
export const NEWCOMER_BADGE_KEY = 'finanz-starter';
export const NEWCOMER_TOTAL_XP = NEWCOMER_MODULES.reduce((sum, m) => sum + m.xp, 0);
