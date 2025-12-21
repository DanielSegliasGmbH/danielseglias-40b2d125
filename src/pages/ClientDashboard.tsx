import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function ClientDashboard() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground">{t('client.portal.title')}</h1>
            <Badge variant="outline">{t('roles.client')}</Badge>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {t('auth.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {t('client.portal.welcome')}
          </h2>
          <p className="text-muted-foreground">
            {t('dashboard.loggedInAs')} <strong>{t('roles.client')}</strong>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('client.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('client.portal.description')}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
