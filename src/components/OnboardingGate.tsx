import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingState } from '@/hooks/useOnboardingState';

/**
 * Hard-enforces the mandatory 6-step onboarding for client users.
 * - Logged-out: pass through (other guards handle this)
 * - Admin/staff: pass through
 * - Client without completed onboarding: redirect to /onboarding
 *
 * Wrap protected client routes with this. The /onboarding route itself
 * must NOT be wrapped (otherwise infinite redirect).
 */
export function OnboardingGate({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { state, loading, isExempt, needsOnboarding } = useOnboardingState();
  const location = useLocation();

  // No user → let auth guards (e.g. RouteGuard) handle the redirect.
  if (!user) return <>{children}</>;

  // Still loading → don't flash content.
  if (authLoading || loading || (user && !state && !isExempt)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isExempt) return <>{children}</>;

  if (needsOnboarding && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
