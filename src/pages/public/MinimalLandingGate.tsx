import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteForRole } from '@/components/RouteGuard';
import MinimalLanding from './MinimalLanding';

/**
 * Gate for the root "/" route.
 * - Logged-in users: redirect straight to their dashboard (no splash).
 * - Logged-out users: see the public MinimalLanding splash.
 */
export default function MinimalLandingGate() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) {
    const target = getDefaultRouteForRole(role);
    return <Navigate to={target} replace />;
  }

  return <MinimalLanding />;
}
