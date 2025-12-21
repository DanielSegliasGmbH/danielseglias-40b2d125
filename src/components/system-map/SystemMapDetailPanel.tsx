import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight, ArrowLeft, GitCompare, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { SystemMapNode, SystemMapEdge, categoryLabels, importanceLabels } from './types';
import { SystemMapNodeForm } from './SystemMapNodeForm';
import { useUpdateNode, useDeleteNodeWithEdges, useNodeEdgeCount } from '@/hooks/useSystemMap';

interface SystemMapDetailPanelProps {
  node: SystemMapNode;
  edges: SystemMapEdge[];
  nodes: SystemMapNode[];
  onClose: () => void;
  onCompare: () => void;
  compareNodeKey: string | null;
  shortestPath: string[];
  editMode: boolean;
}

const categoryColors: Record<string, string> = {
  core: 'bg-primary/10 text-primary',
  module: 'bg-chart-2/10 text-chart-2',
  ui: 'bg-chart-3/10 text-chart-3',
  security: 'bg-destructive/10 text-destructive',
  automation: 'bg-chart-4/10 text-chart-4',
  integration: 'bg-chart-5/10 text-chart-5',
};

export function SystemMapDetailPanel({
  node,
  edges,
  nodes,
  onClose,
  onCompare,
  compareNodeKey,
  shortestPath,
  editMode,
}: SystemMapDetailPanelProps) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateNode = useUpdateNode();
  const deleteNode = useDeleteNodeWithEdges();
  const edgeCount = useNodeEdgeCount(node.key, edges);

  const outgoingEdges = edges.filter((e) => e.source_key === node.key);
  const incomingEdges = edges.filter((e) => e.target_key === node.key);

  const getNodeLabel = (key: string) => nodes.find((n) => n.key === key)?.label || key;

  const handleEditSubmit = (data: Parameters<typeof updateNode.mutate>[0]['updates']) => {
    updateNode.mutate(
      { key: node.key, updates: data },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleDelete = (withEdges: boolean) => {
    deleteNode.mutate(
      { key: node.key, deleteEdges: withEdges },
      {
        onSuccess: () => {
          setShowDeleteDialog(false);
          onClose();
        },
      }
    );
  };

  if (isEditing) {
    return (
      <div className="w-80 bg-card border-l h-full flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-lg">{t('systemMap.editNode')}</h3>
          <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <SystemMapNodeForm
            mode="edit"
            initialData={node}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            isSubmitting={updateNode.isPending}
          />
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="w-80 bg-card border-l h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold text-lg">{node.label}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Category */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('systemMap.category')}</p>
            <Badge className={categoryColors[node.category]}>
              {categoryLabels[node.category]}
            </Badge>
          </div>

          {/* Importance & Phase */}
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('systemMap.form.importance')}</p>
              <Badge variant="outline">{importanceLabels[node.importance] || node.importance}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('systemMap.form.phase')}</p>
              <Badge variant="outline">Phase {node.phase}</Badge>
            </div>
          </div>

          {/* Description */}
          {node.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t('systemMap.description')}</p>
              <p className="text-sm">{node.description}</p>
            </div>
          )}

          <Separator />

          {/* Outgoing (uses/contains) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{t('systemMap.uses')}</p>
            </div>
            {outgoingEdges.length > 0 ? (
              <div className="space-y-1">
                {outgoingEdges.map((edge) => (
                  <div key={edge.id} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{edge.relation}:</span>
                    <span>{getNodeLabel(edge.target_key)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">{t('systemMap.noConnections')}</p>
            )}
          </div>

          {/* Incoming (depends on) */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">{t('systemMap.dependsOn')}</p>
            </div>
            {incomingEdges.length > 0 ? (
              <div className="space-y-1">
                {incomingEdges.map((edge) => (
                  <div key={edge.id} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{edge.relation}:</span>
                    <span>{getNodeLabel(edge.source_key)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">{t('systemMap.noConnections')}</p>
            )}
          </div>

          <Separator />

          {/* Compare Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={onCompare}
            disabled={compareNodeKey === node.key}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {compareNodeKey ? t('systemMap.compareTo') : t('systemMap.selectForCompare')}
          </Button>

          {/* Shortest Path Display */}
          {shortestPath.length > 1 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium mb-2">{t('systemMap.shortestPath')}</p>
              <div className="flex flex-wrap items-center gap-1 text-sm">
                {shortestPath.map((key, i) => (
                  <span key={key} className="flex items-center gap-1">
                    <Badge variant="secondary" className="text-xs">
                      {getNodeLabel(key)}
                    </Badge>
                    {i < shortestPath.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {compareNodeKey && shortestPath.length === 0 && (
            <div className="mt-4 p-3 bg-destructive/5 rounded-lg">
              <p className="text-sm text-destructive">{t('systemMap.noPathFound')}</p>
            </div>
          )}

          {/* Edit Mode Actions */}
          {editMode && (
            <>
              <Separator />
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('systemMap.editNode')}
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('systemMap.deleteNode')}
                </Button>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('systemMap.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {edgeCount > 0
                ? t('systemMap.deleteWithEdges', { count: edgeCount })
                : t('systemMap.deleteConfirmMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('app.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(edgeCount > 0)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {edgeCount > 0 ? t('systemMap.deleteWithEdgesAction') : t('app.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
