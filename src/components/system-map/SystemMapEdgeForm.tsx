import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

interface SystemMapEdgeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceKey: string;
  targetKey: string;
  sourceLabel: string;
  targetLabel: string;
  onSubmit: (relation: EdgeRelation) => void;
  isPending: boolean;
}

export function SystemMapEdgeForm({
  open,
  onOpenChange,
  sourceKey,
  targetKey,
  sourceLabel,
  targetLabel,
  onSubmit,
  isPending,
}: SystemMapEdgeFormProps) {
  const { t } = useTranslation();
  const [relation, setRelation] = useState<EdgeRelation>('uses');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(relation);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('systemMap.edgeForm.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-md text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">{sourceLabel}</span>
              <span className="text-muted-foreground">→</span>
              <span className="font-medium">{targetLabel}</span>
            </div>
          </div>

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
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('app.loading') : t('app.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
