export interface AdvisorSource {
  label: string;
  url: string;
}

export interface AdvisorInfoData {
  registrationLink: string;
  qualificationLink: string;
  compensationText: string;
  workStyle: string[];
  sources: AdvisorSource[];
  showInPresentation: boolean;
}

export const DEFAULT_ADVISOR_INFO_DATA: AdvisorInfoData = {
  registrationLink: 'https://www.finma.ch/de/bewilligung/versicherungsvermittler/',
  qualificationLink: 'https://www.cicero.ch/',
  compensationText:
    'Meine Vergütung erfolgt transparent und nachvollziehbar. Es gibt keine versteckten Provisionen oder intransparenten Gebühren. Du erfährst vor jeder Entscheidung, welche Kosten entstehen.',
  workStyle: [
    'Analyse statt Verkauf',
    'Fokus auf langfristige Strategie',
    'Individuelle Lösungen statt Standardprodukte',
    'Unabhängig und transparent',
  ],
  sources: [
    { label: 'FINMA Vermittlerregister', url: 'https://www.finma.ch/de/bewilligung/versicherungsvermittler/' },
    { label: 'Cicero Qualifikationsplattform', url: 'https://www.cicero.ch/' },
  ],
  showInPresentation: true,
};
