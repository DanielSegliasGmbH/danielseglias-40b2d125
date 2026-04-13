import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSendMessage } from '@/hooks/useChat';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatStarted: (customerId: string) => void;
}

export function NewChatDialog({ open, onOpenChange, onChatStarted }: NewChatDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const sendMessage = useSendMessage();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['all-customers-for-chat'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .is('deleted_at', null)
        .order('last_name');
      if (error) throw error;
      return data || [];
    },
    enabled: open,
  });

  const filtered = customers.filter(c => {
    const name = `${c.first_name} ${c.last_name}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleSend = async () => {
    if (!selectedCustomerId || !message.trim()) return;
    try {
      await sendMessage.mutateAsync({ customerId: selectedCustomerId, message: message.trim() });
      toast.success('Nachricht gesendet');
      onChatStarted(selectedCustomerId);
      setSearch('');
      setSelectedCustomerId(null);
      setMessage('');
      onOpenChange(false);
    } catch {
      toast.error('Nachricht konnte nicht gesendet werden.');
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Chat starten</DialogTitle>
        </DialogHeader>

        {!selectedCustomerId ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kunde suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-64">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Laden…</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Kunden gefunden</p>
              ) : (
                <div className="space-y-1">
                  {filtered.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors"
                    >
                      {c.first_name} {c.last_name}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                An: {selectedCustomer?.first_name} {selectedCustomer?.last_name}
              </p>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCustomerId(null)}>
                Ändern
              </Button>
            </div>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Nachricht schreiben…"
              className="min-h-[80px] resize-none text-sm"
              autoFocus
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || sendMessage.isPending}
              className="w-full gap-2"
            >
              <Send className="h-4 w-4" />
              Senden
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
