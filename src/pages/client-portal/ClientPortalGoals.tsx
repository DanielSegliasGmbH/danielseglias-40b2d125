import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { EmptyState } from '@/components/EmptyState';
import { Target } from 'lucide-react';

export default function ClientPortalGoals() {
  const { t } = useTranslation();

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={Target}
          title="Deine Ziele"
          description="Hier werden bald deine persönlichen Finanzziele sichtbar – übersichtlich und nachvollziehbar."
        />
      </div>
    </ClientPortalLayout>
  );
}
