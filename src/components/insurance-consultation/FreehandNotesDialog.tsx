import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface FreehandNotesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicTitle: string;
  notes: string;
  onSaveNotes: (notes: string) => void;
}

export function FreehandNotesDialog({
  isOpen,
  onClose,
  topicId,
  topicTitle,
  notes,
  onSaveNotes,
}: FreehandNotesDialogProps) {
  const [localNotes, setLocalNotes] = useState(notes);

  // Sync local state when notes prop changes
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes, isOpen]);

  const handleSave = () => {
    onSaveNotes(localNotes);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[500px] h-[500px] max-w-[90vw] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl flex flex-col">
        <DialogHeader className="flex-shrink-0 p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              Freihandnotizen – {topicTitle}
            </DialogTitle>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Schliessen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 p-4 flex flex-col min-h-0">
          <Textarea
            value={localNotes}
            onChange={(e) => setLocalNotes(e.target.value)}
            placeholder="Notizen hier eingeben..."
            className="flex-1 resize-none text-sm"
          />
        </div>

        <div className="flex-shrink-0 p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
