import { useEffect, useCallback } from 'react';
import { PyramidItem } from '@/config/insurancePyramidConfig';
import { DetailPanel } from './DetailPanel';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface DetailPanelOverlayProps {
  item: PyramidItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTogglePrioritized: (itemId: string) => void;
  onToggleDiscussed: (itemId: string) => void;
  onAddWaiver: (itemId: string) => void;
  onToggleTopicDiscussed: (itemId: string, topicId: string) => void;
}

export function DetailPanelOverlay({
  item,
  isOpen,
  onClose,
  onTogglePrioritized,
  onToggleDiscussed,
  onAddWaiver,
  onToggleTopicDiscussed,
}: DetailPanelOverlayProps) {
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

  if (!item) return null;

  // Mobile: Use Sheet/Drawer
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{item.title}</SheetTitle>
          </SheetHeader>
          <DetailPanel
            item={item}
            onClose={onClose}
            onTogglePrioritized={onTogglePrioritized}
            onToggleDiscussed={onToggleDiscussed}
            onAddWaiver={onAddWaiver}
            onToggleTopicDiscussed={onToggleTopicDiscussed}
            showCloseButton
          />
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
          'w-[460px] max-h-[85vh]',
          'bg-card border rounded-xl shadow-2xl overflow-hidden',
          'transition-all duration-300 ease-out',
          isOpen 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-8 pointer-events-none'
        )}
      >
        <DetailPanel
          item={item}
          onClose={onClose}
          onTogglePrioritized={onTogglePrioritized}
          onToggleDiscussed={onToggleDiscussed}
          onAddWaiver={onAddWaiver}
          onToggleTopicDiscussed={onToggleTopicDiscussed}
          showCloseButton
        />
      </div>
    </>
  );
}
