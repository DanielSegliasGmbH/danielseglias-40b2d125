import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Trash2, RotateCcw, AlertTriangle, Users } from 'lucide-react';
import { useDeletedCustomers, useRestoreCustomer, useHardDeleteCustomer } from '@/hooks/useCustomerData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function CustomersTrash() {
  const { t } = useTranslation();
  const { data: deletedCustomers, isLoading } = useDeletedCustomers();
  const restoreCustomer = useRestoreCustomer();
  const hardDeleteCustomer = useHardDeleteCustomer();
  
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const handleRestore = async (customerId: string, name: string) => {
    try {
      await restoreCustomer.mutateAsync(customerId);
      toast.success(t('trash.restored', { name }));
    } catch (error) {
      toast.error(t('trash.restoreError', 'Fehler beim Wiederherstellen'));
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      await hardDeleteCustomer.mutateAsync(confirmDelete.id);
      toast.success(t('trash.permanentlyDeleted', { name: confirmDelete.name }));
      setConfirmDelete(null);
    } catch (error) {
      toast.error(t('trash.deleteError', 'Fehler beim endgültigen Löschen'));
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return format(new Date(dateStr), 'dd.MM.yyyy HH:mm', { locale: de });
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Trash2 className="h-6 w-6 text-destructive" />
          <div>
            <h1 className="text-2xl font-semibold">{t('customer.trash', 'Kunden-Papierkorb')}</h1>
            <p className="text-sm text-muted-foreground">
              {t('trash.subtitle', 'Gelöschte Kunden können wiederhergestellt oder endgültig entfernt werden')}
            </p>
          </div>
          {deletedCustomers && deletedCustomers.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {deletedCustomers.length} {t('common.items', 'Einträge')}
            </Badge>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!deletedCustomers || deletedCustomers.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Trash2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {t('trash.empty', 'Keine gelöschten Kunden vorhanden')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Desktop Table */}
        {!isLoading && deletedCustomers && deletedCustomers.length > 0 && (
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('customer.name', 'Name')}</TableHead>
                    <TableHead>{t('customer.email', 'E-Mail')}</TableHead>
                    <TableHead>{t('trash.deletedAt', 'Gelöscht am')}</TableHead>
                    <TableHead className="text-right">{t('common.actions', 'Aktionen')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedCustomers.map((customer) => {
                    const name = `${customer.first_name} ${customer.last_name}`;
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="font-medium">{name}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {customer.customer_profiles?.email || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(customer.deleted_at)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRestore(customer.id, name)}
                              disabled={restoreCustomer.isPending}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              {t('trash.restore', 'Wiederherstellen')}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setConfirmDelete({ id: customer.id, name })}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {t('trash.deletePermanently', 'Endgültig löschen')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Mobile Cards */}
        {!isLoading && deletedCustomers && deletedCustomers.length > 0 && (
          <div className="md:hidden space-y-3">
            {deletedCustomers.map((customer) => {
              const name = `${customer.first_name} ${customer.last_name}`;
              return (
                <Card key={customer.id}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="font-medium">{name}</div>
                        {customer.customer_profiles?.email && (
                          <div className="text-sm text-muted-foreground">
                            {customer.customer_profiles.email}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {t('trash.deletedAt', 'Gelöscht')}: {formatDate(customer.deleted_at)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRestore(customer.id, name)}
                          disabled={restoreCustomer.isPending}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          {t('trash.restore', 'Wiederherstellen')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => setConfirmDelete({ id: customer.id, name })}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {t('trash.delete', 'Löschen')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t('trash.confirmPermanentDelete', 'Endgültig löschen?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('trash.permanentDeleteWarning', 
                `"${confirmDelete?.name}" wird unwiderruflich gelöscht. Alle zugehörigen Daten (Profil, Wirtschaftsdaten, Steuerungsdaten) werden ebenfalls entfernt.`
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel', 'Abbrechen')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('trash.deletePermanently', 'Endgültig löschen')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
