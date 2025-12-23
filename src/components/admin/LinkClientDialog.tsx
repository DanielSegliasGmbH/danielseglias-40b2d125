import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLinkCustomerToUser } from '@/hooks/useUserManagement';
import { useCustomers } from '@/hooks/useCustomerData';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'lucide-react';
import { toast } from 'sonner';

interface LinkCustomerDialogProps {
  userId: string;
  currentCustomerId: string | null;
}

export function LinkClientDialog({ userId, currentCustomerId }: LinkCustomerDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(currentCustomerId || '');
  const { data: customers } = useCustomers();
  const linkCustomer = useLinkCustomerToUser();

  const handleSubmit = async () => {
    if (!selectedCustomerId) return;

    setLoading(true);
    try {
      await linkCustomer.mutateAsync({ userId, customerId: selectedCustomerId });
      toast.success(t('userManagement.clientLinked'));
      setOpen(false);
    } catch (error: any) {
      toast.error(`${t('userManagement.clientLinkError')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Link className="h-3 w-3" />
          {t('userManagement.linkClient')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('userManagement.linkCustomer', 'Kunde zuordnen')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
            <SelectTrigger>
              <SelectValue placeholder={t('userManagement.selectCustomer', 'Kunde auswählen')} />
            </SelectTrigger>
            <SelectContent>
              {customers?.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.first_name} {customer.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !selectedCustomerId}>
              {loading ? t('app.loading') : t('app.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
