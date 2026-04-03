import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { EmptyState } from '@/components/EmptyState';
import { Shield } from 'lucide-react';

export default function ClientPortalInsurances() {
  const { t } = useTranslation();

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={Shield}
          title="Deine Versicherungen"
          description="Hier wird bald deine Versicherungsübersicht angezeigt – klar strukturiert und auf dem neusten Stand."
        />
      </div>
    </ClientPortalLayout>
  );
}
