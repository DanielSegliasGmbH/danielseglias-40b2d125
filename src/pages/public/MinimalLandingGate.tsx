import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteForRole } from '@/components/RouteGuard';

/**
 * Gate for the root "/" route (v1.0).
 * - Logged-in users: redirect straight to their dashboard.
 * - Logged-out users: redirect to /tools (only public area in v1.0).
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

  return <Navigate to="/tools" replace />;
}
