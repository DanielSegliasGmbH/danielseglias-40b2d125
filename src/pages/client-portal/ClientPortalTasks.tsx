import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { EmptyState } from '@/components/EmptyState';
import { ClipboardList } from 'lucide-react';

export default function ClientPortalTasks() {
  const { t } = useTranslation();

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto">
        <EmptyState
          icon={ClipboardList}
          title="Deine Aufgaben"
          description="Hier erscheinen bald offene und erledigte Aufgaben – damit nichts vergessen geht."
        />
      </div>
    </ClientPortalLayout>
  );
}
