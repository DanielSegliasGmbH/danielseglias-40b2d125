import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EDGE_RELATIONS, EdgeRelation } from './types';
import { SystemMapEdge } from '@/hooks/useSystemMap';

interface SystemMapEdgeEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  edge: SystemMapEdge;
  sourceLabel: string;
  targetLabel: string;
  onSubmit: (data: {
    relation: EdgeRelation;
    swapDirection: boolean;
  }) => void;
  isPending: boolean;
}

export function SystemMapEdgeEditForm({
  open,
  onOpenChange,
  edge,
  sourceLabel,
  targetLabel,
  onSubmit,
  isPending,
}: SystemMapEdgeEditFormProps) {
  const { t } = useTranslation();
  const [relation, setRelation] = useState<EdgeRelation>(edge.relation as EdgeRelation);
  const [swapDirection, setSwapDirection] = useState(false);

  // Computed labels based on swap state
  const displaySource = swapDirection ? targetLabel : sourceLabel;
  const displayTarget = swapDirection ? sourceLabel : targetLabel;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ relation, swapDirection });
  };

  const handleClose = () => {
    // Reset state when closing
    setRelation(edge.relation as EdgeRelation);
    setSwapDirection(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('systemMap.edgeEdit.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Direction preview */}
          <div className="bg-muted/50 p-3 rounded-md">
            <div className="flex items-center justify-between gap-2 text-sm">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-medium truncate">{displaySource}</span>
                <span className="text-muted-foreground shrink-0">→</span>
                <span className="font-medium truncate">{displayTarget}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSwapDirection(!swapDirection)}
                className="shrink-0"
              >
                <ArrowLeftRight className="h-4 w-4 mr-1" />
                {t('systemMap.edgeEdit.swap')}
              </Button>
            </div>
            {swapDirection && (
              <p className="text-xs text-amber-600 mt-2">
                {t('systemMap.edgeEdit.swapHint')}
              </p>
            )}
          </div>

          {/* Relation select */}
          <div className="space-y-2">
            <Label htmlFor="relation">{t('systemMap.edgeForm.relation')}</Label>
            <Select
              value={relation}
              onValueChange={(value) => setRelation(value as EdgeRelation)}
            >
              <SelectTrigger id="relation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EDGE_RELATIONS.map((rel) => (
                  <SelectItem key={rel} value={rel}>
                    {t(`systemMap.legend.relation.${rel}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('app.loading') : t('app.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
