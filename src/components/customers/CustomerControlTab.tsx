import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { CustomerControl } from '@/hooks/useCustomerData';

interface CustomerControlTabProps {
  control: CustomerControl | null;
  formData: Partial<CustomerControl>;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
}

const REVENUE_BANDS = ['low', 'medium', 'high', 'very_high'];
const SERVICE_EFFORTS = ['low', 'medium', 'high'];
const DECISION_STYLES = ['fast', 'analytical', 'hesitant'];
const KNOWLEDGE_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'];
const POTENTIAL_LEVELS = ['none', 'low', 'medium', 'high'];

export function CustomerControlTab({ control, formData, onChange, onSave, saving }: CustomerControlTabProps) {
  const { t } = useTranslation();

  const renderScoreSelect = (field: string, value: number | null, label: string) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select 
        value={value?.toString() || ''} 
        onValueChange={(v) => onChange(field, v ? parseInt(v) : null)}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('common.select', 'Auswählen')} />
        </SelectTrigger>
        <SelectContent>
          {[1, 2, 3, 4, 5].map(n => (
            <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Wert & Umsatz */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.valueRevenue', 'Wert & Umsatz')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('customer.customerValueScore', 'Kundenwert-Score')}</Label>
            <Input 
              type="number"
              min={0}
              value={formData.customer_value_score ?? ''} 
              onChange={(e) => onChange('customer_value_score', e.target.value ? parseInt(e.target.value) : null)}
              placeholder={t('customer.calculatedLater', 'Später berechnet')}
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.estimatedRevenueBand', 'Umsatzklasse')}</Label>
            <Select 
              value={formData.estimated_revenue_band || ''} 
              onValueChange={(v) => onChange('estimated_revenue_band', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select', 'Auswählen')} />
              </SelectTrigger>
              <SelectContent>
                {REVENUE_BANDS.map(r => (
                  <SelectItem key={r} value={r}>
                    {t(`customer.revenueBands.${r}`, r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.lifetimeValue', 'Lifetime Value (CHF)')}</Label>
            <Input 
              type="number"
              min={0}
              step={100}
              value={formData.lifetime_value ?? ''} 
              onChange={(e) => onChange('lifetime_value', e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Verhalten & Eigenschaften */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.behaviorTraits', 'Verhalten & Eigenschaften')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('customer.serviceEffort', 'Betreuungsaufwand')}</Label>
            <Select 
              value={formData.service_effort || 'medium'} 
              onValueChange={(v) => onChange('service_effort', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_EFFORTS.map(e => (
                  <SelectItem key={e} value={e}>
                    {t(`customer.serviceEfforts.${e}`, e)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {renderScoreSelect('trust_level', formData.trust_level ?? null, t('customer.trustLevel', 'Vertrauensniveau (1-5)'))}
          
          <div className="space-y-2">
            <Label>{t('customer.decisionStyle', 'Entscheidungsstil')}</Label>
            <Select 
              value={formData.decision_style || ''} 
              onValueChange={(v) => onChange('decision_style', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select', 'Auswählen')} />
              </SelectTrigger>
              <SelectContent>
                {DECISION_STYLES.map(d => (
                  <SelectItem key={d} value={d}>
                    {t(`customer.decisionStyles.${d}`, d)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {renderScoreSelect('implementation_strength', formData.implementation_strength ?? null, t('customer.implementationStrength', 'Umsetzungsstärke (1-5)'))}
          
          <div className="space-y-2">
            <Label>{t('customer.financialKnowledgeLevel', 'Finanzwissen')}</Label>
            <Select 
              value={formData.financial_knowledge_level || ''} 
              onValueChange={(v) => onChange('financial_knowledge_level', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('common.select', 'Auswählen')} />
              </SelectTrigger>
              <SelectContent>
                {KNOWLEDGE_LEVELS.map(k => (
                  <SelectItem key={k} value={k}>
                    {t(`customer.knowledgeLevels.${k}`, k)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Potenzial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.potential', 'Potenzial')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label>{t('customer.upsellPotential', 'Upsell-Potenzial')}</Label>
            <Select 
              value={formData.upsell_potential || 'none'} 
              onValueChange={(v) => onChange('upsell_potential', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POTENTIAL_LEVELS.map(p => (
                  <SelectItem key={p} value={p}>
                    {t(`customer.potentialLevels.${p}`, p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>{t('customer.crossSellPotential', 'Cross-Sell-Potenzial')}</Label>
            <Select 
              value={formData.cross_sell_potential || 'none'} 
              onValueChange={(v) => onChange('cross_sell_potential', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {POTENTIAL_LEVELS.map(p => (
                  <SelectItem key={p} value={p}>
                    {t(`customer.potentialLevels.${p}`, p)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {renderScoreSelect('referral_score', formData.referral_score ?? null, t('customer.referralScore', 'Empfehlungspotenzial (1-5)'))}
        </CardContent>
      </Card>

      {/* Bewertungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('customer.reviews', 'Bewertungen & Feedbacks')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.google_review_received ?? false}
                onCheckedChange={(v) => onChange('google_review_received', v)}
              />
              <Label>{t('customer.googleReviewReceived', 'Google Bewertung erhalten')}</Label>
            </div>
            {formData.google_review_received && (
              <div className="space-y-2 pl-10">
                <Label>{t('customer.googleReviewDate', 'Datum')}</Label>
                <Input 
                  type="date"
                  value={formData.google_review_date || ''} 
                  onChange={(e) => onChange('google_review_date', e.target.value)}
                />
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Switch
                checked={formData.moneytree_received ?? false}
                onCheckedChange={(v) => onChange('moneytree_received', v)}
              />
              <Label>{t('customer.moneytreeReceived', 'Moneytree erhalten')}</Label>
            </div>
            {formData.moneytree_received && (
              <div className="space-y-2 pl-10">
                <Label>{t('customer.moneytreeDate', 'Datum')}</Label>
                <Input 
                  type="date"
                  value={formData.moneytree_date || ''} 
                  onChange={(e) => onChange('moneytree_date', e.target.value)}
                />
              </div>
            )}
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
