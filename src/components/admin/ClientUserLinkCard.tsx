import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Link, UserPlus, Unlink, ExternalLink, User } from 'lucide-react';
import { toast } from 'sonner';

interface ClientUserLinkCardProps {
  clientId: string;
}

// Hook to get linked user for a client
function useClientUser(clientId: string) {
  return useQuery({
    queryKey: ['client-user', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_users')
        .select('id, user_id, created_at')
        .eq('client_id', clientId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        // Get profile info for the user
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', data.user_id)
          .maybeSingle();
        
        return {
          ...data,
          profile,
        };
      }
      
      return null;
    },
    enabled: !!clientId,
  });
}

// Hook to link a user to a client
function useLinkUserToClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, clientId }: { userId: string; clientId: string }) => {
      // Check if this user already has a client link
      const { data: existingUserLink } = await supabase
        .from('client_users')
        .select('id, client_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingUserLink) {
        throw new Error('user_already_linked');
      }

      // Check if this client already has a user link
      const { data: existingClientLink } = await supabase
        .from('client_users')
        .select('id')
        .eq('client_id', clientId)
        .maybeSingle();

      if (existingClientLink) {
        throw new Error('client_already_linked');
      }

      // Insert new link
      const { error } = await supabase
        .from('client_users')
        .insert({ user_id: userId, client_id: clientId });

      if (error) throw error;

      return { success: true };
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client-user', clientId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

// Hook to unlink a user from a client
function useUnlinkUserFromClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      const { error } = await supabase
        .from('client_users')
        .delete()
        .eq('client_id', clientId);

      if (error) throw error;

      return { success: true };
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client-user', clientId] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function ClientUserLinkCard({ clientId }: ClientUserLinkCardProps) {
  const { t } = useTranslation();
  const { data: clientUser, isLoading } = useClientUser(clientId);
  const linkUser = useLinkUserToClient();
  const unlinkUser = useUnlinkUserFromClient();

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [linking, setLinking] = useState(false);

  const handleLink = async () => {
    if (!userId.trim()) return;

    setLinking(true);
    try {
      await linkUser.mutateAsync({ userId: userId.trim(), clientId });
      toast.success(t('clientPortal.userLinked'));
      setLinkDialogOpen(false);
      setUserId('');
    } catch (error: any) {
      if (error.message === 'user_already_linked') {
        toast.error(t('clientPortal.userAlreadyLinked'));
      } else if (error.message === 'client_already_linked') {
        toast.error(t('clientPortal.clientAlreadyLinked'));
      } else {
        toast.error(`${t('clientPortal.linkError')}: ${error.message}`);
      }
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    try {
      await unlinkUser.mutateAsync({ clientId });
      toast.success(t('clientPortal.userUnlinked'));
      setUnlinkDialogOpen(false);
    } catch (error: any) {
      toast.error(`${t('clientPortal.unlinkError')}: ${error.message}`);
    }
  };

  const openPortalPreview = () => {
    window.open('/app/client-portal', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t('clientPortal.portalAccess')}
        </CardTitle>
        <CardDescription>
          {t('clientPortal.portalAccessDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse h-10 bg-muted rounded" />
        ) : clientUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {clientUser.profile?.first_name} {clientUser.profile?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  User ID: {clientUser.user_id.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={openPortalPreview}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('clientPortal.previewPortal')}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive hover:text-destructive"
                onClick={() => setUnlinkDialogOpen(true)}
              >
                <Unlink className="h-4 w-4 mr-2" />
                {t('clientPortal.unlinkUser')}
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
                  {t('clientPortal.noUserLinked')}
                </p>
              </div>
            </div>

            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Link className="h-4 w-4 mr-2" />
                  {t('clientPortal.linkUser')}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('clientPortal.linkUser')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="userId">User ID (UUID)</Label>
                    <Input
                      id="userId"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('clientPortal.userIdHint')}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setLinkDialogOpen(false)}
                    >
                      {t('app.cancel')}
                    </Button>
                    <Button
                      onClick={handleLink}
                      disabled={linking || !userId.trim()}
                    >
                      {linking ? t('app.loading') : t('clientPortal.linkUser')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Unlink Confirmation */}
        <AlertDialog open={unlinkDialogOpen} onOpenChange={setUnlinkDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('clientPortal.unlinkUser')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('clientPortal.unlinkConfirm')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('app.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnlink}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('clientPortal.unlinkUser')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
