import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerPortalSettings } from '@/hooks/useClientPortal';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Lock, Sparkles } from 'lucide-react';
import {
  Shield,
  Target,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Wrench,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StrategyPasswordGate } from '@/components/client-portal/StrategyPasswordGate';

const portalSections = [
  { key: 'coach', path: '/app/client-portal/coach', icon: Sparkles, titleKey: 'clientPortal.coach', descKey: 'clientPortal.coachDesc', protected: false },
  { key: 'tools', path: '/app/client-portal/tools', icon: Wrench, titleKey: 'clientPortal.tools', descKey: 'clientPortal.toolsDesc', protected: false },
  { key: 'library', path: '/app/client-portal/library', icon: BookOpen, titleKey: 'clientPortal.library', descKey: 'clientPortal.libraryDesc', protected: false },
  { key: 'strategies', path: '/app/client-portal/strategies', icon: TrendingUp, titleKey: 'clientPortal.strategies', descKey: 'clientPortal.strategiesDesc', protected: true },
  { key: 'insurances', path: '/app/client-portal/insurances', icon: Shield, titleKey: 'clientPortal.insurances', descKey: 'clientPortal.insurancesDesc', protected: false },
  { key: 'goals', path: '/app/client-portal/goals', icon: Target, titleKey: 'clientPortal.goals', descKey: 'clientPortal.goalsDesc', protected: false },
  { key: 'tasks', path: '/app/client-portal/tasks', icon: ClipboardList, titleKey: 'clientPortal.tasks', descKey: 'clientPortal.tasksDesc', protected: false },
  { key: 'courses', path: '/app/client-portal/courses', icon: GraduationCap, titleKey: 'clientPortal.courses', descKey: 'clientPortal.coursesDesc', protected: false },
] as const;

export default function ClientPortalHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useCustomerPortalSettings();
  const [passwordGateOpen, setPasswordGateOpen] = useState(false);
  const [strategyUnlocked, setStrategyUnlocked] = useState(false);

  const firstName = user?.user_metadata?.first_name || 'Kunde';

  const visibleSections = portalSections.filter(section => {
    if (!settings) return true;
    const settingKey = `show_${section.key}` as keyof typeof settings;
    return settings[settingKey] !== false;
  });

  const strategyPassword = (settings as any)?.strategy_access_password;
  const hasStrategyPassword = !!strategyPassword;

  const handleSectionClick = (section: typeof portalSections[number], e: React.MouseEvent) => {
    if (section.protected && hasStrategyPassword && !strategyUnlocked) {
      e.preventDefault();
      setPasswordGateOpen(true);
    }
  };

  // Split: primary sections (in bottom nav) vs secondary (in "Mehr")
  const primaryKeys = ['tools', 'library', 'strategies'];
  const primarySections = visibleSections.filter(s => primaryKeys.includes(s.key));
  const secondarySections = visibleSections.filter(s => !primaryKeys.includes(s.key));

  const SectionCard = ({ section }: { section: typeof portalSections[number] }) => {
    const isProtected = section.protected && hasStrategyPassword && !strategyUnlocked;

    return (
      <Link
        key={section.key}
        to={isProtected ? '#' : section.path}
        className="block"
        onClick={(e) => handleSectionClick(section, e)}
      >
        <Card className={cn(
          "w-full transition-all active:scale-[0.98] touch-manipulation hover:shadow-md",
          isProtected && "opacity-80"
        )}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative">
                <section.icon className="h-5 w-5 text-primary" />
                {isProtected && (
                  <Lock className="h-3 w-3 text-muted-foreground absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-foreground truncate">
                  {t(section.titleKey)}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {t(section.descKey)}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
          </CardContent>
        </Card>
      </Link>
    );
  };

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Welcome */}
        <div className="pt-1">
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-0.5">
            {t('clientPortal.welcome', { name: firstName })}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('clientPortal.welcomeSubtitle')}
          </p>
        </div>

        {/* Primary sections – prominent */}
        {primarySections.length > 0 && (
          <div className="space-y-2">
            {primarySections.map(section => (
              <SectionCard key={section.key} section={section} />
            ))}
          </div>
        )}

        {/* Secondary sections – smaller, grouped */}
        {secondarySections.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">
              {t('clientPortal.moreContent', 'Weitere Bereiche')}
            </p>
            {secondarySections.map(section => (
              <SectionCard key={section.key} section={section} />
            ))}
          </div>
        )}

        {visibleSections.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('clientPortal.noSections')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <StrategyPasswordGate
        open={passwordGateOpen}
        onOpenChange={setPasswordGateOpen}
        onSuccess={() => {
          setStrategyUnlocked(true);
          setPasswordGateOpen(false);
          navigate('/app/client-portal/strategies');
        }}
      />
    </ClientPortalLayout>
  );
}
