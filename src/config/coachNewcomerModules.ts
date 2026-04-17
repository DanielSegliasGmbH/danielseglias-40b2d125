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
    desc: 'Ein ehrlicher Blick auf deine aktuelle Lage.',
    xp: 50,
    time: '10 Min.',
    intro: 'Bevor du losläufst, musst du wissen wo du stehst. Keine Bewertung, nur Fakten. Drei kurze Fragen — und dann machst du deinen ersten Snapshot.',
    questions: [
      { id: 'q1', question: 'Was weisst du über deine monatlichen Ausgaben?', type: 'choice', choices: ['Ziemlich genau — auf den Franken', 'Grob — die grossen Posten', 'Ehrlich gesagt: kaum etwas', 'Gar nichts'] },
      { id: 'q2', question: 'Hast du einen Notgroschen? Wenn ja, wie viele Monate deckt er ab?', type: 'choice', choices: ['Ja, 6+ Monate', 'Ja, 3–6 Monate', 'Ja, 1–3 Monate', 'Weniger als 1 Monat', 'Nein, gar keinen'] },
      { id: 'q3', question: 'Gibt es einen finanziellen Gedanken, der dich nachts wach hält?', type: 'choice', choices: ['Ja, ständig', 'Manchmal', 'Selten', 'Nein'] },
    ],
    actionLink: { label: 'Ersten Snapshot erstellen', path: '/app/client-portal/tools/finanz-snapshot' },
    summary: 'Du hast gerade mehr getan als 80% der Menschen je tun werden: hingeschaut.',
  },
  {
    id: 2,
    key: 'goals',
    icon: Target,
    title: 'Wohin willst du?',
    desc: 'Vom Wunsch zum klaren Ziel.',
    xp: 50,
    time: '10 Min.',
    intro: 'Ein Ziel ohne Plan ist nur ein Wunsch. Wir machen daraus etwas Greifbares — eine Richtung, die du jeden Tag spürst.',
    questions: [
      { id: 'q1', question: 'Wenn Geld keine Rolle spielen würde: Was würdest du morgen anders machen?', type: 'choice', choices: ['Weniger arbeiten', 'Reisen', 'Selbstständig machen', 'Familie mehr Zeit geben', 'Etwas Eigenes aufbauen', 'Einfach Ruhe haben'] },
      { id: 'q2', question: 'In 5 Jahren: Wo siehst du dich?', type: 'choice', choices: ['Eigene Wohnung / Eigentum', 'Finanziell unabhängiger', 'Schuldenfrei und entspannt', 'In einer neuen Karriere', 'Weiss ich noch nicht — und das ist okay'] },
      { id: 'q3', question: 'Was ist die EINE Sache, die du am meisten an deiner Finanzsituation ändern willst?', type: 'choice', choices: ['Endlich Überblick haben', 'Schulden loswerden', 'Mehr sparen können', 'Vermögen aufbauen', 'Weniger Stress mit Geld'] },
    ],
    actionLink: { label: 'Erstes Ziel erstellen', path: '/app/client-portal/goals' },
    summary: 'Dein Ziel steht. Jetzt hast du eine Richtung — und alles, was du tust, kann darauf einzahlen.',
  },
  {
    id: 3,
    key: 'lever',
    icon: LayoutGrid,
    title: 'Der wichtigste Hebel',
    desc: 'Konten-Modell + Notgroschen = dein Fundament.',
    xp: 75,
    time: '15 Min.',
    intro: 'Es gibt einen Hebel, der alles verändert: wissen wo dein Geld hinfliesst. Das Konten-Modell trennt Fixkosten, variable Ausgaben, Sparen und Spass — automatisch. Und der Notgroschen kommt ZUERST, denn ohne ihn ist jede Investition wackelig.',
    questions: [
      { id: 'q1', question: 'Wie viel % deines Einkommens sparst du aktuell?', type: 'choice', choices: ['0–5%', '5–10%', '10–20%', 'Mehr als 20%', 'Weiss ich nicht'] },
      { id: 'q2', question: 'Könntest du 10% mehr sparen, wenn du wüsstest, wofür du es ausgibst?', type: 'choice', choices: ['Ja, definitiv', 'Wahrscheinlich schon', 'Vielleicht', 'Nein, mein Budget ist eng'] },
    ],
    actionLink: { label: 'Konten-Modell einrichten', path: '/app/client-portal/tools/kontenmodell' },
    summary: 'Du hast jetzt ein System. Das ist mehr als die meisten Menschen je haben werden.',
  },
  {
    id: 4,
    key: 'firststep',
    icon: CheckCircle2,
    title: 'Dein erster Schritt',
    desc: 'Eine konkrete Aktion. Diese Woche.',
    xp: 75,
    time: '10 Min.',
    intro: 'Pläne sind wertlos. Tun ist alles. Wähle EINE Aktion — sie wird zu deiner ersten Aufgabe in der App.',
    questions: [
      { id: 'q1', question: 'Welche Aktion willst du als Erstes umsetzen?', type: 'choice', choices: ['Krankenkasse vergleichen', 'Ein Abo kündigen', 'CHF 100 aufs Sparkonto überweisen', 'Säule 3a recherchieren'] },
      { id: 'q2', question: 'Welche Gewohnheit kostet dich am meisten Geld — und bringt dir am wenigsten Freude?', type: 'choice', choices: ['Lieferdienste / Take-Away', 'Ungenutzte Abos', 'Impulskäufe online', 'Auswärts Kaffee', 'Etwas anderes'] },
    ],
    actionLink: { label: 'Erste Aufgabe erstellen', path: '/app/client-portal/tasks' },
    summary: 'Der erste Schritt ist getan. Die Reise hat begonnen.',
  },
  {
    id: 5,
    key: 'habit',
    icon: Flame,
    title: 'Deine Gewohnheit',
    desc: 'Eine kleine tägliche Routine — der Rest folgt.',
    xp: 50,
    time: '5 Min.',
    intro: 'Motivation bringt dich zum Start. Gewohnheit bringt dich ans Ziel. Kleine tägliche Aktionen wirken exponentiell: 1% besser pro Tag = 37× besser in einem Jahr.',
    questions: [
      { id: 'q1', question: 'Welche tägliche Gewohnheit willst du aufbauen?', type: 'choice', choices: ['Kein Impulskauf heute', 'Kontostand gecheckt', 'Selber gekocht', 'Ausgaben kurz notiert'] },
      { id: 'q2', question: 'Wann passt dir das am besten in den Tag?', type: 'choice', choices: ['Morgens beim Kaffee', 'Mittags', 'Abends vor dem Schlafen'] },
    ],
    actionLink: { label: 'Gewohnheiten-Tracker aktivieren', path: '/app/client-portal/habits' },
    summary: 'Du bist jetzt kein Anfänger mehr. Du bist ein Spieler. Dein Zukunfts-Ich ist stolz.',
  },
];

export const NEWCOMER_DB_PREFIX = 'newcomer_';
export const NEWCOMER_BADGE_KEY = 'finanz-starter';
export const NEWCOMER_TOTAL_XP = NEWCOMER_MODULES.reduce((sum, m) => sum + m.xp, 0);
