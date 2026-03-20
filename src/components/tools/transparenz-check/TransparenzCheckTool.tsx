import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ShieldCheck,
  Coins,
  Target,
  ExternalLink,
  ChevronDown,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ────────── Types ────────── */
interface SourceLink {
  label: string;
  url: string;
}

interface TransparenzState {
  registrationUrl: string;
  qualificationUrl: string;
  compensationText: string;
  workPrinciples: string[];
  sources: SourceLink[];
}

const DEFAULT_STATE: TransparenzState = {
  registrationUrl: 'https://www.finma.ch/de/bewilligung/versicherungsvermittler/',
  qualificationUrl: 'https://www.cicero.ch/',
  compensationText:
    'Meine Vergütung basiert auf einem transparenten Honorarmodell. Du weisst immer im Voraus, welche Kosten entstehen – ohne versteckte Provisionen.',
  workPrinciples: [
    'Analyse statt Verkauf',
    'Individuelle Strategie statt Standardprodukte',
    'Du triffst die Entscheidung',
    'Fokus auf langfristigen Mehrwert',
  ],
  sources: [
    { label: 'FINMA Vermittlerregister', url: 'https://www.finma.ch/de/bewilligung/versicherungsvermittler/' },
    { label: 'Cicero Qualifikationsplattform', url: 'https://www.cicero.ch/' },
    { label: 'IAF Vermögensberater', url: 'https://www.iaf.ch/' },
  ],
};

/* ────────── Comparison data ────────── */
const comparisonRows = [
  {
    label: 'Vergütung',
    classic: 'Provisionen von Produktanbietern',
    transparent: 'Transparentes Honorar, im Voraus bekannt',
  },
  {
    label: 'Interessenskonflikt',
    classic: 'Möglicher Anreiz, teure Produkte zu empfehlen',
    transparent: 'Kein Anreiz – Empfehlung basiert auf Analyse',
  },
  {
    label: 'Kostenstruktur',
    classic: 'Oft unklar, versteckt in Produktkosten',
    transparent: 'Klar aufgeschlüsselt und nachvollziehbar',
  },
  {
    label: 'Nachvollziehbarkeit',
    classic: 'Schwer überprüfbar',
    transparent: 'Jederzeit überprüfbar und belegbar',
  },
];

/* ────────── Props ────────── */
interface Props {
  mode?: 'public' | 'internal';
}

/* ────────── Component ────────── */
export function TransparenzCheckTool({ mode = 'public' }: Props) {
  const isAdmin = mode === 'internal';
  const [state, setState] = useState<TransparenzState>(DEFAULT_STATE);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const update = (patch: Partial<TransparenzState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const addSource = () =>
    update({ sources: [...state.sources, { label: '', url: '' }] });

  const removeSource = (i: number) =>
    update({ sources: state.sources.filter((_, idx) => idx !== i) });

  const updateSource = (i: number, field: 'label' | 'url', value: string) => {
    const next = [...state.sources];
    next[i] = { ...next[i], [field]: value };
    update({ sources: next });
  };

  /* ────── Section wrapper with stagger animation ────── */
  const Section = ({
    icon: Icon,
    title,
    children,
    delay = 0,
  }: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
    delay?: number;
  }) => (
    <Card
      className="overflow-hidden animate-in fade-in slide-in-from-bottom-3"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both', animationDuration: '600ms' }}
    >
      <CardContent className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {children}
      </CardContent>
    </Card>
  );

  /* ══════════════════ ADMIN VIEW ══════════════════ */
  if (isAdmin) {
    return (
      <div className="space-y-6">
        {/* Registration links */}
        <Section icon={ShieldCheck} title="Offizielle Nachweise" delay={0}>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Registrierungslink</label>
              <Input
                value={state.registrationUrl}
                onChange={(e) => update({ registrationUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Qualifikationslink</label>
              <Input
                value={state.qualificationUrl}
                onChange={(e) => update({ qualificationUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        </Section>

        {/* Compensation */}
        <Section icon={Coins} title="Vergütungsmodell" delay={80}>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Beschreibung</label>
            <Textarea
              value={state.compensationText}
              onChange={(e) => update({ compensationText: e.target.value })}
              rows={3}
            />
          </div>
        </Section>

        {/* Work principles */}
        <Section icon={Target} title="Arbeitsweise" delay={160}>
          <div className="space-y-2">
            {state.workPrinciples.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={p}
                  onChange={(e) => {
                    const next = [...state.workPrinciples];
                    next[i] = e.target.value;
                    update({ workPrinciples: next });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => update({ workPrinciples: state.workPrinciples.filter((_, idx) => idx !== i) })}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => update({ workPrinciples: [...state.workPrinciples, ''] })}>
              <Plus className="h-4 w-4 mr-1" /> Punkt hinzufügen
            </Button>
          </div>
        </Section>

        {/* Sources */}
        <Section icon={Search} title="Quellen" delay={240}>
          <div className="space-y-3">
            {state.sources.map((s, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    value={s.label}
                    onChange={(e) => updateSource(i, 'label', e.target.value)}
                    placeholder="Bezeichnung"
                  />
                  <Input
                    value={s.url}
                    onChange={(e) => updateSource(i, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <Button variant="ghost" size="icon" className="mt-1 shrink-0" onClick={() => removeSource(i)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSource}>
              <Plus className="h-4 w-4 mr-1" /> Quelle hinzufügen
            </Button>
          </div>
        </Section>
      </div>
    );
  }

  /* ══════════════════ PUBLIC / PRESENTATION VIEW ══════════════════ */
  return (
    <div className="space-y-6">
      {/* ── 1. Registration & Verification ── */}
      <Section icon={ShieldCheck} title="Offizielle Nachweise" delay={0}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ich bin offiziell registriert und zertifiziert. Alle Angaben sind öffentlich überprüfbar.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(state.registrationUrl, '_blank', 'noopener,noreferrer')}
          >
            <ShieldCheck className="h-4 w-4" />
            Eintrag überprüfen
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(state.qualificationUrl, '_blank', 'noopener,noreferrer')}
          >
            <CheckCircle2 className="h-4 w-4" />
            Qualifikationen ansehen
            <ExternalLink className="h-3 w-3 opacity-50" />
          </Button>
        </div>
        <Badge variant="muted" className="mt-2 gap-1.5">
          <ShieldCheck className="h-3 w-3" /> Verifiziert
        </Badge>
      </Section>

      {/* ── 2. Compensation model ── */}
      <Section icon={Coins} title="So verdiene ich Geld" delay={120}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {state.compensationText}
        </p>

        {/* Comparison table */}
        <div className="mt-4 overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground w-[30%]" />
                <th className="text-left py-2 px-4 font-medium text-muted-foreground">Klassische Beratung</th>
                <th className="text-left py-2 px-4 font-medium text-foreground bg-primary/5 rounded-t-lg">
                  Transparente Beratung
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <tr key={i}>
                  <td className="py-2.5 pr-4 font-medium text-foreground text-xs">{row.label}</td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs border-t border-border/50">
                    {row.classic}
                  </td>
                  <td
                    className={cn(
                      'py-2.5 px-4 text-foreground text-xs bg-primary/5 border-t border-border/50',
                      i === comparisonRows.length - 1 && 'rounded-b-lg'
                    )}
                  >
                    {row.transparent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ── 3. Work principles ── */}
      <Section icon={Target} title="Wie ich arbeite" delay={240}>
        <ul className="space-y-3">
          {state.workPrinciples.map((p, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-foreground animate-in fade-in slide-in-from-left-2"
              style={{ animationDelay: `${300 + i * 80}ms`, animationFillMode: 'both', animationDuration: '500ms' }}
            >
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* ── 4. Self-verify ── */}
      <Section icon={Search} title="Du kannst alles selbst prüfen" delay={360}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Alle Angaben sind belegbar und überprüfbar. Hier findest du die wichtigsten Quellen.
        </p>

        <Collapsible open={sourcesOpen} onOpenChange={setSourcesOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 mt-2 text-muted-foreground hover:text-foreground">
              <ChevronDown
                className={cn('h-4 w-4 transition-transform duration-200', sourcesOpen && 'rotate-180')}
              />
              Quellen ansehen
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-2">
            {state.sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-scale-8 hover:text-scale-10 transition-colors group"
              >
                <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
                {s.label}
              </a>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </Section>
    </div>
  );
}
