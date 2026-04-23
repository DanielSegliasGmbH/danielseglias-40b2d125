import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, ShieldCheck, KeyRound } from 'lucide-react';
import { PasswordStrengthChecker } from '@/components/PasswordStrengthChecker';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Forced-password-change screen.
 * Shown when profiles.password_change_required = true (admin-created accounts
 * that are still on their initial password). The user must set a personal
 * password before reaching the rest of the app.
 */
export default function SetPassword() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ variant: 'destructive', title: 'Passwort zu kurz', description: 'Mindestens 8 Zeichen.' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwörter stimmen nicht überein' });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setSubmitting(false);
      const msg = error.message?.toLowerCase() ?? '';
      if (msg.includes('same')) {
        toast({ variant: 'destructive', title: 'Bitte ein neues Passwort wählen', description: 'Es darf nicht mit dem Initial-Passwort identisch sein.' });
      } else {
        toast({ variant: 'destructive', title: 'Fehler', description: error.message });
      }
      return;
    }

    // Clear the flag so the gate lets the user through.
    const { error: flagError } = await supabase
      .from('profiles')
      .update({ password_change_required: false })
      .eq('id', user.id);
    setSubmitting(false);

    if (flagError) {
      toast({ variant: 'destructive', title: 'Status konnte nicht aktualisiert werden', description: flagError.message });
      return;
    }

    await qc.invalidateQueries({ queryKey: ['password-change-required', user.id] });
    toast({ title: 'Passwort gesetzt', description: 'Dein persönliches Passwort ist jetzt aktiv.' });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background safe-area-inset">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Konto aktivieren</h1>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          Willkommen! Bitte vergib jetzt dein persönliches Passwort. Es ersetzt das Initial-Passwort, das du von deinem Berater erhalten hast.
        </p>
      </div>

      <div className="px-6 pb-8 w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Neues Passwort</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Mindestens 8 Zeichen"
                className="h-14 rounded-2xl text-base px-4 pr-12"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {password.length > 0 && <PasswordStrengthChecker password={password} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Passwort wiederholen"
              className="h-14 rounded-2xl text-base px-4"
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive">Passwörter stimmen nicht überein</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl text-base font-semibold"
            disabled={submitting || password.length < 8 || password !== confirmPassword}
          >
            {submitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <KeyRound className="h-5 w-5 mr-2" />
                Passwort speichern und fortfahren
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Aus Sicherheitsgründen kannst du erst nach dem Setzen deines persönlichen Passworts auf die App zugreifen.
          </p>
        </form>
      </div>
    </div>
  );
}
