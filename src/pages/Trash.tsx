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
import { Trash2, RotateCcw, Network, ArrowRight, Loader2, Users, Briefcase, ClipboardList, UserCheck } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import {
  useDeletedNodes,
  useDeletedEdges,
  useDeletedCases,
  useDeletedTasks,
  useRestoreNode,
  useRestoreEdge,
  useRestoreCase,
  useRestoreTask,
  usePermanentDeleteNode,
  usePermanentDeleteEdge,
  usePermanentDeleteCase,
  usePermanentDeleteTask,
  useCleanupTrash,
  DeletedNode,
  DeletedEdge,
  DeletedCase,
  DeletedTask,
} from '@/hooks/useTrash';
import { useDeletedCustomers, useRestoreCustomer, useHardDeleteCustomer } from '@/hooks/useCustomerData';

interface DeletedCustomer {
  id: string;
  first_name: string;
  last_name: string;
  deleted_at: string;
  customer_profiles: { email: string | null; phone: string | null } | null;
}

type DeleteItem = 
  | { type: 'node'; item: DeletedNode }
  | { type: 'edge'; item: DeletedEdge }
  | { type: 'case'; item: DeletedCase }
  | { type: 'task'; item: DeletedTask }
  | { type: 'customer'; item: DeletedCustomer };

export default function Trash() {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'de' ? de : enUS;

  const { data: deletedNodes, isLoading: nodesLoading } = useDeletedNodes();
  const { data: deletedEdges, isLoading: edgesLoading } = useDeletedEdges();
  const { data: deletedCases, isLoading: casesLoading } = useDeletedCases();
  const { data: deletedTasks, isLoading: tasksLoading } = useDeletedTasks();
  const { data: deletedCustomers, isLoading: customersLoading } = useDeletedCustomers();

  const restoreNode = useRestoreNode();
  const restoreEdge = useRestoreEdge();
  const restoreCase = useRestoreCase();
  const restoreTask = useRestoreTask();
  const restoreCustomer = useRestoreCustomer();
  const permanentDeleteNode = usePermanentDeleteNode();
  const permanentDeleteEdge = usePermanentDeleteEdge();
  const permanentDeleteCase = usePermanentDeleteCase();
  const permanentDeleteTask = usePermanentDeleteTask();
  const hardDeleteCustomer = useHardDeleteCustomer();
  const cleanup = useCleanupTrash();

  const [confirmDelete, setConfirmDelete] = useState<DeleteItem | null>(null);

  const handlePermanentDelete = () => {
    if (!confirmDelete) return;
    switch (confirmDelete.type) {
      case 'node':
        permanentDeleteNode.mutate((confirmDelete.item as DeletedNode).key);
        break;
      case 'edge':
        permanentDeleteEdge.mutate(confirmDelete.item.id);
        break;
      case 'case':
        permanentDeleteCase.mutate(confirmDelete.item.id);
        break;
      case 'task':
        permanentDeleteTask.mutate(confirmDelete.item.id);
        break;
      case 'customer':
        hardDeleteCustomer.mutate(confirmDelete.item.id);
        break;
    }
    setConfirmDelete(null);
  };

  const totalItems = 
    (deletedNodes?.length || 0) + 
    (deletedEdges?.length || 0) + 
    (deletedCases?.length || 0) + 
    (deletedTasks?.length || 0) +
    (deletedCustomers?.length || 0);

  const formatDeletedAt = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: dateLocale });
  };

  const formatDeletedAtTitle = (dateStr: string) => {
    return format(new Date(dateStr), 'PPpp', { locale: dateLocale });
  };

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

        <Tabs defaultValue="customers">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              {t('customer.listTitle', 'Kunden')} ({deletedCustomers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="cases" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              {t('trash.cases')} ({deletedCases?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              {t('trash.tasks')} ({deletedTasks?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="nodes" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              {t('trash.nodes')} ({deletedNodes?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="edges" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              {t('trash.edges')} ({deletedEdges?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Customers Tab */}
          <TabsContent value="customers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('trash.deletedCustomers', 'Gelöschte Kunden')}</CardTitle>
                <CardDescription>{t('trash.retentionInfo')}</CardDescription>
              </CardHeader>
              <CardContent>
                {customersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !deletedCustomers?.length ? (
                  <p className="text-muted-foreground text-center py-8">{t('trash.noDeletedCustomers', 'Keine gelöschten Kunden')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('trash.name')}</TableHead>
                        <TableHead>{t('trash.email')}</TableHead>
                        <TableHead>{t('trash.deletedAt')}</TableHead>
                        <TableHead className="text-right">{t('table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.first_name} {customer.last_name}</TableCell>
                          <TableCell>{customer.customer_profiles?.email || '–'}</TableCell>
                          <TableCell title={customer.deleted_at ? formatDeletedAtTitle(customer.deleted_at) : ''}>
                            {customer.deleted_at ? formatDeletedAt(customer.deleted_at) : '–'}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restoreCustomer.mutate(customer.id)}
                              disabled={restoreCustomer.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {t('trash.restore')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setConfirmDelete({ type: 'customer', item: customer as DeletedCustomer })}
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

          {/* Cases Tab */}
          <TabsContent value="cases" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('trash.deletedCases')}</CardTitle>
                <CardDescription>{t('trash.retentionInfo')}</CardDescription>
              </CardHeader>
              <CardContent>
                {casesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !deletedCases?.length ? (
                  <p className="text-muted-foreground text-center py-8">{t('trash.noDeletedCases')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('table.title')}</TableHead>
                        <TableHead>{t('table.status')}</TableHead>
                        <TableHead>{t('trash.deletedAt')}</TableHead>
                        <TableHead className="text-right">{t('table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedCases.map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell className="font-medium">{caseItem.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{t(`case.statuses.${caseItem.status}`, caseItem.status)}</Badge>
                          </TableCell>
                          <TableCell title={formatDeletedAtTitle(caseItem.deleted_at)}>
                            {formatDeletedAt(caseItem.deleted_at)}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restoreCase.mutate(caseItem.id)}
                              disabled={restoreCase.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {t('trash.restore')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setConfirmDelete({ type: 'case', item: caseItem })}
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

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('trash.deletedTasks')}</CardTitle>
                <CardDescription>{t('trash.retentionInfo')}</CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : !deletedTasks?.length ? (
                  <p className="text-muted-foreground text-center py-8">{t('trash.noDeletedTasks')}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('table.title')}</TableHead>
                        <TableHead>{t('table.priority')}</TableHead>
                        <TableHead>{t('trash.deletedAt')}</TableHead>
                        <TableHead className="text-right">{t('table.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deletedTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{t(`task.priorities.${task.priority}`, task.priority)}</Badge>
                          </TableCell>
                          <TableCell title={formatDeletedAtTitle(task.deleted_at)}>
                            {formatDeletedAt(task.deleted_at)}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => restoreTask.mutate(task.id)}
                              disabled={restoreTask.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {t('trash.restore')}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setConfirmDelete({ type: 'task', item: task })}
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

          {/* Nodes Tab */}
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
                          <TableCell title={formatDeletedAtTitle(node.deleted_at)}>
                            {formatDeletedAt(node.deleted_at)}
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

          {/* Edges Tab */}
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
                          <TableCell title={formatDeletedAtTitle(edge.deleted_at)}>
                            {formatDeletedAt(edge.deleted_at)}
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
