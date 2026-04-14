import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useChatMessages,
  useSendMessage,
  useMarkAsRead,
  type ChatMessage,
} from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { useTracking } from '@/hooks/useTracking';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDrawer({ open, onOpenChange }: ChatDrawerProps) {
  const { user } = useAuth();
  const participantId = user?.id ?? null;
  const { data: messages = [], isLoading } = useChatMessages(participantId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const { trackEvent } = useTracking();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && participantId) {
      trackEvent({ eventType: 'chat_opened' });
      markAsRead.mutate(participantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, participantId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !participantId) {
      console.warn('[ChatDrawer] Send blocked:', { hasText: !!trimmed, participantId });
      return;
    }
    try {
      console.log('[ChatDrawer] Sending message…', { participantId, length: trimmed.length });
      await sendMessage.mutateAsync({ participantId, message: trimmed });
      console.log('[ChatDrawer] Message sent successfully');
      trackEvent({ eventType: 'chat_message_sent' });
      setText('');
    } catch (error) {
      console.error('[ChatDrawer] Send failed:', error);
      toast.error(
        error instanceof Error ? error.message : 'Nachricht konnte nicht gesendet werden.'
      );
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="flex flex-col p-0 sm:max-w-md w-full h-full"
        side="right"
      >
        {/* Header with close button – padded for status bar */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b border-border bg-card"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' }}
        >
          <div className="flex items-center gap-2 text-base font-semibold">
            <MessageCircle className="h-5 w-5 text-primary" />
            Direkter Chat
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Schliessen</span>
          </Button>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Laden…</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Hier kannst du mir direkt schreiben, wenn du eine Frage hast.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user?.id} />
            ))
          )}
        </div>

        {/* Input bar – sticky bottom with safe area */}
        <div
          className="border-t border-border p-3 bg-card shrink-0"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0.75rem))' }}
        >
          <div className="flex gap-2 items-end">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht schreiben…"
              className="min-h-[40px] max-h-[120px] resize-none text-base sm:text-sm flex-1"
              rows={1}
              disabled={!participantId || sendMessage.isPending}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!participantId || !text.trim() || sendMessage.isPending}
              className="shrink-0 h-10 w-10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
          isOwn
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.message}</p>
        <p
          className={cn(
            'text-[10px] mt-1',
            isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
          )}
        >
          {format(new Date(message.created_at), 'dd.MM. HH:mm', { locale: de })}
        </p>
      </div>
    </div>
  );
}
