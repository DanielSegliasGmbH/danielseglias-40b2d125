import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';
import { getMonthEnd } from '@/hooks/useChallenges';

const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

interface ChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  friendName: string;
  onConfirm: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function ChallengeDialog({ open, onOpenChange, friendName, onConfirm, loading, disabled }: ChallengeDialogProps) {
  const endDate = getMonthEnd();
  const monthName = MONTH_NAMES[new Date().getMonth()];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Swords className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Fordere {friendName} heraus!</DialogTitle>
          <DialogDescription className="text-center">
            Wer verbessert seinen PeakScore diesen Monat mehr?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex justify-between bg-muted/50 rounded-lg p-3">
            <span>Dauer</span>
            <span className="font-medium text-foreground">Bis Ende {monthName}</span>
          </div>
          <div className="flex justify-between bg-muted/50 rounded-lg p-3">
            <span>Gewinner</span>
            <span className="font-medium text-foreground">+100 XP 🏆</span>
          </div>
          <div className="flex justify-between bg-muted/50 rounded-lg p-3">
            <span>Teilnahme</span>
            <span className="font-medium text-foreground">+25 XP</span>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            className="flex-1 gap-1.5"
            onClick={onConfirm}
            disabled={loading || disabled}
          >
            <Swords className="h-4 w-4" />
            {loading ? '...' : 'Challenge senden'}
          </Button>
        </div>

        {disabled && (
          <p className="text-xs text-destructive text-center">
            Du hast bereits 3 aktive Challenges.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
