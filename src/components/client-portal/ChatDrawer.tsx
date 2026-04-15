import { useState, useRef, useEffect, useCallback } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle, X, RotateCcw, Loader2 } from 'lucide-react';
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

interface FailedMessage {
  id: string;
  text: string;
}

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
  const [failedMessages, setFailedMessages] = useState<FailedMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    if (open && participantId) {
      trackEvent({ eventType: 'chat_opened' });
      markAsRead.mutate(participantId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, participantId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const doSend = async (msgText: string, failedId?: string) => {
    if (!msgText.trim() || !participantId) return;
    try {
      await sendMessage.mutateAsync({ participantId, message: msgText.trim() });
      trackEvent({ eventType: 'chat_message_sent' });
      if (failedId) {
        setFailedMessages((prev) => prev.filter((f) => f.id !== failedId));
      }
    } catch (error) {
      console.error('[ChatDrawer] Send failed:', error);
      if (!failedId) {
        setFailedMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), text: msgText.trim() },
        ]);
      }
      toast.error(
        error instanceof Error ? error.message : 'Nachricht konnte nicht gesendet werden.'
      );
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText('');
    await doSend(trimmed);
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
        {/* Header */}
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
            <div className="flex items-center justify-center h-full gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nachrichten werden geladen…</p>
            </div>
          ) : messages.length === 0 && failedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <MessageCircle className="h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Hier kannst du mir direkt schreiben, wenn du eine Frage hast.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} isOwn={msg.sender_id === user?.id} />
              ))}
              {failedMessages.map((fm) => (
                <FailedBubble
                  key={fm.id}
                  text={fm.text}
                  onRetry={() => doSend(fm.text, fm.id)}
                  onDiscard={() => setFailedMessages((prev) => prev.filter((f) => f.id !== fm.id))}
                />
              ))}
            </>
          )}
        </div>

        {/* Input bar – always visible, safe-area aware */}
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
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
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
          {format(new Date(message.created_at), 'HH:mm', { locale: de })}
        </p>
      </div>
    </div>
  );
}

function FailedBubble({
  text,
  onRetry,
  onDiscard,
}: {
  text: string;
  onRetry: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%]">
        <div className="rounded-2xl rounded-br-md px-4 py-2.5 text-sm bg-destructive/20 text-destructive-foreground border border-destructive/30">
          <p className="whitespace-pre-wrap break-words">{text}</p>
          <p className="text-[10px] mt-1 text-destructive">Senden fehlgeschlagen</p>
        </div>
        <div className="flex gap-2 mt-1 justify-end">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={onRetry}>
            <RotateCcw className="h-3 w-3" />
            Erneut senden
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={onDiscard}>
            Verwerfen
          </Button>
        </div>
      </div>
    </div>
  );
}
