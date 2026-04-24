import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateUser } from '@/hooks/useUserManagement';
import { useCustomers } from '@/hooks/useCustomerData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Copy, Check, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PasswordStrengthChecker } from '@/components/PasswordStrengthChecker';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface CreatedUserResult {
  email: string;
  initialPassword: string;
  passwordGenerated: boolean;
}

export function CreateUserDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: customers } = useCustomers();
  const createUser = useCreateUser();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '' as AppRole | '',
    customerId: '',
    password: '',
  });

  // After creation: surface the initial password so the admin can hand it over.
  const [createdUser, setCreatedUser] = useState<CreatedUserResult | null>(null);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | 'both' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.role) {
      toast.error(t('userManagement.requiredFields'));
      return;
    }

    setLoading(true);
    try {
      const result = await createUser.mutateAsync({
        email: formData.email,
        password: formData.password.trim() || '', // empty = backend generates a memorable initial password
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as AppRole,
        customerId: formData.customerId || undefined,
      });

      const initialPassword: string | undefined = result?.initialPassword;
      if (initialPassword) {
        setCreatedUser({
          email: formData.email,
          initialPassword,
          passwordGenerated: !!result?.passwordGenerated,
        });
      } else {
        // Defensive fallback — older backends return no password.
        toast.success('Benutzer erstellt.');
        resetAndClose();
      }
    } catch (error: any) {
      toast.error(`${t('userManagement.userCreateError')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setOpen(false);
    setCreatedUser(null);
    setCopiedField(null);
    setFormData({ email: '', firstName: '', lastName: '', role: '', customerId: '', password: '' });
  };

  const copy = async (text: string, field: 'email' | 'password' | 'both') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1800);
      toast.success('In Zwischenablage kopiert');
    } catch {
      toast.error('Kopieren fehlgeschlagen');
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // While the credentials screen is shown, force explicit close to
        // ensure the admin sees the password at least once.
        if (!next && createdUser) return;
        if (next) setOpen(true);
        else resetAndClose();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          {t('userManagement.newUser')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {createdUser ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Benutzer erstellt
              </DialogTitle>
            </DialogHeader>

            <p className="text-sm text-muted-foreground">
              Bitte übergib die Zugangsdaten <strong className="text-foreground">jetzt sicher</strong> an den Benutzer
              (z. B. persönlich, Telefon, Signal). Beim ersten Login muss er ein eigenes Passwort vergeben.
            </p>

            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">E-Mail</p>
                  <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {createdUser.email}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => copy(createdUser.email, 'email')}
                >
                  {copiedField === 'email' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  Kopieren
                </Button>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    Initial-Passwort {createdUser.passwordGenerated && <span className="normal-case text-muted-foreground/80">(automatisch generiert)</span>}
                  </p>
                  <p className="text-base font-mono font-semibold text-foreground tracking-wide flex items-center gap-1.5 break-all">
                    <KeyRound className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {createdUser.initialPassword}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-1.5"
                  onClick={() => copy(createdUser.initialPassword, 'password')}
                >
                  {copiedField === 'password' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  Kopieren
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              onClick={() =>
                copy(
                  `E-Mail: ${createdUser.email}\nInitial-Passwort: ${createdUser.initialPassword}\n\nBitte beim ersten Login ein neues persönliches Passwort vergeben.`,
                  'both',
                )
              }
            >
              {copiedField === 'both' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              Beides als Text kopieren
            </Button>

            <div className="rounded-lg bg-muted/60 border border-border px-3 py-2.5">
              <p className="text-xs text-muted-foreground leading-snug">
                Dieses Passwort wird <strong className="text-foreground">nur einmal</strong> angezeigt. Aus Sicherheitsgründen ist es danach
                nicht mehr abrufbar. Beim ersten Login wird der Benutzer automatisch zur Passwort-Vergabe geführt.
              </p>
            </div>

            <Button type="button" className="w-full" onClick={resetAndClose}>
              Fertig
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t('userManagement.createUser')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t('auth.firstName')} *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t('auth.lastName')} *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')} *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort (optional)</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mindestens 8 Zeichen"
                />
                <p className="text-xs text-muted-foreground">
                  Leer lassen = automatisch generiertes Initial-Passwort wird angezeigt.
                </p>
                {formData.password && (
                  <PasswordStrengthChecker
                    password={formData.password}
                    context={{
                      email: formData.email,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                    }}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg leading-snug">
                Wenn kein Passwort gesetzt wird, erzeugt das System automatisch ein <strong className="text-foreground">Initial-Passwort</strong>.
                Du siehst es nach der Erstellung einmalig und kannst es dem Benutzer übergeben.
                Beim ersten Login wird er aufgefordert, sein eigenes Passwort zu vergeben.
              </p>
              <div className="space-y-2">
                <Label htmlFor="role">{t('table.role')} *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as AppRole, customerId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('userManagement.selectRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    <SelectItem value="staff">{t('roles.staff')}</SelectItem>
                    <SelectItem value="client">{t('roles.client')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'client' && (
                <div className="space-y-2">
                  <Label htmlFor="customerId">{t('customer.singular', 'Kunde')}</Label>
                  <Select
                    value={formData.customerId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, customerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('userManagement.selectCustomer')} />
                    </SelectTrigger>
                    <SelectContent>
                      {customers?.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.first_name} {customer.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Optional – kann später zugewiesen werden.</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={resetAndClose}>
                  {t('app.cancel')}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? t('userManagement.creating') : t('userManagement.createUser')}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
