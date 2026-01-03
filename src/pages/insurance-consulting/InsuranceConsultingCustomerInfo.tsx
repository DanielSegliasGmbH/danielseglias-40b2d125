import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function InsuranceConsultingCustomerInfo() {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="container py-6 space-y-4">
        <h1 className="text-2xl font-semibold">
          {t('insuranceConsulting.customerInfo', 'Kundeninformationen')}
        </h1>
        <Button asChild>
          <a 
            href="https://danielseglias.monday.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            In Monday anzeigen
          </a>
        </Button>
      </div>
    </AppLayout>
  );
}
