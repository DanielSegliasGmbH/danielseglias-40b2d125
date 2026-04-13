import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  useChatConversations,
  useChatMessages,
  useSendMessage,
  useMarkAsRead,
  type ChatMessage,
} from '@/hooks/useChat';
import { NewChatDialog } from '@/components/admin/NewChatDialog';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

export default function AdminChat() {
  const { user } = useAuth();
  const { data: conversations = [], isLoading } = useChatConversations();
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const isMobile = useIsMobile();

  const selectedConversation = conversations.find((c) => c.participant_id === selectedParticipantId);

  const showList = isMobile ? !selectedParticipantId : true;
  const showChat = isMobile ? !!selectedParticipantId : true;

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Nachrichten</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Direkte Kommunikation mit deinen Benutzern
        </p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)] min-h-[400px]">
        {showList && (
          <Card className={cn('flex flex-col', isMobile ? 'w-full' : 'w-80 shrink-0')}>
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-sm text-foreground">Chats</h2>
              <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setNewChatOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Neu
              </Button>
            </div>
            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="p-4 text-sm text-muted-foreground text-center">Laden…</div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  Noch keine Nachrichten
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.participant_id}
                    onClick={() => setSelectedParticipantId(conv.participant_id)}
                    className={cn(
                      'w-full text-left px-4 py-3 border-b border-border/50 hover:bg-accent transition-colors',
                      selectedParticipantId === conv.participant_id && 'bg-accent'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-foreground truncate">
                        {conv.participant_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {formatDistanceToNow(new Date(conv.last_message_at), {
                          addSuffix: true,
                          locale: de,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate pr-2">
                        {conv.last_message}
                      </p>
                      {conv.unread_count > 0 && (
                        <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] shrink-0">
                          {conv.unread_count}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </Card>
        )}

        {showChat && (
          <Card className="flex-1 flex flex-col">
            {selectedParticipantId ? (
              <AdminChatDetail
                participantId={selectedParticipantId}
                participantName={selectedConversation?.participant_name || ''}
                userId={user!.id}
                onBack={isMobile ? () => setSelectedParticipantId(null) : undefined}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground">
                    Wähle einen Chat aus der Liste
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      <NewChatDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onChatStarted={(pid) => setSelectedParticipantId(pid)}
      />
    </AppLayout>
  );
}

function AdminChatDetail({
  participantId,
  participantName,
  userId,
  onBack,
}: {
  participantId: string;
  participantName: string;
  userId: string;
  onBack?: () => void;
}) {
  const { data: messages = [], isLoading } = useChatMessages(participantId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkAsRead();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markAsRead.mutate(participantId);
  }, [participantId, markAsRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    try {
      await sendMessage.mutateAsync({ participantId, message: text });
      setText('');
    } catch (error) {
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
    <>
      <div className="px-4 py-3 border-b border-border flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h3 className="font-semibold text-sm text-foreground">{participantName}</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">Laden…</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground">Noch keine Nachrichten</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.sender_id === userId ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                msg.sender_id === userId
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              )}>
                <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                <p className={cn('text-[10px] mt-1', msg.sender_id === userId ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
                  {format(new Date(msg.created_at), 'dd.MM. HH:mm', { locale: de })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht schreiben…"
            className="min-h-[40px] max-h-[120px] resize-none text-sm"
            rows={1}
            disabled={sendMessage.isPending}
          />
          <Button size="icon" onClick={handleSend} disabled={!text.trim() || sendMessage.isPending} className="shrink-0 h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
