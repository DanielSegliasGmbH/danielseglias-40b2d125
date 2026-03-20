import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateUser } from '@/hooks/useUserManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Link, UserPlus, Unlink, ExternalLink, User } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerUserLinkCardProps {
  customerId: string;
}

function useCustomerName(customerId: string) {
  return useQuery({
    queryKey: ['customer-name', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('first_name, last_name')
        .eq('id', customerId)
        .maybeSingle();
      if (error) throw error;
      return data ? `${data.first_name} ${data.last_name}` : null;
    },
    enabled: !!customerId,
  });
}

function useCustomerUser(customerId: string) {
  return useQuery({
    queryKey: ['customer-user', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_users')
        .select('id, user_id, created_at')
        .eq('customer_id', customerId)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', data.user_id)
          .maybeSingle();
        return { ...data, profile };
      }
      return null;
    },
    enabled: !!customerId,
  });
}

function useLinkUserToCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, customerId }: { userId: string; customerId: string }) => {
      const { data: existingUserLink } = await supabase
        .from('customer_users')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
      if (existingUserLink) throw new Error('user_already_linked');

      const { data: existingCustomerLink } = await supabase
        .from('customer_users')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();
      if (existingCustomerLink) throw new Error('customer_already_linked');

      const { error } = await supabase
        .from('customer_users')
        .insert({ user_id: userId, customer_id: customerId });
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-user', customerId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

function useUnlinkUserFromCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ customerId }: { customerId: string }) => {
      const { error } = await supabase
        .from('customer_users')
        .delete()
        .eq('customer_id', customerId);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['customer-user', customerId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function CustomerUserLinkCard({ customerId }: CustomerUserLinkCardProps) {
  const { t } = useTranslation();
  const { data: customerName } = useCustomerName(customerId);
  const { data: customerUser, isLoading } = useCustomerUser(customerId);
  const linkUser = useLinkUserToCustomer();
  const unlinkUser = useUnlinkUserFromCustomer();
  const createUser = useCreateUser();

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [linking, setLinking] = useState(false);

  // Create user form state
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [creating, setCreating] = useState(false);

  const handleLink = async () => {
    if (!userId.trim()) return;
    setLinking(true);
    try {
      await linkUser.mutateAsync({ userId: userId.trim(), customerId });
      toast.success('Benutzer erfolgreich verknüpft.');
      setLinkDialogOpen(false);
      setUserId('');
    } catch (error: any) {
      if (error.message === 'user_already_linked') {
        toast.error('Dieser Benutzer ist bereits mit einem Kunden verknüpft.');
      } else if (error.message === 'customer_already_linked') {
        toast.error('Dieser Kunde hat bereits einen verknüpften Benutzer.');
      } else {
        toast.error(`Fehler beim Verknüpfen: ${error.message}`);
      }
    } finally {
      setLinking(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.email || !createForm.password || !createForm.firstName || !createForm.lastName) {
      toast.error('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    setCreating(true);
    try {
      await createUser.mutateAsync({
        email: createForm.email,
        password: createForm.password,
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        role: 'client',
        customerId,
      });
      toast.success('Zugang erfolgreich erstellt. Der Benutzer kann sich jetzt anmelden.');
      setLinkDialogOpen(false);
      setCreateForm({ email: '', password: '', firstName: '', lastName: '' });
    } catch (error: any) {
      if (error.message?.includes('already been registered')) {
        toast.error('Diese E-Mail-Adresse wird bereits verwendet.');
      } else {
        toast.error(`Zugang konnte nicht erstellt werden: ${error.message}`);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUnlink = async () => {
    try {
      await unlinkUser.mutateAsync({ customerId });
      toast.success('Verknüpfung erfolgreich entfernt.');
      setUnlinkDialogOpen(false);
    } catch (error: any) {
      toast.error(`Fehler beim Entfernen der Verknüpfung: ${error.message}`);
    }
  };

  const openPortalPreview = () => {
    window.open(`/app/client-portal?previewCustomerId=${customerId}`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Portalzugang
        </CardTitle>
        <CardDescription>
          Zugang zum Mitgliederbereich für diesen Kunden verwalten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse h-10 bg-muted rounded" />
        ) : customerUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {customerUser.profile?.first_name} {customerUser.profile?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  User ID: {customerUser.user_id.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={openPortalPreview}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Portal-Vorschau
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setUnlinkDialogOpen(true)}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Verknüpfung entfernen
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-muted-foreground">
                  Kein Benutzer verknüpft. Erstelle einen Zugang, damit sich dieser Kunde anmelden kann.
                </p>
              </div>
            </div>

            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Zugang erstellen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Zugang für {customerName || 'Kunde'} erstellen</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="create">
                  <TabsList className="w-full">
                    <TabsTrigger value="create" className="flex-1">Neuen Zugang erstellen</TabsTrigger>
                    <TabsTrigger value="link" className="flex-1">Bestehenden verknüpfen</TabsTrigger>
                  </TabsList>

                  <TabsContent value="create">
                    <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Vorname *</Label>
                          <Input
                            value={createForm.firstName}
                            onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nachname *</Label>
                          <Input
                            value={createForm.lastName}
                            onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>E-Mail *</Label>
                        <Input
                          type="email"
                          value={createForm.email}
                          onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Startpasswort *</Label>
                        <Input
                          type="password"
                          value={createForm.password}
                          onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                          required
                          minLength={6}
                        />
                        <p className="text-xs text-muted-foreground">
                          Der Benutzer kann das Passwort später in seinem Profil ändern.
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setLinkDialogOpen(false)}>
                          Abbrechen
                        </Button>
                        <Button type="submit" disabled={creating}>
                          {creating ? 'Erstelle...' : 'Zugang erstellen'}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="link">
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>User ID (UUID)</Label>
                        <Input
                          value={userId}
                          onChange={(e) => setUserId(e.target.value)}
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Die User-ID findest du in der Benutzerverwaltung.
                        </p>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setLinkDialogOpen(false)}>
                          Abbrechen
                        </Button>
                        <Button onClick={handleLink} disabled={linking || !userId.trim()}>
                          {linking ? 'Verknüpfe...' : 'Verknüpfen'}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <AlertDialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Verknüpfung entfernen</AlertDialogTitle>
              <AlertDialogDescription>
                Der Benutzer verliert den Zugang zum Mitgliederbereich dieses Kunden. Der Login bleibt bestehen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnlink}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Verknüpfung entfernen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
