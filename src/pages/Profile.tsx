import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { KeyRound, LogOut, ChevronRight, User } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PasswordStrengthChecker } from '@/components/PasswordStrengthChecker';

export default function Profile() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Passwort muss mindestens 8 Zeichen lang sein.'); return; }
    if (newPassword !== confirmPassword) { toast.error('Passwörter stimmen nicht überein.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        if (error.message.includes('same')) {
          toast.error('Das neue Passwort darf nicht mit dem alten identisch sein.');
        } else {
          throw error;
        }
      } else {
        toast.success('Passwort erfolgreich geändert.');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      }
    } catch (error: any) {
      toast.error(`Fehler beim Ändern: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.user_metadata?.first_name;
  const lastName = user?.user_metadata?.last_name;
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : user?.email || '';

  return (
    <AppLayout>
      <div className="min-h-screen bg-background page-transition">
        <ScreenHeader title="Profil" />

        <div className="px-4 py-6 max-w-lg mx-auto space-y-6 pb-24">
          {/* Profile Avatar */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {(firstName?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()}
              </span>
            </div>
            {displayName && <p className="text-sm font-medium text-foreground">{displayName}</p>}
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          {/* Account info */}
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              <div className="flex items-center gap-3 px-4 py-4 min-h-[56px]">
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Konto</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-accent/50 transition-colors active:bg-accent min-h-[56px]"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <KeyRound className="h-4 w-4 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Passwort ändern</p>
                  <p className="text-xs text-muted-foreground">Neues Passwort setzen</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            </CardContent>
          </Card>

          {/* Password section (expandable) */}
          {showPasswordSection && (
            <Card className="page-transition">
              <CardContent className="p-4">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Neues Passwort</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Mindestens 8 Zeichen"
                      className="h-14 rounded-2xl"
                    />
                    {newPassword.length > 0 && <PasswordStrengthChecker password={newPassword} />}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="Passwort wiederholen"
                      className="h-14 rounded-2xl"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-destructive">Passwörter stimmen nicht überein</p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                    className="w-full h-14 rounded-2xl"
                  >
                    {loading ? 'Wird gespeichert…' : 'Passwort ändern'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Appearance */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Design</span>
                <ThemeSwitcher />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Sprache</span>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button
            variant="outline"
            className="w-full h-14 rounded-2xl text-destructive border-destructive/20 hover:bg-destructive/5"
            onClick={signOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Abmelden
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
