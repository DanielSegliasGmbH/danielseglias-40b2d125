import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Shield, Trash2, Eye, EyeOff, Flag } from 'lucide-react';

export default function AdminCommunities() {
  const qc = useQueryClient();

  // Pending group requests
  const { data: requests = [] } = useQuery({
    queryKey: ['admin-group-requests'],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_group_requests')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  // All groups
  const { data: groups = [] } = useQuery({
    queryKey: ['admin-groups'],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_groups')
        .select('*, community_group_members(count)')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Flagged posts
  const { data: flaggedPosts = [] } = useQuery({
    queryKey: ['admin-flagged-posts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('community_group_posts')
        .select('*')
        .gt('flag_count', 0)
        .order('flag_count', { ascending: false });
      return data || [];
    },
  });

  const approveRequest = useMutation({
    mutationFn: async (id: string) => {
      const req = requests.find(r => r.id === id);
      if (!req) return;
      // Create the group
      await supabase.from('community_groups').insert({
        name: req.group_name,
        description: req.description,
        created_by: req.user_id,
      });
      // Update request
      await supabase.from('community_group_requests').update({ status: 'approved' }).eq('id', id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-group-requests'] });
      qc.invalidateQueries({ queryKey: ['admin-groups'] });
      toast.success('Gruppe genehmigt');
    },
  });

  const rejectRequest = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('community_group_requests').update({ status: 'rejected' }).eq('id', id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-group-requests'] });
      toast.success('Anfrage abgelehnt');
    },
  });

  const toggleGroupActive = async (id: string, active: boolean) => {
    await supabase.from('community_groups').update({ is_active: active }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-groups'] });
    toast.success(active ? 'Gruppe aktiviert' : 'Gruppe deaktiviert');
  };

  const togglePostHidden = async (id: string, hidden: boolean) => {
    await supabase.from('community_group_posts').update({ is_hidden: hidden }).eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-flagged-posts'] });
    toast.success(hidden ? 'Beitrag versteckt' : 'Beitrag sichtbar');
  };

  const deletePost = async (id: string) => {
    await supabase.from('community_group_posts').delete().eq('id', id);
    qc.invalidateQueries({ queryKey: ['admin-flagged-posts'] });
    toast.success('Beitrag gelöscht');
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <AppLayout>
      <ScreenHeader title="Community-Verwaltung" showBack backTo="/app" />
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <Tabs defaultValue="requests">
          <TabsList className="w-full">
            <TabsTrigger value="requests" className="flex-1">
              Anfragen {pendingRequests.length > 0 && <Badge className="ml-1 text-[10px]">{pendingRequests.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">Gruppen</TabsTrigger>
            <TabsTrigger value="moderation" className="flex-1">
              Moderation {flaggedPosts.length > 0 && <Badge variant="destructive" className="ml-1 text-[10px]">{flaggedPosts.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-2">
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Keine offenen Anfragen</p>
            ) : (
              pendingRequests.map(r => (
                <Card key={r.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{r.group_name}</p>
                        <p className="text-xs text-muted-foreground">{r.description || 'Keine Beschreibung'}</p>
                        {r.reason && <p className="text-xs text-muted-foreground mt-1">Grund: {r.reason}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="sm" variant="default" onClick={() => approveRequest.mutate(r.id)}>
                          <Check className="h-3.5 w-3.5 mr-1" /> Genehmigen
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectRequest.mutate(r.id)}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-2">
            {groups.map((g: any) => (
              <Card key={g.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{g.icon_emoji || '👥'}</span>
                    <div>
                      <p className="font-medium text-sm">{g.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {g.community_group_members?.[0]?.count || 0} Mitglieder
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={g.is_active ? 'default' : 'secondary'}>
                      {g.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => toggleGroupActive(g.id, !g.is_active)}>
                      {g.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="moderation" className="space-y-2">
            {flaggedPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Keine gemeldeten Beiträge</p>
            ) : (
              flaggedPosts.map((p: any) => (
                <Card key={p.id} className={p.is_hidden ? 'opacity-50' : ''}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Flag className="h-3.5 w-3.5 text-destructive" />
                          <Badge variant="destructive" className="text-[10px]">{p.flag_count} Meldungen</Badge>
                          {p.is_hidden && <Badge variant="secondary" className="text-[10px]">Versteckt</Badge>}
                        </div>
                        <p className="text-xs line-clamp-3">{p.content}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="outline" onClick={() => togglePostHidden(p.id, !p.is_hidden)}>
                          {p.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Button size="icon" variant="destructive" onClick={() => deletePost(p.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
