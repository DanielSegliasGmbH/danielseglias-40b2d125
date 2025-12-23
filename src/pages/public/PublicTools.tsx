import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ArrowLeft, Calculator, PieChart, TrendingUp, FileText, Clock, Wrench, LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePublicTools } from '@/hooks/useTools';

// Icon mapping from DB icon string to Lucide component
const iconMap: Record<string, LucideIcon> = {
  'calculator': Calculator,
  'pie-chart': PieChart,
  'trending-up': TrendingUp,
  'file-text': FileText,
  'wrench': Wrench,
};

export default function PublicTools() {
  const { t } = useTranslation();
  const { data: tools, isLoading, error } = usePublicTools();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-primary">
            {t('public.brand')}
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('public.nav.home')}
            </Link>
            <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('public.nav.blog')}
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('public.nav.contact')}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
            <Link to="/login">
              <Button variant="outline" size="sm">
                {t('auth.login')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('app.back')}
        </Link>

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
              <CardContent className="p-6 text-destructive">
                {t('app.loadError')}
              </CardContent>
            </Card>
          )}

          {tools && tools.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => {
                const IconComponent = iconMap[tool.icon] || Wrench;
                const isPlanned = tool.status === 'planned';

                return (
                  <Card key={tool.id} className="transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                        {isPlanned && (
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {t('public.tools.comingSoon')}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{t(tool.name_key)}</CardTitle>
                      <CardDescription>{t(tool.description_key)}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full" disabled={isPlanned}>
                        {t('public.tools.startTool')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
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
      </main>
    </div>
  );
}
