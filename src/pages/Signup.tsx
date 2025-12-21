import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { PasswordStrengthChecker, usePasswordValidation } from '@/components/PasswordStrengthChecker';
import { z } from 'zod';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
      if (role === 'client') {
        navigate('/client', { replace: true });
      } else {
        navigate('/app', { replace: true });
      }
    }
  }, [user, role, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = signupSchema.safeParse({ firstName, lastName, email });
    if (!validation.success) {
      toast({
        variant: 'destructive',
        title: t('app.error'),
        description: validation.error.errors[0].message,
      });
      return;
    }

    if (!passwordValid) {
      toast({
        variant: 'destructive',
        title: t('app.error'),
        description: t('auth.password.invalid'),
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password, firstName, lastName);
    setIsLoading(false);

    if (error) {
      // Handle Supabase password policy errors gracefully
      const isPasswordPolicyError = 
        error.message?.toLowerCase().includes('password') ||
        error.message?.toLowerCase().includes('weak') ||
        error.message?.toLowerCase().includes('strength');
      
      toast({
        variant: 'destructive',
        title: t('auth.signupError'),
        description: isPasswordPolicyError ? t('auth.password.invalid') : error.message,
      });
    } else {
      toast({
        title: t('auth.signup'),
        description: t('auth.signupSuccess'),
      });
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && passwordValid;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('auth.signupTitle')}</CardTitle>
          <CardDescription className="text-center">
            {t('auth.signupSubtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-amber-500/50 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-700 dark:text-amber-400">
              {t('auth.signupSubtitle')}
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('auth.firstName')}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
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
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Checker */}
              <PasswordStrengthChecker 
                password={password} 
                context={passwordContext}
                className="mt-3"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? `${t('auth.signup')}...` : t('auth.signup')}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <span>{t('auth.hasAccount')} </span>
            <Link to="/login" className="text-primary hover:underline">
              {t('auth.login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
