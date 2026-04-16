import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useSundayReflectionScript,
  useTTSPlayer,
  useVoiceSettings,
  useWeeklyAudioReflection,
} from '@/hooks/useVoiceBriefing';
import { Play, Pause, Square, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function SundayReflectionCard() {
  const settings = useVoiceSettings();
  const script = useSundayReflectionScript();
  const { play, pause, resume, stop, isPlaying, isPaused, progress } = useTTSPlayer();
  const { listened, markListened } = useWeeklyAudioReflection();
  const [showTranscript, setShowTranscript] = useState(false);

  const isSunday = new Date().getDay() === 0;

  if (!settings?.voice_weekly_enabled || !isSunday) return null;

  const handlePlay = () => {
    if (isPaused) {
      resume();
    } else if (isPlaying) {
      pause();
    } else {
      play(script, () => {
        if (!listened) markListened.mutate();
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-accent/30 bg-gradient-to-r from-accent/5 to-transparent overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
              <span className="text-lg">🎧</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Deine Sonntag-Reflexion
                </p>
                {!listened && (
                  <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                    Neu
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                2 Minuten für dich 🎧
              </p>
            </div>
          </div>

          {/* Player */}
          <div className="mt-3 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={handlePlay}
            >
              {isPlaying && !isPaused ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 ml-0.5" />
              )}
            </Button>

            {/* Progress bar */}
            <div className="flex-1 h-1.5 rounded-full bg-muted-foreground/15 relative overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">
              {isPlaying ? `${Math.round(progress)}%` : '2:00'}
            </span>

            {isPlaying && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => stop()}
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {listened && (
            <p className="text-[10px] text-muted-foreground mt-2">✅ Angehört</p>
          )}

          {/* Transcript toggle */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showTranscript ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Transkript {showTranscript ? 'ausblenden' : 'anzeigen'}
          </button>

          <AnimatePresence>
            {showTranscript && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed bg-muted/30 rounded-lg p-3">
                  {script}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
