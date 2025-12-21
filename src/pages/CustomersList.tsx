import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Search, Plus, Users, ChevronRight } from 'lucide-react';
import { useCustomers, CustomerStatus, CustomerPriority, CareLevel } from '@/hooks/useCustomerData';
import { CreateCustomerDialog } from '@/components/customers/CreateCustomerDialog';

export default function CustomersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: customers, isLoading } = useCustomers();
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Filter customers by search term
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!searchTerm.trim()) return customers;
    
    const term = searchTerm.toLowerCase();
    return customers.filter(customer => {
      const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
      const email = customer.customer_profiles?.email?.toLowerCase() || '';
      const phone = customer.customer_profiles?.phone || '';
      
      return fullName.includes(term) || email.includes(term) || phone.includes(term);
    });
  }, [customers, searchTerm]);

  const getStatusBadgeVariant = (status: CustomerStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'lead': return 'secondary';
      case 'passive': return 'muted';
      case 'former': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityBadgeVariant = (priority: CustomerPriority | null) => {
    switch (priority) {
      case 'A': return 'default';
      case 'B': return 'secondary';
      case 'C': return 'muted';
      default: return 'outline';
    }
  };

  const getCareLevelLabel = (level: CareLevel | null) => {
    if (!level) return '-';
    return t(`customer.careLevels.${level}`, level);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('de-CH');
  };

  const handleCustomerCreated = (customerId: string) => {
    navigate(`/app/customers/${customerId}`);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-semibold">{t('customer.listTitle', 'Kunden')}</h1>
            {customers && (
              <Badge variant="secondary" className="text-xs">
                {filteredCustomers.length} / {customers.length}
              </Badge>
            )}
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('customer.create', 'Neuer Kunde')}
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('customer.searchPlaceholder', 'Name, E-Mail oder Telefon suchen...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredCustomers.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? t('customer.noSearchResults', 'Keine Kunden gefunden')
                  : t('customer.noCustomers', 'Noch keine Kunden vorhanden')}
              </p>
              {!searchTerm && (
                <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('customer.createFirst', 'Ersten Kunden anlegen')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Desktop Table */}
        {!isLoading && filteredCustomers.length > 0 && (
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('customer.name', 'Name')}</TableHead>
                    <TableHead>{t('customer.status', 'Status')}</TableHead>
                    <TableHead>{t('customer.priority', 'Priorität')}</TableHead>
                    <TableHead>{t('customer.careLevel', 'Betreuung')}</TableHead>
                    <TableHead>{t('customer.firstContactDate', 'Erstkontakt')}</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/app/customers/${customer.id}`)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {customer.first_name} {customer.last_name}
                          </div>
                          {customer.customer_profiles?.email && (
                            <div className="text-sm text-muted-foreground">
                              {customer.customer_profiles.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(customer.customer_status)}>
                          {t(`customer.statuses.${customer.customer_status}`, customer.customer_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customer.priority ? (
                          <Badge variant={getPriorityBadgeVariant(customer.priority)}>
                            {customer.priority}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {getCareLevelLabel(customer.care_level)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(customer.first_contact_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* Mobile Cards */}
        {!isLoading && filteredCustomers.length > 0 && (
          <div className="md:hidden space-y-3">
            {filteredCustomers.map((customer) => (
              <Card
                key={customer.id}
                className="cursor-pointer active:bg-muted/50 transition-colors"
                onClick={() => navigate(`/app/customers/${customer.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {customer.first_name} {customer.last_name}
                      </div>
                      {customer.customer_profiles?.email && (
                        <div className="text-sm text-muted-foreground truncate">
                          {customer.customer_profiles.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant={getStatusBadgeVariant(customer.customer_status)} className="text-xs">
                          {t(`customer.statuses.${customer.customer_status}`, customer.customer_status)}
                        </Badge>
                        {customer.priority && (
                          <Badge variant={getPriorityBadgeVariant(customer.priority)} className="text-xs">
                            {customer.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Customer Dialog */}
      <CreateCustomerDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCustomerCreated}
      />
    </AppLayout>
  );
}
