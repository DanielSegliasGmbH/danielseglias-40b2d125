import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PasswordStrengthChecker, usePasswordValidation } from '@/components/PasswordStrengthChecker';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useSaveConsent, CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from '@/hooks/useConsent';

export default function Signup() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const saveConsent = useSaveConsent();
  const { signUp, user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const passwordContext = { email, firstName, lastName };
  const { allPassed: passwordValid } = usePasswordValidation(password, passwordContext);

  const signupSchema = z.object({
    firstName: z.string().min(1, t('app.required')),
    lastName: z.string().min(1, t('app.required')),
    email: z.string().email(t('auth.invalidCredentials')),
  });

  useEffect(() => {
    if (!loading && user && role) {
      if (role === 'client') navigate('/client', { replace: true });
      else navigate('/app', { replace: true });
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = signupSchema.safeParse({ firstName, lastName, email });
    if (!validation.success) {
      toast({ variant: 'destructive', title: t('app.error'), description: validation.error.errors[0].message });
      return;
    }
    if (!passwordValid) {
      toast({ variant: 'destructive', title: t('app.error'), description: t('auth.password.invalid') });
      return;
    }
    if (!termsAccepted || !privacyAccepted) {
      toast({ variant: 'destructive', title: t('app.error'), description: 'Bitte akzeptiere die AGB und Datenschutzerklärung.' });
      return;
    }
    setIsLoading(true);
    const { error } = await signUp(email, password, firstName, lastName);
    setIsLoading(false);
    if (error) {
      const isPasswordPolicyError = error.message?.toLowerCase().includes('password') || error.message?.toLowerCase().includes('weak');
      toast({ variant: 'destructive', title: t('auth.signupError'), description: isPasswordPolicyError ? t('auth.password.invalid') : error.message });
    } else {
      // Save consent record — user may not be confirmed yet, so we use a fallback
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      if (uid) {
        saveConsent.mutate({ userId: uid });
      }
      toast({ title: t('auth.signup'), description: t('auth.signupSuccess') });
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && passwordValid;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-inset">
      {/* Branding */}
      <div className="flex flex-col items-center pt-10 pb-4 px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-primary">DS</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">{t('auth.signupTitle')}</h1>
        <p className="text-sm text-muted-foreground text-center">{t('auth.signupSubtitle')}</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-8 w-full max-w-md mx-auto overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('auth.firstName')}</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 rounded-2xl text-base px-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('auth.lastName')}</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isLoading}
                className="h-14 rounded-2xl text-base px-4"
              />
            </div>
          </div>
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
            <PasswordStrengthChecker password={password} context={passwordContext} className="mt-3" />
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl text-base font-semibold" disabled={isLoading || !isFormValid}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('auth.signup')}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <span>{t('auth.hasAccount')} </span>
          <Link to="/login" className="text-primary font-medium hover:underline">
            {t('auth.login')}
          </Link>
        </div>
      </div>
    </div>
  );
}
