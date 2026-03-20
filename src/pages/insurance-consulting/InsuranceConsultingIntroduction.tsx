import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { useConsultationState } from '@/hooks/useConsultationState';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail } from 'lucide-react';

/* ─── Data Model ─────────────────────────────────────────── */
interface InsuranceIntroData {
  name: string;
  role: string;
  headline: string;
  whatIDo: string;
  experience: string;
  approach: string;
  personal: string;
  phone: string;
  email: string;
}

const DEFAULT_DATA: InsuranceIntroData = {
  name: 'Daniel Celias',
  role: 'Geschäftsführer & Versicherungsberater',
  headline:
    'Ich begleite Menschen dabei, ihre Versicherungssituation transparent, verständlich und langfristig optimal aufzubauen.',
  whatIDo:
    'Ich unterstütze Menschen in der Schweiz dabei, ihre Versicherungen strukturiert und verständlich zu optimieren – mit Fokus auf echten Schutz und Klarheit.',
  experience:
    'Seit 2016 bin ich in der Finanzbranche tätig.\n2019 habe ich die Weiterbildung zum Versicherungsberater FAV abgeschlossen.\nSeit Februar 2023 bin ich selbstständig und begleite Kunden unabhängig und transparent.',
  approach:
    'Mein Fokus liegt nicht auf dem Verkauf von Produkten, sondern auf echter Aufklärung und nachhaltiger Strategie.\nIch arbeite ohne versteckte Provisionen und lege grossen Wert auf Transparenz, Verständnis und langfristigen Mehrwert.',
  personal:
    'Ich bin sportlich sehr aktiv und bereite mich aktuell auf langfristige Ausdauerziele wie einen Ironman vor.\nPersönliche Entwicklung, Disziplin und Klarheit sind zentrale Bestandteile meines Lebens und meiner Arbeit.',
  phone: '077 444 8608',
  email: 'hallo@danielcelias.ch',
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
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className="text-sm resize-none"
        />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="text-sm" />
      )}
    </div>
  );
}

/* ─── Component ───────────────────────────────────────────── */
export default function InsuranceConsultingIntroduction() {
  const { isPresentation } = useViewMode();
  const { consultationData, updateData } = useConsultationState();

  const [data, setData] = useState<InsuranceIntroData>(
    () => (consultationData.additionalData?.insuranceIntroData as InsuranceIntroData) ?? DEFAULT_DATA
  );

  useEffect(() => {
    const saved = consultationData.additionalData?.insuranceIntroData as InsuranceIntroData | undefined;
    if (saved) setData(saved);
  }, [consultationData.additionalData?.insuranceIntroData]);

  const update = useCallback(
    (field: keyof InsuranceIntroData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value };
        updateData((cd) => ({
          ...cd,
          additionalData: { ...cd.additionalData, insuranceIntroData: next },
        }));
        return next;
      });
    },
    [updateData]
  );

  /* ─── PRESENTATION ─────────────────────────────────────── */
  if (isPresentation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 space-y-14">
          <header
            className="space-y-4 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
            style={{ animationDuration: '700ms' }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight leading-tight">
              {data.name}
            </h1>
            <p className="text-base text-primary font-medium">{data.role}</p>
            <p className="text-lg text-foreground/80 leading-relaxed max-w-prose">
              {data.headline}
            </p>
          </header>

          <div className="h-px bg-border" />

          <Section title="Was ich mache" delay={100}>{data.whatIDo}</Section>
          <Section title="Erfahrung & Hintergrund" delay={200}>{data.experience}</Section>
          <Section title="Mein Ansatz" delay={300}>{data.approach}</Section>
          <Section title="Persönliches" delay={400}>{data.personal}</Section>

          <footer
            className="pt-6 border-t border-border animate-in fade-in fill-mode-both"
            style={{ animationDelay: '500ms', animationDuration: '600ms' }}
          >
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" />
                {data.phone}
              </span>
              <span className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" />
                {data.email}
              </span>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  /* ─── ADMIN ────────────────────────────────────────────── */
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Meine Vorstellung</h1>
          <p className="text-sm text-muted-foreground">
            Bearbeite dein Profil für die Kundenpräsentation. Änderungen werden automatisch gespeichert.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Basisinformationen</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" value={data.name} onChange={(v) => update('name', v)} />
            <Field label="Rolle" value={data.role} onChange={(v) => update('role', v)} />
          </div>
          <Field label="Headline" value={data.headline} onChange={(v) => update('headline', v)} multiline rows={2} />
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Inhalte</h2>
          <Field label="Was ich mache" value={data.whatIDo} onChange={(v) => update('whatIDo', v)} multiline rows={3} />
          <Field label="Erfahrung & Hintergrund" value={data.experience} onChange={(v) => update('experience', v)} multiline rows={5} />
          <Field label="Mein Ansatz" value={data.approach} onChange={(v) => update('approach', v)} multiline rows={4} />
          <Field label="Persönliches" value={data.personal} onChange={(v) => update('personal', v)} multiline rows={3} />
        </section>

        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Kontakt</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefon" value={data.phone} onChange={(v) => update('phone', v)} />
            <Field label="E-Mail" value={data.email} onChange={(v) => update('email', v)} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

/* ─── Presentation Section ────────────────────────────────── */
function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <section
      className="space-y-3 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
      style={{ animationDelay: `${delay}ms`, animationDuration: '600ms' }}
    >
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-line">{children}</div>
    </section>
  );
}
