import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMorningBriefScript, useTTSPlayer, useVoiceSettings } from '@/hooks/useVoiceBriefing';
import { Play, Pause, Square, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function MorningBriefCard() {
  const settings = useVoiceSettings();
  const script = useMorningBriefScript();
  const { play, pause, resume, stop, isPlaying, isPaused, progress } = useTTSPlayer();
  const [showTranscript, setShowTranscript] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if morning (before 12)
  const isMorning = new Date().getHours() < 12;

  // Check if already shown today
  const [shownToday, setShownToday] = useState(() => {
    const key = `morning-brief-${new Date().toISOString().split('T')[0]}`;
    return sessionStorage.getItem(key) === 'dismissed';
  });

  if (!settings?.voice_brief_enabled || dismissed || shownToday || !isMorning) return null;

  const handleDismiss = () => {
    const key = `morning-brief-${new Date().toISOString().split('T')[0]}`;
    sessionStorage.setItem(key, 'dismissed');
    stop();
    setDismissed(true);
  };

  const handlePlay = () => {
    if (isPaused) {
      resume();
    } else if (isPlaying) {
      pause();
    } else {
      play(script);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-lg">🎙️</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Guten Morgen, {settings.first_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Dein Morgens-Brief (30 Sekunden) 🔊
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground px-1"
            >
              ✕
            </button>
          </div>

          {/* Waveform & controls */}
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

            {/* Waveform visual */}
            <div className="flex-1 relative h-8 flex items-center gap-[2px]">
              {Array.from({ length: 30 }).map((_, i) => {
                const height = 8 + Math.sin(i * 0.7) * 12 + Math.cos(i * 1.3) * 6;
                const filled = (i / 30) * 100 < progress;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 rounded-full transition-all duration-200",
                      filled ? "bg-primary" : "bg-muted-foreground/20",
                      isPlaying && !isPaused && "animate-pulse"
                    )}
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>

            {isPlaying && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => { stop(); }}
              >
                <Square className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

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
