import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLinkClientToUser } from '@/hooks/useUserManagement';
import { useClients } from '@/hooks/useDashboardData';
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

interface LinkClientDialogProps {
  userId: string;
  currentClientId: string | null;
}

export function LinkClientDialog({ userId, currentClientId }: LinkClientDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(currentClientId || '');
  const { data: clients } = useClients();
  const linkClient = useLinkClientToUser();

  const handleSubmit = async () => {
    if (!selectedClientId) return;

    setLoading(true);
    try {
      await linkClient.mutateAsync({ userId, clientId: selectedClientId });
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
          <DialogTitle>{t('userManagement.linkClient')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger>
              <SelectValue placeholder={t('userManagement.selectClient')} />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !selectedClientId}>
              {loading ? t('app.loading') : t('app.save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
