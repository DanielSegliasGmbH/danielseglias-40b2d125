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

// Related topic images for "Vermögen aufbauen"
import saeule3aImg from '@/assets/pyramid/saeule-3a.png';
import sparplanImg from '@/assets/pyramid/sparplan.png';
import etfSparplanImg from '@/assets/pyramid/etf-sparplan.png';

// Related topic images for "Familie & Partnerschaft"
import lebensversicherungImg from '@/assets/pyramid/topics/lebensversicherung.png';
import todesfallschutzImg from '@/assets/pyramid/topics/todesfallschutz.png';
import kinderabsicherungImg from '@/assets/pyramid/topics/kinderabsicherung.png';

// Related topic images for "Einkommen & Lebensstandard"
import invaliditaetImg from '@/assets/pyramid/topics/invaliditaet.png';
import erwerbsunfaehigkeitImg from '@/assets/pyramid/topics/erwerbsunfaehigkeit.png';
import krankentaggeldImg from '@/assets/pyramid/topics/krankentaggeld.png';

// Related topic images for "Finanzielle Sicherheit"
import rechtsschutzImg from '@/assets/pyramid/topics/rechtsschutz.png';
import altersvorsorgeImg from '@/assets/pyramid/topics/altersvorsorge.png';
import testamentErbschaftImg from '@/assets/pyramid/topics/testament-erbschaft.png';

// Related topic images for "Gesundheit"
import grundversicherungImg from '@/assets/pyramid/topics/grundversicherung.png';
import zusatzversicherungImg from '@/assets/pyramid/topics/zusatzversicherung.png';
import zahnversicherungImg from '@/assets/pyramid/topics/zahnversicherung.png';

// Related topic images for "Wohnen"
import hausratversicherungImg from '@/assets/pyramid/topics/hausratversicherung.png';
import gebaeudeversicherungImg from '@/assets/pyramid/topics/gebaeudeversicherung.png';
import privathaftpflichtImg from '@/assets/pyramid/topics/privathaftpflicht.png';

// Related topic images for "Mobilität"
import autoversicherungImg from '@/assets/pyramid/topics/autoversicherung.png';
import motorradversicherungImg from '@/assets/pyramid/topics/motorradversicherung.png';
import fahrradEbikeImg from '@/assets/pyramid/topics/fahrrad-ebike.png';

// Related topic images for "Freizeit & Reisen"
import reiseversicherungImg from '@/assets/pyramid/topics/reiseversicherung.png';
import sportversicherungImg from '@/assets/pyramid/topics/sportversicherung.png';
import wertgegenstaendeImg from '@/assets/pyramid/topics/wertgegenstaende.png';

// Related topic images for "Träume verwirklichen"
import wohneigentumImg from '@/assets/pyramid/topics/wohneigentum.png';
import fruehpensionierungImg from '@/assets/pyramid/topics/fruehpensionierung.png';
import sabbaticalImg from '@/assets/pyramid/topics/sabbatical.png';

// Related topic images for "Finanzielle Freiheit"
import anlagestrategieImg from '@/assets/pyramid/topics/anlagestrategie.png';
import vermoegensverwaltungImg from '@/assets/pyramid/topics/vermoegensverwaltung.png';
import steueroptimierungImg from '@/assets/pyramid/topics/steueroptimierung.png';

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
      { id: 'life_insurance', title: 'Lebensversicherung', imageUrl: lebensversicherungImg, discussed: false },
      { id: 'death_benefit', title: 'Todesfallschutz', imageUrl: todesfallschutzImg, discussed: false },
      { id: 'children', title: 'Kinderabsicherung', imageUrl: kinderabsicherungImg, discussed: false },
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
      { id: 'disability', title: 'Invalidität', imageUrl: invaliditaetImg, discussed: false },
      { id: 'income_protection', title: 'Erwerbsunfähigkeit', imageUrl: erwerbsunfaehigkeitImg, discussed: false },
      { id: 'daily_sickness', title: 'Krankentaggeld', imageUrl: krankentaggeldImg, discussed: false },
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
      { id: 'legal_protection', title: 'Rechtsschutz', imageUrl: rechtsschutzImg, discussed: false },
      { id: 'pension', title: 'Altersvorsorge', imageUrl: altersvorsorgeImg, discussed: false },
      { id: 'will', title: 'Testament & Erbschaft', imageUrl: testamentErbschaftImg, discussed: false },
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
      { id: 'health_basic', title: 'Grundversicherung', imageUrl: grundversicherungImg, discussed: false },
      { id: 'health_supplementary', title: 'Zusatzversicherung', imageUrl: zusatzversicherungImg, discussed: false },
      { id: 'dental', title: 'Zahnversicherung', imageUrl: zahnversicherungImg, discussed: false },
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
      { id: 'household', title: 'Hausratversicherung', imageUrl: hausratversicherungImg, discussed: false },
      { id: 'building', title: 'Gebäudeversicherung', imageUrl: gebaeudeversicherungImg, discussed: false },
      { id: 'liability', title: 'Privathaftpflicht', imageUrl: privathaftpflichtImg, discussed: false },
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
      { id: 'car_insurance', title: 'Autoversicherung', imageUrl: autoversicherungImg, discussed: false },
      { id: 'motorcycle', title: 'Motorradversicherung', imageUrl: motorradversicherungImg, discussed: false },
      { id: 'bicycle', title: 'Fahrrad / E-Bike', imageUrl: fahrradEbikeImg, discussed: false },
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
      { id: 'travel', title: 'Reiseversicherung', imageUrl: reiseversicherungImg, discussed: false },
      { id: 'sports', title: 'Sportversicherung', imageUrl: sportversicherungImg, discussed: false },
      { id: 'valuables', title: 'Wertgegenstände', imageUrl: wertgegenstaendeImg, discussed: false },
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
      { id: 'home_ownership', title: 'Wohneigentum', imageUrl: wohneigentumImg, discussed: false },
      { id: 'early_retirement', title: 'Frühpensionierung', imageUrl: fruehpensionierungImg, discussed: false },
      { id: 'sabbatical', title: 'Sabbatical / Auszeit', imageUrl: sabbaticalImg, discussed: false },
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
      { id: 'pillar_3a', title: 'Säule 3a', imageUrl: saeule3aImg, discussed: false },
      { id: 'savings_plan', title: 'Sparplan', imageUrl: sparplanImg, discussed: false },
      { id: 'etf_investing', title: 'ETF-Sparen', imageUrl: etfSparplanImg, discussed: false },
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
      { id: 'investment', title: 'Anlagestrategie', imageUrl: anlagestrategieImg, discussed: false },
      { id: 'wealth_management', title: 'Vermögensverwaltung', imageUrl: vermoegensverwaltungImg, discussed: false },
      { id: 'tax_optimization', title: 'Steueroptimierung', imageUrl: steueroptimierungImg, discussed: false },
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
