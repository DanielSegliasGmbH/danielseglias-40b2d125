import { useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ChevronRight, BarChart3, PenTool, FileCheck, FileX, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RelatedTopicDialogProps {
  topic: {
    id: string;
    title: string;
    imageUrl?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RelatedTopicDialog({
  topic,
  isOpen,
  onClose,
}: RelatedTopicDialogProps) {
  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!topic) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(90vw,500px)] h-[min(90vw,500px)] max-w-none p-0 gap-0 overflow-hidden rounded-2xl flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>{topic.title}</DialogTitle>
        </DialogHeader>

        {/* Hero Image Section */}
        <div className="relative h-[40%] flex-shrink-0">
          {topic.imageUrl ? (
            <img
              src={topic.imageUrl}
              alt={topic.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors"
            aria-label="Schliessen"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title & CTA Button */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <h2 className="text-white text-2xl font-semibold">
              {topic.title}
            </h2>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Angebot berechnen
            </Button>
          </div>
        </div>

        {/* Content Section */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="bg-white p-6 space-y-6">
            {/* Info Text */}
            <div className="p-4 bg-gray-50 rounded-lg space-y-2">
              <p className="text-sm font-medium text-foreground">
                Würde Ihnen eine Invalidenrente von CHF 2'332 pro Monat ausreichen?
              </p>
              <p className="text-xs text-muted-foreground">
                Dies ist die geleistete Invalidenrente aus der 1. Säule, basierend auf dem Schweizer Medianlohn (CHF 6'665/Monat).
              </p>
              <button className="text-sm text-primary hover:underline font-medium">
                Schnellanalyse Vorsorge starten
              </button>
            </div>

            {/* Risikoübersicht Section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Risikoübersicht
              </h3>
              <div className="space-y-0 divide-y">
                <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">Risikosimulation</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <PenTool className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">Freihandnotizen</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">Checkliste und Kundendokumente</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <button className="mt-2 text-sm text-primary hover:underline font-medium flex items-center gap-1">
                <FileX className="w-4 h-4" />
                Beratungsverzicht hinzufügen
              </button>
            </div>

            {/* Relevante Dokumente Section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Relevante Dokumente
              </h3>
              <button className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors text-left border-t">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Relevante Dokumente</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
