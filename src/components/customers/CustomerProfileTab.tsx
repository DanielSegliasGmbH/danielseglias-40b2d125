import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { CustomerProfile } from '@/hooks/useCustomerData';

interface CustomerProfileTabProps {
  profile: CustomerProfile | null;
  formData: Partial<CustomerProfile>;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
}

const COMMUNICATION_PREFERENCES = ['whatsapp', 'email', 'phone'];
const CANTONS = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR',
  'JU', 'LU', 'NE', 'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG',
  'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH'
];
const LANGUAGES = ['de', 'fr', 'it', 'en'];

export function CustomerProfileTab({ profile, formData, onChange, onSave, saving }: CustomerProfileTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Kontakt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.contact', 'Kontakt')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('customer.phone', 'Telefon')}</Label>
            <Input 
              type="tel"
              value={formData.phone || ''} 
              onChange={(e) => onChange('phone', e.target.value)}
              placeholder="+41 79 xxx xx xx"
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.email', 'E-Mail')}</Label>
            <Input 
              type="email"
              value={formData.email || ''} 
              onChange={(e) => onChange('email', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.communicationPreference', 'Bevorzugter Kanal')}</Label>
            <Select 
              value={formData.communication_preference || 'email'} 
              onValueChange={(v) => onChange('communication_preference', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMMUNICATION_PREFERENCES.map(c => (
                  <SelectItem key={c} value={c}>
                    {t(`customer.communicationPreferences.${c}`, c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.language', 'Sprache')}</Label>
            <Select 
              value={formData.language_preference || 'de'} 
              onValueChange={(v) => onChange('language_preference', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map(l => (
                  <SelectItem key={l} value={l}>
                    {t(`languages.${l}`, l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Adresse */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.address', 'Adresse')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-2">
            <Label>{t('customer.street', 'Strasse')}</Label>
            <Input 
              value={formData.street || ''} 
              onChange={(e) => onChange('street', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.houseNumber', 'Hausnummer')}</Label>
            <Input 
              value={formData.house_number || ''} 
              onChange={(e) => onChange('house_number', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.postalCode', 'PLZ')}</Label>
            <Input 
              value={formData.postal_code || ''} 
              onChange={(e) => onChange('postal_code', e.target.value)}
            />
          </div>
          
          <div className="space-y-2 lg:col-span-2">
            <Label>{t('customer.city', 'Ort')}</Label>
            <Input 
              value={formData.city || ''} 
              onChange={(e) => onChange('city', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.canton', 'Kanton')}</Label>
            <Select 
              value={formData.canton || ''} 
              onValueChange={(v) => onChange('canton', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select', 'Auswählen')} />
              </SelectTrigger>
              <SelectContent>
                {CANTONS.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.country', 'Land')}</Label>
            <Input 
              value={formData.country || 'Schweiz'} 
              onChange={(e) => onChange('country', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Familie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.family', 'Familie')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('customer.weddingDate', 'Hochzeitsdatum')}</Label>
            <Input 
              type="date"
              value={formData.wedding_date || ''} 
              onChange={(e) => onChange('wedding_date', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.childrenBirthYears', 'Geburtsjahre Kinder')}</Label>
            <Input 
              value={formData.children_birth_years?.join(', ') || ''} 
              onChange={(e) => {
                const years = e.target.value
                  .split(',')
                  .map(y => parseInt(y.trim()))
                  .filter(y => !isNaN(y));
                onChange('children_birth_years', years.length > 0 ? years : null);
              }}
              placeholder={t('customer.childrenBirthYearsPlaceholder', 'z.B. 2015, 2018, 2021')}
            />
          </div>
        </CardContent>
      </Card>

      {/* GDPR */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.gdpr', 'Datenschutz')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-xs">
            <Label>{t('customer.gdprConsentAt', 'DSGVO-Einwilligung')}</Label>
            <Input 
              type="datetime-local"
              value={formData.gdpr_consent_at ? formData.gdpr_consent_at.slice(0, 16) : ''} 
              onChange={(e) => onChange('gdpr_consent_at', e.target.value ? new Date(e.target.value).toISOString() : null)}
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
