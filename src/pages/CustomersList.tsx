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
import { Search, Plus, Users, ChevronRight, Filter } from 'lucide-react';
import { useCustomers, CustomerStatus, CustomerPriority, CareLevel, CustomerFilters as FilterType } from '@/hooks/useCustomerData';
import { CreateCustomerDialog } from '@/components/customers/CreateCustomerDialog';
import { CustomerFiltersBar, CustomerFiltersMobile } from '@/components/customers/CustomerFilters';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CustomersList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [filters, setFilters] = useState<FilterType>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Pass filters to the hook for server-side filtering
  const { data: customers, isLoading } = useCustomers(filters);

  // Extract unique acquisition sources for filter dropdown
  const acquisitionSources = useMemo(() => {
    if (!customers) return [];
    const sources = customers
      .map(c => c.acquisition_source)
      .filter((s): s is string => !!s);
    return [...new Set(sources)].sort();
  }, [customers]);

  const hasActiveFilters = 
    filters.status || 
    filters.priority || 
    filters.careLevel || 
    filters.acquisitionSource ||
    filters.withoutGoogleReview ||
    filters.withoutMoneytree;

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

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value || undefined }));
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
                {customers.length}
              </Badge>
            )}
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('customer.create', 'Neuer Kunde')}
          </Button>
        </div>

        {/* Search + Mobile Filter Toggle */}
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('customer.searchPlaceholder', 'Name suchen...')}
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              inputMode="search"
              autoComplete="off"
            />
          </div>
          
          {/* Mobile Filter Button */}
          {isMobile && (
            <CustomerFiltersMobile
              filters={filters}
              onFiltersChange={setFilters}
              acquisitionSources={acquisitionSources}
              open={mobileFiltersOpen}
              onOpenChange={setMobileFiltersOpen}
            />
          )}
        </div>

        {/* Desktop Filters */}
        {!isMobile && (
          <CustomerFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            acquisitionSources={acquisitionSources}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!customers || customers.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters || filters.search
                  ? t('customer.noSearchResults', 'Keine Kunden gefunden')
                  : t('customer.noCustomers', 'Noch keine Kunden vorhanden')}
              </p>
              {!hasActiveFilters && !filters.search && (
                <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('customer.createFirst', 'Ersten Kunden anlegen')}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Desktop Table */}
        {!isLoading && customers && customers.length > 0 && (
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
                  {customers.map((customer) => (
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
        {!isLoading && customers && customers.length > 0 && (
          <div className="md:hidden space-y-2">
            {customers.map((customer) => (
              <Card
                key={customer.id}
                className="cursor-pointer active:bg-muted/50 transition-colors"
                onClick={() => navigate(`/app/customers/${customer.id}`)}
              >
                <CardContent className="p-4 py-3">
                  <div className="flex items-center justify-between gap-3 min-h-[48px]">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate leading-tight">
                        {customer.first_name} {customer.last_name}
                      </div>
                      {customer.customer_profiles?.email && (
                        <div className="text-sm text-muted-foreground truncate leading-tight mt-0.5">
                          {customer.customer_profiles.email}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <Badge variant={getStatusBadgeVariant(customer.customer_status)} className="text-xs px-2 py-0.5">
                          {t(`customer.statuses.${customer.customer_status}`, customer.customer_status)}
                        </Badge>
                        {customer.priority && (
                          <Badge variant={getPriorityBadgeVariant(customer.priority)} className="text-xs px-2 py-0.5">
                            {customer.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 ml-2" />
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
