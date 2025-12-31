import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import advisorProfile from '@/assets/advisor-profile.jpg';

// Editable advisor data - can be moved to config or database later
const advisorData = {
  name: 'Risto Rikic',
  title: 'Kundenberater',
  career: [
    'Lehre in der Gemeinde.',
    'Privatkundenberater beim Broker 5 Jahre.',
    'Seit Mai 2024 bei Zurich.',
  ],
  quote: 'Ihr starker Partner für Versicherung und Vorsorge: Gemeinsam gestalten wir Ihre Zukunft.',
  facts: ['Verantwortungsbewusst', 'Lösungsorientiert', 'Wohnhaft in Oetwil a.d.L'],
  hobbies: ['Lesen', 'Reisen', 'Meditieren', 'Wandern'],
  dreams: ['Weltreise', 'Eigenheim', 'Weiterbildung IAF'],
  company: {
    name: 'Generalagentur Okan Pelenk',
    street: 'Zürichstrasse 25',
    city: '8340 Hinwil',
    country: 'Schweiz',
  },
  phone: '+41 44 938 30 62',
  email: 'risto.rikic@zurich.ch',
};

export default function InsuranceConsultingIntroduction() {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="min-h-screen bg-muted/30 p-6 md:p-10">
        <div className="max-w-4xl mx-auto bg-background rounded-lg shadow-sm overflow-hidden">
          {/* Header Section with Photo and Info */}
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-muted">
                  <img
                    src={advisorProfile}
                    alt={advisorData.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Name and Career */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {advisorData.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {advisorData.title}
                </p>

                <h2 className="text-lg font-semibold text-foreground mb-3">
                  Berufsleben
                </h2>
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

            {/* Quote */}
            <div className="mt-10 text-center">
              <blockquote className="text-xl md:text-2xl text-foreground italic">
                "{advisorData.quote}"
              </blockquote>
            </div>
          </div>

          {/* Three Column Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-border">
            {/* Fakten */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-border">
              <h3 className="text-lg font-semibold text-primary mb-4 bg-primary/10 -mx-6 -mt-6 px-6 py-3">
                Fakten
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                {advisorData.facts.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Hobbys */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-border">
              <h3 className="text-lg font-semibold text-primary mb-4 bg-primary/10 -mx-6 -mt-6 px-6 py-3">
                Hobbys
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                {advisorData.hobbies.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Träume & Ziele */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-primary mb-4 bg-primary/10 -mx-6 -mt-6 px-6 py-3">
                Träume & Ziele
              </h3>
              <ul className="space-y-1 text-muted-foreground">
                {advisorData.dreams.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Section */}
          <div className="p-6 md:p-8 border-t border-border bg-muted/30">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              {/* Company Info */}
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{advisorData.company.name}</p>
                <p>{advisorData.company.street}</p>
                <p>{advisorData.company.city}</p>
                <p>{advisorData.company.country}</p>
                <p className="mt-3">Tel. Geschäft {advisorData.phone}</p>
              </div>

              {/* Email */}
              <div className="text-sm">
                <a 
                  href={`mailto:${advisorData.email}`} 
                  className="text-primary underline hover:no-underline"
                >
                  {advisorData.email}
                </a>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="p-4 border-t border-border">
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
