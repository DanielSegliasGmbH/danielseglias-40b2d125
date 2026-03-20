import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type IntroductionData,
  DEFAULT_INTRODUCTION_DATA,
} from './IntroductionConfig';

interface IntroductionPageProps {
  introData?: IntroductionData;
  onDataChange?: (data: IntroductionData) => void;
}

// ─── Admin Field ────────────────────────────────────────────────────
function AdminField({
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
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-sm"
        />
      )}
    </div>
  );
}

// ─── Presentation Section ───────────────────────────────────────────
function PresentationSection({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <section
      className="space-y-3 animate-in fade-in slide-in-from-bottom-3 fill-mode-both"
      style={{ animationDelay: `${delay}ms`, animationDuration: '600ms' }}
    >
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="text-[15px] leading-relaxed text-muted-foreground whitespace-pre-line">
        {children}
      </div>
    </section>
  );
}

export default function IntroductionPage({
  introData: externalData,
  onDataChange,
}: IntroductionPageProps) {
  const { isPresentation } = useViewMode();
  const [data, setData] = useState<IntroductionData>(
    externalData ?? DEFAULT_INTRODUCTION_DATA
  );

  useEffect(() => {
    if (externalData) setData(externalData);
  }, [externalData]);

  const update = useCallback(
    (field: keyof IntroductionData, value: string) => {
      setData((prev) => {
        const next = { ...prev, [field]: value };
        onDataChange?.(next);
        return next;
      });
    },
    [onDataChange]
  );

  // ─── PRESENTATION VIEW ────────────────────────────────────────
  if (isPresentation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 space-y-14">
          {/* Hero */}
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

          <PresentationSection title="Was ich mache" delay={100}>
            {data.whatIDo}
          </PresentationSection>

          <PresentationSection title="Erfahrung & Hintergrund" delay={200}>
            {data.experience}
          </PresentationSection>

          <PresentationSection title="Mein Ansatz" delay={300}>
            {data.approach}
          </PresentationSection>

          <PresentationSection title="Persönliches" delay={400}>
            {data.personal}
          </PresentationSection>

          {/* Contact – subtle */}
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

  // ─── ADMIN VIEW ───────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">
            Meine Vorstellung
          </h1>
          <p className="text-sm text-muted-foreground">
            Bearbeite dein Profil für die Kundenpräsentation. Änderungen werden automatisch gespeichert.
          </p>
        </div>

        {/* Basis */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Basisinformationen</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Name" value={data.name} onChange={(v) => update('name', v)} />
            <AdminField label="Rolle" value={data.role} onChange={(v) => update('role', v)} />
          </div>
          <AdminField
            label="Headline"
            value={data.headline}
            onChange={(v) => update('headline', v)}
            multiline
            rows={2}
          />
        </section>

        {/* Sections */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Inhalte</h2>
          <AdminField
            label="Was ich mache"
            value={data.whatIDo}
            onChange={(v) => update('whatIDo', v)}
            multiline
            rows={3}
          />
          <AdminField
            label="Erfahrung & Hintergrund"
            value={data.experience}
            onChange={(v) => update('experience', v)}
            multiline
            rows={5}
          />
          <AdminField
            label="Mein Ansatz"
            value={data.approach}
            onChange={(v) => update('approach', v)}
            multiline
            rows={4}
          />
          <AdminField
            label="Persönliches"
            value={data.personal}
            onChange={(v) => update('personal', v)}
            multiline
            rows={3}
          />
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="text-base font-semibold text-foreground">Kontakt</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Telefon" value={data.phone} onChange={(v) => update('phone', v)} />
            <AdminField label="E-Mail" value={data.email} onChange={(v) => update('email', v)} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
