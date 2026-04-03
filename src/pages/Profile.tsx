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
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { KeyRound, Bell, Shield, LogOut, ChevronRight, User, Info } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function Profile() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { toast.error(t('userManagement.passwordTooShort')); return; }
    if (newPassword !== confirmPassword) { toast.error(t('userManagement.passwordMismatch')); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success(t('userManagement.passwordChanged'));
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error: any) {
      toast.error(`${t('userManagement.passwordChangeError')} ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: 'Konto',
      description: user?.email || '',
      onClick: () => {},
    },
    {
      icon: KeyRound,
      label: t('userManagement.passwordChange'),
      description: 'Passwort aktualisieren',
      onClick: () => setShowPasswordSection(!showPasswordSection),
    },
    {
      icon: Bell,
      label: 'Benachrichtigungen',
      description: 'Push-Mitteilungen verwalten',
      onClick: () => {},
    },
    {
      icon: Shield,
      label: 'Datenschutz',
      description: 'Datenverarbeitung & Rechte',
      onClick: () => {},
    },
    {
      icon: Info,
      label: 'Über die App',
      description: 'Version & Informationen',
      onClick: () => {},
    },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background page-transition">
        <ScreenHeader title={t('userManagement.profile')} />

        <div className="px-4 py-6 max-w-lg mx-auto space-y-6 pb-24">
          {/* Profile Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>

          {/* Settings List */}
          <Card className="overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              {menuItems.map((item, i) => (
                <button
                  key={i}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-accent/50 transition-colors active:bg-accent min-h-[56px]"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Password section (expandable) */}
          {showPasswordSection && (
            <Card className="page-transition">
              <CardContent className="p-4">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t('userManagement.newPassword')}</Label>
                    <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="h-14 rounded-2xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t('userManagement.confirmPassword')}</Label>
                    <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="h-14 rounded-2xl" />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl">
                    {loading ? t('app.loading') : t('userManagement.passwordChange')}
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
            {t('auth.logout')}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
