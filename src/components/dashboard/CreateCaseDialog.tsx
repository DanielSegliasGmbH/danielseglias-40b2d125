import { useState } from 'react';
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
      toast.error('Client und Titel sind Pflichtfelder');
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
      toast.error('Fehler beim Erstellen: ' + error.message);
      return;
    }

    toast.success('Case erfolgreich erstellt');
    queryClient.invalidateQueries({ queryKey: ['cases'] });
    setOpen(false);
    setFormData({ client_id: '', title: '', description: '', due_date: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Briefcase className="h-4 w-4" />
          Neuer Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Case anlegen</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <Select
              value={formData.client_id}
              onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Client auswählen" />
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
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="due_date">Fälligkeitsdatum</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Erstellen...' : 'Case erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
