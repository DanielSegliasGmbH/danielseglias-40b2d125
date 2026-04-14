import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerPortalSettings } from '@/hooks/useClientPortal';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Lock } from 'lucide-react';
import {
  Shield,
  Target,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Wrench,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { StrategyPasswordGate } from '@/components/client-portal/StrategyPasswordGate';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { GamificationBar } from '@/components/client-portal/GamificationBar';
import { useGamification } from '@/hooks/useGamification';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { useNextBestStep } from '@/hooks/useNextBestStep';
import { NextStepCard } from '@/components/client-portal/NextStepCard';
import { CtaBanner } from '@/components/client-portal/CtaBanner';
import { ProgressWidget } from '@/components/client-portal/ProgressWidget';
import { AlertTriangle } from 'lucide-react';

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


// Motivational greetings based on time of day
function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Guten Morgen, ${name}`;
  if (hour < 17) return `Hallo, ${name}`;
  return `Guten Abend, ${name}`;
}

// Motivational subtitles based on progress
function getMotivationalSubtitle(level: number, streakDays: number): string {
  if (streakDays >= 7) return 'Beeindruckend – du bleibst konsequent dran.';
  if (streakDays >= 3) return 'Du baust gute Gewohnheiten auf – weiter so.';
  if (level >= 4) return 'Du gehörst zur Spitze – dein Wissen wächst.';
  if (level >= 2) return 'Du machst echten Fortschritt – Schritt für Schritt.';
  return 'Schön, dass du da bist – lass uns loslegen.';
}

export default function ClientPortalHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: settings } = useCustomerPortalSettings();
  const { level, streakDays } = useGamification();
  const { needsCheckup } = useMetaProfile();
  const { data: nextStepResult } = useNextBestStep();
  const [passwordGateOpen, setPasswordGateOpen] = useState(false);
  const [strategyUnlocked, setStrategyUnlocked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('client_onboarding_complete')) {
      setShowOnboarding(true);
    }
  }, []);

  const firstName = user?.user_metadata?.first_name || 'Kunde';

  const visibleSections = portalSections.filter(section => {
    if (!settings) return true;
    const settingKey = `show_${section.key}` as keyof typeof settings;
    return settings[settingKey] !== false;
  });

  const hasStrategyPassword = settings?.has_strategy_password ?? false;

  const handleSectionClick = (section: typeof portalSections[number], e: React.MouseEvent) => {
    if (section.protected && hasStrategyPassword && !strategyUnlocked) {
      e.preventDefault();
      setPasswordGateOpen(true);
    }
  };

  const bottomNavKeys = ['coach', 'tools', 'library'];
  const secondarySections = visibleSections.filter(s => !bottomNavKeys.includes(s.key));


  const SectionCard = ({ section, index }: { section: typeof portalSections[number]; index: number }) => {
    const isProtected = section.protected && hasStrategyPassword && !strategyUnlocked;

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + index * 0.05, duration: 0.3, ease: 'easeOut' }}
      >
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
            <CardContent className="flex items-center justify-between p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative">
                  <section.icon className="h-4 w-4 text-primary" />
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
      </motion.div>
    );
  };

  if (showOnboarding) {
    return (
      <OnboardingScreen
        onComplete={() => {
          localStorage.setItem('client_onboarding_complete', 'true');
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Compact gamification header */}
        <GamificationBar />

        {/* Progress Widget */}
        <ProgressWidget />

        {/* Meta-Profile Checkup Banner */}
        {needsCheckup && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <Link to="/app/client-portal/profile-data">
              <Card className="border-warning/50 bg-warning/5 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-3 py-3.5 px-4">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Profil-Check fällig</p>
                    <p className="text-xs text-muted-foreground">Überprüfe deine Finanzdaten – dauert nur 1 Minute.</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}
        {/* Welcome with dynamic greeting */}
        <motion.div
          className="pt-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-0.5">
            {getGreeting(firstName)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {getMotivationalSubtitle(level, streakDays)}
          </p>
        </motion.div>

        {/* Dynamic Next Best Step */}
        {nextStepResult && nextStepResult.primary && (
          <NextStepCard result={nextStepResult} />
        )}

        {/* Contextual CTA */}
        <CtaBanner context="dashboard" />

        {/* Weitere Bereiche */}
        {secondarySections.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-1">
              {t('clientPortal.moreContent', 'Weitere Bereiche')}
            </p>
            {secondarySections.map((section, i) => (
              <SectionCard key={section.key} section={section} index={i} />
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
