import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useClientCustomerId } from '@/hooks/useChat';

interface StrategyPasswordGateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function StrategyPasswordGate({ open, onOpenChange, onSuccess }: StrategyPasswordGateProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { data: customerId } = useClientCustomerId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || !customerId) return;

    setLoading(true);
    setError('');

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-strategy-password', {
        body: { password, customer_id: customerId },
      });

      if (fnError) {
        setError('Fehler bei der Überprüfung');
        return;
      }

      if (data?.match) {
        setPassword('');
        sessionStorage.setItem('strategy_unlocked', 'true');
        onSuccess();
      } else {
        setError('Passwort nicht korrekt');
      }
    } catch {
      setError('Fehler bei der Überprüfung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Geschützter Bereich
          </DialogTitle>
          <DialogDescription>
            Der Bereich Anlagestrategien ist passwortgeschützt. Bitte gib das Passwort ein, um fortzufahren.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Passwort eingeben"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            autoFocus
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!password.trim() || loading}>
              {loading ? 'Prüfe...' : 'Entsperren'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
