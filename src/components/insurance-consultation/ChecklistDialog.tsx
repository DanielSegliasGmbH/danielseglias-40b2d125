import { ArrowLeft, ExternalLink, FilePlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

// Define checklist items per related topic
const checklistConfigs: Record<string, { 
  items: { id: string; label: string; link?: { label: string; url: string } }[];
  infoText?: string;
}> = {
  // Default checklist for any topic
  default: {
    items: [
      { id: 'pensionskasse', label: 'Pensionskassenausweis' },
      { id: 'ahv', label: 'Individueller AHV-Kontoauszug (oder Angabe des durchschnittlichen AHV-Einkommens)', link: { label: 'Kontoauszug bestellen', url: 'https://www.ahv-iv.ch/de/Merkblätter-Formulare/Bestellung-Kontoauszug' } },
      { id: 'vorsorge', label: 'Bestehende Vorsorgepolicen' },
      { id: 'krankenkasse', label: 'Bestehende Krankenkassen-Policen' },
      { id: 'gesundheit', label: 'Gesundheitsinformationen (allgemeiner Gesundheitszustand, Tabakkonsum)' },
      { id: 'beruf', label: 'Beruf, höchster Schulabschluss, mehr als 80% Bürotätigkeit' },
      { id: 'mitglied', label: 'Mitgliedsausweis' },
    ],
    infoText: 'Elemente werden der Zusammenfassung als nächste Schritte für den Kunden hinzugefügt.',
  },
  // Topic-specific checklists can be added here
  disability: {
    items: [
      { id: 'pensionskasse', label: 'Pensionskassenausweis' },
      { id: 'ahv', label: 'Individueller AHV-Kontoauszug (oder Angabe des durchschnittlichen AHV-Einkommens)', link: { label: 'Kontoauszug bestellen', url: 'https://www.ahv-iv.ch/de/Merkblätter-Formulare/Bestellung-Kontoauszug' } },
      { id: 'vorsorge', label: 'Bestehende Vorsorgepolicen' },
      { id: 'krankenkasse', label: 'Bestehende Krankenkassen-Policen' },
      { id: 'gesundheit', label: 'Gesundheitsinformationen (allgemeiner Gesundheitszustand, Tabakkonsum)' },
      { id: 'beruf', label: 'Beruf, höchster Schulabschluss, mehr als 80% Bürotätigkeit' },
      { id: 'mitglied', label: 'Mitgliedsausweis' },
    ],
    infoText: 'Elemente werden der Zusammenfassung als nächste Schritte für den Kunden hinzugefügt.',
  },
  death: {
    items: [
      { id: 'pensionskasse', label: 'Pensionskassenausweis' },
      { id: 'ahv', label: 'Individueller AHV-Kontoauszug (oder Angabe des durchschnittlichen AHV-Einkommens)', link: { label: 'Kontoauszug bestellen', url: 'https://www.ahv-iv.ch/de/Merkblätter-Formulare/Bestellung-Kontoauszug' } },
      { id: 'vorsorge', label: 'Bestehende Vorsorgepolicen' },
      { id: 'lebensversicherung', label: 'Bestehende Lebensversicherungen' },
      { id: 'testament', label: 'Testament / Erbvertrag' },
      { id: 'zivilstand', label: 'Zivilstandsnachweis' },
    ],
    infoText: 'Elemente werden der Zusammenfassung als nächste Schritte für den Kunden hinzugefügt.',
  },
};

interface ChecklistDialogProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicTitle: string;
  checkedItems: string[];
  onToggleItem: (itemId: string) => void;
}

export function ChecklistDialog({
  isOpen,
  onClose,
  topicId,
  topicTitle,
  checkedItems,
  onToggleItem,
}: ChecklistDialogProps) {
  // Get the appropriate checklist config
  const config = checklistConfigs[topicId] || checklistConfigs.default;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[750px] h-[750px] max-w-[90vw] max-h-[90vh] p-0 gap-0 overflow-hidden rounded-2xl flex flex-col">
        <DialogHeader className="sr-only">
          <DialogTitle>Checkliste und Kundendokumente</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{topicTitle}</span>
          </button>
          <h2 className="text-lg font-semibold text-foreground">
            Checkliste und Kundendokumente
          </h2>
          <button className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <FilePlus className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            {/* Missing Information Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Fehlende Informationen
                </h3>
                <a 
                  href="#" 
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                  onClick={(e) => e.preventDefault()}
                >
                  Vollmachtsformular
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-0 divide-y">
                {config.items.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-start gap-3 py-3"
                  >
                    <Checkbox
                      id={item.id}
                      checked={checkedItems.includes(item.id)}
                      onCheckedChange={() => onToggleItem(item.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <label 
                        htmlFor={item.id}
                        className="text-sm cursor-pointer block"
                      >
                        {item.label}
                      </label>
                    </div>
                    {item.link && (
                      <a 
                        href={item.link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 flex-shrink-0"
                      >
                        {item.link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {config.infoText && (
                <p className="text-xs text-muted-foreground mt-4">
                  {config.infoText}
                </p>
              )}
            </div>

            {/* Documents Section */}
            <div>
              <a 
                href="https://drive.google.com/drive/folders/1zJX3qJN739R3ixPel25u_0fV9WRkVMc8?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 text-left text-primary hover:underline font-medium block"
              >
                Dokument hinzufügen
              </a>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
