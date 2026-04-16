import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useMetaProfile, META_FIELD_MAP, MetaFieldKey } from '@/hooks/useMetaProfile';
import { useGamification } from '@/hooks/useGamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, CheckCircle2, AlertTriangle, Wallet, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

const FINANCIAL_GOALS = [
  'Finanzielle Freiheit',
  'Eigenheim',
  'Altersvorsorge optimieren',
  'Vermögensaufbau',
  'Schuldenabbau',
  'Kinder absichern',
  'Frühpensionierung',
  'Anderes',
];

export default function ClientPortalProfileData() {
  const { t } = useTranslation();
  const { profile, isLoading, updateFields, confirmProfile, needsCheckup } = useMetaProfile();
  const { awardPoints } = useGamification();

  // Local form state
  const [form, setForm] = useState<Record<string, string | number | null>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Sync profile data to form
  useEffect(() => {
    if (profile) {
      const fields: Record<string, string | number | null> = {};
      Object.keys(META_FIELD_MAP).forEach(key => {
        fields[key] = (profile as any)[key] ?? null;
      });
      setForm(fields);
      setIsDirty(false);
    }
  }, [profile]);

  const handleChange = (field: string, value: string | number | null) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const updates: Record<string, string | number | null> = {};
    Object.entries(form).forEach(([key, val]) => {
      updates[key] = val === '' ? null : val;
    });

    try {
      await updateFields(updates as any, 'profil-seite');
    } catch (err) {
      console.error('[ProfileData] Save failed:', err);
      toast.error('Fehler beim Speichern', { duration: 3000 });
      return;
    }

    setIsDirty(false);
    toast.success('Gespeichert ✓');

    // Check if profile is fully filled → award one-time XP
    const filledFields = Object.values(form).filter(v => v !== null && v !== '').length;
    const totalFields = Object.keys(META_FIELD_MAP).length + 4; // finance fields + personal fields
    if (filledFields >= totalFields * 0.8) {
      awardPoints('profile_completed', 'profile_full');
    }

    // Confirm separately – don't block success feedback
    try {
      await confirmProfile();
    } catch (err) {
      console.error('[ProfileData] Confirm failed:', err);
    }
  };

  const financeFields = Object.entries(META_FIELD_MAP).filter(([, v]) => v.group === 'finance');
  const personalFields = Object.entries(META_FIELD_MAP).filter(([, v]) => v.group === 'personal');

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <ScreenHeader title="Mein Finanzprofil" backTo="/app/client-portal/settings" />

      {/* Checkup Banner */}
      {needsCheckup && (
        <Card className="mb-6 border-warning/50 bg-warning/5">
          <CardContent className="py-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Daten-Check fällig</p>
              <p className="text-xs text-muted-foreground">Bitte überprüfe deine Angaben – der letzte Check ist über 90 Tage her.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last confirmed */}
      {profile?.last_confirmed_at && (
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Zuletzt bestätigt: {format(parseISO(profile.last_confirmed_at), 'dd.MM.yyyy', { locale: de })}
          </span>
        </div>
      )}

      <div className="space-y-6">
        {/* Finance Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Finanzielle Daten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {financeFields.map(([key, meta]) => (
              <div key={key} className="space-y-1.5">
                <Label className="text-sm">{meta.label}</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={form[key] ?? ''}
                    onChange={e => handleChange(key, e.target.value === '' ? null : Number(e.target.value))}
                    placeholder={`${meta.label} eingeben`}
                  />
                  {meta.unit && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {meta.unit}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Personal Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Persönliche Daten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Age */}
            <div className="space-y-1.5">
              <Label className="text-sm">Alter</Label>
              <Input
                type="number"
                value={form.age ?? ''}
                onChange={e => handleChange('age', e.target.value === '' ? null : Number(e.target.value))}
                placeholder="Alter eingeben"
              />
            </div>

            {/* Occupation */}
            <div className="space-y-1.5">
              <Label className="text-sm">Beruf</Label>
              <Input
                type="text"
                value={form.occupation ?? ''}
                onChange={e => handleChange('occupation', e.target.value || null)}
                placeholder="Beruf eingeben"
              />
            </div>

            {/* Financial Goal */}
            <div className="space-y-1.5">
              <Label className="text-sm">Finanzziel</Label>
              <Select
                value={form.financial_goal as string || ''}
                onValueChange={v => handleChange('financial_goal', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ziel wählen" />
                </SelectTrigger>
                <SelectContent>
                  {FINANCIAL_GOALS.map(goal => (
                    <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-1.5">
              <Label className="text-sm">Risikobereitschaft (1-10)</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={form.risk_tolerance ?? ''}
                onChange={e => handleChange('risk_tolerance', e.target.value === '' ? null : Math.min(10, Math.max(1, Number(e.target.value))))}
                placeholder="1 = konservativ, 10 = risikofreudig"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={!isDirty} className="gap-2 flex-1">
            <Save className="h-4 w-4" />
            {isDirty ? 'Speichern & Bestätigen' : 'Gespeichert'}
          </Button>
          {needsCheckup && !isDirty && (
            <Button variant="outline" onClick={confirmProfile} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Daten bestätigen
            </Button>
          )}
        </div>
      </div>
    </ClientPortalLayout>
  );
}
