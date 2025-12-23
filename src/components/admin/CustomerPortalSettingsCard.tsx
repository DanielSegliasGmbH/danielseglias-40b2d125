import { useTranslation } from 'react-i18next';
import { useCustomerPortalSettingsForCustomer, useUpdateCustomerPortalSettings } from '@/hooks/useClientPortal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Shield,
  Target,
  ClipboardList,
  TrendingUp,
  BookOpen,
  Wrench,
  Settings,
} from 'lucide-react';

interface CustomerPortalSettingsCardProps {
  customerId: string;
}

const sections = [
  { key: 'show_insurances', icon: Shield, labelKey: 'clientPortal.insurances', color: 'text-blue-500' },
  { key: 'show_goals', icon: Target, labelKey: 'clientPortal.goals', color: 'text-green-500' },
  { key: 'show_tasks', icon: ClipboardList, labelKey: 'clientPortal.tasks', color: 'text-orange-500' },
  { key: 'show_strategies', icon: TrendingUp, labelKey: 'clientPortal.strategies', color: 'text-purple-500' },
  { key: 'show_library', icon: BookOpen, labelKey: 'clientPortal.library', color: 'text-amber-500' },
  { key: 'show_tools', icon: Wrench, labelKey: 'clientPortal.tools', color: 'text-slate-500' },
] as const;

export function CustomerPortalSettingsCard({ customerId }: CustomerPortalSettingsCardProps) {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useCustomerPortalSettingsForCustomer(customerId);
  const updateSettings = useUpdateCustomerPortalSettings();

  const handleToggle = async (key: string, value: boolean) => {
    try {
      await updateSettings.mutateAsync({
        customerId,
        settings: { [key]: value },
      });
      toast.success(t('clientPortal.settingsUpdated'));
    } catch {
      toast.error(t('app.error'));
    }
  };

  const getSettingValue = (key: string): boolean => {
    if (!settings) return true; // Default to true if no settings
    const settingKey = key as keyof typeof settings;
    const value = settings[settingKey];
    return typeof value === 'boolean' ? value : true;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('clientPortal.settingsTitle')}
        </CardTitle>
        <CardDescription>{t('clientPortal.settingsDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sections.map(section => (
            <div key={section.key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <section.icon className={`h-5 w-5 ${section.color}`} />
                <Label htmlFor={section.key} className="cursor-pointer">
                  {t(section.labelKey)}
                </Label>
              </div>
              <Switch
                id={section.key}
                checked={getSettingValue(section.key)}
                onCheckedChange={(value) => handleToggle(section.key, value)}
                disabled={updateSettings.isPending}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
