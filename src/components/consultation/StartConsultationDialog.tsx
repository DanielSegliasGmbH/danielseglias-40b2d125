import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
}

interface StartConsultationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (title: string, customerId?: string) => void;
  isLoading?: boolean;
  type: 'insurance' | 'investment';
}

export function StartConsultationDialog({
  open,
  onOpenChange,
  onStart,
  isLoading = false,
  type,
}: StartConsultationDialogProps) {
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState<string>('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setCustomerId('');
    loadCustomers();
  }, [open]);

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const { data } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .is('deleted_at', null)
        .order('last_name');
      setCustomers(data || []);
    } catch {
      // silent
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleStart = () => {
    if (!title.trim()) return;
    onStart(title.trim(), customerId || undefined);
  };

  const typeLabel = type === 'insurance' ? 'Versicherungsberatung' : 'Anlageberatung';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neues Gespräch starten</DialogTitle>
          <DialogDescription>
            Erstelle eine neue {typeLabel}. Das Gespräch wird automatisch gespeichert.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="consultation-title">Gesprächstitel *</Label>
            <Input
              id="consultation-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`z.B. Erstberatung Familie Müller`}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && title.trim() && handleStart()}
            />
          </div>

          <div className="space-y-2">
            <Label>Kunde (optional)</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder={loadingCustomers ? 'Laden…' : 'Kunde auswählen'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Kunde</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleStart} disabled={!title.trim() || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Erstelle…
              </>
            ) : (
              'Gespräch starten'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
