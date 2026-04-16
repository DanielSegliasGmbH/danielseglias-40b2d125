import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGamification } from '@/hooks/useGamification';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ArrowRight, ExternalLink, MessageCircle } from 'lucide-react';

type MoodKey = 'entspannt' | 'gut' | 'okay' | 'gestresst' | 'sorgen';

interface MoodOption {
  key: MoodKey;
  emoji: string;
  label: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { key: 'entspannt', emoji: '😊', label: 'Entspannt' },
  { key: 'gut', emoji: '🙂', label: 'Gut, aber es geht mehr' },
  { key: 'okay', emoji: '😐', label: 'Es ist okay' },
  { key: 'gestresst', emoji: '😟', label: 'Etwas gestresst' },
  { key: 'sorgen', emoji: '😰', label: 'Ich mache mir Sorgen' },
];

function getWeekKey(): string {
  const d = new Date();
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function MoodCheckinCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { awardPoints } = useGamification();
  const weekKey = getWeekKey();

  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'pick' | 'response' | 'done'>('pick');

  // Check if enabled
  const { data: settings } = useQuery({
    queryKey: ['mood-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('mood_checkin_enabled, first_name')
        .eq('id', user.id)
        .maybeSingle();
      return {
        enabled: (data as any)?.mood_checkin_enabled ?? true,
        first_name: data?.first_name ?? '',
      };
    },
    enabled: !!user,
  });

  // Check if already done this week
  const { data: existingCheckin } = useQuery({
    queryKey: ['mood-checkin', user?.id, weekKey],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('mood_checkins')
        .select('*')
        .eq('user_id', user.id)
        .eq('week_key', weekKey)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Check for stress pattern (3 consecutive weeks)
  const { data: stressPattern = false } = useQuery({
    queryKey: ['mood-stress-pattern', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('mood_checkins')
        .select('mood, week_key')
        .eq('user_id', user.id)
        .in('mood', ['gestresst', 'sorgen'])
        .order('created_at', { ascending: false })
        .limit(3);
      if (!data || data.length < 3) return false;
      // Check if the 3 most recent are consecutive weeks
      return data.length === 3;
    },
    enabled: !!user,
  });

  const saveMood = useMutation({
    mutationFn: async ({ mood, noteText }: { mood: MoodKey; noteText?: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('mood_checkins').upsert({
        user_id: user.id,
        mood,
        note: noteText || null,
        week_key: weekKey,
      } as any, { onConflict: 'user_id,week_key' });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mood-checkin'] });
      qc.invalidateQueries({ queryKey: ['mood-stress-pattern'] });
    },
  });

  const isMonday = new Date().getDay() === 1;
  const isMorning = new Date().getHours() < 14;

  if (!settings?.enabled || existingCheckin || !isMonday || !isMorning) {
    // Show stress pattern warning even if checkin done
    if (stressPattern && existingCheckin) {
      return <StressPatternCard />;
    }
    return null;
  }

  const handleMoodSelect = async (mood: MoodKey) => {
    setSelectedMood(mood);
    // For moods that need text input, go to response step
    if (mood === 'gut' || mood === 'gestresst') {
      setStep('response');
      return;
    }
    // Save immediately for others
    try {
      await saveMood.mutateAsync({ mood });
      await awardPoints('tool_used', `mood-checkin-${weekKey}`);
      toast.success('+15 XP – Für deine Ehrlichkeit ✨');
      setStep('response');
    } catch {
      toast.error('Fehler beim Speichern');
    }
  };

  const handleSubmitNote = async () => {
    if (!selectedMood) return;
    try {
      await saveMood.mutateAsync({ mood: selectedMood, noteText: note });
      await awardPoints('tool_used', `mood-checkin-${weekKey}`);
      toast.success('+15 XP – Für deine Ehrlichkeit ✨');
      setStep('done');
    } catch {
      toast.error('Fehler beim Speichern');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20 overflow-hidden">
        <CardContent className="p-4">
          <AnimatePresence mode="wait">
            {step === 'pick' && (
              <motion.div
                key="pick"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm font-semibold text-foreground mb-1">
                  Wie geht es dir heute mit deinen Finanzen?
                </p>
                <p className="text-xs text-muted-foreground mb-3">Montag Mood-Check</p>
                <div className="flex flex-col gap-1.5">
                  {MOOD_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => handleMoodSelect(opt.key)}
                      className={cn(
                        "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all border",
                        "border-border bg-background hover:border-primary/40 hover:bg-primary/5",
                        "active:scale-[0.99]"
                      )}
                    >
                      <span className="mr-2">{opt.emoji}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'response' && selectedMood && (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <MoodResponse
                  mood={selectedMood}
                  note={note}
                  onNoteChange={setNote}
                  onSubmitNote={handleSubmitNote}
                  onNavigate={(path) => navigate(path)}
                  saving={saveMood.isPending}
                />
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-3"
              >
                <p className="text-2xl mb-1">
                  {MOOD_OPTIONS.find(m => m.key === selectedMood)?.emoji}
                </p>
                <p className="text-sm font-medium text-foreground">Danke für deine Ehrlichkeit.</p>
                <p className="text-xs text-muted-foreground">+15 XP</p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MoodResponse({
  mood,
  note,
  onNoteChange,
  onSubmitNote,
  onNavigate,
  saving,
}: {
  mood: MoodKey;
  note: string;
  onNoteChange: (v: string) => void;
  onSubmitNote: () => void;
  onNavigate: (path: string) => void;
  saving: boolean;
}) {
  switch (mood) {
    case 'entspannt':
      return (
        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            Schön. Das ist der Zustand, den wir halten wollen.{'\n'}
            Vielleicht Zeit, die nächste Stufe anzugehen?
          </p>
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => onNavigate('/app/client-portal/coach')}
          >
            Zum Finanz-Coach <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      );

    case 'gut':
      return (
        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            Dieser Wunsch nach mehr ist dein Motor.{'\n'}
            Was genau würde es «besser» machen?
          </p>
          <Input
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder="Deine Gedanken..."
            className="h-10 text-sm"
            maxLength={500}
            autoFocus
          />
          <Button
            size="sm"
            className="w-full"
            onClick={onSubmitNote}
            disabled={saving}
          >
            Speichern
          </Button>
        </div>
      );

    case 'okay':
      return (
        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            Okay ist ein Anfang. Aber okay macht nicht frei.{'\n'}
            Wo stehst du heute wirklich?
          </p>
          <Button
            size="sm"
            className="w-full gap-2"
            onClick={() => onNavigate('/app/client-portal/peak-score')}
          >
            PeakScore prüfen <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      );

    case 'gestresst':
      return (
        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            Stress ist ein Signal. Nicht eine Schwäche.{'\n'}
            Lass uns herausfinden, was dich belastet.
          </p>
          <Input
            value={note}
            onChange={e => onNoteChange(e.target.value)}
            placeholder="Was beschäftigt dich gerade?"
            className="h-10 text-sm"
            maxLength={500}
            autoFocus
          />
          <Button
            size="sm"
            className="w-full"
            onClick={onSubmitNote}
            disabled={saving}
          >
            Speichern & Hilfe finden
          </Button>
        </div>
      );

    case 'sorgen':
      return (
        <div className="space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            Das ist mutig, dass du das teilst.{'\n'}
            Finanzstress ist real und weit verbreitet. Du bist nicht allein.
          </p>
          <div className="flex flex-col gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-left h-auto py-2.5"
              onClick={() => onNavigate('/app/client-portal/tools')}
            >
              <span>🛡️</span>
              <span className="text-xs">Ich will einen Notfall-Plan</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-left h-auto py-2.5"
              onClick={() => onNavigate('/app/client-portal/chat')}
            >
              <MessageCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Ich will mit jemandem reden</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 text-left h-auto py-2.5"
              onClick={() => window.open('https://www.caritas.ch/hilfe-finden/fachstelle-finden/schuldenberatung.html', '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Ich brauche professionelle Hilfe</span>
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Caritas Schuldenberatung · Pro Mente Sana · Budget-Beratung Schweiz
          </p>
        </div>
      );

    default:
      return null;
  }
}

function StressPatternCard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">
            Du hast in letzter Zeit oft Stress gemeldet.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Es gibt Hilfe — und das Annehmen davon ist stark.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => navigate('/app/client-portal/chat')}
            >
              Mit Daniel reden
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => window.open('https://www.promentesana.ch', '_blank', 'noopener,noreferrer')}
            >
              Hilfe finden
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
