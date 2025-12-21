import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { CustomerWithRelations } from '@/hooks/useCustomerData';

interface CustomerCoreTabProps {
  customer: CustomerWithRelations;
  formData: Partial<CustomerWithRelations>;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
}

const SALUTATIONS = ['Herr', 'Frau', 'Divers'];
const CIVIL_STATUSES = ['single', 'married', 'divorced', 'widowed', 'partnership'];
const CUSTOMER_STATUSES = ['lead', 'active', 'passive', 'former'];
const PRIORITIES = ['A', 'B', 'C'];
const CARE_LEVELS = ['vip', 'standard', 'light'];

export function CustomerCoreTab({ customer, formData, onChange, onSave, saving }: CustomerCoreTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Identität */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.identity', 'Identität')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('customer.salutation', 'Anrede')}</Label>
            <Select 
              value={formData.salutation || ''} 
              onValueChange={(v) => onChange('salutation', v)}
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
          
          <div className="space-y-2">
            <Label>{t('customer.firstName', 'Vorname')} *</Label>
            <Input 
              value={formData.first_name || ''} 
              onChange={(e) => onChange('first_name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.lastName', 'Nachname')} *</Label>
            <Input 
              value={formData.last_name || ''} 
              onChange={(e) => onChange('last_name', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.preferredName', 'Rufname')}</Label>
            <Input 
              value={formData.preferred_name || ''} 
              onChange={(e) => onChange('preferred_name', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.dateOfBirth', 'Geburtsdatum')}</Label>
            <Input 
              type="date"
              value={formData.date_of_birth || ''} 
              onChange={(e) => onChange('date_of_birth', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.nationality', 'Nationalität')}</Label>
            <Input 
              value={formData.nationality || ''} 
              onChange={(e) => onChange('nationality', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.civilStatus', 'Zivilstand')}</Label>
            <Select 
              value={formData.civil_status || ''} 
              onValueChange={(v) => onChange('civil_status', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select', 'Auswählen')} />
              </SelectTrigger>
              <SelectContent>
                {CIVIL_STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {t(`customer.civilStatuses.${s}`, s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.numberOfChildren', 'Anzahl Kinder')}</Label>
            <Input 
              type="number"
              min={0}
              value={formData.number_of_children ?? 0} 
              onChange={(e) => onChange('number_of_children', parseInt(e.target.value) || 0)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.ahvNumber', 'AHV-Nummer')}</Label>
            <Input 
              value={formData.ahv_number || ''} 
              onChange={(e) => onChange('ahv_number', e.target.value)}
              placeholder="756.xxxx.xxxx.xx"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status & Klassifizierung */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.statusClassification', 'Status & Klassifizierung')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('customer.status', 'Status')}</Label>
            <Select 
              value={formData.customer_status || 'lead'} 
              onValueChange={(v) => onChange('customer_status', v)}
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
          
          <div className="space-y-2">
            <Label>{t('customer.priority', 'Priorität')}</Label>
            <Select 
              value={formData.priority || 'C'} 
              onValueChange={(v) => onChange('priority', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.careLevel', 'Betreuungsstufe')}</Label>
            <Select 
              value={formData.care_level || 'standard'} 
              onValueChange={(v) => onChange('care_level', v)}
            >
              <SelectTrigger>
                <SelectValue />
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
        </CardContent>
      </Card>

      {/* Akquise */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.acquisition', 'Akquise')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('customer.acquisitionSource', 'Herkunft')}</Label>
            <Input 
              value={formData.acquisition_source || ''} 
              onChange={(e) => onChange('acquisition_source', e.target.value)}
              placeholder={t('customer.acquisitionSourcePlaceholder', 'z.B. Empfehlung, Google, Event')}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.firstContactDate', 'Erstkontakt')}</Label>
            <Input 
              type="date"
              value={formData.first_contact_date || ''} 
              onChange={(e) => onChange('first_contact_date', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? t('common.saving', 'Speichern...') : t('common.save', 'Speichern')}
        </Button>
      </div>
    </div>
  );
}
