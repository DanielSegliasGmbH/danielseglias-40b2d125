export type ResultLevel = 'grün' | 'gelb' | 'rot';

export interface VorsorgecheckAnswers {
  q1_provider: string;
  q2_year: string;
  q3_payment: string;
  q4_fees: string;
  q5_flexibility: string;
  q6_investment: string;
  q7_feeling: string;
}

export interface VorsorgecheckResult {
  level: ResultLevel;
  score: number;
}

export interface Question {
  id: keyof VorsorgecheckAnswers;
  question: string;
  options: { label: string; value: string; points: number }[];
}

export const QUESTIONS: Question[] = [
  {
    id: 'q1_provider',
    question: 'Bei wem hast du deine Säule 3a abgeschlossen?',
    options: [
      { label: 'Bank', value: 'bank', points: 0 },
      { label: 'Versicherung', value: 'versicherung', points: 3 },
      { label: 'Weiß nicht', value: 'weiss_nicht', points: 2 },
    ],
  },
  {
    id: 'q2_year',
    question: 'In welchem Jahr hast du deine Säule 3a eröffnet?',
    options: [
      { label: 'Ab 2021', value: 'ab_2021', points: 0 },
      { label: '2015–2020', value: '2015_2020', points: 1 },
      { label: 'Vor 2015', value: 'vor_2015', points: 2 },
      { label: 'Weiß nicht', value: 'weiss_nicht', points: 1 },
    ],
  },
  {
    id: 'q3_payment',
    question: 'Wie zahlst du in deine Säule 3a ein?',
    options: [
      { label: 'Regelmäßig (monatlich oder jährlich)', value: 'regelmaessig', points: 0 },
      { label: 'Unregelmäßig', value: 'unregelmaessig', points: 1 },
      { label: 'Aktuell keine Einzahlung', value: 'keine', points: 1 },
    ],
  },
  {
    id: 'q4_fees',
    question: 'Wie hoch sind die laufenden Gebühren deiner Säule 3a?',
    options: [
      { label: 'Unter 0.5 %', value: 'unter_05', points: 0 },
      { label: '0.5–1.0 %', value: '05_10', points: 1 },
      { label: 'Über 1.0 %', value: 'ueber_10', points: 3 },
      { label: 'Weiß nicht', value: 'weiss_nicht', points: 2 },
    ],
  },
  {
    id: 'q5_flexibility',
    question: 'Wie flexibel ist deine Säule 3a?',
    options: [
      { label: 'Flexibel kündbar', value: 'flexibel', points: 0 },
      { label: 'Vertraglich gebunden', value: 'gebunden', points: 3 },
      { label: 'Weiß nicht', value: 'weiss_nicht', points: 2 },
    ],
  },
  {
    id: 'q6_investment',
    question: 'Wie ist deine Säule 3a angelegt?',
    options: [
      { label: 'Breit gestreute ETFs', value: 'etf', points: 0 },
      { label: 'Aktive Fonds', value: 'aktive_fonds', points: 1 },
      { label: 'Versicherung / Sparanteil', value: 'versicherung', points: 3 },
      { label: 'Keine Ahnung', value: 'keine_ahnung', points: 2 },
    ],
  },
  {
    id: 'q7_feeling',
    question: 'Wie fühlst du dich mit deiner aktuellen 3a-Lösung?',
    options: [
      { label: 'Sehr sicher', value: 'sehr_sicher', points: 0 },
      { label: 'Eher unsicher', value: 'eher_unsicher', points: 1 },
      { label: 'Unsicher', value: 'unsicher', points: 2 },
      { label: 'Kein gutes Gefühl', value: 'kein_gutes_gefuehl', points: 3 },
    ],
  },
];

export function calculateScore(answers: VorsorgecheckAnswers): VorsorgecheckResult {
  let totalScore = 0;

  for (const question of QUESTIONS) {
    const answer = answers[question.id];
    const option = question.options.find((o) => o.value === answer);
    if (option) {
      totalScore += option.points;
    }
  }

  let level: ResultLevel;
  if (totalScore <= 4) {
    level = 'grün';
  } else if (totalScore <= 9) {
    level = 'gelb';
  } else {
    level = 'rot';
  }

  return { level, score: totalScore };
}

export const RESULT_TEXTS: Record<ResultLevel, { title: string; text: string }> = {
  grün: {
    title: 'Deine Säule 3a ist grundsätzlich gut aufgestellt',
    text: 'Deine aktuelle Lösung wirkt strukturiert und kosteneffizient. Trotzdem lohnt sich eine periodische Überprüfung – insbesondere in Bezug auf Steuern, Aufteilung und langfristige Strategie.',
  },
  gelb: {
    title: 'Deine Säule 3a ist optimierbar',
    text: 'Einige Punkte in deiner Vorsorge sind unklar oder nicht optimal gelöst. Solche Schwachstellen wirken harmlos, können langfristig aber spürbar Geld kosten.',
  },
  rot: {
    title: 'Deine aktuelle 3a-Lösung ist wahrscheinlich teuer oder unflexibel',
    text: 'Mehrere Faktoren deuten darauf hin, dass deine Säule 3a nicht effizient aufgebaut ist. Je länger solche Lösungen unverändert bleiben, desto größer wird der finanzielle Nachteil.',
  },
};
