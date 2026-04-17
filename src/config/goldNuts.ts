// Goldnuss-Katalog: Seltene Sammler-Achievements.
// Jede Goldnuss kann pro Nutzer nur EINMAL verdient werden.
// Maximal 365 Goldnüsse insgesamt im Spiel — Start mit ~50.

export type GoldNutCategory =
  | 'onboarding'
  | 'wissen'
  | 'finanzen'
  | 'peakscore'
  | 'konstanz'
  | 'social'
  | 'tools';

export interface GoldNutDef {
  key: string;
  label: string;
  description: string;
  category: GoldNutCategory;
}

export const GOLD_NUT_TOTAL = 365;

export const GOLD_NUTS: GoldNutDef[] = [
  // ─── ONBOARDING ───────────────────────────────────
  { key: 'first_login',          category: 'onboarding', label: 'Erster Schritt',     description: 'Du hast die App zum ersten Mal geöffnet.' },
  { key: 'onboarding_complete',  category: 'onboarding', label: 'Bereit',             description: 'Du hast das Onboarding abgeschlossen.' },
  { key: 'first_peakscore',      category: 'onboarding', label: 'Erste Diagnose',     description: 'Dein erster PeakScore wurde berechnet.' },
  { key: 'finanz_typ_complete',  category: 'onboarding', label: 'Selbsterkenntnis',   description: 'Du kennst deinen Finanz-Typ.' },
  { key: 'first_snapshot',       category: 'onboarding', label: 'Bestandsaufnahme',   description: 'Du hast deinen ersten Snapshot erstellt.' },

  // ─── WISSEN ───────────────────────────────────────
  { key: 'first_article',        category: 'wissen', label: 'Wissensdurst',           description: 'Ersten Artikel gelesen.' },
  { key: 'articles_5',           category: 'wissen', label: 'Lernender',              description: '5 Artikel gelesen.' },
  { key: 'articles_10',          category: 'wissen', label: 'Wissenssammler',         description: '10 Artikel gelesen.' },
  { key: 'coach_newcomer_1',     category: 'wissen', label: 'Erste Lektion',          description: 'Erstes Coach-Modul abgeschlossen.' },
  { key: 'coach_newcomer_done',  category: 'wissen', label: 'Abschluss',              description: 'Alle Newcomer-Module abgeschlossen.' },

  // ─── FINANZEN ─────────────────────────────────────
  { key: 'first_budget_entry',   category: 'finanzen', label: 'Buchhalter',           description: 'Erste Ausgabe erfasst.' },
  { key: 'budget_entries_30',    category: 'finanzen', label: 'Tracker',              description: '30 Ausgaben erfasst.' },
  { key: 'first_goal',           category: 'finanzen', label: 'Träumer',              description: 'Erstes Ziel gesetzt.' },
  { key: 'goal_completed',       category: 'finanzen', label: 'Macher',               description: 'Erstes Ziel erreicht.' },
  { key: 'first_asset',          category: 'finanzen', label: 'Besitzer',             description: 'Ersten Vermögenswert erfasst.' },
  { key: 'assets_5',             category: 'finanzen', label: 'Vermögensverwalter',   description: '5 Vermögenswerte erfasst.' },
  { key: 'first_insurance',      category: 'finanzen', label: 'Abgesichert',          description: 'Erste Versicherung hinterlegt.' },
  { key: 'savings_rate_20',      category: 'finanzen', label: 'Sparsam',              description: 'Sparquote über 20% erreicht.' },
  { key: 'savings_rate_30',      category: 'finanzen', label: 'Diszipliniert',        description: 'Sparquote über 30% erreicht.' },
  { key: 'net_worth_positive',   category: 'finanzen', label: 'Im Plus',              description: 'Positives Nettovermögen erreicht.' },

  // ─── PEAKSCORE ────────────────────────────────────
  { key: 'peakscore_3',          category: 'peakscore', label: 'Erster Puffer',       description: 'PeakScore von 3 erreicht.' },
  { key: 'peakscore_6',          category: 'peakscore', label: 'Aufwachend',          description: 'PeakScore von 6 erreicht.' },
  { key: 'peakscore_12',         category: 'peakscore', label: 'Ein Jahr frei',       description: 'PeakScore von 12 erreicht.' },
  { key: 'peakscore_24',         category: 'peakscore', label: 'Zwei Jahre frei',     description: 'PeakScore von 24 erreicht.' },
  { key: 'peakscore_36',         category: 'peakscore', label: 'Gestalter',           description: 'PeakScore von 36 erreicht.' },
  { key: 'peakscore_60',         category: 'peakscore', label: 'Fünf Jahre frei',     description: 'PeakScore von 60 erreicht.' },
  { key: 'peakscore_120',        category: 'peakscore', label: 'Investor',            description: 'PeakScore von 120 erreicht.' },
  { key: 'rank_up_first',        category: 'peakscore', label: 'Aufgestiegen',        description: 'Ersten Rang aufgestiegen.' },

  // ─── KONSTANZ ─────────────────────────────────────
  { key: 'streak_7',             category: 'konstanz', label: '7 Tage',               description: '7-Tage-Streak erreicht.' },
  { key: 'streak_14',            category: 'konstanz', label: '2 Wochen',             description: '14-Tage-Streak erreicht.' },
  { key: 'streak_30',            category: 'konstanz', label: 'Monat',                description: '30-Tage-Streak erreicht.' },
  { key: 'streak_100',           category: 'konstanz', label: '100 Tage',             description: '100-Tage-Streak — Legende.' },
  { key: 'tasks_10',             category: 'konstanz', label: 'Quester',              description: '10 Aufgaben erledigt.' },
  { key: 'tasks_50',             category: 'konstanz', label: 'Held',                 description: '50 Aufgaben erledigt.' },
  { key: 'habit_21_days',        category: 'konstanz', label: 'Gewohnheit',           description: 'Eine Gewohnheit 21 Tage in Folge.' },
  { key: 'payday_ritual_3',      category: 'konstanz', label: 'Ritual',               description: '3 Payday-Rituale abgeschlossen.' },

  // ─── SOCIAL ───────────────────────────────────────
  { key: 'first_referral',       category: 'social', label: 'Botschafter',            description: 'Ersten Freund eingeladen.' },
  { key: 'referrals_5',          category: 'social', label: 'Netzwerker',             description: '5 Freunde eingeladen.' },
  { key: 'first_challenge',      category: 'social', label: 'Herausforderer',         description: 'Erste Challenge gestartet.' },
  { key: 'challenge_won',        category: 'social', label: 'Gewinner',               description: 'Eine Challenge gewonnen.' },
  { key: 'first_community_post', category: 'social', label: 'Stimme',                 description: 'Ersten Community-Post verfasst.' },
  { key: 'life_film_complete',   category: 'social', label: 'Filmemacher',            description: 'Lebensfilm erstellt.' },
  { key: 'pair_connected',       category: 'social', label: 'Team',                   description: 'Partner verbunden.' },

  // ─── TOOLS ────────────────────────────────────────
  { key: 'tools_3_used',         category: 'tools', label: 'Werkzeugkasten',          description: '3 verschiedene Tools genutzt.' },
  { key: 'tools_10_used',        category: 'tools', label: 'Handwerker',              description: '10 verschiedene Tools genutzt.' },
  { key: 'steuerrechner_used',   category: 'tools', label: 'Steuerfuchs',             description: 'Steuerrechner genutzt.' },
  { key: 'notfall_check_done',   category: 'tools', label: 'Vorbereitet',             description: 'Notfall-Check abgeschlossen.' },
  { key: 'konten_modell_done',   category: 'tools', label: 'Strukturiert',            description: 'Konten-Modell eingerichtet.' },
  { key: 'abo_audit_done',       category: 'tools', label: 'Effizienz',               description: 'Abo-Audit abgeschlossen.' },
  { key: 'xray_reviewed',        category: 'tools', label: 'Diagnose',                description: 'Erstes Finanz-Röntgenbild gelesen.' },
];

export const GOLD_NUTS_BY_KEY: Record<string, GoldNutDef> = GOLD_NUTS.reduce(
  (acc, n) => { acc[n.key] = n; return acc; },
  {} as Record<string, GoldNutDef>
);

export function getGoldNut(key: string): GoldNutDef | undefined {
  return GOLD_NUTS_BY_KEY[key];
}

// Bonus-Münzen, die zusätzlich beim Finden einer Goldnuss vergeben werden.
export const GOLD_NUT_COIN_BONUS = 50;
