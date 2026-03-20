import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, FileText } from 'lucide-react';
import { useViewMode } from '@/hooks/useViewMode';

export default function InvestmentConsultingCustomerInfo() {
  const { t } = useTranslation();
  const { isPresentation } = useViewMode();

  // In presentation mode, show a clean customer-facing view
  if (isPresentation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="max-w-2xl text-center space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Deine Informationen
          </h1>
          <p className="text-lg text-muted-foreground">
            In diesem Abschnitt besprechen wir deine persönliche Situation und stellen sicher, dass wir alle relevanten Informationen haben.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container py-6 space-y-4">
        <h1 className="text-2xl font-semibold">
          {t('investmentConsulting.customerInfo', 'Kundeninformationen')}
        </h1>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <a href="https://danielseglias.monday.com/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              In Monday anzeigen
            </a>
          </Button>
          <Button asChild>
            <a href="https://calendar.app.google/VnTmx31NQvBjSRt26" target="_blank" rel="noopener noreferrer">
              <Calendar className="mr-2 h-4 w-4" />
              Termin setzen
            </a>
          </Button>
          <Button asChild>
            <a href="https://danielseglias.monday.com/boards/5084293920/views/38819347" target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              KIDN
            </a>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
