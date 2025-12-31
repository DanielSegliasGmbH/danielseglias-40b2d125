import { useEffect, useCallback } from 'react';
import { PyramidTopic } from '@/config/pyramidTopicsConfig';
import { TopicState } from '@/hooks/usePyramidState';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { X, Star, MessageSquare, FileX, Check } from 'lucide-react';

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

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 id="detail-panel-title" className="text-xl font-semibold">
              {topic.title}
            </h2>
            {topic.isImportant && (
              <Badge variant="destructive" className="text-xs">
                Wichtig
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted transition-colors"
          aria-label="Schliessen"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={topicState.prioritized ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTogglePrioritized(topic.id)}
              className="gap-2"
            >
              <Star className={cn('w-4 h-4', topicState.prioritized && 'fill-current')} />
              {topicState.prioritized ? 'Priorisiert' : 'Priorisieren'}
            </Button>
            <Button
              variant={topicState.discussed ? 'default' : 'outline'}
              size="sm"
              onClick={() => onToggleDiscussed(topic.id)}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {topicState.discussed ? 'Besprochen' : 'Als besprochen markieren'}
            </Button>
            <Button
              variant={topicState.waiver ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => onToggleWaiver(topic.id)}
              className="gap-2"
            >
              <FileX className="w-4 h-4" />
              {topicState.waiver ? 'Verzicht eingetragen' : 'Beratungsverzicht'}
            </Button>
          </div>

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
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Relevante Themen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topic.relatedTopics.map((relatedTopic) => {
                const isDiscussed = topicState.relatedTopicsDiscussed[relatedTopic.id] ?? false;
                return (
                  <Card
                    key={relatedTopic.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onToggleRelatedTopicDiscussed(topic.id, relatedTopic.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleRelatedTopicDiscussed(topic.id, relatedTopic.id);
                      }
                    }}
                    className={cn(
                      'p-3 cursor-pointer transition-all',
                      'hover:shadow-md hover:border-primary/50',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      isDiscussed && 'bg-primary/5 border-primary/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{relatedTopic.title}</span>
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center transition-colors',
                          isDiscussed
                            ? 'bg-primary text-primary-foreground'
                            : 'border-2 border-muted-foreground/30'
                        )}
                      >
                        {isDiscussed && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
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
