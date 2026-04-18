import { useState, useCallback } from 'react';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { PageHeader } from '@/components/client-portal/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Shield, Lock, FileText, Heart, Scale, Briefcase,
  CheckCircle2, ExternalLink, ChevronDown, ChevronUp,
  Award, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useLastPlan,
  useOptInLastPlan,
  useDismissLastPlan,
  useUpdateLastPlanSection,
  calculateCompleteness,
} from '@/hooks/useLastPlan';

/* ── Section Definitions ── */

const VORSORGEAUFTRAG_ITEMS = [
  { key: 'person_bestimmt', label: 'Vorsorgebevollmächtigte Person bestimmt' },
  { key: 'person_informiert', label: 'Bevollmächtigte Person informiert' },
  { key: 'notar_besucht', label: 'Notar besucht / Dokument bei KESB hinterlegt' },
  { key: 'ersatz_bestimmt', label: 'Ersatz-Bevollmächtigte bestimmt' },
];

const PATIENTENVERFUEGUNG_ITEMS = [
  { key: 'wuensche_formuliert', label: 'Wünsche formuliert' },
  { key: 'dokument_ausgefuellt', label: 'Dokument ausgefüllt' },
  { key: 'hausarzt_hinterlegt', label: 'Bei Hausarzt hinterlegt' },
  { key: 'vertrauensperson_informiert', label: 'Vertrauensperson informiert' },
  { key: 'standort_dokumentiert', label: 'Standort Original dokumentiert' },
];

const TESTAMENT_ITEMS = [
  { key: 'beguenstigte_bestimmt', label: 'Begünstigte bestimmt' },
  { key: 'testament_geschrieben', label: 'Testament eigenhändig geschrieben / notariell' },
  { key: 'original_sicher', label: 'Original bei sicherem Ort' },
  { key: 'vertrauenspersonen_informiert', label: 'Vertrauenspersonen informiert' },
];

const TODESFALL_ITEMS = [
  { key: 'id_standort', label: 'Identitätskarte/Pass — Standort dokumentiert' },
  { key: 'krankenkasse', label: 'Krankenkassen-Police — Standort dokumentiert' },
  { key: 'lebensversicherung', label: 'Lebensversicherung-Policen — Standort dokumentiert' },
  { key: 'bank_zugaenge', label: 'Bank-Zugänge — sicher dokumentiert' },
  { key: 'hypothek', label: 'Hypothek-Dokumente — Standort dokumentiert' },
  { key: 'arbeitgeber', label: 'Arbeitgeber-Kontakt — dokumentiert' },
  { key: 'versicherungen', label: 'Wichtige Versicherungen — Standort dokumentiert' },
  { key: 'pensionskasse', label: 'Pensionskasse-Auszug — Standort dokumentiert' },
  { key: 'steuerunterlagen', label: 'Steuerunterlagen — Standort dokumentiert' },
  { key: 'digitale_zugaenge', label: 'Digitale Zugänge — dokumentiert' },
];

const BEGUENSTIGTE_ITEMS = [
  { key: 'versicherungen_aktuell', label: 'Begünstigte auf allen Versicherungen aktuell' },
];

interface SectionConfig {
  id: string;
  title: string;
  icon: typeof FileText;
  info: string;
  explanation: string;
  items: { key: string; label: string }[];
  links?: { label: string; url: string }[];
}

const SECTIONS: SectionConfig[] = [
  {
    id: 'vorsorgeauftrag',
    title: 'Vorsorgeauftrag',
    icon: FileText,
    info: 'Was passiert, wenn du urteilsunfähig wirst — wer entscheidet?',
    explanation: 'Mit einem Vorsorgeauftrag bestimmst du, wer für dich entscheidet, wenn du es nicht mehr selbst kannst. Ohne dieses Dokument entscheidet die KESB (Kindes- und Erwachsenenschutzbehörde) — oft nicht im Sinne deiner Familie. Der Vorsorgeauftrag muss handschriftlich verfasst oder notariell beurkundet und bei der KESB hinterlegt werden.',
    items: VORSORGEAUFTRAG_ITEMS,
    links: [
      { label: 'KESB Info', url: 'https://www.kesb.ch' },
    ],
  },
  {
    id: 'patientenverfuegung',
    title: 'Patientenverfügung',
    icon: Heart,
    info: 'Was willst du, wenn du keine medizinische Entscheidung mehr selbst treffen kannst?',
    explanation: 'Die Patientenverfügung hält fest, welche medizinischen Massnahmen du wünschst und welche nicht — z.B. bei Bewusstlosigkeit oder im Endstadium einer Krankheit. Sie entlastet deine Angehörigen von schweren Entscheidungen. Die FMH bietet eine anerkannte Vorlage an.',
    items: PATIENTENVERFUEGUNG_ITEMS,
    links: [
      { label: 'FMH Vorlage', url: 'https://www.fmh.ch/themen/patientenverfuegung.cfm' },
    ],
  },
  {
    id: 'testament',
    title: 'Testament / Erbschaft',
    icon: Scale,
    info: 'Wer erbt was — und wem darfst du überhaupt was vererben?',
    explanation: 'In der Schweiz gilt das Pflichtteilsrecht: Ehepartner und Kinder haben Anspruch auf einen festen Anteil. Nur der Rest ist frei verfügbar. Ohne Testament gilt die gesetzliche Erbfolge — nicht-eheliche Partner erben nichts. Ein handschriftliches Testament ist gültig (datiert, unterschrieben, komplett handgeschrieben). Erbschaftssteuern variieren stark nach Kanton.',
    items: TESTAMENT_ITEMS,
  },
  {
    id: 'todesfall_dokumente',
    title: 'Todesfall-Dokumente',
    icon: Briefcase,
    info: 'Was deine Angehörigen brauchen werden.',
    explanation: 'Im Todesfall brauchen Angehörige sofort Zugang zu vielen Dokumenten — unter hohem emotionalen Stress. Wenn diese Dokumente organisiert und ihr Standort dokumentiert ist, erleichtert das die Situation enorm. Dokumentiere hier den Standort (nicht die Inhalte selbst).',
    items: TODESFALL_ITEMS,
  },
  {
    id: 'beguenstigte',
    title: 'Begünstigte auf Versicherungen',
    icon: Users,
    info: 'Sind deine Begünstigten auf allen Policen aktuell?',
    explanation: 'Nach Heirat, Scheidung oder der Geburt von Kindern müssen Begünstigte auf Lebensversicherungen, Pensionskasse und Säule 3a aktualisiert werden. Alte Einträge können dazu führen, dass Ex-Partner oder nicht gewünschte Personen Leistungen erhalten.',
    items: BEGUENSTIGTE_ITEMS,
  },
];

/* ── Intro Modal ── */
function IntroModal({ onOptIn, onDismiss }: { onOptIn: () => void; onDismiss: () => void }) {
  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-base">Dieses Thema ist unbequem. Aber wichtig.</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Niemand redet gerne über den Tod oder Invalidität. Aber wer es nicht plant,
            überlässt seine Familie einem Chaos — emotional und finanziell.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hier kannst du Schritt für Schritt deine Vorsorge dokumentieren.
            Nicht alles auf einmal. In deinem Tempo.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Button className="w-full" onClick={onOptIn}>Ich will beginnen</Button>
            <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={onDismiss}>
              Später
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Checklist Section ── */
function ChecklistSection({
  config,
  data,
  onUpdate,
}: {
  config: SectionConfig;
  data: Record<string, boolean>;
  onUpdate: (key: string, value: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const Icon = config.icon;
  const completedCount = config.items.filter((item) => data[item.key]).length;
  const totalCount = config.items.length;
  const isComplete = completedCount === totalCount;

  return (
    <Card className={cn(isComplete && 'border-success/30 bg-success/5')}>
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={cn(
            'size-9 rounded-xl grid place-content-center shrink-0',
            isComplete ? 'bg-success/10' : 'bg-primary/10'
          )}>
            {isComplete ? (
              <CheckCircle2 className="h-4 w-4 text-success" />
            ) : (
              <Icon className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-foreground">{config.title}</p>
              <Badge variant="outline" className="text-[9px]">
                {completedCount}/{totalCount}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              {config.info}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          )}
        </div>

        {/* Expanded Content */}
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3"
          >
            {/* Explanation */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {config.explanation}
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2">
              {config.items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className={cn(
                    'text-xs flex-1 pr-3',
                    data[item.key] ? 'text-muted-foreground line-through' : 'text-foreground'
                  )}>
                    {item.label}
                  </span>
                  <Switch
                    checked={data[item.key] || false}
                    onCheckedChange={(checked) => onUpdate(item.key, checked)}
                  />
                </div>
              ))}
            </div>

            {/* Links */}
            {config.links && config.links.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {config.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Progress Ring ── */
function ProgressRing({ percentage }: { percentage: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="80" height="80" className="-rotate-90">
        <circle
          cx="40" cy="40" r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="40" cy="40" r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-sm font-bold text-foreground">{percentage}%</span>
    </div>
  );
}

/* ── Main Page ── */
export default function ClientPortalLastPlan() {
  const { data: plan, isLoading } = useLastPlan();
  const optIn = useOptInLastPlan();
  const dismiss = useDismissLastPlan();
  const updateSection = useUpdateLastPlanSection();

  const showIntro = !isLoading && (!plan || (!plan.opted_in && (!plan.dismissed_until || new Date(plan.dismissed_until) < new Date())));
  const hasOptedIn = plan?.opted_in;

  const completeness = calculateCompleteness(plan);

  const handleCheckUpdate = useCallback(
    (sectionId: string, currentData: Record<string, boolean>, key: string, value: boolean) => {
      const updated = { ...currentData, [key]: value };
      updateSection.mutate({ section: sectionId, data: updated });
    },
    [updateSection],
  );

  if (isLoading) {
    return (
      <ClientPortalLayout>
        <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </ClientPortalLayout>
    );
  }

  return (
    <ClientPortalLayout>
      <div className="w-full max-w-2xl mx-auto space-y-5 overflow-x-hidden px-1">
        <PageHeader title="📋 Mein letzter Plan" subtitle="Deine zuletzt erstellte Strategie" />

        {/* Privacy Notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Diese Daten sind privat. Nur du siehst sie. Keine Information wird mit
              Dritten geteilt — auch nicht mit deinem Berater.
            </p>
          </CardContent>
        </Card>

        {/* Intro Modal */}
        {showIntro && (
          <IntroModal
            onOptIn={() => optIn.mutate()}
            onDismiss={() => dismiss.mutate()}
          />
        )}

        {hasOptedIn && (
          <>
            {/* Progress Overview */}
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <ProgressRing percentage={completeness} />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Vorsorge-Vollständigkeit
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {completeness === 100
                      ? 'Alles dokumentiert. Du hast vorgesorgt. 🎉'
                      : 'Schritt für Schritt. In deinem Tempo.'}
                  </p>
                  {completeness === 100 && (
                    <Badge className="mt-1 text-[9px] bg-success/10 text-success border-success/30" variant="outline">
                      <Award className="h-3 w-3 mr-1" /> Verantwortungsvoll
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            {SECTIONS.map((section) => {
              const sectionData = (plan?.[section.id as keyof typeof plan] || {}) as Record<string, boolean>;
              return (
                <ChecklistSection
                  key={section.id}
                  config={section}
                  data={sectionData}
                  onUpdate={(key, value) =>
                    handleCheckUpdate(section.id, sectionData, key, value)
                  }
                />
              );
            })}
          </>
        )}

        {!hasOptedIn && !showIntro && (
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <Shield className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">
                Du hast dieses Thema verschoben. Wir erinnern dich in 3 Monaten.
              </p>
              <Button variant="outline" size="sm" onClick={() => optIn.mutate()}>
                Doch jetzt starten
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ClientPortalLayout>
  );
}
