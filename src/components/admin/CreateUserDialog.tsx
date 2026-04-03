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
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.role) {
      toast.error(t('userManagement.requiredFields'));
      return;
    }

    if (formData.role === 'client' && !formData.customerId) {
      toast.error(t('userManagement.customerRequired'));
      return;
    }

    setLoading(true);
    try {
      await createUser.mutateAsync({
        email: formData.email,
        password: '', // Empty = invitation flow
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as AppRole,
        customerId: formData.customerId || undefined,
      });

      toast.success('Einladung wurde versendet.');
      setOpen(false);
      setFormData({ email: '', firstName: '', lastName: '', role: '', customerId: '' });
    } catch (error: any) {
      toast.error(`${t('userManagement.userCreateError')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          {t('userManagement.newUser')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
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
          <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            Der Benutzer erhält eine Einladungsmail und kann anschliessend sein Passwort selbst setzen.
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
              <Label htmlFor="customerId">{t('customer.singular', 'Kunde')} *</Label>
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
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('userManagement.creating') : t('userManagement.createUser')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
