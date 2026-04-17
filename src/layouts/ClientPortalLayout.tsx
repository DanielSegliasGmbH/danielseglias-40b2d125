import { ReactNode, useState } from 'react';
import { LevelUpCelebration } from '@/components/client-portal/LevelUpCelebration';
import { TruthMomentOverlay } from '@/components/client-portal/TruthMomentOverlay';
import { PaydayRitualOverlay } from '@/components/client-portal/PaydayRitualOverlay';
import { StreakRescueOverlay } from '@/components/client-portal/StreakRescueOverlay';
import { UnlockCelebration } from '@/components/client-portal/UnlockCelebration';
import { GoldNutCelebrationOverlay } from '@/components/client-portal/GoldNutCelebrationOverlay';
import { GoldNutCelebrationOverlay } from '@/components/client-portal/GoldNutCelebrationOverlay';
import { HamsterSheetsProvider } from '@/hooks/useHamsterSheets';
import { HamsterInventorySheet } from '@/components/client-portal/HamsterInventorySheet';
import { AchievementsSheet } from '@/components/client-portal/AchievementsSheet';
import { useSmartNotifications } from '@/hooks/useSmartNotifications';
import { useFeatureUnlock } from '@/hooks/useFeatureUnlock';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PrivacyModeProvider } from '@/hooks/usePrivacyMode';
import { PrivacyToggle } from '@/components/client-portal/PrivacyToggle';
import { PrivacyBanner } from '@/components/client-portal/PrivacyBanner';
import { useCustomerPortalSettings, usePreviewCustomerId, PortalVisibility } from '@/hooks/useClientPortal';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/client-portal/BottomNavigation';
import { MoreSheet } from '@/components/client-portal/MoreSheet';
import { ChatDrawer } from '@/components/client-portal/ChatDrawer';
import { FloatingChatBubble } from '@/components/client-portal/FloatingChatBubble';
import { NotificationBell } from '@/components/client-portal/NotificationBell';
import { PeakScoreNavBadge } from '@/components/client-portal/PeakScoreNavBadge';
// ARCHIVED: future-self avatar replaced by Hamster mascot
// import { DualAvatarIndicator } from '@/components/client-portal/DualAvatarIndicator';
import { useUnreadCount } from '@/hooks/useChat';
import {
  Shield,
  Target,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Wrench,
  Home,
  LogOut,
  Eye,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface ClientPortalLayoutProps {
  children: ReactNode;
}

const portalSections = [
  { key: 'insurances', path: '/app/client-portal/insurances', icon: Shield, labelKey: 'clientPortal.insurances', settingsKey: 'show_insurances' as keyof PortalVisibility },
  { key: 'goals', path: '/app/client-portal/goals', icon: Target, labelKey: 'clientPortal.goals', settingsKey: 'show_goals' as keyof PortalVisibility },
  { key: 'tasks', path: '/app/client-portal/tasks', icon: ClipboardList, labelKey: 'clientPortal.tasks', settingsKey: 'show_tasks' as keyof PortalVisibility },
  { key: 'strategies', path: '/app/client-portal/strategies', icon: TrendingUp, labelKey: 'clientPortal.strategies', settingsKey: 'show_strategies' as keyof PortalVisibility },
  { key: 'library', path: '/app/client-portal/library', icon: BookOpen, labelKey: 'clientPortal.library', settingsKey: 'show_library' as keyof PortalVisibility },
  { key: 'tools', path: '/app/client-portal/tools', icon: Wrench, labelKey: 'clientPortal.tools', settingsKey: 'show_tools' as keyof PortalVisibility },
] as const;

// Hook to get customer name for preview (Phase 2: using customers table)
function usePreviewCustomerName(customerId: string | null) {
  return useQuery({
    queryKey: ['preview-customer-name', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('first_name, last_name')
        .eq('id', customerId)
        .maybeSingle();
      if (error) return null;
      return data ? `${data.first_name} ${data.last_name}` : null;
    },
    enabled: !!customerId,
  });
}

export function ClientPortalLayout({ children }: ClientPortalLayoutProps) {
  const { t } = useTranslation();
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false); // desktop only
  const { data: settings } = useCustomerPortalSettings();
  const { data: unreadCount = 0 } = useUnreadCount();
  useSmartNotifications();
  const { newlyUnlocked, clearNewlyUnlocked } = useFeatureUnlock();
  
  const previewCustomerId = usePreviewCustomerId();
  const isAdminPreview = role === 'admin' && !!previewCustomerId;
  const { data: previewCustomerName } = usePreviewCustomerName(previewCustomerId);

  // Build paths with preview param preserved
  const buildPath = (basePath: string) => {
    if (previewCustomerId) {
      return `${basePath}?previewCustomerId=${previewCustomerId}`;
    }
    return basePath;
  };

  const visibleSections = portalSections.filter(section => {
    if (!settings) return true; // Show all if no settings (admin without preview)
    return settings[section.settingsKey] !== false;
  });

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const firstName = user?.user_metadata?.first_name || 'Kunde';

  const NavItem = ({ to, icon: Icon, label, isActive }: { to: string; icon: React.ElementType; label: string; isActive: boolean }) => {
    const content = (
      <Link
        to={to}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          sidebarCollapsed && "justify-center px-2"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!sidebarCollapsed && <span>{label}</span>}
      </Link>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <PrivacyModeProvider>
    <TooltipProvider delayDuration={0}>
      <PrivacyBanner />
      <div className="min-h-screen bg-background flex max-w-[100vw] overflow-x-hidden">
        {/* Admin Preview Banner */}
        {isAdminPreview && (
          <div className="fixed top-0 left-0 right-0 z-[60] bg-warning/90 text-warning-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium">
            <Eye className="h-4 w-4" />
            {t('clientPortal.adminPreview')}: {previewCustomerName || previewCustomerId?.slice(0, 8) + '…'}
            <Link to="/app" className="ml-4 inline-flex items-center gap-1 bg-background/20 hover:bg-background/30 px-3 py-1 rounded-md transition-colors">
              <ChevronLeft className="h-3 w-3" />
              {t('clientPortal.backToDashboard')}
            </Link>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside 
          className={cn(
            "hidden lg:flex flex-col bg-card border-r border-border transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-64",
            isAdminPreview && "pt-10"
          )}
        >
          <div className="p-4 border-b border-border flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-semibold text-foreground truncate flex items-center gap-2">
                <span className="text-primary text-xl leading-none">✦</span>
                FinLife
              </h1>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 shrink-0 hover:bg-accent"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className={cn("px-2 space-y-1", sidebarCollapsed && "px-1")}>
              <NavItem
                to={buildPath('/app/client-portal')}
                icon={Home}
                label={t('clientPortal.home')}
                isActive={location.pathname === '/app/client-portal'}
              />
              {visibleSections.map(section => (
                <NavItem
                  key={section.key}
                  to={buildPath(section.path)}
                  icon={section.icon}
                  label={t(section.labelKey)}
                  isActive={location.pathname === section.path}
                />
              ))}
            </nav>
          </ScrollArea>
          <div className={cn("p-4 border-t border-border space-y-2", sidebarCollapsed && "p-2")}>
            {!sidebarCollapsed && (
              <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
            )}
            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-full hover:bg-accent" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{t('auth.logout')}</TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-accent" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('auth.logout')}
              </Button>
            )}
          </div>
        </aside>

        {/* Mobile Header - Clean & minimal */}
        <div
          className={cn("lg:hidden fixed left-0 right-0 z-50 bg-card border-b border-border", isAdminPreview ? "top-10" : "top-0")}
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className="flex items-center justify-between px-4 h-12">
            <h1 className="text-base font-semibold text-foreground">{t('clientPortal.title')}</h1>
            <div className="flex items-center gap-1">
              <PrivacyToggle />
              <PeakScoreNavBadge />
              <NotificationBell />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 bg-background",
            "pt-[calc(env(safe-area-inset-top,20px)+48px)] pb-[calc(env(safe-area-inset-bottom,0px)+80px)]",
            "lg:pb-0 lg:pt-0",
            isAdminPreview && "lg:pt-10"
          )}
        >
          <div className="hidden lg:flex items-center justify-end gap-4 p-4 border-b border-border bg-card">
            <PrivacyToggle />
            <PeakScoreNavBadge />
            <NotificationBell />
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <ThemeSwitcher />
            <LanguageSwitcher />
            <span className="text-sm text-muted-foreground">{firstName}</span>
          </div>
          <div className="p-4 lg:p-8 overflow-x-hidden w-full min-w-0">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation 
          onMoreClick={() => setMoreSheetOpen(true)} 
          buildPath={buildPath}
        />

        {/* More Sheet */}
        <MoreSheet
          open={moreSheetOpen}
          onOpenChange={setMoreSheetOpen}
          buildPath={buildPath}
          onLogout={handleLogout}
          visibleSections={visibleSections}
        />

        {/* Chat Drawer (desktop) */}
        <ChatDrawer open={chatOpen} onOpenChange={setChatOpen} />

        {/* Floating Chat Bubble (mobile) */}
        <FloatingChatBubble />

        {/* Level-up celebration overlay */}
        <LevelUpCelebration />
        <TruthMomentOverlay />
        <PaydayRitualOverlay />
        <StreakRescueOverlay />
        <UnlockCelebration newlyUnlocked={newlyUnlocked} onDismiss={clearNewlyUnlocked} />
        <GoldNutCelebrationOverlay />
      </div>
    </TooltipProvider>
    </PrivacyModeProvider>
  );
}