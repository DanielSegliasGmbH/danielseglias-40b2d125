/**
 * Zentrale Konfiguration für die Pyramiden-Kacheln
 * 
 * level: 1 = Spitze (1 Kachel), 4 = Basis (4 Kacheln)
 * order: Position innerhalb der Reihe (0-indexed)
 */

export interface PyramidTopic {
  id: string;
  title: string;
  level: 1 | 2 | 3 | 4;
  order: number;
  imageUrl?: string;
  isImportant: boolean;
  whyText: string;
  relatedTopics: {
    id: string;
    title: string;
    imageUrl?: string;
    discussed: boolean;
  }[];
}

// Import pyramid topic images
import selbstverwirklichungImg from '@/assets/pyramid/selbstverwirklichung.png';
import traeumeVerwirklichenImg from '@/assets/pyramid/traeume-verwirklichen.png';
import vermoegenAufbauenImg from '@/assets/pyramid/vermoegen-aufbauen.png';
import wohnenImg from '@/assets/pyramid/wohnen.png';
import mobilitaetImg from '@/assets/pyramid/mobilitaet.png';
import freizeitReisenImg from '@/assets/pyramid/freizeit-reisen.png';
import familiePartnerschaftImg from '@/assets/pyramid/familie-partnerschaft.png';
import einkommenLebensstandardImg from '@/assets/pyramid/einkommen-lebensstandard.png';
import finanzielleSicherheitImg from '@/assets/pyramid/finanzielle-sicherheit.png';
import gesundheitImg from '@/assets/pyramid/gesundheit.png';

export const pyramidTopics: PyramidTopic[] = [
  // Level 4 (Basis - 4 Kacheln)
  {
    id: 'loved_family',
    title: 'Familie & Partnerschaft',
    level: 4,
    order: 0,
    imageUrl: familiePartnerschaftImg,
    isImportant: true,
    whyText: 'Ihre Familie ist das Wichtigste. Sorgen Sie dafür, dass Ihre Liebsten auch in schwierigen Zeiten finanziell abgesichert sind.',
    relatedTopics: [
      { id: 'life_insurance', title: 'Lebensversicherung', discussed: false },
      { id: 'death_benefit', title: 'Todesfallschutz', discussed: false },
      { id: 'children', title: 'Kinderabsicherung', discussed: false },
    ],
  },
  {
    id: 'loved_income',
    title: 'Einkommen & Lebensstandard',
    level: 4,
    order: 1,
    imageUrl: einkommenLebensstandardImg,
    isImportant: true,
    whyText: 'Ihr Einkommen ist die Basis Ihres Lebensstandards. Schützen Sie sich vor den finanziellen Folgen von Erwerbsunfähigkeit.',
    relatedTopics: [
      { id: 'disability', title: 'Invalidität', discussed: false },
      { id: 'income_protection', title: 'Erwerbsunfähigkeit', discussed: false },
      { id: 'daily_sickness', title: 'Krankentaggeld', discussed: false },
    ],
  },
  {
    id: 'loved_security',
    title: 'Finanzielle Sicherheit',
    level: 4,
    order: 2,
    imageUrl: finanzielleSicherheitImg,
    isImportant: false,
    whyText: 'Rechtliche Streitigkeiten können teuer werden. Mit der richtigen Absicherung sind Sie auf der sicheren Seite.',
    relatedTopics: [
      { id: 'legal_protection', title: 'Rechtsschutz', discussed: false },
      { id: 'pension', title: 'Altersvorsorge', discussed: false },
      { id: 'will', title: 'Testament & Erbschaft', discussed: false },
    ],
  },
  {
    id: 'loved_health',
    title: 'Gesundheit',
    level: 4,
    order: 3,
    imageUrl: gesundheitImg,
    isImportant: true,
    whyText: 'Gesundheit ist unser höchstes Gut. Mit einer optimalen Krankenversicherung sind Sie bestens versorgt.',
    relatedTopics: [
      { id: 'health_basic', title: 'Grundversicherung', discussed: false },
      { id: 'health_supplementary', title: 'Zusatzversicherung', discussed: false },
      { id: 'dental', title: 'Zahnversicherung', discussed: false },
    ],
  },

  // Level 3 (3 Kacheln)
  {
    id: 'protect_home',
    title: 'Wohnen',
    level: 3,
    order: 0,
    imageUrl: wohnenImg,
    isImportant: false,
    whyText: 'Ihr Zuhause ist mehr als nur vier Wände – es ist Ihr Rückzugsort. Schützen Sie Ihr Eigenheim und Ihre Einrichtung.',
    relatedTopics: [
      { id: 'household', title: 'Hausratversicherung', discussed: false },
      { id: 'building', title: 'Gebäudeversicherung', discussed: false },
      { id: 'liability', title: 'Privathaftpflicht', discussed: false },
    ],
  },
  {
    id: 'protect_mobility',
    title: 'Mobilität',
    level: 3,
    order: 1,
    imageUrl: mobilitaetImg,
    isImportant: false,
    whyText: 'Mobilität bedeutet Freiheit und Flexibilität. Ob Auto, Motorrad oder E-Bike – sorgen Sie für den richtigen Schutz.',
    relatedTopics: [
      { id: 'car_insurance', title: 'Autoversicherung', discussed: false },
      { id: 'motorcycle', title: 'Motorradversicherung', discussed: false },
      { id: 'bicycle', title: 'Fahrrad / E-Bike', discussed: false },
    ],
  },
  {
    id: 'protect_leisure',
    title: 'Freizeit & Reisen',
    level: 3,
    order: 2,
    imageUrl: freizeitReisenImg,
    isImportant: false,
    whyText: 'Ihre Freizeit ist kostbar. Geniessen Sie Ihre Hobbys und Reisen mit der Gewissheit, gut abgesichert zu sein.',
    relatedTopics: [
      { id: 'travel', title: 'Reiseversicherung', discussed: false },
      { id: 'sports', title: 'Sportversicherung', discussed: false },
      { id: 'valuables', title: 'Wertgegenstände', discussed: false },
    ],
  },

  // Level 2 (2 Kacheln)
  {
    id: 'future_dreams',
    title: 'Träume verwirklichen',
    level: 2,
    order: 0,
    imageUrl: traeumeVerwirklichenImg,
    isImportant: false,
    whyText: 'Ob Eigenheim, Weltreise oder Frühpensionierung – Ihre Träume verdienen einen konkreten Plan.',
    relatedTopics: [
      { id: 'home_ownership', title: 'Wohneigentum', discussed: false },
      { id: 'early_retirement', title: 'Frühpensionierung', discussed: false },
      { id: 'sabbatical', title: 'Sabbatical / Auszeit', discussed: false },
    ],
  },
  {
    id: 'future_build',
    title: 'Vermögen aufbauen',
    level: 2,
    order: 1,
    imageUrl: vermoegenAufbauenImg,
    isImportant: false,
    whyText: 'Systematischer Vermögensaufbau ist der Schlüssel zu langfristiger finanzieller Sicherheit.',
    relatedTopics: [
      { id: 'pillar_3a', title: 'Säule 3a', discussed: false },
      { id: 'savings_plan', title: 'Sparplan', discussed: false },
      { id: 'etf_investing', title: 'ETF-Sparen', discussed: false },
    ],
  },

  // Level 1 (Spitze - 1 Kachel)
  {
    id: 'freedom_wealth',
    title: 'Finanzielle Freiheit',
    level: 1,
    order: 0,
    imageUrl: selbstverwirklichungImg,
    isImportant: true,
    whyText: 'Finanzielle Freiheit bedeutet, dass Sie Ihr Leben nach Ihren Vorstellungen gestalten können.',
    relatedTopics: [
      { id: 'investment', title: 'Anlagestrategie', discussed: false },
      { id: 'wealth_management', title: 'Vermögensverwaltung', discussed: false },
      { id: 'tax_optimization', title: 'Steueroptimierung', discussed: false },
    ],
  },
];

// Get topics by level
export const getTopicsByLevel = (level: 1 | 2 | 3 | 4): PyramidTopic[] => {
  return pyramidTopics
    .filter(t => t.level === level)
    .sort((a, b) => a.order - b.order);
};

// Get topic by id
export const findTopicById = (id: string): PyramidTopic | undefined => {
  return pyramidTopics.find(t => t.id === id);
};

// Level labels for the pyramid
export const levelLabels: Record<1 | 2 | 3 | 4, string> = {
  1: 'Geniessen Sie Ihre finanzielle Freiheit',
  2: 'Gestalten Sie Ihre Zukunft',
  3: 'Schützen Sie Dinge, die Sie lieben',
  4: 'Schützen Sie sich und Ihre Liebsten',
};
