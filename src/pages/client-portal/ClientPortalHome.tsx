import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerPortalSettings } from '@/hooks/useClientPortal';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import {
  Shield,
  Target,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const portalSections = [
  { 
    key: 'insurances', 
    path: '/app/client-portal/insurances', 
    icon: Shield, 
    titleKey: 'clientPortal.insurances',
    descKey: 'clientPortal.insurancesDesc',
  },
  { 
    key: 'goals', 
    path: '/app/client-portal/goals', 
    icon: Target, 
    titleKey: 'clientPortal.goals',
    descKey: 'clientPortal.goalsDesc',
  },
  { 
    key: 'tasks', 
    path: '/app/client-portal/tasks', 
    icon: ClipboardList, 
    titleKey: 'clientPortal.tasks',
    descKey: 'clientPortal.tasksDesc',
  },
  { 
    key: 'strategies', 
    path: '/app/client-portal/strategies', 
    icon: TrendingUp, 
    titleKey: 'clientPortal.strategies',
    descKey: 'clientPortal.strategiesDesc',
  },
  { 
    key: 'library', 
    path: '/app/client-portal/library', 
    icon: BookOpen, 
    titleKey: 'clientPortal.library',
    descKey: 'clientPortal.libraryDesc',
  },
  { 
    key: 'tools', 
    path: '/app/client-portal/tools', 
    icon: Wrench, 
    titleKey: 'clientPortal.tools',
    descKey: 'clientPortal.toolsDesc',
  },
] as const;

export default function ClientPortalHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: settings } = useCustomerPortalSettings();

  const firstName = user?.user_metadata?.first_name || 'Kunde';

  const visibleSections = portalSections.filter(section => {
    if (!settings) return true;
    const settingKey = `show_${section.key}` as keyof typeof settings;
    return settings[settingKey] !== false;
  });

  return (
    <ClientPortalLayout>
      <div className="max-w-5xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
            {t('clientPortal.welcome', { name: firstName })}
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            {t('clientPortal.welcomeSubtitle')}
          </p>
        </div>

        {/* Mobile: Vertical stacked cards */}
        <div className="flex flex-col gap-3 lg:hidden">
          {visibleSections.map(section => (
            <Link key={section.key} to={section.path} className="block">
              <Card className={cn(
                "w-full transition-all",
                "active:scale-[0.98] touch-manipulation",
                "hover:shadow-md"
              )}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <section.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {t(section.titleKey)}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {t(section.descKey)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleSections.map(section => (
            <Link key={section.key} to={section.path}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <section.icon className="h-6 w-6 text-primary" />
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
