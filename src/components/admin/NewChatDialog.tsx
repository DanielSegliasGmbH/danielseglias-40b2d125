import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSendMessage } from '@/hooks/useChat';
import { toast } from 'sonner';

interface NewChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChatStarted: (participantId: string) => void;
}

export function NewChatDialog({ open, onOpenChange, onChatStarted }: NewChatDialogProps) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; role: string; customerId?: string } | null>(null);
  const [message, setMessage] = useState('');
  const sendMessage = useSendMessage();

  // Fetch all users from profiles + their roles and customer links
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-users-for-chat'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .order('last_name');
      if (error) throw error;

      // Get roles
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Get customer links
      const { data: customerLinks } = await supabase
        .from('customer_users')
        .select('user_id, customer_id');

      const roleMap = new Map<string, string>();
      for (const r of roles || []) {
        roleMap.set(r.user_id, r.role);
      }

      const customerMap = new Map<string, string>();
      for (const cl of customerLinks || []) {
        customerMap.set(cl.user_id, cl.customer_id);
      }

      return (profiles || [])
        .filter(p => roleMap.get(p.id) !== 'admin') // Don't show admins
        .map(p => ({
          id: p.id,
          name: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'Unbekannt',
          role: roleMap.get(p.id) || 'user',
          customerId: customerMap.get(p.id),
        }));
    },
    enabled: open,
  });

  const filtered = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  const handleSend = async () => {
    if (!selectedUser || !message.trim()) return;
    try {
      await sendMessage.mutateAsync({
        participantId: selectedUser.id,
        message: message.trim(),
        customerId: selectedUser.customerId || null,
      });
      toast.success('Nachricht gesendet');
      onChatStarted(selectedUser.id);
      setSearch('');
      setSelectedUser(null);
      setMessage('');
      onOpenChange(false);
    } catch {
      toast.error('Nachricht konnte nicht gesendet werden.');
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'client': return 'Benutzer';
      case 'staff': return 'Mitarbeiter';
      default: return 'Benutzer';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Chat starten</DialogTitle>
        </DialogHeader>

        {!selectedUser ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Benutzer suchen…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-64">
              {isLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Laden…</p>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Benutzer gefunden</p>
              ) : (
                <div className="space-y-1">
                  {filtered.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors flex items-center justify-between"
                    >
                      <span>{u.name}</span>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {roleLabel(u.role)}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">An: {selectedUser.name}</p>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Ändern</Button>
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
