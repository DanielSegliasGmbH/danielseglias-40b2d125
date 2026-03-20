import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { useConsultationState } from '@/hooks/useConsultationState';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Plus,
  Trash2,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ─── Data Model ─────────────────────────────────────────── */
interface AdvisorSource {
  label: string;
  url: string;
}

interface InsuranceAdvisorData {
  registrationLink: string;
  qualificationLink: string;
  compensationText: string;
  workStyle: string[];
  sources: AdvisorSource[];
  showInPresentation: boolean;
}

const DEFAULT_DATA: InsuranceAdvisorData = {
  registrationLink: 'https://www.finma.ch/de/bewilligung/versicherungsvermittler/',
  qualificationLink: 'https://www.cicero.ch/',
  compensationText:
    'Meine Vergütung erfolgt transparent und nachvollziehbar. Es gibt keine versteckten Provisionen oder intransparenten Gebühren. Du erfährst vor jeder Entscheidung, welche Kosten entstehen.',
  workStyle: [
    'Analyse statt Verkauf',
    'Fokus auf langfristige Strategie',
    'Individuelle Lösungen statt Standardprodukte',
    'Unabhängig und transparent',
  ],
  sources: [
    { label: 'FINMA Vermittlerregister', url: 'https://www.finma.ch/de/bewilligung/versicherungsvermittler/' },
    { label: 'Cicero Qualifikationsplattform', url: 'https://www.cicero.ch/' },
  ],
  showInPresentation: true,
};

/* ─── Field Helper ────────────────────────────────────────── */
function Field({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="text-sm resize-none" />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
      )}
    </div>
  );
}

/* ─── Component ───────────────────────────────────────────── */
export default function InsuranceConsultingAdvisorInfo() {
  const { isPresentation } = useViewMode();
  const { consultationData, updateData } = useConsultationState();

  const [data, setData] = useState<InsuranceAdvisorData>(
    () => (consultationData.additionalData?.insuranceAdvisorData as InsuranceAdvisorData) ?? DEFAULT_DATA
  );

  useEffect(() => {
    const saved = consultationData.additionalData?.insuranceAdvisorData as InsuranceAdvisorData | undefined;
    if (saved) setData(saved);
  }, [consultationData.additionalData?.insuranceAdvisorData]);

  const update = useCallback(
    <K extends keyof InsuranceAdvisorData>(key: K, value: InsuranceAdvisorData[K]) => {
      setData((prev) => {
        const next = { ...prev, [key]: value };
        updateData((cd) => ({
          ...cd,
          additionalData: { ...cd.additionalData, insuranceAdvisorData: next },
        }));
        return next;
      });
    },
    [updateData]
  );

  /* ── source helpers ── */
  const addSource = () => update('sources', [...data.sources, { label: '', url: '' }]);
  const removeSource = (i: number) => update('sources', data.sources.filter((_, idx) => idx !== i));
  const updateSource = (i: number, field: keyof AdvisorSource, v: string) => {
    const next = data.sources.map((s, idx) => (idx === i ? { ...s, [field]: v } : s));
    update('sources', next);
  };

  /* ── workStyle helpers ── */
  const updateWorkItem = (i: number, v: string) => {
    const next = [...data.workStyle];
    next[i] = v;
    update('workStyle', next);
  };
  const addWorkItem = () => update('workStyle', [...data.workStyle, '']);
  const removeWorkItem = (i: number) => update('workStyle', data.workStyle.filter((_, idx) => idx !== i));

  /* ═══════════ PRESENTATION ═══════════ */
  if (isPresentation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 space-y-16">
          <PresentationSection delay={0}>
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                Transparenz & Nachweise
              </h1>
            </div>
            <p className="text-lg text-foreground/80 leading-relaxed max-w-prose">
              Mir ist wichtig, dass du genau verstehst, wie ich arbeite – und dass du alles jederzeit überprüfen kannst.
            </p>
          </PresentationSection>

          <div className="h-px bg-border" />

          <PresentationSection delay={100}>
            <h2 className="text-lg font-semibold text-foreground mb-3">Nachweisbarkeit</h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
              Ich bin offiziell registriert und zertifiziert. Alle Angaben sind öffentlich überprüfbar.
            </p>
            <div className="flex flex-wrap gap-3">
              {data.registrationLink && (
                <Button variant="outline" asChild className="gap-2">
                  <a href={data.registrationLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Registrierung prüfen
                  </a>
                </Button>
              )}
              {data.qualificationLink && (
                <Button variant="outline" asChild className="gap-2">
                  <a href={data.qualificationLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Qualifikationen ansehen
                  </a>
                </Button>
              )}
            </div>
          </PresentationSection>

          <div className="h-px bg-border" />

          <PresentationSection delay={200}>
            <h2 className="text-lg font-semibold text-foreground mb-3">Vergütung & Transparenz</h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed whitespace-pre-line">
              {data.compensationText}
            </p>
          </PresentationSection>

          <div className="h-px bg-border" />

          <PresentationSection delay={300}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Arbeitsweise</h2>
            <ul className="space-y-3">
              {data.workStyle.filter((w) => w.trim()).map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-[15px] text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </PresentationSection>

          {data.sources.length > 0 && (
            <PresentationSection delay={400}>
              <Accordion type="single" collapsible>
                <AccordionItem value="sources" className="border-none">
                  <AccordionTrigger className="text-sm text-muted-foreground hover:no-underline py-2">
                    Quellen & Details
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pt-2">
                      {data.sources.filter((s) => s.label && s.url).map((s, i) => (
                        <li key={i}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            {s.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </PresentationSection>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════ ADMIN ═══════════ */
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Transparenz & Nachweise</h1>
          <p className="text-sm text-muted-foreground">
            Verwalte Registrierungslinks, Vergütungsinfos und Quellen für die Kundenpräsentation.
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground flex-1">Im Präsentationsmodus anzeigen</span>
          <Switch checked={data.showInPresentation} onCheckedChange={(v) => update('showInPresentation', v)} />
        </div>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Registrierung & Qualifikation</h2>
          <Field label="Registrierungslink (z. B. FINMA)" value={data.registrationLink} onChange={(v) => update('registrationLink', v)} />
          <Field label="Qualifikationslink (z. B. Cicero / IAF)" value={data.qualificationLink} onChange={(v) => update('qualificationLink', v)} />
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Vergütung & Transparenz</h2>
          <Field label="Beschreibung Vergütung" value={data.compensationText} onChange={(v) => update('compensationText', v)} multiline rows={4} />
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Arbeitsweise</h2>
          {data.workStyle.map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <Input value={item} onChange={(e) => updateWorkItem(i, e.target.value)} className="text-sm flex-1" placeholder="z. B. Analyse statt Verkauf" />
              <Button variant="ghost" size="icon" onClick={() => removeWorkItem(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addWorkItem} className="gap-1">
            <Plus className="w-3.5 h-3.5" />
            Punkt hinzufügen
          </Button>
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Quellen & Links</h2>
          {data.sources.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-start">
              <Input value={s.label} onChange={(e) => updateSource(i, 'label', e.target.value)} placeholder="Bezeichnung" className="text-sm" />
              <Input value={s.url} onChange={(e) => updateSource(i, 'url', e.target.value)} placeholder="https://..." className="text-sm" />
              <Button variant="ghost" size="icon" onClick={() => removeSource(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addSource} className="gap-1">
            <Plus className="w-3.5 h-3.5" />
            Quelle hinzufügen
          </Button>
        </section>
      </div>
    </AppLayout>
  );
}

/* ─── Presentation Section ────────────────────────────────── */
function PresentationSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <section
      className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
      style={{ animationDelay: `${delay}ms`, animationDuration: '600ms' }}
    >
      {children}
    </section>
  );
}
