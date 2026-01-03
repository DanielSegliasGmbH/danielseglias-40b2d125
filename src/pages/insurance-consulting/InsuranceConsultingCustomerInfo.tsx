import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

export default function InsuranceConsultingCustomerInfo() {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="container py-6 flex items-center justify-center min-h-[60vh]">
        <Button asChild size="lg">
          <a 
            href="https://danielseglias.monday.com/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            In Monday anzeigen
          </a>
        </Button>
      </div>
    </AppLayout>
  );
}
