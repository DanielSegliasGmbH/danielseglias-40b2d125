import { useRef, useState, useCallback, type ReactNode } from 'react';
import html2canvas from 'html2canvas';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Share2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ── Types ── */
export interface ShareStat {
  label: string;
  value: string;
}

export interface ShareRank {
  emoji: string;
  name: string;
}

export type ShareTheme = 'dark' | 'light' | 'gold';
export type ShareFormat = 'story' | 'square';

export interface ShareCardGeneratorProps {
  /** Controls dialog visibility */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Card title, e.g. "Mein PeakScore" */
  title: string;
  /** Key stats rendered prominently */
  stats: ShareStat[];
  /** Optional rank badge */
  rank?: ShareRank | null;
  /** Visual theme */
  theme?: ShareTheme;
  /** Aspect ratio: 1080×1920 story or 1080×1080 square */
  format?: ShareFormat;
  /** CTA text at the bottom */
  cta?: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Optional extra node rendered below stats */
  children?: ReactNode;
  /** File name (without extension) */
  fileName?: string;
}

/* ── Theme maps ── */
const THEME_STYLES: Record<ShareTheme, { bg: string; text: string; sub: string; accent: string; statBg: string }> = {
  dark: {
    bg: 'bg-[#1a1a1a]',
    text: 'text-white',
    sub: 'text-white/50',
    accent: 'text-[#8B9B6B]',
    statBg: 'bg-white/[0.06]',
  },
  light: {
    bg: 'bg-white',
    text: 'text-[#1a1a1a]',
    sub: 'text-[#1a1a1a]/50',
    accent: 'text-[#6B7A4F]',
    statBg: 'bg-[#1a1a1a]/[0.04]',
  },
  gold: {
    bg: 'bg-gradient-to-br from-[#C9A84C] via-[#E8D48B] to-[#B8963A]',
    text: 'text-[#2D1F00]',
    sub: 'text-[#2D1F00]/60',
    accent: 'text-[#5C4A1E]',
    statBg: 'bg-[#2D1F00]/[0.06]',
  },
};

export function ShareCardGenerator({
  open,
  onOpenChange,
  title,
  stats,
  rank,
  theme = 'dark',
  format = 'story',
  cta = 'Was ist dein PeakScore?',
  subtitle,
  children,
  fileName = 'finlife-share',
}: ShareCardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const t = THEME_STYLES[theme];
  const isStory = format === 'story';

  /* ── Image generation ── */
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
    } catch {
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  /* ── Share via Web Share API or WhatsApp ── */
  const handleShare = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) { toast.error('Bild konnte nicht erstellt werden'); return; }

    const file = new File([blob], `${fileName}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title });
      } catch {
        /* user cancelled */
      }
    } else {
      // Fallback: WhatsApp with text
      const whatsappText = encodeURIComponent(`${title}\n\n${stats.map(s => `${s.label}: ${s.value}`).join('\n')}\n\nfinlife.ch`);
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank', 'noopener,noreferrer');
    }
  }, [generateImage, fileName, title, stats]);

  /* ── Download as PNG ── */
  const handleDownload = useCallback(async () => {
    const blob = await generateImage();
    if (!blob) { toast.error('Bild konnte nicht erstellt werden'); return; }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.png`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Bild gespeichert');
  }, [generateImage, fileName]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-4 gap-3">
        {/* ── Rendered card ── */}
        <div
          ref={cardRef}
          className={cn(
            'rounded-3xl overflow-hidden relative',
            t.bg, t.text,
            isStory ? 'aspect-[9/16]' : 'aspect-square',
          )}
          style={{ width: '100%', maxWidth: 360 }}
        >
          <div className={cn(
            'flex flex-col justify-between h-full',
            isStory ? 'px-7 py-10' : 'px-6 py-7',
          )}>
            {/* ── Top: brand ── */}
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 opacity-60" />
              <span className={cn('text-[11px] font-medium tracking-wider uppercase', t.sub)}>
                FinLife ✦
              </span>
            </div>

            {/* ── Center: content ── */}
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              {/* Rank badge */}
              {rank && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-5xl">{rank.emoji}</span>
                  <span className={cn('text-xs font-medium', t.sub)}>{rank.name}</span>
                </div>
              )}

              {/* Title */}
              <div className="text-center space-y-1">
                <h2 className={cn(
                  'font-bold tracking-tight',
                  isStory ? 'text-2xl' : 'text-xl',
                )}>
                  {title}
                </h2>
                {subtitle && (
                  <p className={cn('text-sm', t.sub)}>{subtitle}</p>
                )}
              </div>

              {/* Stats grid */}
              {stats.length > 0 && (
                <div className={cn(
                  'w-full grid gap-2.5',
                  stats.length <= 2 ? 'grid-cols-2' :
                  stats.length === 3 ? 'grid-cols-3' :
                  'grid-cols-2',
                )}>
                  {stats.map(stat => (
                    <div
                      key={stat.label}
                      className={cn('rounded-2xl p-3.5 text-center', t.statBg)}
                    >
                      <p className={cn(
                        'font-bold',
                        isStory ? 'text-2xl' : 'text-xl',
                      )}>
                        {stat.value}
                      </p>
                      <p className={cn('text-[10px] mt-0.5 font-medium', t.sub)}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Extra content */}
              {children}
            </div>

            {/* ── Bottom: CTA + domain ── */}
            <div className="text-center space-y-2">
              <p className={cn(
                'font-semibold',
                isStory ? 'text-sm' : 'text-xs',
                t.accent,
              )}>
                {cta}
              </p>
              {/* QR placeholder */}
              <div className={cn(
                'w-12 h-12 mx-auto rounded-lg border-2 flex items-center justify-center text-[8px] font-mono',
                theme === 'dark' ? 'border-white/20 text-white/30' :
                theme === 'light' ? 'border-[#1a1a1a]/15 text-[#1a1a1a]/30' :
                'border-[#2D1F00]/15 text-[#2D1F00]/30',
              )}>
                QR
              </div>
              <p className={cn('text-[10px] font-medium tracking-wide', t.sub)}>
                finlife.ch
              </p>
            </div>
          </div>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex gap-2">
          <Button
            onClick={handleShare}
            disabled={generating}
            className="flex-1 gap-1.5"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            Teilen
          </Button>
          <Button
            onClick={handleDownload}
            disabled={generating}
            variant="outline"
            className="flex-1 gap-1.5"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Standalone export helper (for use without dialog) ── */
export async function captureAndShare(
  element: HTMLElement,
  fileName: string,
  title: string,
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 3, useCORS: true, backgroundColor: null, logging: false,
    });
    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(b => resolve(b), 'image/png', 1),
    );
    if (!blob) { toast.error('Bild konnte nicht erstellt werden'); return; }

    const file = new File([blob], `${fileName}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = file.name; a.click();
      URL.revokeObjectURL(url);
      toast.success('Bild gespeichert');
    }
  } catch {
    toast.error('Teilen fehlgeschlagen');
  }
}
