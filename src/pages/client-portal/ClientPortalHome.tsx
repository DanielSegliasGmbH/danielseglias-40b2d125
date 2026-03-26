import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerPortalSettings } from '@/hooks/useClientPortal';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Construction, MessageSquareHeart, Lock } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StrategyPasswordGate } from '@/components/client-portal/StrategyPasswordGate';

const portalSections = [
  { 
    key: 'insurances', 
    path: '/app/client-portal/insurances', 
    icon: Shield, 
    titleKey: 'clientPortal.insurances',
    descKey: 'clientPortal.insurancesDesc',
    protected: false,
  },
  { 
    key: 'goals', 
    path: '/app/client-portal/goals', 
    icon: Target, 
    titleKey: 'clientPortal.goals',
    descKey: 'clientPortal.goalsDesc',
    protected: false,
  },
  { 
    key: 'tasks', 
    path: '/app/client-portal/tasks', 
    icon: ClipboardList, 
    titleKey: 'clientPortal.tasks',
    descKey: 'clientPortal.tasksDesc',
    protected: false,
  },
  { 
    key: 'strategies', 
    path: '/app/client-portal/strategies', 
    icon: TrendingUp, 
    titleKey: 'clientPortal.strategies',
    descKey: 'clientPortal.strategiesDesc',
    protected: true,
  },
  { 
    key: 'library', 
    path: '/app/client-portal/library', 
    icon: BookOpen, 
    titleKey: 'clientPortal.library',
    descKey: 'clientPortal.libraryDesc',
    protected: false,
  },
  { 
    key: 'tools', 
    path: '/app/client-portal/tools', 
    icon: Wrench, 
    titleKey: 'clientPortal.tools',
    descKey: 'clientPortal.toolsDesc',
    protected: false,
  },
  { 
    key: 'courses', 
    path: '/app/client-portal/courses', 
    icon: GraduationCap, 
    titleKey: 'clientPortal.courses',
    descKey: 'clientPortal.coursesDesc',
    protected: false,
  },
] as const;

export default function ClientPortalHome() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: settings } = useCustomerPortalSettings();
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
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

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim() || !user) return;
    setFeedbackSending(true);
    try {
      const { error } = await supabase.from('client_feedback' as any).insert({
        user_id: user.id,
        user_email: user.email || null,
        user_name: `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || null,
        message: feedbackText.trim(),
      });
      if (error) throw error;
      setFeedbackText('');
      setFeedbackSent(true);
      toast.success('Danke für dein Feedback 🙌');
      setTimeout(() => setFeedbackSent(false), 5000);
    } catch (err) {
      console.error('Feedback error:', err);
      toast.error('Feedback konnte nicht gesendet werden.');
    } finally {
      setFeedbackSending(false);
    }
  };

  const SectionCard = ({ section, isMobile }: { section: typeof portalSections[number]; isMobile: boolean }) => {
    const isProtected = section.protected && hasStrategyPassword && !strategyUnlocked;

    if (isMobile) {
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
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 relative">
                  <section.icon className="h-6 w-6 text-primary" />
                  {isProtected && (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" />
                  )}
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
      );
    }

    return (
      <Link
        key={section.key}
        to={isProtected ? '#' : section.path}
        onClick={(e) => handleSectionClick(section, e)}
      >
        <Card className={cn(
          "h-full hover:shadow-md transition-shadow cursor-pointer group",
          isProtected && "opacity-80"
        )}>
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform relative">
              <section.icon className="h-6 w-6 text-primary" />
              {isProtected && (
                <Lock className="h-3.5 w-3.5 text-muted-foreground absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" />
              )}
            </div>
            <CardTitle className="text-lg">{t(section.titleKey)}</CardTitle>
            <CardDescription>{t(section.descKey)}</CardDescription>
          </CardHeader>
        </Card>
      </Link>
    );
  };

  return (
    <ClientPortalLayout>
      <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1 lg:mb-2">
            {t('clientPortal.welcome', { name: firstName })}
          </h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            {t('clientPortal.welcomeSubtitle')}
          </p>
        </div>

        {/* Construction Info Tile */}
        <Card className="border-primary/20 bg-[hsl(var(--accent))]/30">
          <CardContent className="p-5 lg:p-6">
            <div className="flex items-start gap-3">
              <Construction className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  🚧 Diese Plattform befindet sich aktuell im Aufbau
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Du bist hier einer der Ersten – vieles ist bereits nutzbar, einiges wird aktuell noch weiterentwickelt.
                  </p>
                  <p>
                    Du kannst alle bestehenden Inhalte und Tools ganz normal verwenden. Gleichzeitig kann es sein, dass gewisse Bereiche noch unvollständig sind oder sich verändern.
                  </p>
                  <p>
                    Wenn dir etwas auffällt oder du Feedback hast, freue ich mich sehr darüber.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile: Vertical stacked cards */}
        <div className="flex flex-col gap-3 lg:hidden">
          {visibleSections.map(section => (
            <SectionCard key={section.key} section={section} isMobile />
          ))}
        </div>

        {/* Desktop: Grid layout */}
        <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleSections.map(section => (
            <SectionCard key={section.key} section={section} isMobile={false} />
          ))}
        </div>

        {visibleSections.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('clientPortal.noSections')}</p>
            </CardContent>
          </Card>
        )}

        {/* Feedback Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquareHeart className="h-5 w-5 text-primary" />
              Dein Feedback
            </CardTitle>
            <CardDescription>
              Hast du Ideen, Wünsche oder ist dir etwas aufgefallen? Teile es mir mit!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedbackSent ? (
              <div className="text-center py-6">
                <p className="text-lg font-medium text-foreground">Danke für dein Feedback 🙌</p>
                <p className="text-sm text-muted-foreground mt-1">Ich schaue es mir an.</p>
              </div>
            ) : (
              <>
                <Textarea
                  placeholder="Dein Feedback, Ideen oder Wünsche…"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedbackText.trim() || feedbackSending}
                >
                  {feedbackSending ? 'Wird gesendet…' : 'Feedback senden'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Password Gate Modal */}
      <StrategyPasswordGate
        open={passwordGateOpen}
        onOpenChange={setPasswordGateOpen}
        onSuccess={() => {
          setStrategyUnlocked(true);
          setPasswordGateOpen(false);
          window.location.href = '/app/client-portal/strategies';
        }}
      />
    </ClientPortalLayout>
  );
}
