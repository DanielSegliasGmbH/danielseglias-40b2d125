import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  NodeFormData,
  NODE_CATEGORIES,
  NODE_IMPORTANCE,
  NODE_PHASES,
  categoryLabels,
  importanceLabels,
  SystemMapNode,
} from './types';

interface SystemMapNodeFormProps {
  mode: 'create' | 'edit';
  initialData?: SystemMapNode;
  onSubmit: (data: NodeFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  existingKeys?: string[];
}

function sanitizeKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 50);
}

export function SystemMapNodeForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  existingKeys = [],
}: SystemMapNodeFormProps) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<NodeFormData>({
    key: initialData?.key || '',
    label: initialData?.label || '',
    category: initialData?.category || 'module',
    description: initialData?.description || '',
    is_active: initialData?.is_active ?? true,
    importance: initialData?.importance || 'supporting',
    phase: initialData?.phase ?? 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof NodeFormData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        key: initialData.key,
        label: initialData.label,
        category: initialData.category,
        description: initialData.description || '',
        is_active: initialData.is_active,
        importance: initialData.importance || 'supporting',
        phase: initialData.phase ?? 0,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NodeFormData, string>> = {};

    if (!formData.key.trim()) {
      newErrors.key = t('systemMap.form.keyRequired');
    } else if (mode === 'create' && existingKeys.includes(formData.key)) {
      newErrors.key = t('systemMap.form.keyExists');
    }

    if (!formData.label.trim()) {
      newErrors.label = t('systemMap.form.labelRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleKeyChange = (value: string) => {
    const sanitized = sanitizeKey(value);
    setFormData((prev) => ({ ...prev, key: sanitized }));
    if (errors.key) {
      setErrors((prev) => ({ ...prev, key: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Key */}
      <div className="space-y-2">
        <Label htmlFor="key">{t('systemMap.form.key')} *</Label>
        <Input
          id="key"
          value={formData.key}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder="z.B. my_module"
          disabled={mode === 'edit'}
          className={errors.key ? 'border-destructive' : ''}
        />
        {errors.key && <p className="text-sm text-destructive">{errors.key}</p>}
        {mode === 'edit' && (
          <p className="text-xs text-muted-foreground">{t('systemMap.form.keyImmutable')}</p>
        )}
      </div>

      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="label">{t('systemMap.form.label')} *</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, label: e.target.value }));
            if (errors.label) setErrors((prev) => ({ ...prev, label: undefined }));
          }}
          placeholder="Anzeigename"
          className={errors.label ? 'border-destructive' : ''}
        />
        {errors.label && <p className="text-sm text-destructive">{errors.label}</p>}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>{t('systemMap.form.category')} *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as typeof formData.category }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NODE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Importance */}
      <div className="space-y-2">
        <Label>{t('systemMap.form.importance')} *</Label>
        <Select
          value={formData.importance}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, importance: value as typeof formData.importance }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NODE_IMPORTANCE.map((imp) => (
              <SelectItem key={imp} value={imp}>
                {importanceLabels[imp]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Phase */}
      <div className="space-y-2">
        <Label>{t('systemMap.form.phase')} *</Label>
        <Select
          value={String(formData.phase)}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, phase: Number(value) as typeof formData.phase }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NODE_PHASES.map((phase) => (
              <SelectItem key={phase} value={String(phase)}>
                Phase {phase}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('systemMap.form.description')}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Optionale Beschreibung..."
          rows={3}
        />
      </div>

      {/* Is Active */}
      <div className="flex items-center gap-3">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          {t('systemMap.form.isActive')}
        </Label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('app.loading') : mode === 'create' ? t('app.create') : t('app.save')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t('app.cancel')}
        </Button>
      </div>
    </form>
  );
}
