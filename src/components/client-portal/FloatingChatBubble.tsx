import { useState, useRef } from 'react';
import { MessageCircle, X, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ChatDrawer } from './ChatDrawer';
import { useUnreadCount } from '@/hooks/useChat';
import { cn } from '@/lib/utils';

export function FloatingChatBubble() {
  const { data: unreadCount = 0 } = useUnreadCount();
  const [chatOpen, setChatOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? window.innerWidth - 60 - 16 : 300,
    y: typeof window !== 'undefined' ? window.innerHeight - 80 - 56 - 16 : 300,
  }));
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLButtonElement>(null);
  const hasMoved = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    hasMoved.current = false;
    const rect = bubbleRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    hasMoved.current = true;
    const size = minimized ? 36 : 56;
    const newX = Math.max(0, Math.min(window.innerWidth - size, e.clientX - dragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - 80 - size, e.clientY - dragOffset.current.y));
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    if (!hasMoved.current && !dragging.current) return;
    dragging.current = false;
    if (bubbleRef.current) {
      const size = minimized ? 36 : 56;
      const mid = window.innerWidth / 2;
      setPosition(prev => ({
        x: prev.x + size / 2 < mid ? 12 : window.innerWidth - size - 12,
        y: prev.y,
      }));
    }
  };

  const handleClick = () => {
    if (hasMoved.current) return;
    setChatOpen(true);
  };

  const bubbleSize = minimized ? 'h-9 w-9' : 'h-14 w-14';
  const iconSize = minimized ? 'h-4 w-4' : 'h-6 w-6';

  return (
    <>
      <button
        ref={bubbleRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        className={cn(
          'fixed z-50 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl touch-none select-none lg:hidden',
          bubbleSize
        )}
        style={{
          left: position.x,
          top: position.y,
          transition: dragging.current ? 'none' : 'left 0.2s ease, top 0.2s ease',
        }}
      >
        <MessageCircle className={iconSize} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 text-[10px] flex items-center justify-center bg-destructive text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </button>

      {!minimized && (
        <button
          onClick={(e) => { e.stopPropagation(); setMinimized(true); }}
          className="fixed z-50 h-5 w-5 rounded-full bg-muted text-muted-foreground flex items-center justify-center shadow-sm lg:hidden"
          style={{
            left: position.x + 42,
            top: position.y - 4,
            transition: dragging.current ? 'none' : 'left 0.2s ease, top 0.2s ease',
          }}
        >
          <Minus className="h-3 w-3" />
        </button>
      )}
      {minimized && (
        <button
          onClick={(e) => { e.stopPropagation(); setMinimized(false); }}
          className="fixed z-50 h-4 w-4 rounded-full bg-muted text-muted-foreground flex items-center justify-center shadow-sm lg:hidden"
          style={{
            left: position.x + 28,
            top: position.y - 2,
            transition: dragging.current ? 'none' : 'left 0.2s ease, top 0.2s ease',
          }}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}

      <ChatDrawer open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}
