import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useCreateCustomer, CustomerStatus, CustomerPriority, CareLevel } from '@/hooks/useCustomerData';

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (customerId: string) => void;
}

const SALUTATIONS = ['Herr', 'Frau', 'Divers'];
const CUSTOMER_STATUSES: CustomerStatus[] = ['lead', 'active', 'passive', 'former'];
const PRIORITIES: CustomerPriority[] = ['A', 'B', 'C'];
const CARE_LEVELS: CareLevel[] = ['vip', 'standard', 'light'];

interface FormData {
  salutation: string;
  first_name: string;
  last_name: string;
  customer_status: CustomerStatus;
  priority: CustomerPriority | '';
  care_level: CareLevel | '';
  email: string;
  phone: string;
}

const initialFormData: FormData = {
  salutation: '',
  first_name: '',
  last_name: '',
  customer_status: 'lead',
  priority: '',
  care_level: '',
  email: '',
  phone: '',
};

export function CreateCustomerDialog({ open, onOpenChange, onSuccess }: CreateCustomerDialogProps) {
  const { t } = useTranslation();
  const createCustomer = useCreateCustomer();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.first_name.trim()) {
      toast.error(t('customer.validation.firstNameRequired', 'Vorname ist erforderlich'));
      return;
    }
    if (!formData.last_name.trim()) {
      toast.error(t('customer.validation.lastNameRequired', 'Nachname ist erforderlich'));
      return;
    }

    setSaving(true);
    try {
      const customer = await createCustomer.mutateAsync({
        salutation: formData.salutation || null,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        customer_status: formData.customer_status,
        priority: formData.priority || null,
        care_level: formData.care_level || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
      });
      
      toast.success(t('customer.createSuccess', 'Kunde erfolgreich erstellt'));
      setFormData(initialFormData);
      onOpenChange(false);
      onSuccess?.(customer.id);
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error(t('customer.createError', 'Fehler beim Erstellen des Kunden'));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFormData(initialFormData);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('customer.createTitle', 'Neuen Kunden anlegen')}</DialogTitle>
            <DialogDescription>
              {t('customer.createDescription', 'Erfasse die Grunddaten des neuen Kunden. Weitere Details können später ergänzt werden.')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Row 1: Salutation */}
            <div className="grid gap-2">
              <Label>{t('customer.salutation', 'Anrede')}</Label>
              <Select
                value={formData.salutation}
                onValueChange={(v) => handleChange('salutation', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('common.select', 'Auswählen')} />
                </SelectTrigger>
                <SelectContent>
                  {SALUTATIONS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 2: First Name + Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('customer.firstName', 'Vorname')} *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  placeholder="Max"
                  required
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('customer.lastName', 'Nachname')} *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  placeholder="Muster"
                  required
                />
              </div>
            </div>

            {/* Row 3: Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('customer.email', 'E-Mail')}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="max@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('customer.phone', 'Telefon')}</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+41 79 xxx xx xx"
                />
              </div>
            </div>

            {/* Row 4: Status + Priority + Care Level */}
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>{t('customer.status', 'Status')}</Label>
                <Select
                  value={formData.customer_status}
                  onValueChange={(v) => handleChange('customer_status', v as CustomerStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CUSTOMER_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>
                        {t(`customer.statuses.${s}`, s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('customer.priority', 'Priorität')}</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => handleChange('priority', v as CustomerPriority)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>{t('customer.careLevel', 'Betreuung')}</Label>
                <Select
                  value={formData.care_level}
                  onValueChange={(v) => handleChange('care_level', v as CareLevel)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARE_LEVELS.map(c => (
                      <SelectItem key={c} value={c}>
                        {t(`customer.careLevels.${c}`, c)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              {t('common.cancel', 'Abbrechen')}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? t('common.saving', 'Speichern...') : t('common.create', 'Erstellen')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
