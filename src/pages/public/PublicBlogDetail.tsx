import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function PublicBlogDetail() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['public-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-12">
        <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('public.blog.backToList')}
        </Link>

        <div className="max-w-3xl mx-auto">
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <div className="space-y-2 mt-8">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="py-12 text-center text-destructive">
                {t('app.loadError')}
              </CardContent>
            </Card>
          )}

          {!isLoading && !article && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {t('public.blog.notFound')}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t('public.blog.notFoundDesc')}
                </p>
                <Link to="/blog">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('public.blog.backToList')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {article && (
            <>
              <article>
                <header className="mb-8">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4" />
                    {article.published_at && format(
                      new Date(article.published_at),
                      'dd. MMMM yyyy',
                      { locale: i18n.language === 'de' ? de : undefined }
                    )}
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                    {article.title}
                  </h1>
                  {article.excerpt && (
                    <p className="text-xl text-muted-foreground">
                      {article.excerpt}
                    </p>
                  )}
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {article.content ? (
                    <div className="whitespace-pre-wrap">{article.content}</div>
                  ) : (
                    <p className="text-muted-foreground italic">
                      {t('public.blog.noContent')}
                    </p>
                  )}
                </div>
              </article>

              {/* CTA Section */}
              <div className="mt-12 pt-8 border-t">
                <LeadCaptureForm
                  source="blog_cta"
                  pageSlug={slug}
                  title={t('public.blog.ctaTitle')}
                  description={t('public.blog.ctaDescription')}
                  showMessage={false}
                  compact
                />
              </div>
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
