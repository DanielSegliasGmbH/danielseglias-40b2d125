import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useClients } from '@/hooks/useDashboardData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export function CreateCaseDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { data: clients } = useClients();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_id || !formData.title) {
      toast.error(t('case.requiredFields'));
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('cases').insert({
      client_id: formData.client_id,
      title: formData.title,
      description: formData.description || null,
      due_date: formData.due_date || null,
      assigned_to: user?.id,
      created_by: user?.id,
    });

    setLoading(false);
    if (error) {
      toast.error(`${t('case.createError')}: ${error.message}`);
      return;
    }

    toast.success(t('case.createdSuccess'));
    queryClient.invalidateQueries({ queryKey: ['cases'] });
    setOpen(false);
    setFormData({ client_id: '', title: '', description: '', due_date: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Briefcase className="h-4 w-4" />
          {t('case.newCase')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('case.createCase')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">{t('table.client')} *</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('case.selectClient')} />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t('case.caseTitle')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('case.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">{t('case.dueDate')}</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('case.creating') : t('case.createCase')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
