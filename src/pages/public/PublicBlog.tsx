import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function PublicBlog() {
  const { t, i18n } = useTranslation();

  const { data: articles, isLoading } = useQuery({
    queryKey: ['public-pages', 'blog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_pages')
        .select('*')
        .eq('page_type', 'blog')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <PublicLayout title={t('public.blog.title')} description={t('public.blog.subtitle')}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('public.blog.title')}</h1>
              <p className="text-muted-foreground">{t('public.blog.subtitle')}</p>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <Card key={article.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      {article.published_at && format(
                        new Date(article.published_at), 
                        'dd. MMMM yyyy', 
                        { locale: i18n.language === 'de' ? de : undefined }
                      )}
                    </div>
                    <CardTitle className="text-xl">{article.title}</CardTitle>
                    {article.excerpt && (
                      <CardDescription>{article.excerpt}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link to={`/blog/${article.slug}`}>
                      <Button variant="ghost" className="p-0 h-auto text-primary">
                        {t('public.blog.readMore')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t('public.blog.noArticles')}
                </h3>
                <p className="text-muted-foreground">
                  {t('public.blog.noArticlesDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
