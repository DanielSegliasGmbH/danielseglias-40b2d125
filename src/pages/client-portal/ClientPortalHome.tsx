import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientPortalSettings } from '@/hooks/useClientPortal';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Shield,
  Target,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Wrench,
} from 'lucide-react';

const portalSections = [
  { 
    key: 'insurances', 
    path: '/app/client-portal/insurances', 
    icon: Shield, 
    titleKey: 'clientPortal.insurances',
    descKey: 'clientPortal.insurancesDesc',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  { 
    key: 'goals', 
    path: '/app/client-portal/goals', 
    icon: Target, 
    titleKey: 'clientPortal.goals',
    descKey: 'clientPortal.goalsDesc',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  { 
    key: 'tasks', 
    path: '/app/client-portal/tasks', 
    icon: ClipboardList, 
    titleKey: 'clientPortal.tasks',
    descKey: 'clientPortal.tasksDesc',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
  },
  { 
    key: 'strategies', 
    path: '/app/client-portal/strategies', 
    icon: TrendingUp, 
    titleKey: 'clientPortal.strategies',
    descKey: 'clientPortal.strategiesDesc',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  { 
    key: 'library', 
    path: '/app/client-portal/library', 
    icon: BookOpen, 
    titleKey: 'clientPortal.library',
    descKey: 'clientPortal.libraryDesc',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  { 
    key: 'tools', 
    path: '/app/client-portal/tools', 
    icon: Wrench, 
    titleKey: 'clientPortal.tools',
    descKey: 'clientPortal.toolsDesc',
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
  },
] as const;

export default function ClientPortalHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: settings } = useClientPortalSettings();

  const firstName = user?.user_metadata?.first_name || 'Kunde';

  const visibleSections = portalSections.filter(section => {
    if (!settings) return true; // Show all if no settings (default)
    const settingKey = `show_${section.key}` as keyof typeof settings;
    return settings[settingKey] !== false;
  });

  return (
    <ClientPortalLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('clientPortal.welcome', { name: firstName })}
          </h1>
          <p className="text-muted-foreground">
            {t('clientPortal.welcomeSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleSections.map(section => (
            <Link key={section.key} to={section.path}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <CardTitle className="text-lg">{t(section.titleKey)}</CardTitle>
                  <CardDescription>{t(section.descKey)}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {visibleSections.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('clientPortal.noSections')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientPortalLayout>
  );
}