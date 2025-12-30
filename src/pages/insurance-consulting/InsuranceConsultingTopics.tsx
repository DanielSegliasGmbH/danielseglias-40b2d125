import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function InsuranceConsultingTopics() {
  const { t } = useTranslation();

  return (
    <AppLayout>
      <div className="container py-6 space-y-6">
        <h1 className="text-2xl font-semibold">
          {t('insuranceConsulting.topics', 'Gesprächsthemen')}
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>{t('insuranceConsulting.topics', 'Gesprächsthemen')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('common.contentFollows', 'Inhalt folgt')}
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
