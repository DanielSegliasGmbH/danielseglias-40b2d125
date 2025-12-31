/**
 * Zentrale Konfiguration für die Bedürfnis-Pyramide
 * 
 * Hier können Ebenen, Bausteine und Inhalte angepasst werden.
 */

export interface RelatedTopic {
  id: string;
  title: string;
  imageUrl?: string;
  discussed: boolean;
}

export interface PyramidItem {
  id: string;
  title: string;
  icon: string; // Lucide icon name
  whyText: string;
  isImportant: boolean;
  status: {
    prioritized: boolean;
    discussed: boolean;
    waiver: boolean;
  };
  relatedTopics: RelatedTopic[];
}

export interface PyramidLevel {
  id: string;
  title: string;
  infoText?: string;
  items: PyramidItem[];
}

export const pyramidConfig: PyramidLevel[] = [
  {
    id: 'level_1',
    title: 'Geniessen Sie Ihre finanzielle Freiheit',
    infoText: 'Die Spitze der Pyramide: Vermögensaufbau und finanzielle Unabhängigkeit',
    items: [
      {
        id: 'freedom_wealth',
        title: 'Vermögen vermehren & nutzen',
        icon: 'TrendingUp',
        whyText: 'Finanzielle Freiheit bedeutet, dass Sie Ihr Leben nach Ihren Vorstellungen gestalten können. Mit einer durchdachten Vermögensstrategie können Sie Ihr Kapital nicht nur erhalten, sondern auch vermehren und für Ihre Ziele einsetzen.',
        isImportant: true,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'investment', title: 'Anlagestrategie', discussed: false },
          { id: 'wealth_management', title: 'Vermögensverwaltung', discussed: false },
          { id: 'tax_optimization', title: 'Steueroptimierung', discussed: false },
        ],
      },
    ],
  },
  {
    id: 'level_2',
    title: 'Gestalten Sie Ihre Zukunft',
    infoText: 'Vorsorge und Vermögensaufbau für Ihre Träume',
    items: [
      {
        id: 'future_dreams',
        title: 'Träume verwirklichen',
        icon: 'Sparkles',
        whyText: 'Ob Eigenheim, Weltreise oder Frühpensionierung – Ihre Träume verdienen einen konkreten Plan. Gemeinsam erarbeiten wir, wie Sie Ihre Ziele erreichen können.',
        isImportant: false,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'home_ownership', title: 'Wohneigentum', discussed: false },
          { id: 'early_retirement', title: 'Frühpensionierung', discussed: false },
          { id: 'sabbatical', title: 'Sabbatical / Auszeit', discussed: false },
        ],
      },
      {
        id: 'future_build',
        title: 'Vermögen aufbauen',
        icon: 'PiggyBank',
        whyText: 'Systematischer Vermögensaufbau ist der Schlüssel zu langfristiger finanzieller Sicherheit. Wir zeigen Ihnen, wie Sie Schritt für Schritt Ihr Vermögen aufbauen.',
        isImportant: false,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'pillar_3a', title: 'Säule 3a', discussed: false },
          { id: 'savings_plan', title: 'Sparplan', discussed: false },
          { id: 'etf_investing', title: 'ETF-Sparen', discussed: false },
        ],
      },
    ],
  },
  {
    id: 'level_3',
    title: 'Schützen Sie Dinge, die Sie lieben',
    infoText: 'Sachversicherungen für Ihr Hab und Gut',
    items: [
      {
        id: 'protect_home',
        title: 'Wohnen',
        icon: 'Home',
        whyText: 'Ihr Zuhause ist mehr als nur vier Wände – es ist Ihr Rückzugsort. Schützen Sie Ihr Eigenheim und Ihre Einrichtung vor unvorhergesehenen Ereignissen.',
        isImportant: false,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'household', title: 'Hausratversicherung', discussed: false },
          { id: 'building', title: 'Gebäudeversicherung', discussed: false },
          { id: 'liability', title: 'Privathaftpflicht', discussed: false },
        ],
      },
      {
        id: 'protect_mobility',
        title: 'Mobilität',
        icon: 'Car',
        whyText: 'Mobilität bedeutet Freiheit und Flexibilität. Ob Auto, Motorrad oder E-Bike – sorgen Sie für den richtigen Schutz.',
        isImportant: false,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'car_insurance', title: 'Autoversicherung', discussed: false },
          { id: 'motorcycle', title: 'Motorradversicherung', discussed: false },
          { id: 'bicycle', title: 'Fahrrad / E-Bike', discussed: false },
        ],
      },
      {
        id: 'protect_leisure',
        title: 'Freizeit, Hobbys & Reisen',
        icon: 'Plane',
        whyText: 'Ihre Freizeit ist kostbar. Geniessen Sie Ihre Hobbys und Reisen mit der Gewissheit, gut abgesichert zu sein.',
        isImportant: false,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'travel', title: 'Reiseversicherung', discussed: false },
          { id: 'sports', title: 'Sportversicherung', discussed: false },
          { id: 'valuables', title: 'Wertgegenstände', discussed: false },
        ],
      },
    ],
  },
  {
    id: 'level_4',
    title: 'Schützen Sie sich und Ihre Liebsten',
    infoText: 'Personenversicherungen für Sie und Ihre Familie',
    items: [
      {
        id: 'loved_family',
        title: 'Familie & Partnerschaft',
        icon: 'Users',
        whyText: 'Ihre Familie ist das Wichtigste. Sorgen Sie dafür, dass Ihre Liebsten auch in schwierigen Zeiten finanziell abgesichert sind.',
        isImportant: true,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'life_insurance', title: 'Lebensversicherung', discussed: false },
          { id: 'death_benefit', title: 'Todesfallschutz', discussed: false },
          { id: 'children', title: 'Kinderabsicherung', discussed: false },
        ],
      },
      {
        id: 'loved_income',
        title: 'Einkommen & Lebensstandard',
        icon: 'Briefcase',
        whyText: 'Ihr Einkommen ist die Basis Ihres Lebensstandards. Schützen Sie sich vor den finanziellen Folgen von Erwerbsunfähigkeit.',
        isImportant: true,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'disability', title: 'Invalidität', discussed: false },
          { id: 'income_protection', title: 'Erwerbsunfähigkeit', discussed: false },
          { id: 'daily_sickness', title: 'Krankentaggeld', discussed: false },
        ],
      },
      {
        id: 'loved_security',
        title: 'Finanzielle & rechtliche Sicherheit',
        icon: 'Shield',
        whyText: 'Rechtliche Streitigkeiten können teuer werden. Mit der richtigen Absicherung sind Sie auf der sicheren Seite.',
        isImportant: false,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'legal_protection', title: 'Rechtsschutz', discussed: false },
          { id: 'pension', title: 'Altersvorsorge', discussed: false },
          { id: 'will', title: 'Testament & Erbschaft', discussed: false },
        ],
      },
      {
        id: 'loved_health',
        title: 'Gesundheit',
        icon: 'Heart',
        whyText: 'Gesundheit ist unser höchstes Gut. Mit einer optimalen Krankenversicherung sind Sie bestens versorgt.',
        isImportant: true,
        status: { prioritized: false, discussed: false, waiver: false },
        relatedTopics: [
          { id: 'health_basic', title: 'Grundversicherung', discussed: false },
          { id: 'health_supplementary', title: 'Zusatzversicherung', discussed: false },
          { id: 'dental', title: 'Zahnversicherung', discussed: false },
        ],
      },
    ],
  },
];

// Helper to get all items flattened
export const getAllPyramidItems = (): PyramidItem[] => {
  return pyramidConfig.flatMap(level => level.items);
};

// Helper to find item by id
export const findPyramidItemById = (id: string): PyramidItem | undefined => {
  return getAllPyramidItems().find(item => item.id === id);
};
