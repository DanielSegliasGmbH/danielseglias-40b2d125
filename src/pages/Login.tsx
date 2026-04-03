import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteForRole } from '@/components/RouteGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, Mail, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loginSchema = z.object({
    email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein.'),
    password: z.string().min(1, 'Bitte gib dein Passwort ein.'),
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
      toast({ variant: 'destructive', title: 'Eingabe prüfen', description: validation.error.errors[0].message });
      return;
    }
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('invalid') || msg.includes('credentials')) {
        toast({ variant: 'destructive', title: 'Anmeldung fehlgeschlagen', description: 'E-Mail oder Passwort ist nicht korrekt.' });
      } else if (msg.includes('email not confirmed')) {
        toast({ variant: 'destructive', title: 'E-Mail nicht bestätigt', description: 'Bitte bestätige zuerst deine E-Mail-Adresse über den Link in der Einladungsmail.' });
      } else if (msg.includes('too many')) {
        toast({ variant: 'destructive', title: 'Zu viele Versuche', description: 'Bitte warte einen Moment und versuche es erneut.' });
      } else {
        toast({ variant: 'destructive', title: 'Anmeldung fehlgeschlagen', description: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' });
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Fehler', description: 'Es ist ein Fehler aufgetreten. Bitte versuche es erneut.' });
    } else {
      setResetSent(true);
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
            onClick={() => {
              setResetEmail(email);
              setResetSent(false);
              setResetOpen(true);
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

      {/* Password Reset Dialog */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-md">
          {resetSent ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">E-Mail gesendet</h3>
                <p className="text-sm text-muted-foreground">
                  Falls ein Konto mit <span className="font-medium text-foreground">{resetEmail}</span> existiert, erhältst du einen Link zum Zurücksetzen deines Passworts.
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Keine E-Mail erhalten? Prüfe deinen Spam-Ordner oder versuche es erneut.
              </p>
              <Button variant="outline" onClick={() => setResetOpen(false)} className="rounded-xl">
                Schliessen
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Passwort zurücksetzen</DialogTitle>
                <DialogDescription>
                  Gib deine E-Mail-Adresse ein. Du erhältst einen Link, über den du ein neues Passwort setzen kannst.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">E-Mail-Adresse</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={resetLoading}
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" onClick={() => setResetOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={resetLoading} className="rounded-xl">
                    {resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                    Link senden
                  </Button>
                </div>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
