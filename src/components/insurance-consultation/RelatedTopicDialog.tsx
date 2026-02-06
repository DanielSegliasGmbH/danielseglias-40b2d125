import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ChevronRight, BarChart3, PenTool, FileCheck, FileX, FileText, ArrowLeft, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InvalidityRiskSimulation } from './InvalidityRiskSimulation';
import { FreehandNotesDialog } from './FreehandNotesDialog';
import { ChecklistDialog } from './ChecklistDialog';
import { SavingsPlan3aComparison } from './SavingsPlan3aComparison';
import { useConsultationState } from '@/hooks/useConsultationState';

interface RelatedTopicDialogProps {
  topic: {
    id: string;
    title: string;
    imageUrl?: string;
  } | null;
  parentTopicId: string;
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = 'main' | 'risikosimulation' | 'notes' | 'checklist' | 'comparison';

export function RelatedTopicDialog({
  topic,
  parentTopicId,
  isOpen,
  onClose,
}: RelatedTopicDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const { topicStates, setRelatedTopicNotes, toggleChecklistItem, getCheckedItems } = useConsultationState();

  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (viewMode !== 'main') {
        setViewMode('main');
      } else {
        onClose();
      }
    }
  }, [onClose, viewMode]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Reset view mode when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setViewMode('main');
    }
  }, [isOpen]);

  if (!topic) return null;

  // Get current notes for this related topic
  const currentNotes = topicStates[parentTopicId]?.relatedTopicNotes?.[topic.id] || '';
  
  // Get checked items for this related topic
  const checkedItems = getCheckedItems(parentTopicId, topic.id);

  // Check if this is the disability topic
  const isDisabilityTopic = topic.id === 'disability';
  
  // Check if this is the savings plan topic
  const isSavingsPlanTopic = topic.id === 'savings_plan';

  // 3a Comparison View
  if (viewMode === 'comparison' && isSavingsPlanTopic) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[min(90vw,750px)] h-[min(90vh,750px)] max-w-none p-0 gap-0 overflow-hidden rounded-2xl flex flex-col bg-background">
          <DialogHeader className="sr-only">
            <DialogTitle>Bank-3a vs. Versicherungs-3a Vergleich</DialogTitle>
          </DialogHeader>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => setViewMode('main')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Sparplan</span>
            </button>
            <h2 className="text-lg font-semibold text-foreground">
              Bank-3a vs. Versicherungs-3a
            </h2>
            <div className="w-16" /> {/* Spacer for centering */}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-6">
              <SavingsPlan3aComparison />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Risikosimulation View
  if (viewMode === 'risikosimulation' && isDisabilityTopic) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[min(90vw,750px)] h-[min(90vw,750px)] max-w-none p-0 gap-0 overflow-hidden rounded-2xl flex flex-col bg-background">
          <DialogHeader className="sr-only">
            <DialogTitle>Invalidität Risikosimulation</DialogTitle>
          </DialogHeader>

          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => setViewMode('main')}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Invalidität</span>
            </button>
            <h2 className="text-lg font-semibold text-foreground">
              Invalidität Risikosimulation
            </h2>
            <button className="text-sm text-primary hover:underline font-medium">
              Alter anzeigen
            </button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-6">
              <InvalidityRiskSimulation />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  // Notes View
  if (viewMode === 'notes') {
    return (
      <FreehandNotesDialog
        isOpen={isOpen}
        onClose={() => setViewMode('main')}
        topicId={topic.id}
        topicTitle={topic.title}
        notes={currentNotes}
        onSaveNotes={(notes) => setRelatedTopicNotes(parentTopicId, topic.id, notes)}
      />
    );
  }

  // Checklist View
  if (viewMode === 'checklist') {
    return (
      <ChecklistDialog
        isOpen={isOpen}
        onClose={() => setViewMode('main')}
        topicId={topic.id}
        topicTitle={topic.title}
        checkedItems={checkedItems}
        onToggleItem={(itemId) => toggleChecklistItem(parentTopicId, topic.id, itemId)}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[min(90vw,750px)] h-[min(90vw,750px)] max-w-none p-0 gap-0 overflow-hidden rounded-2xl flex flex-col">
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
            <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70" />
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
          <div className="bg-card p-6 space-y-6">
            {/* Info Text */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
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

            {/* 3a Comparison (only for savings_plan) */}
            {isSavingsPlanTopic && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Produktvergleich
                </h3>
                <div className="space-y-0 divide-y">
                  <button 
                    onClick={() => setViewMode('comparison')}
                    className="w-full flex items-center justify-between py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">Bank-3a vs. Versicherungs-3a</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {/* Risikoübersicht Section */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Risikoübersicht
              </h3>
              <div className="space-y-0 divide-y">
                <button 
                  onClick={() => isDisabilityTopic && setViewMode('risikosimulation')}
                  className="w-full flex items-center justify-between py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">Risikosimulation</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => setViewMode('notes')}
                  className="w-full flex items-center justify-between py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <PenTool className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">Freihandnotizen</span>
                    {currentNotes && (
                      <Badge variant="secondary" className="text-xs">Notiz vorhanden</Badge>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
                <button 
                  onClick={() => setViewMode('checklist')}
                  className="w-full flex items-center justify-between py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileCheck className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">Checkliste und Kundendokumente</span>
                    {checkedItems.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{checkedItems.length} ausgewählt</Badge>
                    )}
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
              <button className="w-full flex items-center justify-between py-3 hover:bg-muted/50 transition-colors text-left border-t">
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
