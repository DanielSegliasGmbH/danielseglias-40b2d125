import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Pencil, Eye, Users, Coins } from 'lucide-react';
import companyHero from '@/assets/company-hero.jpg';

const companyData = {
  name: 'Daniel Seglias GmbH',
  heroTitle: 'Sie stehen bei uns an erster Stelle',
  heroSubtitle: 'Deshalb stimme ich meine Beratung auf Sie und Ihre Bedürfnisse ab',
  stats: [
    { value: 'Über 10 Jahre', label: 'Erfahrung in der Versicherungsbranche' },
    { value: '200+', label: 'Kunden vertrauen auf uns' },
  ],
  uniqueValue: 'Was die Daniel Seglias GmbH besonders ausmacht ist die uneingeschränkte Transparenz und den neuen Ansatz perfekt Kostenoptimiert im Interesse des Kunden zu handeln.',
  services: [
    { icon: Eye, title: 'Transparenz', description: 'Uneingeschränkte Transparenz in allen Beratungsprozessen. Sie wissen immer genau, wofür Sie bezahlen.' },
    { icon: Coins, title: 'Kostenoptimierung', description: 'Wir handeln perfekt kostenoptimiert – immer in Ihrem Interesse, nie im Interesse von Provisionen.' },
    { icon: Users, title: 'Kundenorientierung', description: 'Ihre Bedürfnisse stehen im Mittelpunkt. Wir entwickeln massgeschneiderte Lösungen für Ihre Situation.' },
  ],
};

export default function InvestmentConsultingCompany() {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="bg-primary/10 p-8 md:p-12">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-primary/20 shadow-lg">
                <img src={companyHero} alt="Beratung" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">{companyData.heroTitle}</h1>
              <p className="text-lg text-muted-foreground">{companyData.heroSubtitle}</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-background">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">Das ist {companyData.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {companyData.stats.map((stat, index) => (
                <div key={index} className="text-center md:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-muted-foreground italic border-l-4 border-primary pl-4">{companyData.uniqueValue}</p>
          </div>
        </div>

        <div className="p-8 md:p-12 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-10">Gemeinsam gestalten wir eine bessere Zukunft</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {companyData.services.map((service, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <Button variant="link" className="text-primary p-0 h-auto font-normal">
              <Pencil className="w-4 h-4 mr-1" />
              Bearbeiten
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
