import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, Wrench, ArrowRight, AlertCircle } from 'lucide-react';

interface PublicPage {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  page_type: string;
  is_published: boolean;
  updated_at: string;
}

export default function PublicTools() {
  const { t } = useTranslation();

  // Load from public_pages - only published tools
  const { data: tools, isLoading, error } = useQuery({
    queryKey: ['public-pages-tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_pages')
        .select('*')
        .eq('page_type', 'tool')
        .eq('is_published', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as PublicPage[];
    },
  });

  return (
    <PublicLayout title={t('public.tools.title')} description={t('public.tools.subtitle')}>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('public.tools.title')}</h1>
              <p className="text-muted-foreground">{t('public.tools.subtitle')}</p>
            </div>
          </div>

          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="w-10 h-10 rounded-lg mb-2" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="border-destructive">
              <CardContent className="p-6 flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{t('app.loadError')}</span>
              </CardContent>
            </Card>
          )}

          {tools && tools.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card key={tool.id} className="transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    {tool.excerpt && (
                      <CardDescription>{tool.excerpt}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Link to={`/tools/${tool.slug}`}>
                      <Button variant="outline" className="w-full">
                        {t('public.tools.startTool')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {tools && tools.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                {t('public.tools.noToolsAvailable')}
              </CardContent>
            </Card>
          )}

          {/* CTA Section */}
          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {t('public.tools.ctaTitle')}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t('public.tools.ctaDescription')}
              </p>
              <Link to="/contact">
                <Button>
                  {t('public.tools.ctaButton')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicLayout>
  );
}
