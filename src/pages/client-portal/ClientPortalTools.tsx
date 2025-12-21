import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Clock } from 'lucide-react';

export default function ClientPortalTools() {
  const { t } = useTranslation();

  return (
    <ClientPortalLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-slate-500/10 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-slate-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('clientPortal.tools')}</h1>
            <p className="text-muted-foreground">{t('clientPortal.toolsDesc')}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>{t('clientPortal.comingSoon')}</CardTitle>
            </div>
            <CardDescription>{t('clientPortal.inDevelopment')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6">
              <h3 className="font-medium mb-3">{t('clientPortal.plannedFeatures')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• {t('clientPortal.tools.feature1')}</li>
                <li>• {t('clientPortal.tools.feature2')}</li>
                <li>• {t('clientPortal.tools.feature3')}</li>
                <li>• {t('clientPortal.tools.feature4')}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientPortalLayout>
  );
}