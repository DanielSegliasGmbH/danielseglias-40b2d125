import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { CustomerEconomics } from '@/hooks/useCustomerData';

interface CustomerEconomicsTabProps {
  economics: CustomerEconomics | null;
  formData: Partial<CustomerEconomics>;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
}

const EMPLOYMENT_TYPES = ['employed', 'self_employed', 'entrepreneur', 'unemployed', 'retired'];
const INCOME_RANGES = ['under_50k', '50k_80k', '80k_120k', '120k_200k', '200k_plus'];

export function CustomerEconomicsTab({ economics, formData, onChange, onSave, saving }: CustomerEconomicsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Beruf */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.employment', 'Beruf')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('customer.employmentType', 'Beschäftigungsart')}</Label>
            <Select 
              value={formData.employment_type || ''} 
              onValueChange={(v) => onChange('employment_type', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select', 'Auswählen')} />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map(e => (
                  <SelectItem key={e} value={e}>
                    {t(`customer.employmentTypes.${e}`, e)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.employer', 'Arbeitgeber')}</Label>
            <Input 
              value={formData.employer || ''} 
              onChange={(e) => onChange('employer', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.jobTitle', 'Position')}</Label>
            <Input 
              value={formData.job_title || ''} 
              onChange={(e) => onChange('job_title', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.industry', 'Branche')}</Label>
            <Input 
              value={formData.industry || ''} 
              onChange={(e) => onChange('industry', e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.workloadPercentage', 'Pensum %')}</Label>
            <Input 
              type="number"
              min={0}
              max={100}
              value={formData.workload_percentage ?? 100} 
              onChange={(e) => onChange('workload_percentage', parseInt(e.target.value) || 100)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Einkommen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.income', 'Einkommen')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('customer.incomeRange', 'Einkommensklasse')}</Label>
            <Select 
              value={formData.income_range || ''} 
              onValueChange={(v) => onChange('income_range', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select', 'Auswählen')} />
              </SelectTrigger>
              <SelectContent>
                {INCOME_RANGES.map(r => (
                  <SelectItem key={r} value={r}>
                    {t(`customer.incomeRanges.${r}`, r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3 pt-6">
            <Switch
              checked={formData.bonus_income ?? false}
              onCheckedChange={(v) => onChange('bonus_income', v)}
            />
            <Label>{t('customer.bonusIncome', 'Bonus-Einkommen')}</Label>
          </div>
          
          <div className="flex items-center space-x-3 pt-6">
            <Switch
              checked={formData.side_income ?? false}
              onCheckedChange={(v) => onChange('side_income', v)}
            />
            <Label>{t('customer.sideIncome', 'Nebeneinkommen')}</Label>
          </div>
        </CardContent>
      </Card>

      {/* Vermögen & Verbindlichkeiten */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.assetsLiabilities', 'Vermögen & Verbindlichkeiten')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.owns_real_estate ?? false}
              onCheckedChange={(v) => onChange('owns_real_estate', v)}
            />
            <Label>{t('customer.ownsRealEstate', 'Immobilienbesitz')}</Label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.has_liabilities ?? false}
              onCheckedChange={(v) => onChange('has_liabilities', v)}
            />
            <Label>{t('customer.hasLiabilities', 'Verbindlichkeiten')}</Label>
          </div>
          
          <div className="flex items-center space-x-3">
            <Switch
              checked={formData.entrepreneurial_activity ?? false}
              onCheckedChange={(v) => onChange('entrepreneurial_activity', v)}
            />
            <Label>{t('customer.entrepreneurialActivity', 'Unternehmerisch tätig')}</Label>
          </div>
        </CardContent>
      </Card>

      {/* Bankverbindungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.bankAccounts', 'Bankverbindungen')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('customer.banks', 'Banken')}</Label>
            <Input 
              value={formData.banks?.join(', ') || ''} 
              onChange={(e) => {
                const banks = e.target.value
                  .split(',')
                  .map(b => b.trim())
                  .filter(b => b.length > 0);
                onChange('banks', banks.length > 0 ? banks : null);
              }}
              placeholder={t('customer.banksPlaceholder', 'z.B. UBS, Credit Suisse')}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.ibans', 'IBANs')}</Label>
            <Input 
              value={formData.ibans?.join(', ') || ''} 
              onChange={(e) => {
                const ibans = e.target.value
                  .split(',')
                  .map(i => i.trim())
                  .filter(i => i.length > 0);
                onChange('ibans', ibans.length > 0 ? ibans : null);
              }}
              placeholder={t('customer.ibansPlaceholder', 'CH00 0000 0000 0000 0000 0')}
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
