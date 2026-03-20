import { useState, useCallback } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useViewMode } from '@/hooks/useViewMode';
import { useConsultationState } from '@/hooks/useConsultationState';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Pencil, Phone, Mail, MapPin } from 'lucide-react';

/* ─── Data Model ─────────────────────────────────────────── */
interface RistoIntroData {
  name: string;
  role: string;
  career: string[];
  quote: string;
  facts: string[];
  hobbies: string[];
  dreams: string[];
  company: string;
  location: string;
  street: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
}

const DEFAULT_DATA: RistoIntroData = {
  name: 'Risto Rikic',
  role: 'Abteilungsleiter Versicherungen und Aussendienst',
  career: [
    'Lehre in der Gemeinde',
    'In der Versicherungsbranche seit 2017',
    'Bei Daniel Seglias GmbH seit Februar 2026',
  ],
  quote:
    'Ihr starker Partner für Versicherung und Vorsorge: Gemeinsam gestalten wir Ihre Zukunft.',
  facts: ['Verantwortungsbewusst', 'Lösungsorientiert', 'Wohnhaft in Oetwil a.d.L'],
  hobbies: ['Lesen', 'Reisen', 'Meditieren', 'Wandern'],
  dreams: ['Weltreise', 'Eigenheim', 'Weiterbildung IAF'],
  company: 'Daniel Seglias GmbH',
  location: 'Standort Limmattal',
  street: 'Lerzenstrasse 19a',
  zip: '8953 Dietikon',
  country: 'Schweiz',
  phone: '+41 79 772 83 97',
  email: 'risto@danielseglias.ch',
};

const STORAGE_KEY = 'insuranceIntroData';

/* ─── Component ───────────────────────────────────────────── */
export default function InsuranceConsultingIntroduction() {
  const { isPresentation } = useViewMode();
  const { consultationData, updateData } = useConsultationState();

  useSectionBroadcast({
    section: 'introduction',
    title: 'Meine Vorstellung',
  });

  const [data, setData] = useState<RistoIntroData>(
    () => (consultationData.additionalData?.[STORAGE_KEY] as RistoIntroData) ?? DEFAULT_DATA
  );
  const [editing, setEditing] = useState(false);

  const persist = useCallback(
    (next: RistoIntroData) => {
      setData(next);
      updateData((cd) => ({
        ...cd,
        additionalData: { ...cd.additionalData, [STORAGE_KEY]: next },
      }));
    },
    [updateData]
  );

  const updateField = useCallback(
    <K extends keyof RistoIntroData>(field: K, value: RistoIntroData[K]) => {
      const next = { ...data, [field]: value };
      persist(next);
    },
    [data, persist]
  );

  const updateArrayItem = useCallback(
    (field: 'career' | 'facts' | 'hobbies' | 'dreams', idx: number, value: string) => {
      const arr = [...data[field]];
      arr[idx] = value;
      persist({ ...data, [field]: arr });
    },
    [data, persist]
  );

  /* ─── Shared Profile Card ──────────────────────────────── */
  const ProfileCard = ({ editable = false }: { editable?: boolean }) => (
    <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
      {/* Header: Avatar + Name */}
      <div className="px-8 pt-8 pb-6 flex items-start gap-8">
        <Avatar className="w-28 h-28 md:w-36 md:h-36 shrink-0 ring-4 ring-background shadow-md">
          <AvatarFallback className="text-2xl md:text-3xl font-semibold bg-muted text-muted-foreground">
            RR
          </AvatarFallback>
        </Avatar>

        <div className="space-y-3 min-w-0">
          {editable && editing ? (
            <>
              <Input
                value={data.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="text-2xl font-bold"
              />
              <Input
                value={data.role}
                onChange={(e) => updateField('role', e.target.value)}
                className="text-sm"
              />
            </>
          ) : (
            <>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {data.name}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">{data.role}</p>
            </>
          )}

          {/* Career / Berufsleben */}
          <div className="pt-2">
            <h2 className="text-base font-semibold text-foreground mb-2">Berufsleben</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {data.career.map((item, i) =>
                editable && editing ? (
                  <li key={i} className="list-none">
                    <Input
                      value={item}
                      onChange={(e) => updateArrayItem('career', i, e.target.value)}
                      className="text-sm mb-1"
                    />
                  </li>
                ) : (
                  <li key={i}>{item}</li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div className="px-8 py-6 border-t border-border">
        {editable && editing ? (
          <Textarea
            value={data.quote}
            onChange={(e) => updateField('quote', e.target.value)}
            rows={2}
            className="text-sm italic text-center resize-none"
          />
        ) : (
          <p className="text-center text-base md:text-lg italic text-primary leading-relaxed">
            &ldquo;{data.quote}&rdquo;
          </p>
        )}
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
        <ColumnBlock
          title="Fakten"
          items={data.facts}
          field="facts"
          editable={editable && editing}
          onItemChange={updateArrayItem}
        />
        <ColumnBlock
          title="Hobbys"
          items={data.hobbies}
          field="hobbies"
          editable={editable && editing}
          onItemChange={updateArrayItem}
        />
        <ColumnBlock
          title="Träume & Ziele"
          items={data.dreams}
          field="dreams"
          editable={editable && editing}
          onItemChange={updateArrayItem}
        />
      </div>

      {/* Contact Footer */}
      <div className="px-8 py-6 border-t border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground space-y-0.5">
            {editable && editing ? (
              <>
                <Input value={data.company} onChange={(e) => updateField('company', e.target.value)} className="text-sm mb-1" />
                <Input value={data.location} onChange={(e) => updateField('location', e.target.value)} className="text-sm mb-1" />
                <Input value={data.street} onChange={(e) => updateField('street', e.target.value)} className="text-sm mb-1" />
                <Input value={data.zip} onChange={(e) => updateField('zip', e.target.value)} className="text-sm mb-1" />
                <Input value={data.country} onChange={(e) => updateField('country', e.target.value)} className="text-sm mb-1" />
              </>
            ) : (
              <>
                <p className="font-semibold text-foreground">{data.company}</p>
                <p>{data.location}</p>
                <p>{data.street}</p>
                <p>{data.zip}</p>
                <p>{data.country}</p>
              </>
            )}
          </div>

          <div className="text-sm text-muted-foreground space-y-1">
            {editable && editing ? (
              <>
                <Input value={data.phone} onChange={(e) => updateField('phone', e.target.value)} className="text-sm mb-1" />
                <Input value={data.email} onChange={(e) => updateField('email', e.target.value)} className="text-sm" />
              </>
            ) : (
              <>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" /> {data.phone}
                </p>
                <a
                  href={`mailto:${data.email}`}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" /> {data.email}
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Edit Toggle (admin only) */}
      {editable && (
        <button
          onClick={() => setEditing(!editing)}
          className="w-full flex items-center justify-center gap-2 py-3 border-t border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          {editing ? 'Fertig' : 'Bearbeiten'}
        </button>
      )}
    </div>
  );

  /* ─── PRESENTATION ─────────────────────────────────────── */
  if (isPresentation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-700">
          <ProfileCard />
        </div>
      </div>
    );
  }

  /* ─── ADMIN ────────────────────────────────────────────── */
  return (
    <AppLayout>
      <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-foreground">Meine Vorstellung</h1>
          <p className="text-sm text-muted-foreground">
            Profil für die Kundenpräsentation in der Versicherungsberatung.
          </p>
        </div>
        <ProfileCard editable />
      </div>
    </AppLayout>
  );
}

/* ─── 3-Column Block ──────────────────────────────────────── */
function ColumnBlock({
  title,
  items,
  field,
  editable,
  onItemChange,
}: {
  title: string;
  items: string[];
  field: 'career' | 'facts' | 'hobbies' | 'dreams';
  editable: boolean;
  onItemChange: (field: 'career' | 'facts' | 'hobbies' | 'dreams', idx: number, value: string) => void;
}) {
  return (
    <div className="px-6 py-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((item, i) =>
          editable ? (
            <Input
              key={i}
              value={item}
              onChange={(e) => onItemChange(field, i, e.target.value)}
              className="text-sm"
            />
          ) : (
            <p key={i}>{item}</p>
          )
        )}
      </div>
    </div>
  );
}
