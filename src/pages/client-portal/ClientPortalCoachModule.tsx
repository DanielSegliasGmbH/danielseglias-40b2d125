import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import {
  Brain, Eye, Target, LayoutGrid, Shield, Settings2, TrendingUp, Rocket, Star, RotateCcw,
  MessageSquare, BarChart3, CheckSquare, Lightbulb, Info, Mic, MicOff, Loader2, Copy, Share2,
  Sparkles, Play, BookOpen, Trophy, DollarSign, PiggyBank, CreditCard, ClipboardCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Module definitions ───────────────────────────────────────────

interface ModuleConfig {
  title: string;
  desc: string;
  icon: React.ElementType;
  implemented: boolean;
  questions?: string[];
  questionsTitle?: string;
  questionsSubtitle?: string;
  analyzeLabel?: string;
  reflectionQuestion?: string;
  cathedralMoment?: string[];
  structuredFields?: boolean;
  sectionIcons?: Record<string, React.ElementType>;
}

const moduleData: Record<string, ModuleConfig> = {
  mindset: {
    title: 'Mindset',
    desc: 'In diesem Modul verstehst du, wie du aktuell über Geld denkst – und wie dich diese Denkweise beeinflusst.\n\nZiel ist es, limitierende Überzeugungen zu erkennen und durch stärkere, förderliche Perspektiven zu ersetzen.',
    icon: Brain,
    implemented: true,
    questions: [
      'Was hast du in deiner Kindheit über Geld gelernt?',
      'Wie denkst du heute über Geld? (z. B. Sicherheit, Stress, Freiheit, Risiko)',
      'Was ist aktuell deine grösste Angst im Zusammenhang mit Geld?',
      'Was würdest du gerne finanziell erreichen, traust es dir aber noch nicht ganz zu?',
      'Wenn du ehrlich bist: Was hält dich aktuell am meisten zurück?',
    ],
    questionsTitle: 'Fragen',
    analyzeLabel: 'Antworten analysieren',
    reflectionQuestion: 'Was hast du konkret umgesetzt und was hat sich dadurch verändert?',
    cathedralMoment: [
      'Du arbeitest nicht einfach an deinen Finanzen.',
      'Du baust Schritt für Schritt dein Fundament für ein selbstbestimmtes Leben.',
      'Jede kleine Entscheidung zählt.',
    ],
    sectionIcons: {
      'Deine aktuelle Denkweise': Brain,
      'Was dich aktuell bremst': Shield,
      'Neue Perspektive': Sparkles,
      'Deine nächsten Schritte': CheckSquare,
      'Das hast du erreicht': Star,
      'Warum das wichtig ist': Target,
      'Was das für deine Zukunft bedeutet': TrendingUp,
    },
  },
  klarheit: {
    title: 'Klarheit',
    desc: 'In diesem Modul schaffst du Klarheit über deine aktuelle finanzielle Realität.\n\nDu erkennst, was reinkommt, was rausgeht, was du besitzt, was du schuldest und wo du gerade wirklich stehst.\n\nZiel ist nicht Perfektion, sondern Ehrlichkeit, Übersicht und ein sauberes Fundament für alle nächsten Schritte.',
    icon: Eye,
    implemented: true,
    questions: [
      'Wie viel Geld kommt monatlich ungefähr bei dir rein?',
      'Wie viel Geld gibst du monatlich ungefähr aus?',
      'Hast du aktuell Ersparnisse? Wenn ja, ungefähr wie viel?',
      'Hast du Schulden, offene Verpflichtungen oder laufende finanzielle Belastungen? Wenn ja, welche?',
      'Hast du aktuell einen Überblick über deine Konten, Versicherungen, Vorsorge, Anlagen und Fixkosten?',
      'Was stresst dich aktuell finanziell am meisten?',
      'Was ist aus deiner Sicht gerade der grösste blinde Fleck in deinen Finanzen?',
    ],
    questionsTitle: 'Deine aktuelle Situation',
    questionsSubtitle: 'Beantworte die folgenden Fragen so ehrlich und einfach wie möglich. Es geht nicht um Perfektion, sondern um Klarheit.',
    analyzeLabel: 'Situation analysieren',
    reflectionQuestion: 'Was hast du konkret zusammengetragen, erkannt oder geordnet – und was hat sich dadurch verändert?',
    cathedralMoment: [
      'Du schaffst nicht einfach Ordnung in deinen Finanzen.',
      'Du machst sichtbar, worauf du künftig bewusst aufbauen kannst.',
      'Klarheit ist der Moment, in dem aus Druck wieder Richtung wird.',
    ],
    structuredFields: true,
    sectionIcons: {
      'Deine aktuelle finanzielle Ausgangslage': BarChart3,
      'Was bereits gut ist': Star,
      'Wo dir aktuell Klarheit fehlt': Eye,
      'Deine nächsten Schritte': CheckSquare,
      'Das hast du sichtbar gemacht': Star,
      'Warum das wichtig ist': Target,
      'Was das für deine nächsten Entscheidungen bedeutet': TrendingUp,
    },
  },
  ziele: {
    title: 'Ziele',
    desc: 'In diesem Modul definierst du, was du finanziell wirklich erreichen willst.\n\nNicht vage, nicht irgendwann, sondern so, dass daraus Richtung, Motivation und konkrete Entscheidungen entstehen.\n\nZiel ist es, aus allgemeinen Wünschen klare finanzielle Ziele zu machen, die zu deinem Leben passen.',
    icon: Target,
    implemented: true,
    questions: [
      'Was möchtest du finanziell in den nächsten 12 Monaten erreichen?',
      'Was möchtest du finanziell in den nächsten 3 bis 5 Jahren erreichen?',
      'Was bedeutet finanzielle Freiheit oder finanzielle Sicherheit für dich persönlich?',
      'Welche Wünsche, Träume oder Lebensziele hängen direkt mit Geld zusammen?',
      'Welche finanziellen Ziele sind dir wirklich wichtig – und welche glaubst du nur wichtig finden zu müssen?',
      'Was wäre aktuell dein wichtigstes Ziel, wenn du dich auf nur eines konzentrieren müsstest?',
      'Warum ist dir dieses Ziel wirklich wichtig?',
    ],
    questionsTitle: 'Deine Ziele',
    questionsSubtitle: 'Beantworte die Fragen möglichst ehrlich. Es geht nicht darum, perfekt zu formulieren, sondern sichtbar zu machen, was dir wirklich wichtig ist.',
    analyzeLabel: 'Ziele analysieren',
    reflectionQuestion: 'Was ist dir durch dieses Modul klarer geworden – und was verändert sich dadurch für deine Entscheidungen?',
    cathedralMoment: [
      'Du formulierst nicht einfach Ziele.',
      'Du gibst deiner finanziellen Zukunft Richtung.',
      'Ein klares Ziel macht aus Hoffnung eine Entscheidung.',
    ],
    structuredFields: true,
    sectionIcons: {
      'Was dir wirklich wichtig ist': Star,
      'Welche Ziele noch unscharf sind': Eye,
      'Deine klare Zielrichtung': Target,
      'Deine nächsten Schritte': CheckSquare,
      'Das ist dir klarer geworden': Star,
      'Warum das wichtig ist': Target,
      'Was das für deine nächsten Entscheidungen bedeutet': TrendingUp,
    },
  },
  struktur: { title: 'Struktur', desc: 'Organisiere deine Konten, Budgets und Geldflüsse sauber und nachvollziehbar.', icon: LayoutGrid, implemented: false },
  absicherung: { title: 'Absicherung', desc: 'Stelle sicher, dass die wichtigsten Risiken richtig abgesichert sind.', icon: Shield, implemented: false },
  optimierung: { title: 'Optimierung', desc: 'Prüfe bestehende Verträge, Gebühren und Kosten – und verbessere sie gezielt.', icon: Settings2, implemented: false },
  investment: { title: 'Investment', desc: 'Lerne, dein Geld strategisch und langfristig für dich arbeiten zu lassen.', icon: TrendingUp, implemented: false },
  skalierung: { title: 'Skalierung', desc: 'Bringe deinen Vermögensaufbau auf die nächste Stufe mit fortgeschrittenen Strategien.', icon: Rocket, implemented: false },
  freiheit: { title: 'Freiheit', desc: 'Plane deine finanzielle Unabhängigkeit konkret und realistisch.', icon: Star, implemented: false },
  review: { title: 'Review', desc: 'Überprüfe regelmässig deine Fortschritte und passe deine Strategie an.', icon: RotateCcw, implemented: false },
};

// ─── Speech Input ─────────────────────────────────────────────────

function SpeechInput({
  value,
  onChange,
  placeholder,
  minHeight = '120px',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  minHeight?: string;
}) {
  const { isListening, isSupported, finalText, interimText, startListening, stopListening, resetTranscript } = useSpeechToText();
  const prevFinalRef = useRef('');

  useEffect(() => {
    if (finalText && finalText !== prevFinalRef.current) {
      const newPart = finalText.slice(prevFinalRef.current.length).trim();
      if (newPart) {
        onChange(value ? value.trimEnd() + ' ' + newPart : newPart);
      }
      prevFinalRef.current = finalText;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalText]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      prevFinalRef.current = '';
      resetTranscript();
      startListening();
    }
  };

  return (
    <div className="relative">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-sm pr-14"
        style={{ minHeight }}
      />
      {isSupported && (
        <button
          type="button"
          onClick={handleToggle}
          className={cn(
            'absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all',
            isListening
              ? 'bg-destructive text-destructive-foreground animate-pulse'
              : 'bg-primary/10 text-primary hover:bg-primary/20'
          )}
          title={isListening ? 'Aufnahme stoppen' : 'Spracheingabe starten'}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
      )}
      {isListening && (
        <div className="flex items-center gap-2 mt-2 px-1">
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Aufnahme läuft...{interimText ? ` "${interimText}"` : ' Sprich jetzt.'}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Analysis result renderer ────────────────────────────────────

function AnalysisResult({ content, sectionIcons }: { content: string; sectionIcons?: Record<string, React.ElementType> }) {
  const sections = content.split(/(?=## )/).filter(Boolean);
  const icons = sectionIcons || {};

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => {
        const titleMatch = section.match(/^## (.+)/);
        const title = titleMatch ? titleMatch[1].trim() : '';
        const body = section.replace(/^## .+\n?/, '').trim();
        const SIcon = icons[title] || BarChart3;
        return (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <SIcon className="h-4 w-4 text-primary shrink-0" />
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
              </div>
              <div className="prose prose-sm max-w-none text-foreground/90 [&_p]:mb-2 [&_ol]:pl-4 [&_ul]:pl-4 [&_li]:mb-1">
                <ReactMarkdown>{body}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Structured Fields for Klarheit ──────────────────────────────

interface StructuredData {
  income: string;
  expenses: string;
  savings: string;
  debts: string;
  accounts: string;
  hasBudget: string;
  insuranceOverview: string;
  pensionOverview: string;
}

function StructuredFields({
  data,
  onChange,
}: {
  data: StructuredData;
  onChange: (d: StructuredData) => void;
}) {
  const update = (key: keyof StructuredData, val: string) => onChange({ ...data, [key]: val });

  const fields: { key: keyof StructuredData; label: string; icon: React.ElementType; type: 'text' | 'select'; placeholder?: string; options?: string[] }[] = [
    { key: 'income', label: 'Monatliches Einkommen (ca.)', icon: DollarSign, type: 'text', placeholder: 'z. B. 6000' },
    { key: 'expenses', label: 'Monatliche Ausgaben (ca.)', icon: CreditCard, type: 'text', placeholder: 'z. B. 4500' },
    { key: 'savings', label: 'Erspartes / Notgroschen (ca.)', icon: PiggyBank, type: 'text', placeholder: 'z. B. 15000' },
    { key: 'debts', label: 'Schulden / offene Verpflichtungen', icon: CreditCard, type: 'text', placeholder: 'z. B. Leasing 300/Mt' },
    { key: 'accounts', label: 'Anzahl Konten (ca.)', icon: ClipboardCheck, type: 'text', placeholder: 'z. B. 3' },
    { key: 'hasBudget', label: 'Besteht ein Budget?', icon: ClipboardCheck, type: 'select', options: ['', 'Ja', 'Nein', 'Teilweise'] },
    { key: 'insuranceOverview', label: 'Überblick über Versicherungen?', icon: Shield, type: 'select', options: ['', 'Ja', 'Nein', 'Teilweise'] },
    { key: 'pensionOverview', label: 'Überblick über Vorsorge / Anlagen?', icon: TrendingUp, type: 'select', options: ['', 'Ja', 'Nein', 'Teilweise'] },
  ];

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Schnellübersicht (optional)</h3>
        </div>
        <p className="text-xs text-muted-foreground">Diese Angaben helfen der Auswertung, sind aber nicht zwingend.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(f => (
            <div key={f.key} className="space-y-1">
              <label className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                <f.icon className="h-3 w-3 text-muted-foreground" />
                {f.label}
              </label>
              {f.type === 'select' ? (
                <select
                  value={data[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {f.options?.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                </select>
              ) : (
                <Input
                  value={data[f.key]}
                  onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="text-sm"
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Structured Fields for Ziele ─────────────────────────────────

interface GoalStructuredData {
  shortTerm: string;
  midTerm: string;
  longTerm: string;
  targetAmount: string;
  targetDate: string;
  priority: string;
  category: string;
}

function GoalFields({
  data,
  onChange,
}: {
  data: GoalStructuredData;
  onChange: (d: GoalStructuredData) => void;
}) {
  const update = (key: keyof GoalStructuredData, val: string) => onChange({ ...data, [key]: val });

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Ziele konkretisieren (optional)</h3>
        </div>
        <p className="text-xs text-muted-foreground">Diese Angaben helfen, deine Ziele greifbarer zu machen.</p>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground/80">Kurzfristiges Ziel (0–12 Monate)</label>
            <Input value={data.shortTerm} onChange={e => update('shortTerm', e.target.value)} placeholder="z. B. Notgroschen aufbauen" className="text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground/80">Mittelfristiges Ziel (1–5 Jahre)</label>
            <Input value={data.midTerm} onChange={e => update('midTerm', e.target.value)} placeholder="z. B. Eigenkapital für Wohneigentum" className="text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground/80">Langfristiges Ziel (5+ Jahre)</label>
            <Input value={data.longTerm} onChange={e => update('longTerm', e.target.value)} placeholder="z. B. Finanzielle Unabhängigkeit" className="text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground/80">Wunschbetrag (optional)</label>
              <Input value={data.targetAmount} onChange={e => update('targetAmount', e.target.value)} placeholder="z. B. 50'000" className="text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground/80">Zeithorizont (optional)</label>
              <Input value={data.targetDate} onChange={e => update('targetDate', e.target.value)} placeholder="z. B. 2027" className="text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground/80">Priorität</label>
              <select value={data.priority} onChange={e => update('priority', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">—</option>
                <option value="niedrig">Niedrig</option>
                <option value="mittel">Mittel</option>
                <option value="hoch">Hoch</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground/80">Kategorie</label>
              <select value={data.category} onChange={e => update('category', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <option value="">—</option>
                <option value="Sicherheit">Sicherheit</option>
                <option value="Vermögensaufbau">Vermögensaufbau</option>
                <option value="Wohnen">Wohnen</option>
                <option value="Familie">Familie</option>
                <option value="Freiheit">Freiheit</option>
                <option value="Reisen / Erlebnisse">Reisen / Erlebnisse</option>
                <option value="Business">Business</option>
                <option value="Sonstiges">Sonstiges</option>
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Module Score (Klarheit / Ziele) ────────────────────────────

function ModuleScore({ moduleKey, hasAnswers, hasStructured, hasAnalysis, hasReflection, tasksCreated, goalsSaved }: {
  moduleKey: string;
  hasAnswers: boolean;
  hasStructured: boolean;
  hasAnalysis: boolean;
  hasReflection: boolean;
  tasksCreated: boolean;
  goalsSaved?: boolean;
}) {
  let score = 0;
  if (hasAnswers) score += 20;
  if (hasStructured) score += 15;
  if (hasAnalysis) score += 25;
  if (hasReflection) score += 25;
  if (tasksCreated) score += 15;
  if (goalsSaved) score = Math.min(100, score + 10);

  const isZiele = moduleKey === 'ziele';
  const title = isZiele ? 'Dein Zielfokus' : 'Dein Klarheitsgrad';
  const SIcon = isZiele ? Target : Eye;
  const level = score >= 80 ? (isZiele ? 'Klar' : 'Hoch') : score >= 40 ? (isZiele ? 'Teilweise klar' : 'Mittel') : (isZiele ? 'Unklar' : 'Niedrig');
  const levelColor = score >= 80 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-muted-foreground';
  const hint = isZiele
    ? 'Je klarer deine Ziele, desto leichter werden deine Entscheidungen.'
    : 'Je mehr du beantwortest und umsetzt, desto klarer wird dein Bild.';

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SIcon className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          </div>
          <span className={cn('text-sm font-semibold', levelColor)}>{level}</span>
        </div>
        <Progress value={score} className="h-2" />
        <p className="text-xs text-muted-foreground">{score}% – {hint}</p>
      </CardContent>
    </Card>
  );
}

// ─── Main component ──────────────────────────────────────────────

export default function ClientPortalCoachModule() {
  const { moduleKey } = useParams<{ moduleKey: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const mod = moduleKey ? moduleData[moduleKey] : null;

  // State
  const [answers, setAnswers] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<{ title: string; description: string }[]>([]);
  const [tasksCreated, setTasksCreated] = useState(false);
  const [goalsSaved, setGoalsSaved] = useState(false);
  const [reflectionInput, setReflectionInput] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);
  const [reflectionResult, setReflectionResult] = useState('');
  const [structured, setStructured] = useState<StructuredData>({
    income: '', expenses: '', savings: '', debts: '', accounts: '',
    hasBudget: '', insuranceOverview: '', pensionOverview: '',
  });
  const [goalFields, setGoalFields] = useState<GoalStructuredData>({
    shortTerm: '', midTerm: '', longTerm: '', targetAmount: '', targetDate: '', priority: '', category: '',
  });

  if (!mod) {
    return (
      <ClientPortalLayout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <p className="text-muted-foreground">Modul nicht gefunden.</p>
        </div>
      </ClientPortalLayout>
    );
  }

  const Icon = mod.icon;
  const currentModuleKey = moduleKey || 'mindset';

  // ─── Not yet implemented ─────────────────────────────────────
  if (!mod.implemented) {
    return (
      <ClientPortalLayout>
        <ScreenHeader title={mod.title} showBack backTo="/app/client-portal/coach" />
        <div className="max-w-2xl mx-auto space-y-5 p-4 pb-8">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{mod.title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{mod.desc}</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <Badge variant="muted" className="mb-3 text-[10px]">Kommt bald</Badge>
              <p className="text-sm text-muted-foreground">Dieses Modul wird in einer späteren Version freigeschaltet.</p>
            </CardContent>
          </Card>
        </div>
      </ClientPortalLayout>
    );
  }

  // ─── Handlers ────────────────────────────────────────────────

  const handleAnalyze = async () => {
    if (answers.trim().length < 20) {
      toast({ title: 'Bitte ausführlicher antworten', description: 'Nimm dir einen Moment und beantworte die Fragen.', variant: 'destructive' });
      return;
    }
    setIsAnalyzing(true);
    setAnalysisResult('');
    setExtractedTasks([]);
    setTasksCreated(false);
    try {
      const body: any = { type: 'analysis', userInput: answers, moduleKey: currentModuleKey };
      if (mod.structuredFields && currentModuleKey === 'klarheit') {
        const hasAny = Object.values(structured).some(v => v !== '');
        if (hasAny) body.structuredData = structured;
      }
      if (mod.structuredFields && currentModuleKey === 'ziele') {
        const hasAny = Object.values(goalFields).some(v => v !== '');
        if (hasAny) body.structuredData = goalFields;
      }
      const { data, error } = await supabase.functions.invoke('coach-analyze', { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAnalysisResult(data.content || '');
      if (data.tasks?.length) setExtractedTasks(data.tasks);
    } catch (e: any) {
      toast({ title: 'Fehler bei der Analyse', description: e.message || 'Bitte versuche es erneut.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTasks = () => {
    if (!extractedTasks.length || !user) return;
    try {
      const existingRaw = localStorage.getItem('coach_tasks');
      const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 3);
      const newTasks = extractedTasks.map(t => ({
        id: crypto.randomUUID(),
        title: t.title,
        description: t.description,
        status: 'offen',
        module: currentModuleKey,
        created_at: new Date().toISOString(),
        deadline: deadline.toISOString(),
      }));
      localStorage.setItem('coach_tasks', JSON.stringify([...existing, ...newTasks]));
      setTasksCreated(true);
      toast({ title: 'Aufgaben hinzugefügt', description: 'Die nächsten Schritte wurden zu deinen Aufgaben hinzugefügt.' });
    } catch {
      toast({ title: 'Fehler', description: 'Aufgaben konnten nicht gespeichert werden.', variant: 'destructive' });
    }
  };

  const handleReflection = async () => {
    if (reflectionInput.trim().length < 10) {
      toast({ title: 'Bitte beschreibe kurz, was du umgesetzt hast', variant: 'destructive' });
      return;
    }
    setIsReflecting(true);
    setReflectionResult('');
    try {
      const { data, error } = await supabase.functions.invoke('coach-analyze', {
        body: { type: 'reflection', userInput: reflectionInput, moduleKey: currentModuleKey },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setReflectionResult(data.content || '');
    } catch (e: any) {
      toast({ title: 'Fehler bei der Reflexion', description: e.message || 'Bitte versuche es erneut.', variant: 'destructive' });
    } finally {
      setIsReflecting(false);
    }
  };

  const saveInsight = (source: string) => {
    const content = source === 'reflection' ? reflectionResult : analysisResult;
    if (!content) return;
    const existingRaw = localStorage.getItem('coach_insights');
    const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push({
      id: crypto.randomUUID(),
      title: `${source === 'reflection' ? 'Reflexion' : 'Analyse'} – ${mod.title}`,
      description: content.slice(0, 300).replace(/##\s*/g, '').trim() + '...',
      module: currentModuleKey,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('coach_insights', JSON.stringify(existing));
    toast({ title: 'Erkenntnis gespeichert' });
  };

  const saveAchievement = () => {
    if (!reflectionResult) return;
    const existingRaw = localStorage.getItem('coach_achievements');
    const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
    existing.push({
      id: crypto.randomUUID(),
      title: `${mod.title}-Reflexion abgeschlossen`,
      description: reflectionInput.slice(0, 200).trim(),
      module: currentModuleKey,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('coach_achievements', JSON.stringify(existing));
    toast({ title: 'Erfolg gespeichert! 🎉' });
  };

  const handleCopyTasks = () => {
    const text = extractedTasks.map((t, i) => `${i + 1}. ${t.title}\n   ${t.description}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => toast({ title: 'Aufgaben kopiert' })).catch(() => toast({ title: 'Kopieren fehlgeschlagen', variant: 'destructive' }));
  };

  const handleShare = async () => {
    const text = extractedTasks.map((t, i) => `${i + 1}. ${t.title}: ${t.description}`).join('\n');
    if (navigator.share) {
      try { await navigator.share({ title: `Nächste Schritte – ${mod.title}`, text }); } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text).then(() => toast({ title: 'In die Zwischenablage kopiert' }));
    }
  };

  const hasStructuredData = Object.values(structured).some(v => v !== '');
  const hasGoalFieldData = Object.values(goalFields).some(v => v !== '');

  const saveGoals = () => {
    if (!analysisResult) return;
    const goalsSection = analysisResult.split('## Deine klare Zielrichtung')[1]?.split('## ')[0] || '';
    const items = goalsSection.match(/\d+\.\s+\*\*(.+?)\*\*[:\s]*(.+?)(?=\n\d+\.|\n##|$)/gs) ||
                  goalsSection.match(/\d+\.\s+(.+?)(?=\n\d+\.|\n##|$)/gs) || [];
    const existingRaw = localStorage.getItem('coach_goals');
    const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
    const newGoals = items.slice(0, 5).map((item: string) => {
      const boldMatch = item.match(/\*\*(.+?)\*\*/);
      const title = boldMatch ? boldMatch[1].trim() : item.replace(/^\d+\.\s+/, '').split(/[.!?]/)[0].trim();
      const desc = item.replace(/^\d+\.\s+/, '').replace(/\*\*.*?\*\*[:\s]*/, '').trim();
      return {
        id: crypto.randomUUID(),
        title,
        description: desc,
        category: goalFields.category || '',
        priority: goalFields.priority || 'mittel',
        timeframe: goalFields.targetDate || '',
        module: 'ziele',
        created_at: new Date().toISOString(),
      };
    });
    if (newGoals.length === 0) {
      toast({ title: 'Keine Ziele erkannt', description: 'Die Auswertung enthielt keine extrahierbaren Ziele.', variant: 'destructive' });
      return;
    }
    localStorage.setItem('coach_goals', JSON.stringify([...existing, ...newGoals]));
    setGoalsSaved(true);
    toast({ title: 'Ziele gespeichert', description: 'Die Zielvorschläge wurden zu deinen Zielen hinzugefügt.' });
  };

  // ─── Render ──────────────────────────────────────────────────

  return (
    <ClientPortalLayout>
      <ScreenHeader title={mod.title} showBack backTo="/app/client-portal/coach" />

      <div className="max-w-2xl mx-auto space-y-5 p-4 pb-8">
        {/* Module header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{mod.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed whitespace-pre-line">{mod.desc}</p>
          </div>
        </div>

        {/* Video introduction */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Einführung in dieses Modul</h3>
            </div>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border border-border">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Play className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">Video wird bald verfügbar sein</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Schau dir dieses kurze Video an, bevor du startest.</p>
          </CardContent>
        </Card>

        {/* Module Score (klarheit + ziele) */}
        {(currentModuleKey === 'klarheit' || currentModuleKey === 'ziele') && (
          <ModuleScore
            moduleKey={currentModuleKey}
            hasAnswers={answers.trim().length >= 20}
            hasStructured={currentModuleKey === 'klarheit' ? hasStructuredData : hasGoalFieldData}
            hasAnalysis={!!analysisResult}
            hasReflection={!!reflectionResult}
            tasksCreated={tasksCreated}
            goalsSaved={goalsSaved}
          />
        )}

        {/* Structured fields for klarheit */}
        {mod.structuredFields && currentModuleKey === 'klarheit' && (
          <StructuredFields data={structured} onChange={setStructured} />
        )}

        {/* Structured fields for ziele */}
        {mod.structuredFields && currentModuleKey === 'ziele' && (
          <GoalFields data={goalFields} onChange={setGoalFields} />
        )}

        {/* Questions */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">{mod.questionsTitle || 'Fragen'}</h3>
            </div>
            {mod.questionsSubtitle && (
              <p className="text-sm text-muted-foreground">{mod.questionsSubtitle}</p>
            )}
            <div className="space-y-2">
              {(mod.questions || []).map((q, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs font-semibold text-primary mt-0.5 shrink-0">{i + 1}.</span>
                  <p className="text-sm text-foreground/80">{q}</p>
                </div>
              ))}
            </div>
            <SpeechInput
              value={answers}
              onChange={setAnswers}
              placeholder="Nimm dir einen Moment und beantworte die Fragen oben. Du kannst frei schreiben oder die Spracheingabe nutzen..."
              minHeight="160px"
            />
            <Button onClick={handleAnalyze} disabled={isAnalyzing || answers.trim().length < 20} className="w-full">
              {isAnalyzing ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Wird analysiert...</>
              ) : (
                <><BarChart3 className="h-4 w-4" /> {mod.analyzeLabel || 'Antworten analysieren'}</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Result */}
        {analysisResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Deine Auswertung</h3>
            </div>
            <AnalysisResult content={analysisResult} sectionIcons={mod.sectionIcons} />

            <Button variant="outline" size="sm" onClick={() => saveInsight('analysis')} className="w-full">
              <BookOpen className="h-3.5 w-3.5" /> Als Erkenntnis speichern
            </Button>

            {extractedTasks.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">Aufgaben übernehmen</h3>
                  </div>
                  {!tasksCreated ? (
                    <Button onClick={handleCreateTasks} variant="default" className="w-full">
                      <CheckSquare className="h-4 w-4" /> Aufgaben zu «Meine Aufgaben» hinzufügen
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckSquare className="h-4 w-4" />
                      <span>Die nächsten Schritte wurden zu deinen Aufgaben hinzugefügt.</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyTasks} className="flex-1">
                      <Copy className="h-3.5 w-3.5" /> Kopieren
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
                      <Share2 className="h-3.5 w-3.5" /> Teilen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Reflection */}
        {analysisResult && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Reflexion</h3>
              </div>
              <p className="text-sm text-muted-foreground">{mod.reflectionQuestion}</p>
              <SpeechInput
                value={reflectionInput}
                onChange={setReflectionInput}
                placeholder="Beschreibe, was du umgesetzt hast und wie es sich angefühlt hat..."
                minHeight="100px"
              />
              <Button onClick={handleReflection} disabled={isReflecting || reflectionInput.trim().length < 10} variant="secondary" className="w-full">
                {isReflecting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Reflexion wird ausgewertet...</>
                ) : (
                  <><Lightbulb className="h-4 w-4" /> Reflexion auswerten</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Reflection Result */}
        {reflectionResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Deine Reflexion</h3>
            </div>
            <AnalysisResult content={reflectionResult} sectionIcons={mod.sectionIcons} />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => saveInsight('reflection')} className="flex-1">
                <BookOpen className="h-3.5 w-3.5" /> Als Erkenntnis speichern
              </Button>
              <Button variant="outline" size="sm" onClick={saveAchievement} className="flex-1">
                <Trophy className="h-3.5 w-3.5" /> Als Erfolg speichern
              </Button>
            </div>
          </div>
        )}

        {/* Kathedralen-Moment */}
        {(analysisResult || reflectionResult) && mod.cathedralMoment && (
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-5 text-center space-y-2">
              <Sparkles className="h-5 w-5 text-primary mx-auto" />
              {mod.cathedralMoment.map((line, i) => (
                <p key={i} className={cn(
                  'leading-relaxed',
                  i === 0 ? 'text-sm font-medium text-foreground' :
                  i === mod.cathedralMoment!.length - 1 ? 'text-xs text-muted-foreground mt-1' :
                  'text-sm text-foreground/80'
                )}>{line}</p>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Data hint */}
        <div className="flex items-start gap-2.5 px-1 py-3">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deine sensiblen Dokumente werden nicht in dieser App gespeichert.
            Du kannst externe Links wie Google Drive, Dropbox oder iCloud verwenden.
          </p>
        </div>
      </div>
    </ClientPortalLayout>
  );
}
