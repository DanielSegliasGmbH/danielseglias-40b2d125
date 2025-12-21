import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, RotateCcw } from 'lucide-react';
import { CustomerStatus, CustomerPriority, CareLevel, CustomerFilters as FilterType } from '@/hooks/useCustomerData';

interface CustomerFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  acquisitionSources: string[];
}

export function CustomerFiltersBar({ filters, onFiltersChange, acquisitionSources }: CustomerFiltersProps) {
  const { t } = useTranslation();

  const hasActiveFilters = 
    filters.status || 
    filters.priority || 
    filters.careLevel || 
    filters.acquisitionSource ||
    filters.withoutGoogleReview ||
    filters.withoutMoneytree;

  const resetFilters = () => {
    onFiltersChange({
      search: filters.search, // Keep search
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-lg border">
      {/* Status */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{t('customer.status', 'Status')}</Label>
        <Select
          value={filters.status || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? null : v as CustomerStatus })}
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all', 'Alle')}</SelectItem>
            <SelectItem value="lead">{t('customer.statuses.lead', 'Lead')}</SelectItem>
            <SelectItem value="active">{t('customer.statuses.active', 'Aktiv')}</SelectItem>
            <SelectItem value="passive">{t('customer.statuses.passive', 'Passiv')}</SelectItem>
            <SelectItem value="former">{t('customer.statuses.former', 'Ehemalig')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{t('customer.priority', 'Priorität')}</Label>
        <Select
          value={filters.priority || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, priority: v === 'all' ? null : v as CustomerPriority })}
        >
          <SelectTrigger className="w-28 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all', 'Alle')}</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Care Level */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">{t('customer.careLevel', 'Betreuung')}</Label>
        <Select
          value={filters.careLevel || 'all'}
          onValueChange={(v) => onFiltersChange({ ...filters, careLevel: v === 'all' ? null : v as CareLevel })}
        >
          <SelectTrigger className="w-32 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all', 'Alle')}</SelectItem>
            <SelectItem value="vip">{t('customer.careLevels.vip', 'VIP')}</SelectItem>
            <SelectItem value="standard">{t('customer.careLevels.standard', 'Standard')}</SelectItem>
            <SelectItem value="light">{t('customer.careLevels.light', 'Light')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Acquisition Source */}
      {acquisitionSources.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{t('customer.acquisitionSource', 'Herkunft')}</Label>
          <Select
            value={filters.acquisitionSource || 'all'}
            onValueChange={(v) => onFiltersChange({ ...filters, acquisitionSource: v === 'all' ? null : v })}
          >
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.all', 'Alle')}</SelectItem>
              {acquisitionSources.map((source) => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Switches */}
      <div className="flex items-center gap-6 ml-2">
        <div className="flex items-center gap-2">
          <Switch
            id="no-google"
            checked={filters.withoutGoogleReview || false}
            onCheckedChange={(v) => onFiltersChange({ ...filters, withoutGoogleReview: v })}
          />
          <Label htmlFor="no-google" className="text-sm cursor-pointer whitespace-nowrap">
            {t('customer.withoutGoogleReview', 'Ohne Google Review')}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="no-moneytree"
            checked={filters.withoutMoneytree || false}
            onCheckedChange={(v) => onFiltersChange({ ...filters, withoutMoneytree: v })}
          />
          <Label htmlFor="no-moneytree" className="text-sm cursor-pointer whitespace-nowrap">
            {t('customer.withoutMoneytree', 'Ohne Moneytree')}
          </Label>
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-auto">
          <RotateCcw className="h-4 w-4 mr-1" />
          {t('common.resetFilters', 'Filter zurücksetzen')}
        </Button>
      )}
    </div>
  );
}

// Mobile version using Sheet
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter } from 'lucide-react';

interface CustomerFiltersMobileProps extends CustomerFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerFiltersMobile({ 
  filters, 
  onFiltersChange, 
  acquisitionSources,
  open,
  onOpenChange 
}: CustomerFiltersMobileProps) {
  const { t } = useTranslation();

  const hasActiveFilters = 
    filters.status || 
    filters.priority || 
    filters.careLevel || 
    filters.acquisitionSource ||
    filters.withoutGoogleReview ||
    filters.withoutMoneytree;

  const activeCount = [
    filters.status,
    filters.priority,
    filters.careLevel,
    filters.acquisitionSource,
    filters.withoutGoogleReview,
    filters.withoutMoneytree,
  ].filter(Boolean).length;

  const resetFilters = () => {
    onFiltersChange({
      search: filters.search,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          {t('common.filters', 'Filter')}
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>{t('common.filters', 'Filter')}</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Status */}
          <div className="space-y-2">
            <Label>{t('customer.status', 'Status')}</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => onFiltersChange({ ...filters, status: v === 'all' ? null : v as CustomerStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'Alle')}</SelectItem>
                <SelectItem value="lead">{t('customer.statuses.lead', 'Lead')}</SelectItem>
                <SelectItem value="active">{t('customer.statuses.active', 'Aktiv')}</SelectItem>
                <SelectItem value="passive">{t('customer.statuses.passive', 'Passiv')}</SelectItem>
                <SelectItem value="former">{t('customer.statuses.former', 'Ehemalig')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>{t('customer.priority', 'Priorität')}</Label>
            <Select
              value={filters.priority || 'all'}
              onValueChange={(v) => onFiltersChange({ ...filters, priority: v === 'all' ? null : v as CustomerPriority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'Alle')}</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Care Level */}
          <div className="space-y-2">
            <Label>{t('customer.careLevel', 'Betreuung')}</Label>
            <Select
              value={filters.careLevel || 'all'}
              onValueChange={(v) => onFiltersChange({ ...filters, careLevel: v === 'all' ? null : v as CareLevel })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'Alle')}</SelectItem>
                <SelectItem value="vip">{t('customer.careLevels.vip', 'VIP')}</SelectItem>
                <SelectItem value="standard">{t('customer.careLevels.standard', 'Standard')}</SelectItem>
                <SelectItem value="light">{t('customer.careLevels.light', 'Light')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Acquisition Source */}
          {acquisitionSources.length > 0 && (
            <div className="space-y-2">
              <Label>{t('customer.acquisitionSource', 'Herkunft')}</Label>
              <Select
                value={filters.acquisitionSource || 'all'}
                onValueChange={(v) => onFiltersChange({ ...filters, acquisitionSource: v === 'all' ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'Alle')}</SelectItem>
                  {acquisitionSources.map((source) => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="no-google-mobile">{t('customer.withoutGoogleReview', 'Ohne Google Review')}</Label>
              <Switch
                id="no-google-mobile"
                checked={filters.withoutGoogleReview || false}
                onCheckedChange={(v) => onFiltersChange({ ...filters, withoutGoogleReview: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="no-moneytree-mobile">{t('customer.withoutMoneytree', 'Ohne Moneytree')}</Label>
              <Switch
                id="no-moneytree-mobile"
                checked={filters.withoutMoneytree || false}
                onCheckedChange={(v) => onFiltersChange({ ...filters, withoutMoneytree: v })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={resetFilters} disabled={!hasActiveFilters}>
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('common.resetFilters', 'Zurücksetzen')}
            </Button>
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              {t('common.apply', 'Anwenden')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
