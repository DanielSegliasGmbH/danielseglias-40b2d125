import { useState, useCallback } from 'react';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Plane, ChevronDown, ChevronUp, CheckCircle2, ExternalLink,
  Landmark, Shield, Heart, Wallet, FileText, Stethoscope,
  ArrowRight, AlertTriangle, Plus, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { toast } from 'sonner';

/* ─── Country Data ─── */
const COUNTRIES = [
  'Deutschland', 'Österreich', 'Portugal', 'Spanien', 'Italien',
  'Frankreich', 'Niederlande', 'UK', 'USA', 'Kanada',
  'Thailand', 'Dubai/VAE', 'Singapur', 'Australien', 'Brasilien',
] as const;

type Country = typeof COUNTRIES[number];

const EU_COUNTRIES: Country[] = [
  'Deutschland', 'Österreich', 'Portugal', 'Spanien', 'Italien',
  'Frankreich', 'Niederlande',
];

function isEU(c: Country) {
  return EU_COUNTRIES.includes(c);
}

/* ─── 6 Knowledge Areas ─── */
interface AreaConfig {
  id: string;
  title: string;
  question: string;
  icon: typeof Landmark;
  content: (country: Country | null) => string[];
}

const AREAS: AreaConfig[] = [
  {
    id: 'saeule3a',
    title: 'Säule 3a',
    question: 'Kann ich meine 3a mitnehmen?',
    icon: Wallet,
    content: (c) => {
      const base = [
        'Die Säule 3a kann beim Wegzug aus der Schweiz als Kapitalleistung bezogen werden.',
        'Es fällt eine Quellensteuer an (Höhe variiert nach Kanton des letzten Wohnsitzes).',
        'Tipp: Gestaffelter Bezug über mehrere 3a-Konten kann die Steuerlast senken.',
      ];
      if (c && isEU(c)) {
        base.push(`${c} (EU): Auszahlung als Kapital möglich. Die Quellensteuer kann unter dem DBA teilweise zurückgefordert werden.`);
      } else if (c) {
        base.push(`${c} (Nicht-EU): Flexiblerer Bezug, aber Doppelbesteuerung prüfen. Quellensteuer-Rückerstattung hängt vom Abkommen ab.`);
      }
      return base;
    },
  },
  {
    id: 'freizuegigkeit',
    title: 'Freizügigkeit',
    question: 'Was passiert mit meiner Freizügigkeit?',
    icon: Shield,
    content: (c) => {
      const base = [
        'Das Freizügigkeitsguthaben muss beim Wegzug auf ein Freizügigkeitskonto oder eine Freizügigkeitspolice übertragen werden.',
        'Du kannst es auch bei einer Freizügigkeitsstiftung belassen, bis du es beziehst.',
      ];
      if (c && isEU(c)) {
        base.push(`${c} (EU): Nur der überobligatorische Teil kann bar ausgezahlt werden. Der obligatorische Teil bleibt bis zum Rentenalter gesperrt.`);
      } else if (c) {
        base.push(`${c} (Nicht-EU): Barauszahlung des gesamten Guthabens grundsätzlich möglich (Quellensteuer beachten).`);
      }
      base.push('Steuerlich: Quellensteuer fällt an. Rückforderung je nach DBA möglich.');
      return base;
    },
  },
  {
    id: 'pensionskasse',
    title: 'Pensionskasse',
    question: 'Was passiert mit dem obligatorischen Teil?',
    icon: Landmark,
    content: (c) => {
      const base = [
        'Der obligatorische Teil muss in der Regel auf eine Freizügigkeitsstiftung übertragen werden.',
        'Der überobligatorische Teil kann unter bestimmten Bedingungen bar ausgezahlt werden.',
        'Eine «Exit-Steuer» (Quellensteuer) fällt auf die Auszahlung an.',
      ];
      if (c && isEU(c)) {
        base.push(`${c} (EU): Der obligatorische Teil bleibt bis zum Rentenalter in der Schweiz gesperrt (EU/EFTA-Regel).`);
      } else if (c) {
        base.push(`${c} (Nicht-EU): Gesamtbezug möglich. Die Quellensteuer variiert je nach Kanton.`);
      }
      return base;
    },
  },
  {
    id: 'ahv',
    title: 'AHV',
    question: 'Meine AHV-Beiträge — verloren?',
    icon: Heart,
    content: (c) => {
      const base = [
        'Nein! Deine AHV-Beiträge bleiben gesichert und gehen nicht verloren.',
        'Die AHV-Rente kann grundsätzlich ins Ausland ausbezahlt werden.',
        'Die Rentenhöhe richtet sich nach deinen Beitragsjahren und deinem durchschnittlichen Einkommen.',
      ];
      if (c && isEU(c)) {
        base.push(`${c}: Als Abkommen-Land werden Versicherungszeiten koordiniert. Du kannst Beitragsjahre in ${c} anrechnen lassen.`);
      } else if (c) {
        base.push(`${c}: Prüfe, ob ein Sozialversicherungsabkommen besteht. Ohne Abkommen kann die Rente trotzdem ausgezahlt werden, aber ohne Koordination der Versicherungszeiten.`);
      }
      return base;
    },
  },
  {
    id: 'steuern',
    title: 'Steuern',
    question: 'Wegzugbesteuerung und Doppelbesteuerung',
    icon: FileText,
    content: (c) => {
      const base = [
        'Beim Wegzug wirst du bis zum Datum der Abmeldung in der Schweiz besteuert (pro-rata Besteuerung).',
        'Eine Wegzugsmeldung bei der Gemeinde ist obligatorisch — sie bestimmt das Steuerdatum.',
        'Prüfe ob ein Doppelbesteuerungsabkommen (DBA) mit deinem Zielland besteht.',
        'Wichtige Dokumente: Abmeldebestätigung, letzte Steuererklärung CH, Ansässigkeitsbescheinigung im neuen Land.',
      ];
      if (c) {
        const hasDBA = ['Deutschland', 'Österreich', 'Portugal', 'Spanien', 'Italien', 'Frankreich', 'Niederlande', 'UK', 'USA', 'Kanada', 'Thailand', 'Singapur', 'Australien', 'Brasilien'].includes(c);
        base.push(hasDBA
          ? `${c}: Ein DBA besteht. Doppelbesteuerung kann vermieden werden.`
          : `${c}: Kein umfassendes DBA — Doppelbesteuerungsrisiko prüfen.`
        );
      }
      return base;
    },
  },
  {
    id: 'krankenkasse',
    title: 'Krankenkasse',
    question: 'Grundversicherung im Ausland',
    icon: Stethoscope,
    content: (c) => {
      const base = [
        'Die Schweizer Grundversicherung (KVG) endet mit der Abmeldung in der Schweiz.',
        'Zusatzversicherungen müssen separat gekündigt werden.',
        'Plane eine Auslandskrankenversicherung oder eine lokale Versicherung im Zielland.',
      ];
      if (c && isEU(c)) {
        base.push(`${c} (EU): Eine Sonderregelung ermöglicht unter Umständen die Weiterführung der KVG (z.B. für Grenzgänger oder Rentner). Prüfe die Optionsrecht-Regelung.`);
      } else if (c) {
        base.push(`${c} (Nicht-EU): Grundversicherung muss gekündigt werden. Schliesse rechtzeitig eine lokale Versicherung oder internationale Krankenversicherung ab.`);
      }
      return base;
    },
  },
];

/* ─── Checklist Data ─── */
interface ChecklistItem {
  phase: string;
  tasks: string[];
}

function generateChecklist(country: Country): ChecklistItem[] {
  const eu = isEU(country);
  return [
    {
      phase: '6 Monate vorher',
      tasks: [
        'Doppelbesteuerungsabkommen mit ' + country + ' recherchieren',
        'Pensionskasse kontaktieren: Optionen für Freizügigkeit klären',
        'Säule 3a: Bezugsmöglichkeiten und Quellensteuer abklären',
        'AHV-Konto: Kontoauszug bestellen (individuelle AHV-Kontoinformation)',
        eu ? `EU-Koordination der Sozialversicherungen prüfen` : 'Sozialversicherungsabkommen mit ' + country + ' prüfen',
        'Professionelle Steuerberatung für Wegzug einholen',
      ],
    },
    {
      phase: '3 Monate vorher',
      tasks: [
        'Krankenkasse informieren und Kündigungsfrist prüfen',
        eu ? `Optionsrecht KVG-Weiterführung prüfen (EU-Sonderregel)` : 'Auslandskrankenversicherung recherchieren und abschliessen',
        'Freizügigkeitsstiftung wählen (falls FZG-Transfer nötig)',
        'Bankkonten: Optionen für Auslandskunden abklären',
        'Letzte Steuererklärung vorbereiten (Unterjahresabrechnung)',
        'Mietvertrag kündigen / Immobilie klären',
      ],
    },
    {
      phase: '1 Monat vorher',
      tasks: [
        'Abmeldung bei der Gemeinde (Wegzugsmeldung)',
        'Abmeldebestätigung aufbewahren',
        'Krankenkasse kündigen (per Wegzugsdatum)',
        'Post-Nachsendeauftrag einrichten',
        'Versicherungen kündigen oder anpassen (Haftpflicht, Hausrat etc.)',
        'Mobilfunkvertrag anpassen',
      ],
    },
    {
      phase: 'Nach Wegzug',
      tasks: [
        'Anmeldung im Zielland (' + country + ')',
        'Ansässigkeitsbescheinigung im neuen Land beantragen (für DBA)',
        'Quellensteuer-Rückerstattung auf Vorsorgebezüge prüfen',
        'AHV: Freiwillige Weiterversicherung prüfen (wenn < 2 Jahre)',
        'Steuervertretung in der Schweiz bestimmen (für Nachsteuerfragen)',
        'Schweizer Bankkonten: Vermögensverwaltung klären',
      ],
    },
  ];
}

/* ─── Components ─── */

function AreaCard({ area, country }: { area: AreaConfig; country: Country | null }) {
  const [open, setOpen] = useState(false);
  const Icon = area.icon;
  const lines = area.content(country);

  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start gap-3 cursor-pointer" onClick={() => setOpen(!open)}>
          <div className="size-9 rounded-xl bg-primary/10 grid place-content-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground">{area.title}</p>
            <p className="text-[11px] text-muted-foreground">{area.question}</p>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
        </div>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 pt-1">
            {lines.map((line, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-1.5 size-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">{line}</p>
              </div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

function ChecklistPhase({
  phase,
  tasks,
  onAddTasks,
}: {
  phase: string;
  tasks: string[];
  onAddTasks: (tasks: string[]) => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[10px]">{phase}</Badge>
          <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1" onClick={() => onAddTasks(tasks)}>
            <Plus className="h-3 w-3" /> Alle als Aufgaben
          </Button>
        </div>
        <div className="space-y-1.5">
          {tasks.map((task, i) => (
            <div key={i} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
              <p className="text-xs text-foreground leading-relaxed">{task}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Main Page ─── */
export default function ClientPortalExpat() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [xpAwarded, setXpAwarded] = useState(false);
  const { user } = useAuth();
  const { awardPoints } = useGamification();
  const navigate = useNavigate();

  const handleStartPlan = useCallback(() => {
    if (!selectedCountry) {
      toast.error('Bitte wähle ein Zielland aus.');
      return;
    }
    setShowChecklist(true);
    if (!xpAwarded) {
      awardAction('tool_used', 50, 'expat-plan');
      setXpAwarded(true);
      toast.success('+50 XP für deinen Expat-Plan!');
    }
  }, [selectedCountry, xpAwarded, awardAction]);

  const handleAddTasks = useCallback(async (tasks: string[]) => {
    if (!user) return;
    const inserts = tasks.map((title) => ({
      user_id: user.id,
      title,
      is_completed: false,
    }));
    const { error } = await supabase.from('client_tasks').insert(inserts);
    if (error) {
      toast.error('Fehler beim Erstellen der Aufgaben.');
    } else {
      toast.success(`${tasks.length} Aufgaben erstellt!`);
    }
  }, [user]);

  const checklist = selectedCountry ? generateChecklist(selectedCountry) : [];

  return (
    <ClientPortalLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <ScreenHeader title="Ins Ausland?" backTo="/app/client-portal" />

        {/* Intro */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Plane className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foreground">Planst du einen Wegzug aus der Schweiz?</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                Auswanderung hat grosse finanzielle Auswirkungen auf deine Vorsorge, Steuern und Versicherungen.
                Hier findest du die wichtigsten Informationen — und kannst dir eine personalisierte Checkliste erstellen.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Country Selector */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">Zielland wählen</p>
            <Select value={selectedCountry || ''} onValueChange={(v) => { setSelectedCountry(v as Country); setShowChecklist(false); }}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Land auswählen…" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>{c} {isEU(c) ? '🇪🇺' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCountry && (
              <p className="text-[10px] text-muted-foreground">
                {isEU(selectedCountry) ? '🇪🇺 EU/EFTA-Land — spezielle Vorsorge-Regeln gelten' : '🌍 Nicht-EU — flexiblere Bezüge, aber Abkommen prüfen'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* 6 Areas */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">Die 6 wichtigsten Bereiche</p>
          {AREAS.map((area) => (
            <AreaCard key={area.id} area={area} country={selectedCountry} />
          ))}
        </div>

        <Separator />

        {/* Checklist Mode */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="text-sm font-bold text-foreground">📋 Persönliche Wegzug-Checkliste</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Wähle oben ein Zielland und generiere deine persönliche Checkliste mit allen wichtigen Schritten — aufgeteilt nach Zeitpunkt.
            </p>
            <Button
              className="w-full"
              disabled={!selectedCountry}
              onClick={handleStartPlan}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {selectedCountry ? `Checkliste für ${selectedCountry} erstellen` : 'Erst Zielland wählen'}
            </Button>
          </CardContent>
        </Card>

        {showChecklist && selectedCountry && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Dein Wegzug nach {selectedCountry}
            </p>
            {checklist.map((phase) => (
              <ChecklistPhase
                key={phase.phase}
                phase={phase.phase}
                tasks={phase.tasks}
                onAddTasks={handleAddTasks}
              />
            ))}
          </motion.div>
        )}

        {/* Expert Hint */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-foreground">Auswanderung ist komplex</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Die Informationen hier dienen der Orientierung. Plane professionelle Beratung ein — besonders bei Steuern und Vorsorge.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 rounded-lg" onClick={() => navigate('/app/client-portal/chat')}>
                  Direktnachricht Berater
                </Button>
                <a href="https://www.swisscommunity.org" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> SwissCommunity
                </a>
                <a href="https://www.aso.ch" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> ASO
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientPortalLayout>
  );
}
