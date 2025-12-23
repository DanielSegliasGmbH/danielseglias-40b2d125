import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, ExternalLink, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

type PageType = 'landing' | 'blog' | 'tool' | 'info';

interface PublicPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  page_type: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface PageFormData {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  page_type: PageType;
  is_published: boolean;
}

export default function AdminPublicPages() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PublicPage | null>(null);
  const [formData, setFormData] = useState<PageFormData>({
    slug: '',
    title: '',
    content: '',
    excerpt: '',
    page_type: 'blog',
    is_published: false,
  });

  const { data: pages, isLoading } = useQuery({
    queryKey: ['public-pages-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as PublicPage[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PageFormData & { id?: string }) => {
      const pageData = {
        slug: data.slug,
        title: data.title,
        content: data.content || null,
        excerpt: data.excerpt || null,
        page_type: data.page_type,
        is_published: data.is_published,
        published_at: data.is_published ? new Date().toISOString() : null,
        created_by: user?.id,
      };

      if (data.id) {
        const { error } = await supabase
          .from('public_pages')
          .update(pageData)
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('public_pages')
          .insert(pageData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-pages-admin'] });
      setDialogOpen(false);
      setEditingPage(null);
      resetForm();
      toast({
        title: t('adminPages.saved'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('app.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('public_pages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-pages-admin'] });
      toast({
        title: t('app.deleteSuccess'),
      });
    },
    onError: () => {
      toast({
        title: t('app.error'),
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      content: '',
      excerpt: '',
      page_type: 'blog',
      is_published: false,
    });
  };

  const openEditDialog = (page: PublicPage) => {
    setEditingPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      content: page.content || '',
      excerpt: page.excerpt || '',
      page_type: page.page_type as PageType,
      is_published: page.is_published,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingPage(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.slug || !formData.title) {
      toast({
        title: t('app.required'),
        variant: 'destructive',
      });
      return;
    }
    saveMutation.mutate(editingPage ? { ...formData, id: editingPage.id } : formData);
  };

  const getPageTypeLabel = (type: string) => {
    switch (type) {
      case 'landing':
        return t('adminPages.typeLanding');
      case 'blog':
        return t('adminPages.typeBlog');
      case 'tool':
        return t('adminPages.typeTool');
      case 'info':
        return t('adminPages.typeInfo');
      default:
        return type;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('adminPages.title')}</h1>
              <p className="text-muted-foreground">{t('adminPages.subtitle')}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/app/tools">
                <Wrench className="mr-2 h-4 w-4" />
                {t('adminPages.manageTools')}
              </Link>
            </Button>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              {t('adminPages.newPage')}
            </Button>
          </div>
        </div>

        {/* Pages List */}
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
        ) : pages && pages.length > 0 ? (
          <div className="space-y-4">
            {pages.map((page) => (
              <Card key={page.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{page.title}</h3>
                        <Badge variant="outline">{getPageTypeLabel(page.page_type)}</Badge>
                        {page.is_published ? (
                          <Badge variant="default" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            {t('adminPages.published')}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            {t('adminPages.draft')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        /{page.slug} • {t('adminPages.updatedAt')}{' '}
                        {format(
                          new Date(page.updated_at),
                          'dd.MM.yyyy HH:mm',
                          { locale: i18n.language === 'de' ? de : undefined }
                        )}
                      </p>
                      {page.excerpt && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{page.excerpt}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {page.is_published && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={`/blog/${page.slug}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(page)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteMutation.mutate(page.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t('adminPages.noPages')}
              </h3>
              <p className="text-muted-foreground mb-4">
                {t('adminPages.noPagesDesc')}
              </p>
              <Button onClick={openNewDialog}>
                <Plus className="mr-2 h-4 w-4" />
                {t('adminPages.newPage')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit/Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? t('adminPages.editPage') : t('adminPages.newPage')}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('adminPages.titleLabel')} *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder={t('adminPages.titlePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('adminPages.slugLabel')} *</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder={t('adminPages.slugPlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('adminPages.typeLabel')}</Label>
                  <Select
                    value={formData.page_type}
                    onValueChange={(value) => setFormData({ ...formData, page_type: value as PageType })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">{t('adminPages.typeBlog')}</SelectItem>
                      <SelectItem value="info">{t('adminPages.typeInfo')}</SelectItem>
                      <SelectItem value="landing">{t('adminPages.typeLanding')}</SelectItem>
                      <SelectItem value="tool">{t('adminPages.typeTool')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('adminPages.publishedLabel')}</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.is_published}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {formData.is_published ? t('adminPages.published') : t('adminPages.draft')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('adminPages.excerptLabel')}</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder={t('adminPages.excerptPlaceholder')}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('adminPages.contentLabel')}</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t('adminPages.contentPlaceholder')}
                  rows={10}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t('app.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('app.loading') : t('app.save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
