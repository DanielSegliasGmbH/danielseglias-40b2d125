import { useTranslation } from 'react-i18next';
import { Trash2, X, ArrowRight, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SystemMapEdge } from '@/hooks/useSystemMap';

interface SystemMapEdgePopoverProps {
  edge: SystemMapEdge;
  sourceLabel: string;
  targetLabel: string;
  editMode: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  showDeleteConfirm: boolean;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  isDeleting: boolean;
}

export function SystemMapEdgePopover({
  edge,
  sourceLabel,
  targetLabel,
  editMode,
  onClose,
  onEdit,
  onDelete,
  showDeleteConfirm,
  onConfirmDelete,
  onCancelDelete,
  isDeleting,
}: SystemMapEdgePopoverProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="w-72 shadow-lg">
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {t('systemMap.edgeDetail.title')}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-3">
            {/* Connection visualization */}
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium truncate max-w-24">{sourceLabel}</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="font-medium truncate max-w-24">{targetLabel}</span>
            </div>

            {/* Relation badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {t('systemMap.edgeDetail.relation')}:
              </span>
              <Badge variant="secondary">
                {t(`systemMap.legend.relation.${edge.relation}`)}
              </Badge>
            </div>

            {/* Actions (edit mode only) */}
            {editMode && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={onEdit}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('app.edit')}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('app.delete')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={onCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('systemMap.edgeDetail.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('systemMap.edgeDetail.confirmMessage', {
                source: sourceLabel,
                target: targetLabel,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t('app.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('app.loading') : t('app.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
