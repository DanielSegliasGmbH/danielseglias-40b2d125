import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Users, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

type LeadStatus = 'new' | 'contacted' | 'converted' | 'archived';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
}

export default function AdminLeads() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: t('adminLeads.statusUpdated'),
      });
    },
    onError: () => {
      toast({
        title: t('app.error'),
        variant: 'destructive',
      });
    },
  });

  const getStatusVariant = (status: string | null): 'default' | 'secondary' | 'outline' | 'destructive' => {
    switch (status) {
      case 'new':
        return 'default';
      case 'contacted':
        return 'secondary';
      case 'converted':
        return 'outline';
      case 'archived':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const statusCounts = {
    new: leads?.filter(l => l.status === 'new').length || 0,
    contacted: leads?.filter(l => l.status === 'contacted').length || 0,
    converted: leads?.filter(l => l.status === 'converted').length || 0,
    archived: leads?.filter(l => l.status === 'archived').length || 0,
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('adminLeads.title')}</h1>
            <p className="text-muted-foreground">{t('adminLeads.subtitle')}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{statusCounts.new}</div>
              <div className="text-sm text-muted-foreground">{t('adminLeads.statusNew')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{statusCounts.contacted}</div>
              <div className="text-sm text-muted-foreground">{t('adminLeads.statusContacted')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{statusCounts.converted}</div>
              <div className="text-sm text-muted-foreground">{t('adminLeads.statusConverted')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-foreground">{statusCounts.archived}</div>
              <div className="text-sm text-muted-foreground">{t('adminLeads.statusArchived')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Leads List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : leads && leads.length > 0 ? (
          <div className="space-y-4">
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-foreground">{lead.name}</h3>
                        <Badge variant={getStatusVariant(lead.status)}>
                          {t(`adminLeads.status${(lead.status || 'new').charAt(0).toUpperCase() + (lead.status || 'new').slice(1)}`)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {lead.email}
                        </span>
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {lead.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(
                            new Date(lead.created_at),
                            'dd.MM.yyyy HH:mm',
                            { locale: i18n.language === 'de' ? de : undefined }
                          )}
                        </span>
                      </div>

                      {lead.message && (
                        <div className="bg-muted/50 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground mb-1">
                            <MessageSquare className="h-3 w-3" />
                            {t('adminLeads.message')}
                          </div>
                          <p className="text-foreground whitespace-pre-wrap">{lead.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      <Select
                        value={lead.status || 'new'}
                        onValueChange={(value) => updateStatusMutation.mutate({ id: lead.id, status: value as LeadStatus })}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">{t('adminLeads.statusNew')}</SelectItem>
                          <SelectItem value="contacted">{t('adminLeads.statusContacted')}</SelectItem>
                          <SelectItem value="converted">{t('adminLeads.statusConverted')}</SelectItem>
                          <SelectItem value="archived">{t('adminLeads.statusArchived')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t('adminLeads.noLeads')}
              </h3>
              <p className="text-muted-foreground">
                {t('adminLeads.noLeadsDesc')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
