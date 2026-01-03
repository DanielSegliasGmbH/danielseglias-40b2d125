import { useEffect, useCallback, useState } from 'react';
import { PyramidTopic } from '@/config/pyramidTopicsConfig';
import { TopicState } from '@/hooks/usePyramidState';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { X, Star, MessageSquare, FileX } from 'lucide-react';
import { RelatedTopicDialog } from './RelatedTopicDialog';

interface TopicDetailOverlayProps {
  topic: PyramidTopic | null;
  topicState: TopicState | null;
  isOpen: boolean;
  onClose: () => void;
  onTogglePrioritized: (topicId: string) => void;
  onToggleDiscussed: (topicId: string) => void;
  onToggleWaiver: (topicId: string) => void;
  onToggleRelatedTopicDiscussed: (topicId: string, relatedTopicId: string) => void;
}

export function TopicDetailOverlay({
  topic,
  topicState,
  isOpen,
  onClose,
  onTogglePrioritized,
  onToggleDiscussed,
  onToggleWaiver,
  onToggleRelatedTopicDiscussed,
}: TopicDetailOverlayProps) {
  const isMobile = useIsMobile();
  const [selectedRelatedTopic, setSelectedRelatedTopic] = useState<{
    id: string;
    title: string;
    imageUrl?: string;
  } | null>(null);

  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!topic || !topicState) return null;

  // Check if isImportant from topicState (user-toggled) or fallback to topic.isImportant
  const isImportant = topicState.important;

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Hero Section with Image */}
      <div className="relative h-48 shrink-0">
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
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-800/50 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors z-10"
          aria-label="Schliessen"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Important Badge */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-3 mb-3">
            <h2 id="detail-panel-title" className="text-xl font-semibold text-white">
              {topic.title}
            </h2>
            <Badge 
              className={cn(
                "text-xs",
                isImportant 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "bg-white/20 text-white hover:bg-white/30"
              )}
            >
              {isImportant ? '! Wichtige Themen' : 'Wichtig'}
            </Badge>
          </div>

          {/* Action Buttons in Hero */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTogglePrioritized(topic.id)}
              className={cn(
                "gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:text-white",
                topicState.prioritized && "bg-white/30"
              )}
            >
              <Star className={cn('w-4 h-4', topicState.prioritized && 'fill-current')} />
              <span className="text-xs">{topicState.prioritized ? 'Priorisiert' : 'Bedürfnis priorisieren'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleDiscussed(topic.id)}
              className={cn(
                "gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:text-white",
                topicState.discussed && "bg-white/30"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">{topicState.discussed ? 'Besprochen' : 'Als besprochen markieren'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleWaiver(topic.id)}
              className={cn(
                "gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:text-white",
                topicState.waiver && "bg-red-600/80"
              )}
            >
              <FileX className="w-4 h-4" />
              <span className="text-xs">{topicState.waiver ? 'Verzicht eingetragen' : 'Beratungsverzicht hinzufügen'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* White Content Section */}
      <ScrollArea className="flex-1 bg-white">
        <div className="p-6 space-y-6">
          {/* Why Section */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Warum ist dieses Bedürfnis wichtig?
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {topic.whyText}
            </p>
          </div>

          {/* Related Topics */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Relevante Themen
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {topic.relatedTopics.map((relatedTopic) => {
                const isDiscussed = topicState.relatedTopicsDiscussed[relatedTopic.id] ?? false;
                return (
                  <div
                    key={relatedTopic.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedRelatedTopic(relatedTopic)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedRelatedTopic(relatedTopic);
                      }
                    }}
                    className={cn(
                      'relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer transition-all',
                      'hover:scale-[1.02] hover:shadow-lg',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                    )}
                  >
                    {/* Placeholder Image or Gradient */}
                    {relatedTopic.imageUrl ? (
                      <img
                        src={relatedTopic.imageUrl}
                        alt={relatedTopic.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-200 via-orange-300 to-amber-400" />
                    )}
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Discussed Badge */}
                    {isDiscussed && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2">
                        Angesprochen
                      </Badge>
                    )}
                    
                    {/* Title */}
                    <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-medium">
                      {relatedTopic.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Related Topic Dialog */}
      <RelatedTopicDialog
        topic={selectedRelatedTopic}
        parentTopicId={topic?.id || ''}
        isOpen={!!selectedRelatedTopic}
        onClose={() => setSelectedRelatedTopic(null)}
      />
    </div>
  );

  // Mobile: Use Sheet/Drawer
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{topic.title}</SheetTitle>
          </SheetHeader>
          {panelContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Floating Overlay Panel
  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 transition-all duration-300',
          isOpen
            ? 'bg-black/30 backdrop-blur-sm opacity-100'
            : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-panel-title"
        className={cn(
          'fixed z-50 top-1/2 -translate-y-1/2 right-6',
          'w-[480px] max-h-[85vh]',
          'bg-card border rounded-xl shadow-2xl overflow-hidden',
          'transition-all duration-300 ease-out',
          isOpen
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-8 pointer-events-none'
        )}
      >
        {panelContent}
      </div>
    </>
  );
}
