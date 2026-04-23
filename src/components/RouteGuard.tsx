import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { ConsentGate } from '@/components/ConsentGate';
import { OnboardingGate } from '@/components/OnboardingGate';
import { PasswordChangeGate } from '@/components/PasswordChangeGate';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'staff' | 'client')[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { t } = useTranslation();
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">{t('auth.accessDenied')}</h1>
          <p className="text-muted-foreground mb-4">
            {t('auth.accessDeniedMessage')}
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-primary hover:underline"
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'client') {
      return <Navigate to="/app/client-portal" replace />;
    }
    return <Navigate to="/app" replace />;
  }

  // Admins skip consent + onboarding gate, but STILL must change an admin-set
  // initial password (in case an admin account itself was bootstrapped that way).
  if (role === 'admin') {
    return <PasswordChangeGate>{children}</PasswordChangeGate>;
  }

  return (
    <PasswordChangeGate>
      <OnboardingGate>
        <ConsentGate>{children}</ConsentGate>
      </OnboardingGate>
    </PasswordChangeGate>
  );
}

// Role-based redirect after login
export function getDefaultRouteForRole(role: 'admin' | 'staff' | 'client' | null): string {
  switch (role) {
    case 'client':
      return '/app/client-portal';
    case 'admin':
    case 'staff':
      return '/app';
    default:
      return '/login';
  }
}