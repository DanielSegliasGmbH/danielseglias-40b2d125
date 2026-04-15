import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const fmtCHF = (v: number) =>
  `CHF ${Math.round(v).toLocaleString('de-CH')}`;

const GOAL_DISPLAY: Record<string, { emoji: string; label: string }> = {
  eigenheim: { emoji: '🏠', label: 'Eigenheim kaufen' },
  familie: { emoji: '👨‍👩‍👧‍👦', label: 'Familie gründen' },
  reisen: { emoji: '✈️', label: 'Viel reisen' },
  fruehpension: { emoji: '🔥', label: 'Frühpension' },
  traumauto: { emoji: '🚗', label: 'Traumauto' },
  weiterbildung: { emoji: '📚', label: 'Weiterbildung' },
  unternehmen: { emoji: '💼', label: 'Eigenes Unternehmen' },
  auswandern: { emoji: '🌍', label: 'Auswandern' },
};

interface ShareCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  age: number;
  peakScore: number;
  rankEmoji: string;
  difference: number;
  lifeGoals: string[];
}

export function ShareCard({
  open, onOpenChange,
  age, peakScore, rankEmoji, difference, lifeGoals,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const primaryGoal = lifeGoals[0];
  const goalInfo = primaryGoal ? GOAL_DISPLAY[primaryGoal] : null;

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/png', 1);
      });
    } finally {
      setGenerating(false);
    }
  }, []);

  const handleShare = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) return;

    const file = new File([blob], 'mein-lebensfilm.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Mein FinLife Lebensfilm',
          text: `Mein PeakScore: ${peakScore.toFixed(1)} Monate. Mein Potenzial: ${fmtCHF(difference)}. Was ist deiner?`,
          files: [file],
        });
        toast.success('Geteilt! 🎬');
      } catch {
        // User cancelled
      }
    } else {
      // Fallback: download
      handleDownload(blob);
    }
  }, [generateImage, peakScore, difference]);

  const handleDownload = useCallback(async (existingBlob?: Blob) => {
    const blob = existingBlob || await generateImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mein-lebensfilm.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Bild gespeichert! 📸');
  }, [generateImage]);

  const supportsShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4 gap-4">
        {/* ── Renderable share card ── */}
        <div
          ref={cardRef}
          style={{
            width: 360,
            minHeight: 640,
            background: 'linear-gradient(160deg, #1a1a1a 0%, #2d2d1e 40%, #3d4a2a 100%)',
            borderRadius: 24,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(122,122,103,0.15) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(122,122,103,0.1) 0%, transparent 70%)',
          }} />

          {/* Top: Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>✦</span>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', opacity: 0.7, textTransform: 'uppercase' as const }}>
              Mein Lebensfilm
            </span>
          </div>

          {/* Middle: Stats */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
            {/* Age */}
            <div>
              <p style={{ fontSize: 14, opacity: 0.5, marginBottom: 4 }}>Ich bin</p>
              <p style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
                {age} Jahre alt.
              </p>
            </div>

            {/* PeakScore */}
            <div>
              <p style={{ fontSize: 14, opacity: 0.5, marginBottom: 4 }}>Mein PeakScore</p>
              <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>
                {peakScore.toFixed(1)} Monate {rankEmoji}
              </p>
            </div>

            {/* Potential */}
            <div>
              <p style={{ fontSize: 14, opacity: 0.5, marginBottom: 4 }}>Mein Potenzial</p>
              <p style={{
                fontSize: 28, fontWeight: 800, lineHeight: 1,
                background: 'linear-gradient(90deg, #a8b887, #7a7a67)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {fmtCHF(difference)}
              </p>
            </div>

            {/* Goal */}
            {goalInfo && (
              <div>
                <p style={{ fontSize: 14, opacity: 0.5, marginBottom: 4 }}>Mein Ziel</p>
                <p style={{ fontSize: 22, fontWeight: 700 }}>
                  {goalInfo.emoji} {goalInfo.label}
                </p>
              </div>
            )}
          </div>

          {/* Bottom: CTA */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
            <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Was ist dein PeakScore?
            </p>
            <p style={{ fontSize: 12, opacity: 0.4 }}>
              finlife.ch
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {supportsShare ? (
            <>
              <Button
                className="flex-1 gap-2"
                onClick={handleShare}
                disabled={generating}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                Teilen
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => handleDownload()}
                disabled={generating}
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              className="w-full gap-2"
              onClick={() => handleDownload()}
              disabled={generating}
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Bild speichern
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
