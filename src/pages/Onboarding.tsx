import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboardingState } from '@/hooks/useOnboardingState';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { getDefaultRouteForRole } from '@/components/RouteGuard';

export default function Onboarding() {
  const { user, role, loading: authLoading } = useAuth();
  const { state, loading, isExempt } = useOnboardingState();

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // Admin/staff don't go through this; bounce to their default area.
  if (isExempt) return <Navigate to={getDefaultRouteForRole(role)} replace />;

  // Already done → straight to dashboard.
  if (state?.completed) return <Navigate to="/app/client-portal" replace />;

  return <OnboardingWizard />;
}
