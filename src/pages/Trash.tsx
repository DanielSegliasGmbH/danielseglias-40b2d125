import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Trash2, RotateCcw, Network, ArrowRight, Loader2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import {
  useDeletedNodes,
  useDeletedEdges,
  useRestoreNode,
  useRestoreEdge,
  usePermanentDeleteNode,
  usePermanentDeleteEdge,
  useCleanupTrash,
  DeletedNode,
  DeletedEdge,
} from '@/hooks/useTrash';

export default function Trash() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'de' ? de : enUS;

  const { data: deletedNodes, isLoading: nodesLoading } = useDeletedNodes();
  const { data: deletedEdges, isLoading: edgesLoading } = useDeletedEdges();

  const restoreNode = useRestoreNode();
  const restoreEdge = useRestoreEdge();
  const permanentDeleteNode = usePermanentDeleteNode();
  const permanentDeleteEdge = usePermanentDeleteEdge();
  const cleanup = useCleanupTrash();

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'node' | 'edge'; item: DeletedNode | DeletedEdge } | null>(null);

  const handlePermanentDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'node') {
      permanentDeleteNode.mutate((confirmDelete.item as DeletedNode).key);
    } else {
      permanentDeleteEdge.mutate(confirmDelete.item.id);
    }
    setConfirmDelete(null);
  };

  const totalItems = (deletedNodes?.length || 0) + (deletedEdges?.length || 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Trash2 className="h-8 w-8" />
              {t('trash.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              {t('trash.subtitle', { count: totalItems })}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => cleanup.mutate()}
            disabled={cleanup.isPending}
          >
            {cleanup.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {t('trash.cleanupNow')}
          </Button>
        </div>

        <Tabs defaultValue="nodes">
          <TabsList>
            <TabsTrigger value="nodes" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              {t('trash.nodes')} ({deletedNodes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="edges" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              {t('trash.edges')} ({deletedEdges?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nodes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('trash.deletedNodes')}</CardTitle>
                <CardDescription>{t('trash.retentionInfo')}</CardDescription>
              </CardHeader>
              <CardContent>
                {nodesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !deletedNodes?.length ? (
                  <p className="text-muted-foreground text-center py-8">{t('trash.noDeletedNodes')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('trash.label')}</TableHead>
                        <TableHead>{t('trash.key')}</TableHead>
                        <TableHead>{t('trash.category')}</TableHead>
                        <TableHead>{t('trash.deletedAt')}</TableHead>
                        <TableHead className="text-right">{t('table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedNodes.map((node) => (
                        <TableRow key={node.id}>
                          <TableCell className="font-medium">{node.label}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">{node.key}</code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{node.category}</Badge>
                          </TableCell>
                          <TableCell title={format(new Date(node.deleted_at), 'PPpp', { locale: dateLocale })}>
                            {formatDistanceToNow(new Date(node.deleted_at), { addSuffix: true, locale: dateLocale })}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restoreNode.mutate(node.key)}
                              disabled={restoreNode.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {t('trash.restore')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setConfirmDelete({ type: 'node', item: node })}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t('trash.deletePermanently')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="edges" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('trash.deletedEdges')}</CardTitle>
                <CardDescription>{t('trash.retentionInfo')}</CardDescription>
              </CardHeader>
              <CardContent>
                {edgesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !deletedEdges?.length ? (
                  <p className="text-muted-foreground text-center py-8">{t('trash.noDeletedEdges')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('trash.connection')}</TableHead>
                        <TableHead>{t('trash.relation')}</TableHead>
                        <TableHead>{t('trash.deletedAt')}</TableHead>
                        <TableHead className="text-right">{t('table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedEdges.map((edge) => (
                        <TableRow key={edge.id}>
                          <TableCell className="font-medium">
                            <span className="flex items-center gap-2">
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{edge.source_key}</code>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">{edge.target_key}</code>
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{edge.relation}</Badge>
                          </TableCell>
                          <TableCell title={format(new Date(edge.deleted_at), 'PPpp', { locale: dateLocale })}>
                            {formatDistanceToNow(new Date(edge.deleted_at), { addSuffix: true, locale: dateLocale })}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restoreEdge.mutate(edge.id)}
                              disabled={restoreEdge.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {t('trash.restore')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setConfirmDelete({ type: 'edge', item: edge })}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t('trash.deletePermanently')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('trash.confirmPermanentDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('trash.confirmPermanentDeleteMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('app.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('trash.deletePermanently')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
