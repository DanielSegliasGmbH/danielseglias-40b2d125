import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordChangeRequired } from '@/hooks/usePasswordChangeRequired';
import { Loader2 } from 'lucide-react';

/**
 * Forces users whose profiles.password_change_required = true to /set-password
 * before they can access ANY protected route (incl. onboarding & consent).
 *
 * The /set-password page itself MUST NOT be wrapped by this gate (otherwise
 * infinite redirect).
 */
export function PasswordChangeGate({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { required, loading } = usePasswordChangeRequired();
  const location = useLocation();

  // No user → let auth guards handle the redirect.
  if (!user) return <>{children}</>;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (required && !location.pathname.startsWith('/set-password')) {
    return <Navigate to="/set-password" replace />;
  }

  return <>{children}</>;
}
