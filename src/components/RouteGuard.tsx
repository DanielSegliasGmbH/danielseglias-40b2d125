import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RouteGuardProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'staff' | 'client')[];
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // No role assigned -> show access denied
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Kein Zugriff</h1>
          <p className="text-muted-foreground mb-4">
            Ihrem Account wurde noch keine Rolle zugewiesen. 
            Bitte kontaktieren Sie einen Administrator.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="text-primary hover:underline"
          >
            Zurück zum Login
          </button>
        </div>
      </div>
    );
  }

  // Check if user has allowed role
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate area based on role
    if (role === 'client') {
      return <Navigate to="/client" replace />;
    }
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
