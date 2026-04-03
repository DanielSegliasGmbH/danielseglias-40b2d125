import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import {
  Brain, Eye, Target, LayoutGrid, Shield, Settings2, TrendingUp, Rocket, Star, RotateCcw,
  MessageSquare, BarChart3, CheckSquare, Lightbulb, Info, Mic, MicOff, Loader2, Copy, Share2,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const moduleData: Record<string, { title: string; desc: string; icon: React.ElementType; implemented: boolean }> = {
  mindset: {
    title: 'Mindset',
    desc: 'In diesem Modul verstehst du, wie du aktuell über Geld denkst – und wie dich diese Denkweise beeinflusst.\n\nZiel ist es, limitierende Überzeugungen zu erkennen und durch stärkere, förderliche Perspektiven zu ersetzen.',
    icon: Brain,
    implemented: true,
  },
  klarheit: { title: 'Klarheit', desc: 'Verschaffe dir einen vollständigen Überblick über deine aktuelle finanzielle Situation.', icon: Eye, implemented: false },
  ziele: { title: 'Ziele', desc: 'Definiere klare, messbare Finanzziele mit konkreten Zeitrahmen.', icon: Target, implemented: false },
  struktur: { title: 'Struktur', desc: 'Organisiere deine Konten, Budgets und Geldflüsse sauber und nachvollziehbar.', icon: LayoutGrid, implemented: false },
  absicherung: { title: 'Absicherung', desc: 'Stelle sicher, dass die wichtigsten Risiken richtig abgesichert sind.', icon: Shield, implemented: false },
  optimierung: { title: 'Optimierung', desc: 'Prüfe bestehende Verträge, Gebühren und Kosten – und verbessere sie gezielt.', icon: Settings2, implemented: false },
  investment: { title: 'Investment', desc: 'Lerne, dein Geld strategisch und langfristig für dich arbeiten zu lassen.', icon: TrendingUp, implemented: false },
  skalierung: { title: 'Skalierung', desc: 'Bringe deinen Vermögensaufbau auf die nächste Stufe mit fortgeschrittenen Strategien.', icon: Rocket, implemented: false },
  freiheit: { title: 'Freiheit', desc: 'Plane deine finanzielle Unabhängigkeit konkret und realistisch.', icon: Star, implemented: false },
  review: { title: 'Review', desc: 'Überprüfe regelmässig deine Fortschritte und passe deine Strategie an.', icon: RotateCcw, implemented: false },
};

const mindsetQuestions = [
  'Was hast du in deiner Kindheit über Geld gelernt?',
  'Wie denkst du heute über Geld? (z. B. Sicherheit, Stress, Freiheit, Risiko)',
  'Was ist aktuell deine grösste Angst im Zusammenhang mit Geld?',
  'Was würdest du gerne finanziell erreichen, traust es dir aber noch nicht ganz zu?',
  'Wenn du ehrlich bist: Was hält dich aktuell am meisten zurück?',
];

// Speech input component
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
  const { isListening, isSupported, transcript, startListening, stopListening, resetTranscript } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      onChange(value ? value + ' ' + transcript : transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      resetTranscript();
    } else {
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
          <span className="text-xs text-muted-foreground">Aufnahme läuft... Sprich jetzt.</span>
        </div>
      )}
    </div>
  );
}

// Markdown result section
function AnalysisResult({ content }: { content: string }) {
  const sections = content.split(/(?=## )/).filter(Boolean);

  const sectionIcons: Record<string, React.ElementType> = {
    'Deine aktuelle Denkweise': Brain,
    'Was dich aktuell bremst': Shield,
    'Neue Perspektive': Sparkles,
    'Deine nächsten Schritte': CheckSquare,
    'Das hast du erreicht': Star,
    'Warum das wichtig ist': Target,
    'Was das für deine Zukunft bedeutet': TrendingUp,
  };

  return (
    <div className="space-y-3">
      {sections.map((section, idx) => {
        const titleMatch = section.match(/^## (.+)/);
        const title = titleMatch ? titleMatch[1].trim() : '';
        const body = section.replace(/^## .+\n?/, '').trim();
        const SIcon = sectionIcons[title] || BarChart3;

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

export default function ClientPortalCoachModule() {
  const { moduleKey } = useParams<{ moduleKey: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const mod = moduleKey ? moduleData[moduleKey] : null;

  // Mindset state
  const [answers, setAnswers] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<{ title: string; description: string }[]>([]);
  const [tasksCreated, setTasksCreated] = useState(false);

  // Reflection state
  const [reflectionInput, setReflectionInput] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);
  const [reflectionResult, setReflectionResult] = useState('');

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

  // Not yet implemented modules
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
              <p className="text-sm text-muted-foreground">
                Dieses Modul wird in einer späteren Version freigeschaltet.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Starte zuerst mit dem Modul «Mindset», um dein Fundament zu legen.
              </p>
            </CardContent>
          </Card>
        </div>
      </ClientPortalLayout>
    );
  }

  // --- MINDSET MODULE ---

  const handleAnalyze = async () => {
    if (answers.trim().length < 20) {
      toast({ title: 'Bitte ausführlicher antworten', description: 'Nimm dir einen Moment und schreibe zu den Fragen, was dir spontan einfällt.', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult('');
    setExtractedTasks([]);
    setTasksCreated(false);

    try {
      const { data, error } = await supabase.functions.invoke('coach-analyze', {
        body: { type: 'analysis', userInput: answers },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAnalysisResult(data.content || '');
      if (data.tasks?.length) {
        setExtractedTasks(data.tasks);
      }
    } catch (e: any) {
      toast({ title: 'Fehler bei der Analyse', description: e.message || 'Bitte versuche es erneut.', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateTasks = async () => {
    if (!extractedTasks.length || !user) return;

    // The client portal tasks page currently shows an empty state.
    // We store coach tasks in localStorage for now as a simple V1 approach,
    // since the tasks table requires a case_id which clients don't have.
    try {
      const existingRaw = localStorage.getItem('coach_tasks');
      const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];

      const newTasks = extractedTasks.map((t) => ({
        id: crypto.randomUUID(),
        title: t.title,
        description: t.description,
        status: 'offen',
        module: 'mindset',
        created_at: new Date().toISOString(),
      }));

      localStorage.setItem('coach_tasks', JSON.stringify([...existing, ...newTasks]));
      setTasksCreated(true);
      toast({ title: 'Aufgaben hinzugefügt', description: 'Die nächsten Schritte wurden zu deinen Aufgaben hinzugefügt.' });
    } catch (e) {
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
        body: { type: 'reflection', userInput: reflectionInput },
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

  const handleCopyTasks = () => {
    const text = extractedTasks.map((t, i) => `${i + 1}. ${t.title}\n   ${t.description}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast({ title: 'Aufgaben kopiert' });
  };

  const handleShare = async () => {
    const text = extractedTasks.map((t, i) => `${i + 1}. ${t.title}: ${t.description}`).join('\n');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meine nächsten Schritte – Finanz-Coach', text });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: 'In die Zwischenablage kopiert' });
    }
  };

  return (
    <ClientPortalLayout>
      <ScreenHeader title="Mindset" showBack backTo="/app/client-portal/coach" />

      <div className="max-w-2xl mx-auto space-y-5 p-4 pb-8">
        {/* Module header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Mindset</h2>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed whitespace-pre-line">{mod.desc}</p>
          </div>
        </div>

        {/* Questions */}
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Fragen</h3>
            </div>

            <div className="space-y-2">
              {mindsetQuestions.map((q, i) => (
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

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || answers.trim().length < 20}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Wird analysiert...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4" />
                  Antworten analysieren
                </>
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
            <AnalysisResult content={analysisResult} />

            {/* Task actions */}
            {extractedTasks.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm text-foreground">Aufgaben übernehmen</h3>
                  </div>

                  {!tasksCreated ? (
                    <Button onClick={handleCreateTasks} variant="default" className="w-full">
                      <CheckSquare className="h-4 w-4" />
                      Aufgaben zu «Meine Aufgaben» hinzufügen
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <CheckSquare className="h-4 w-4" />
                      <span>Die nächsten Schritte wurden zu deinen Aufgaben hinzugefügt.</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyTasks} className="flex-1">
                      <Copy className="h-3.5 w-3.5" />
                      Kopieren
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
                      <Share2 className="h-3.5 w-3.5" />
                      Teilen
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

              <p className="text-sm text-muted-foreground">
                Was hast du konkret umgesetzt und was hat sich dadurch verändert?
              </p>

              <SpeechInput
                value={reflectionInput}
                onChange={setReflectionInput}
                placeholder="Beschreibe, was du umgesetzt hast und wie es sich angefühlt hat..."
                minHeight="100px"
              />

              <Button
                onClick={handleReflection}
                disabled={isReflecting || reflectionInput.trim().length < 10}
                variant="secondary"
                className="w-full"
              >
                {isReflecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reflexion wird ausgewertet...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4" />
                    Reflexion auswerten
                  </>
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
            <AnalysisResult content={reflectionResult} />
          </div>
        )}

        {/* Kathedralen-Moment */}
        {(analysisResult || reflectionResult) && (
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-5 text-center space-y-2">
              <Sparkles className="h-5 w-5 text-primary mx-auto" />
              <p className="text-sm font-medium text-foreground leading-relaxed">
                Du arbeitest nicht einfach an deinen Finanzen.
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Du baust Schritt für Schritt dein Fundament für ein selbstbestimmtes Leben.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Jede kleine Entscheidung zählt.
              </p>
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
