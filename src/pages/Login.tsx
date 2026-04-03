import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteForRole } from '@/components/RouteGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginSchema = z.object({
    email: z.string().email(t('auth.invalidCredentials')),
    password: z.string().min(6, t('auth.invalidCredentials')),
  });

  useEffect(() => {
    if (!loading && user && role) {
      const defaultRoute = getDefaultRouteForRole(role);
      navigate(defaultRoute, { replace: true });
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({ variant: 'destructive', title: t('app.error'), description: validation.error.errors[0].message });
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({ variant: 'destructive', title: t('auth.loginError'), description: t('auth.invalidCredentials') });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-inset">
      {/* Top section with branding */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <span className="text-2xl font-bold text-primary">DS</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">{t('auth.loginTitle')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>
      </div>

      {/* Form */}
      <div className="px-6 pb-8 w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-14 rounded-2xl text-base px-4"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.passwordLabel')}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 rounded-2xl text-base px-4 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl text-base font-semibold" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('auth.login')}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={async () => {
              if (!email) {
                toast({ variant: 'destructive', title: 'E-Mail erforderlich', description: 'Bitte gib deine E-Mail-Adresse ein.' });
                return;
              }
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              if (error) {
                toast({ variant: 'destructive', title: 'Fehler', description: error.message });
              } else {
                toast({ title: 'E-Mail gesendet', description: 'Falls ein Konto existiert, erhältst du einen Link zum Zurücksetzen.' });
              }
            }}
            className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
          >
            Passwort vergessen?
          </button>
        </div>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <span>{t('auth.noAccount')} </span>
          <Link to="/signup" className="text-primary font-medium hover:underline">
            {t('auth.signup')}
          </Link>
        </div>
      </div>
    </div>
  );
}
