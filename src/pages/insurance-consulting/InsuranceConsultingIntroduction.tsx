import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useViewMode } from '@/hooks/useViewMode';
import advisorProfile from '@/assets/advisor-profile.jpg';

const advisorData = {
  name: 'Risto Rikic',
  title: 'Abteilungsleiter Versicherungen und Aussendienst',
  career: [
    'Lehre in der Gemeinde',
    'In der Versicherungsbranche seit 2017',
    'Bei Daniel Seglias GmbH seit Februar 2026',
  ],
  quote: 'Ihr starker Partner für Versicherung und Vorsorge: Gemeinsam gestalten wir Ihre Zukunft.',
  facts: ['Verantwortungsbewusst', 'Lösungsorientiert', 'Wohnhaft in Oetwil a.d.L'],
  hobbies: ['Lesen', 'Reisen', 'Meditieren', 'Wandern'],
  dreams: ['Weltreise', 'Eigenheim', 'Weiterbildung IAF'],
  company: {
    name: 'Daniel Seglias GmbH',
    location: 'Standort Limmattal',
    street: 'Lerzenstrasse 19a',
    city: '8953 Dietikon',
    country: 'Schweiz',
  },
  phone: '+41 79 772 83 97',
  email: 'risto@danielseglias.ch',
};

export default function InsuranceConsultingIntroduction() {
  const { t } = useTranslation();
  const { isPresentation } = useViewMode();

  const Wrapper = isPresentation ? 'div' : AppLayout;

  return (
    <Wrapper>
      <div className="min-h-screen bg-muted/30 p-6 md:p-10">
        <div className="max-w-4xl mx-auto bg-background rounded-lg shadow-sm overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-muted">
                  <img src={advisorProfile} alt={advisorData.name} className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">{advisorData.name}</h1>
                <p className="text-lg text-muted-foreground mb-6">{advisorData.title}</p>
                <h2 className="text-lg font-semibold text-foreground mb-3">Berufsleben</h2>
                <ul className="space-y-1">
                  {advisorData.career.map((item, index) => (
                    <li key={index} className="text-muted-foreground flex items-start">
                      <span className="mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-10 text-center">
              <blockquote className="text-xl md:text-2xl text-foreground italic">
                "{advisorData.quote}"
              </blockquote>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border">
            <div className="p-6 border-b md:border-b-0 md:border-r border-border">
              <h3 className="text-lg font-semibold text-primary mb-4 bg-primary/10 -mx-6 -mt-6 px-6 py-3">Fakten</h3>
              <ul className="space-y-1 text-muted-foreground">
                {advisorData.facts.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
            <div className="p-6 border-b md:border-b-0 md:border-r border-border">
              <h3 className="text-lg font-semibold text-primary mb-4 bg-primary/10 -mx-6 -mt-6 px-6 py-3">Hobbys</h3>
              <ul className="space-y-1 text-muted-foreground">
                {advisorData.hobbies.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 bg-primary/10 -mx-6 -mt-6 px-6 py-3">Träume & Ziele</h3>
              <ul className="space-y-1 text-muted-foreground">
                {advisorData.dreams.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
          </div>
          <div className="p-6 md:p-8 border-t border-border bg-muted/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{advisorData.company.name}</p>
                <p>{advisorData.company.location}</p>
                <p>{advisorData.company.street}</p>
                <p>{advisorData.company.city}</p>
                <p>{advisorData.company.country}</p>
                <p className="mt-3">Tel. {advisorData.phone}</p>
              </div>
              <div className="text-sm">
                <a href={`mailto:${advisorData.email}`} className="text-primary underline hover:no-underline">{advisorData.email}</a>
              </div>
            </div>
          </div>

          {/* Admin-only: Edit button */}
          {!isPresentation && (
            <div className="p-4 border-t border-border">
              <Button variant="link" className="text-primary p-0 h-auto font-normal">
                <Pencil className="w-4 h-4 mr-1" />
                Bearbeiten
              </Button>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
