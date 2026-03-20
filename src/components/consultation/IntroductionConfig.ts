/**
 * Data model for the "Meine Vorstellung" introduction page.
 * Stored inside consultation additionalData.introData.
 */
export interface IntroductionData {
  name: string;
  role: string;
  headline: string;
  whatIDo: string;
  experience: string;
  approach: string;
  personal: string;
  phone: string;
  email: string;
}

export const DEFAULT_INTRODUCTION_DATA: IntroductionData = {
  name: 'Daniel Celias',
  role: 'Geschäftsführer & Anlageberater',
  headline:
    'Ich begleite Menschen dabei, ihre finanzielle Zukunft transparent, selbstbestimmt und langfristig erfolgreich aufzubauen.',
  whatIDo:
    'Ich unterstütze Menschen in der Schweiz dabei, ihre Vorsorge und ihren Vermögensaufbau strukturiert und verständlich zu optimieren – mit Fokus auf langfristigen Mehrwert und Klarheit.',
  experience:
    'Seit 2016 bin ich in der Finanzbranche tätig.\n2019 habe ich die Weiterbildung zum Versicherungsberater FAV abgeschlossen,\n2021 folgte die Weiterbildung zum Vermögensberater gemäss IAF.\nSeit Februar 2023 bin ich selbstständig und begleite Kunden unabhängig und transparent.',
  approach:
    'Mein Fokus liegt nicht auf dem Verkauf von Produkten, sondern auf echter Aufklärung und nachhaltiger Strategie.\nIch arbeite ohne versteckte Provisionen und lege grossen Wert auf Transparenz, Verständnis und langfristigen Mehrwert.',
  personal:
    'Ich bin sportlich sehr aktiv und bereite mich aktuell auf langfristige Ausdauerziele wie einen Ironman vor.\nPersönliche Entwicklung, Disziplin und Klarheit sind zentrale Bestandteile meines Lebens und meiner Arbeit.',
  phone: '077 444 8608',
  email: 'hallo@danielcelias.ch',
};
