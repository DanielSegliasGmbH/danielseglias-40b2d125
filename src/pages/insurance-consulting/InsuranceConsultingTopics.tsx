import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { useViewMode } from '@/hooks/useViewMode';
import heroImage from '@/assets/insurance-consulting-hero.jpg';

const topics = [
  'Gegenseitige Vorstellung',
  'Beraterinformationen (VAG Art. 45)',
  'Mein Ziel und Ihre Erwartungen an unser Gespräch',
  'Unser Beratungsansatz mit der Bedürfnis-Pyramide',
  'Ihre Versicherungsanliegen',
  'Entscheid / nächste Schritte',
];

export default function InsuranceConsultingTopics() {
  const { t } = useTranslation();
  const { isPresentation } = useViewMode();

  const Wrapper = isPresentation ? 'div' : AppLayout;

  return (
    <Wrapper>
      <div className="flex flex-col min-h-screen">
        {/* Hero Image */}
        <div className="w-full h-[50vh] min-h-[300px] max-h-[500px] relative">
          <img
            src={heroImage}
            alt="Versicherungsberatung"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 bg-background p-8 md:p-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
              Unsere heutigen Gesprächsthemen
            </h1>
            
            <ul className="space-y-3 mb-8">
              {topics.map((topic, index) => (
                <li key={index} className="text-foreground/80 text-lg flex items-start">
                  <span className="mr-2">-</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>

            {!isPresentation && (
              <Button variant="link" className="text-primary p-0 h-auto font-normal">
                <Pencil className="w-4 h-4 mr-1" />
                Bearbeiten
              </Button>
            )}
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
