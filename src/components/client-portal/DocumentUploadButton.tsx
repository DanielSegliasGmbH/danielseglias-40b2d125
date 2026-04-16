import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type DocumentType =
  | 'pensionskasse'
  | 'pillar_3a'
  | 'freizuegigkeit'
  | 'kontoauszug'
  | 'depot'
  | 'hypothek'
  | 'leasing'
  | 'kredit';

interface ExtractedField {
  key: string;
  label: string;
  value: string;
  type: 'number' | 'text';
}

interface DocumentUploadButtonProps {
  documentType: DocumentType;
  onExtracted: (data: Record<string, unknown>) => void;
  className?: string;
}

const FIELD_LABELS: Record<string, string> = {
  austrittsleistung: 'Austrittsleistung (CHF)',
  freizuegigkeitsleistung: 'Freizügigkeitsleistung (CHF)',
  altersrente_geschaetzt_monat: 'Altersrente geschätzt (CHF/Monat)',
  pensionskasse_name: 'Pensionskasse',
  guthaben: 'Guthaben (CHF)',
  anbieter: 'Anbieter',
  rendite_ytd: 'Rendite YTD (%)',
  kontostand: 'Kontostand (CHF)',
  bankname: 'Bank',
  kontobezeichnung: 'Kontobezeichnung',
  gesamtwert: 'Gesamtwert (CHF)',
  plattform: 'Plattform',
  restschuld: 'Restschuld (CHF)',
  zinssatz: 'Zinssatz (%)',
  monatliche_rate: 'Monatliche Rate (CHF)',
};

const NUMBER_FIELDS = new Set([
  'austrittsleistung', 'freizuegigkeitsleistung', 'altersrente_geschaetzt_monat',
  'guthaben', 'rendite_ytd', 'kontostand', 'gesamtwert', 'restschuld',
  'zinssatz', 'monatliche_rate',
]);

type Phase = 'idle' | 'consent' | 'uploading' | 'extracting' | 'review' | 'error';

export function DocumentUploadButton({ documentType, onExtracted, className }: DocumentUploadButtonProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [rawData, setRawData] = useState<Record<string, unknown>>({});

  const handleClick = () => setPhase('consent');
  const handleCancel = () => { setPhase('idle'); setFields([]); };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({ title: 'Ungültiger Dateityp', description: 'Bitte lade ein Bild oder PDF hoch.', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Datei zu gross', description: 'Maximal 10 MB.', variant: 'destructive' });
      return;
    }

    setPhase('uploading');
    const filePath = `${user.id}/${crypto.randomUUID()}.${file.name.split('.').pop()}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('document-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setPhase('extracting');

      const { data: fnData, error: fnError } = await supabase.functions.invoke('extract-document', {
        body: { document_type: documentType, file_path: filePath },
      });

      if (fnError) throw fnError;

      if (!fnData?.success) {
        setPhase('error');
        return;
      }

      // Build editable fields
      const extracted = fnData.data as Record<string, unknown>;
      setRawData(extracted);
      const editableFields: ExtractedField[] = [];
      for (const [key, value] of Object.entries(extracted)) {
        if (key === 'positionen') continue; // skip arrays
        if (value === null || value === undefined) continue;
        editableFields.push({
          key,
          label: FIELD_LABELS[key] || key,
          value: String(value),
          type: NUMBER_FIELDS.has(key) ? 'number' : 'text',
        });
      }
      setFields(editableFields);
      setPhase('review');
    } catch (err) {
      console.error('Document extraction error:', err);
      setPhase('error');
      // Clean up uploaded file on error
      await supabase.storage.from('document-uploads').remove([filePath]).catch(() => {});
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = () => {
    const result: Record<string, unknown> = { ...rawData };
    for (const field of fields) {
      result[field.key] = field.type === 'number' ? Number(field.value) || 0 : field.value;
    }
    onExtracted(result);
    setPhase('idle');
    setFields([]);
    toast({ title: 'Daten übernommen ✓' });
  };

  const updateField = (key: string, value: string) => {
    setFields(prev => prev.map(f => f.key === key ? { ...f, value } : f));
  };

  if (phase === 'idle') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("gap-1.5 text-xs", className)}
        onClick={handleClick}
      >
        <Camera className="h-3.5 w-3.5" /> Foto hochladen statt manuell
      </Button>
    );
  }

  return (
    <div className="border border-border rounded-xl p-4 space-y-3 bg-card">
      {/* Close button */}
      <div className="flex justify-end">
        <button onClick={handleCancel} className="p-1 rounded hover:bg-muted">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {phase === 'consent' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg p-3">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-semibold">Du lädst ein sensibles Dokument hoch.</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Das Foto wird kurz an eine KI gesendet</li>
                <li>Die KI extrahiert nur die relevanten Zahlen</li>
                <li>Das Foto wird danach sofort gelöscht</li>
                <li>Nur die extrahierten Zahlen bleiben gespeichert</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1 gap-1.5" onClick={() => fileInputRef.current?.click()}>
              <Camera className="h-3.5 w-3.5" /> Ja, Foto auswählen
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
              Abbrechen
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {(phase === 'uploading' || phase === 'extracting') && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {phase === 'uploading' ? 'Wird hochgeladen...' : 'KI liest dein Dokument...'}
          </p>
        </div>
      )}

      {phase === 'review' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Wir haben folgende Daten extrahiert. Stimmt das?
          </div>
          <div className="space-y-2">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label className="text-xs text-muted-foreground">{field.label}</Label>
                <Input
                  type={field.type === 'number' ? 'text' : 'text'}
                  inputMode={field.type === 'number' ? 'decimal' : 'text'}
                  value={field.value}
                  onChange={(e) => updateField(field.key, field.type === 'number' ? e.target.value.replace(/[^0-9.]/g, '') : e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex-1" onClick={handleConfirm}>
              Übernehmen ✓
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleCancel}>
              Verwerfen
            </Button>
          </div>
        </div>
      )}

      {phase === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>Wir konnten nicht alle Werte lesen. Bitte manuell ergänzen.</p>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={handleCancel}>
            Schliessen
          </Button>
        </div>
      )}
    </div>
  );
}
