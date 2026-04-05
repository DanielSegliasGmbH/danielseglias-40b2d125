import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMetaProfile, MetaFieldKey, META_FIELD_MAP } from '@/hooks/useMetaProfile';
import { toast } from 'sonner';

interface MetaProfilePrefillProps {
  /** Which meta field this input maps to */
  metaField: MetaFieldKey;
  /** Current local value */
  value: number | string;
  /** Called when user changes the value locally */
  onChange: (value: number | string) => void;
  /** Label override (defaults to META_FIELD_MAP label) */
  label?: string;
  /** Input type */
  type?: 'number' | 'text';
  /** Tool slug for source tracking */
  toolSlug?: string;
  /** Additional className */
  className?: string;
  /** Disable the prefill feature */
  disabled?: boolean;
}

export function MetaProfilePrefill({
  metaField,
  value,
  onChange,
  label,
  type = 'number',
  toolSlug = 'unknown',
  className,
  disabled = false,
}: MetaProfilePrefillProps) {
  const { getFieldValue, updateField } = useMetaProfile();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [hasBeenPrefilled, setHasBeenPrefilled] = useState(false);

  const metaValue = getFieldValue(metaField);
  const fieldMeta = META_FIELD_MAP[metaField];
  const displayLabel = label || fieldMeta?.label || metaField;

  // Check if current value was prefilled and then changed
  const isPrefilled = metaValue != null && !hasBeenPrefilled && (value === '' || value === 0 || value === metaValue);

  // Auto-prefill on mount if value is empty/default
  const shouldPrefill = metaValue != null && (value === '' || value === 0) && !disabled;

  if (shouldPrefill && !hasBeenPrefilled) {
    // Trigger prefill
    onChange(metaValue);
    setHasBeenPrefilled(true);
  }

  const handleChange = (newValue: string) => {
    const parsed = type === 'number' ? (newValue === '' ? 0 : Number(newValue)) : newValue;
    onChange(parsed);

    // If value differs from meta profile, show update prompt
    if (metaValue != null && String(parsed) !== String(metaValue) && !showUpdatePrompt) {
      setShowUpdatePrompt(true);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await updateField(metaField, type === 'number' ? Number(value) : value, toolSlug);
      toast.success(`${displayLabel} im Profil aktualisiert`);
    } catch {
      toast.error('Fehler beim Aktualisieren');
    }
    setShowUpdatePrompt(false);
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">{displayLabel}</Label>
        {hasBeenPrefilled && (
          <Badge variant="secondary" className="text-[10px] gap-1 py-0 h-5">
            <User className="h-3 w-3" />
            Aus Profil
          </Badge>
        )}
      </div>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={e => handleChange(e.target.value)}
          className={cn(hasBeenPrefilled && 'border-primary/30 bg-primary/5')}
        />
        {fieldMeta?.unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {fieldMeta.unit}
          </span>
        )}
      </div>

      {/* Update prompt */}
      {showUpdatePrompt && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/60 text-xs">
          <span className="text-muted-foreground flex-1">Dauerhaft im Profil aktualisieren?</span>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={handleUpdateProfile}>
            <Check className="h-3 w-3" /> Ja
          </Button>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs gap-1" onClick={() => setShowUpdatePrompt(false)}>
            <X className="h-3 w-3" /> Nein
          </Button>
        </div>
      )}
    </div>
  );
}
