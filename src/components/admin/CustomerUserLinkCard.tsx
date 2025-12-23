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

interface CustomerUserLinkCardProps {
  customerId: string;
}

// Hook to get customer name
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

// Hook to get linked user for a customer
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
    enabled: !!customerId,
  });
}

// Hook to link a user to a customer
function useLinkUserToCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, customerId }: { userId: string; customerId: string }) => {
      // Check if this user already has a customer link
      const { data: existingUserLink } = await supabase
        .from('customer_users')
        .select('id, customer_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingUserLink) {
        throw new Error('user_already_linked');
      }

      // Check if this customer already has a user link
      const { data: existingCustomerLink } = await supabase
        .from('customer_users')
        .select('id')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (existingCustomerLink) {
        throw new Error('customer_already_linked');
      }

      // Insert new link
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

// Hook to unlink a user from a customer
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
  const { data: customerUser, isLoading } = useCustomerUser(customerId);
  const linkUser = useLinkUserToCustomer();
  const unlinkUser = useUnlinkUserFromCustomer();

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [unlinkDialogOpen, setUnlinkDialogOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [linking, setLinking] = useState(false);

  const handleLink = async () => {
    if (!userId.trim()) return;

    setLinking(true);
    try {
      await linkUser.mutateAsync({ userId: userId.trim(), customerId });
      toast.success(t('clientPortal.userLinked'));
      setLinkDialogOpen(false);
      setUserId('');
    } catch (error: any) {
      if (error.message === 'user_already_linked') {
        toast.error(t('clientPortal.userAlreadyLinked'));
      } else if (error.message === 'customer_already_linked') {
        toast.error(t('clientPortal.customerAlreadyLinked', t('clientPortal.clientAlreadyLinked')));
      } else {
        toast.error(`${t('clientPortal.linkError')}: ${error.message}`);
      }
    } finally {
      setLinking(false);
    }
  };

  const handleUnlink = async () => {
    try {
      await unlinkUser.mutateAsync({ customerId });
      toast.success(t('clientPortal.userUnlinked'));
      setUnlinkDialogOpen(false);
    } catch (error: any) {
      toast.error(`${t('clientPortal.unlinkError')}: ${error.message}`);
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
          {t('clientPortal.portalAccess')}
        </CardTitle>
        <CardDescription>
          {t('clientPortal.portalAccessDescription')}
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
