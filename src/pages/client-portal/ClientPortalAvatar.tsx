import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { usePeakScore } from '@/hooks/usePeakScore';
import { useFinanzType } from '@/hooks/useFinanzType';
import { useMetaProfile } from '@/hooks/useMetaProfile';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Sparkles, User, Star } from 'lucide-react';
import { toast } from 'sonner';

const NAME_CATEGORIES = [
  {
    key: 'zweitname',
    label: 'Dein Zweitname',
    description: 'Wenn du einen Zweitnamen hast, nutze ihn. Es ist wie ein Spitzname für dein stärkeres Ich.',
    placeholder: 'z.B. Alexander, Marie...',
  },
  {
    key: 'vorbild_familie',
    label: 'Ein Vorbild aus deiner Familie',
    description: 'Der Name einer Person, auf die du aufschaust. Grossvater, Grossmutter, Elternteil, Geschwister die es geschafft haben.',
    placeholder: 'z.B. Grossvater Hans...',
  },
  {
    key: 'mentor',
    label: 'Ein Mentor oder Vorbild',
    description: 'Eine Person die du bewunderst. Real oder historisch. Ihr Name wird dein Antrieb.',
    placeholder: 'z.B. Warren, Marie Curie...',
  },
  {
    key: 'eigener_name',
    label: 'Ein eigener Helden-Name',
    description: 'Erfinde einen Namen. Dein Alter-Ego. Ein Titel. Sei mutig.',
    placeholder: 'z.B. Der Souverän, Free Spirit...',
  },
] as const;

export default function ClientPortalAvatar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { saveAvatar } = useUserAvatar();
  const { score, rank } = usePeakScore();
  const { info: finanzTypeInfo } = useFinanzType();
  const { metaProfile } = useMetaProfile();

  const { data: userProfile } = useQuery({
    queryKey: ['profile-basic', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from('profiles').select('first_name, age').eq('id', user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [futureName, setFutureName] = useState('');
  const [futureAge, setFutureAge] = useState(50);
  const [definingMoment, setDefiningMoment] = useState('');

  const currentAge = userProfile?.age || metaProfile?.age || 30;
  const currentName = userProfile?.first_name || 'Du';
  const minFutureAge = currentAge + 10;
  const maxFutureAge = Math.max(minFutureAge + 40, 95);

  const canProceedStep2 = futureName.trim().length >= 2 && selectedCategory && definingMoment.trim().length >= 3;

  const handleComplete = async () => {
    if (!futureName.trim() || !selectedCategory) return;
    try {
      await saveAvatar.mutateAsync({
        future_self_name: futureName.trim(),
        future_self_name_category: selectedCategory,
        future_self_age: futureAge,
        future_self_defining_moment: definingMoment.trim(),
      });

      // Award +100 XP
      if (user) {
        await supabase.from('gamification_actions').insert({
          user_id: user.id,
          action_type: 'avatar_created',
          action_ref: 'avatar',
          points_awarded: 100,
        });
      }

      toast.success('Du hast deinen Helden gefunden! +100 XP 🎉');
      setStep(3);
    } catch {
      toast.error('Fehler beim Speichern.');
    }
  };

  return (
    <ClientPortalLayout>
      <ScreenHeader title="Dein Avatar" backTo="/app/client-portal" />

      <div className="px-4 pb-8 max-w-lg mx-auto space-y-6">
        {/* Progress */}
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                s <= step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Dein Ich</h2>
                <p className="text-muted-foreground">Das bist du heute.</p>
              </div>

              {/* Current Self Avatar */}
              <Card className="border-2 border-border">
                <CardContent className="pt-6 flex flex-col items-center space-y-4">
                  <div className="w-28 h-28 rounded-full bg-muted border-4 border-border flex items-center justify-center">
                    <User className="w-14 h-14 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{currentName}</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary">{currentAge} Jahre</Badge>
                    <Badge variant="secondary">{rank.emoji} {rank.name}</Badge>
                    {finanzTypeInfo && (
                      <Badge variant="secondary">{finanzTypeInfo.emoji} {finanzTypeInfo.shortTitle}</Badge>
                    )}
                  </div>
                  {score !== null && (
                    <p className="text-sm text-muted-foreground">PeakScore: {score}</p>
                  )}
                </CardContent>
              </Card>

              <Button className="w-full" size="lg" onClick={() => setStep(2)}>
                Weiter zu deinem Zukunfts-Ich <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Dein Zukunfts-Ich</h2>
                <p className="text-muted-foreground">Wer willst du werden?</p>
              </div>

              {/* Name Category Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Wie soll dein Zukunfts-Ich heissen?</Label>
                <div className="grid gap-3">
                  {NAME_CATEGORIES.map(cat => (
                    <Card
                      key={cat.key}
                      className={cn(
                        'cursor-pointer transition-all border-2',
                        selectedCategory === cat.key
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      )}
                      onClick={() => setSelectedCategory(cat.key)}
                    >
                      <CardContent className="p-4 space-y-2">
                        <p className="font-semibold text-foreground">{cat.label}</p>
                        <p className="text-xs text-muted-foreground">{cat.description}</p>
                        {selectedCategory === cat.key && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                          >
                            <Input
                              value={futureName}
                              onChange={e => setFutureName(e.target.value)}
                              placeholder={cat.placeholder}
                              className="mt-2"
                              autoFocus
                              maxLength={50}
                            />
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Future Age */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Wie alt wird dein Zukunfts-Ich sein?
                </Label>
                <div className="text-center">
                  <span className="text-3xl font-bold text-primary">{futureAge}</span>
                  <span className="text-muted-foreground ml-1">Jahre</span>
                </div>
                <Slider
                  value={[futureAge]}
                  onValueChange={v => setFutureAge(v[0])}
                  min={minFutureAge}
                  max={maxFutureAge}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{minFutureAge}</span>
                  <span>{maxFutureAge}</span>
                </div>
              </div>

              {/* Defining Moment */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Was ist sein/ihr definierender Moment?
                </Label>
                <p className="text-xs text-muted-foreground">
                  „Ich habe ____________ geschafft."
                </p>
                <Input
                  value={definingMoment}
                  onChange={e => setDefiningMoment(e.target.value)}
                  placeholder="z.B. finanzielle Freiheit, ein Haus für meine Familie gebaut..."
                  maxLength={200}
                />
                <div className="flex flex-wrap gap-2">
                  {['finanzielle Freiheit', 'ein Haus für meine Familie gebaut', 'mit 50 die Arbeit nach Lust gewählt'].map(ex => (
                    <Badge
                      key={ex}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 text-xs"
                      onClick={() => setDefiningMoment(ex)}
                    >
                      {ex}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  disabled={!canProceedStep2 || saveAvatar.isPending}
                  onClick={handleComplete}
                >
                  {saveAvatar.isPending ? 'Speichern...' : `${futureName || 'Zukunfts-Ich'} annehmen`}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Dein Zukunfts-Ich</h2>
                <p className="text-muted-foreground">wird vorgestellt</p>
              </div>

              {/* Future Self – Glowing Avatar */}
              <Card className="border-2 border-amber-500/40 bg-gradient-to-b from-amber-500/10 via-yellow-500/5 to-transparent overflow-hidden">
                <CardContent className="pt-6 flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl scale-125" />
                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border-4 border-amber-500/50 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Star className="w-16 h-16 text-amber-500" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{futureName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentName}s Zukunfts-Ich, {futureAge}
                  </p>
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30">
                    🌟 Souverän
                  </Badge>
                  <p className="text-center text-sm text-foreground/80 italic">
                    „Ich habe {definingMoment} geschafft."
                  </p>
                </CardContent>
              </Card>

              <p className="text-center text-sm text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">{futureName}</span> existiert noch nicht. 
                Aber jede Entscheidung, die du ab heute triffst, bringt dich näher zu ihm.
              </p>

              <div className="text-center">
                <p className="text-lg font-bold text-foreground">Das wirst du.</p>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate('/app/client-portal', { replace: true })}
              >
                <Sparkles className="mr-2 w-4 h-4" /> Los geht's
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ClientPortalLayout>
  );
}
