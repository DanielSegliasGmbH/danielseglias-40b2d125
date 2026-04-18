import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCases, type CaseWithCustomer } from '@/hooks/useDashboardData';
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
import { ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TaskPriority = Database['public']['Enums']['task_priority'];

const PRIORITY_KEYS: TaskPriority[] = ['niedrig', 'mittel', 'hoch', 'dringend'];

export function CreateTaskDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { data: cases } = useCases();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    case_id: '',
    title: '',
    description: '',
    priority: 'mittel' as TaskPriority,
    due_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.case_id || !formData.title) {
      toast.error(t('task.requiredFields'));
      return;
    }

    setLoading(true);
    // DEPRECATED: use client_tasks instead
    // Note: this admin CRM dialog still writes to `tasks` because the row is
    // tied to a `case_id` (FK to cases), which client_tasks does not support.
    // Migration to client_tasks requires the cases module to be retired first.
    const { error } = await supabase.from('tasks').insert({
      case_id: formData.case_id,
      title: formData.title,
      description: formData.description || null,
      priority: formData.priority,
      due_date: formData.due_date || null,
      assigned_to: user?.id,
      created_by: user?.id,
    });

    setLoading(false);
    if (error) {
      toast.error(`${t('task.createError')}: ${error.message}`);
      return;
    }

    toast.success(t('task.createdSuccess'));
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    setOpen(false);
    setFormData({ case_id: '', title: '', description: '', priority: 'mittel', due_date: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <ClipboardList className="h-4 w-4" />
          {t('task.newTask')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('task.createTask')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="case_id">{t('case.title')} *</Label>
            <Select
              value={formData.case_id}
              onValueChange={(value) => setFormData({ ...formData, case_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('task.selectCase')} />
              </SelectTrigger>
              <SelectContent>
                {cases?.map((c: CaseWithCustomer) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.title} ({c.customer?.first_name} {c.customer?.last_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">{t('task.taskTitle')} *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('task.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">{t('task.priority')}</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as TaskPriority })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_KEYS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {t(`task.priorities.${p}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">{t('task.dueDate')}</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t('task.creating') : t('task.createTask')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
