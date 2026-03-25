import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useChatMessages,
  useClientCustomerId,
  useSendMessage,
  useMarkAsRead,
  type ChatMessage,
} from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDrawer({ open, onOpenChange }: ChatDrawerProps) {
  const { user } = useAuth();
  const { data: customerId } = useClientCustomerId();
  const { data: messages = [], isLoading } = useChatMessages(customerId ?? null);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Mark messages as read when opening
  useEffect(() => {
    if (open && customerId) {
      markAsRead.mutate(customerId);
    }
  }, [open, customerId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !customerId) return;
    sendMessage.mutate({ customerId, message: text });
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col p-0 sm:max-w-md w-full">
        <SheetHeader className="px-4 py-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base">
            <MessageCircle className="h-5 w-5 text-primary" />
            Direkter Chat
          </SheetTitle>
        </SheetHeader>

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

        {/* Input area */}
        <div className="border-t border-border p-3 bg-card">
          <div className="flex gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nachricht schreiben…"
              className="min-h-[40px] max-h-[120px] resize-none text-sm"
              rows={1}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!text.trim() || sendMessage.isPending}
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
