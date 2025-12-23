import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ArrowLeft, Calculator, PieChart, TrendingUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PublicTools() {
  const { t } = useTranslation();

  const tools = [
    {
      id: 'budget-calculator',
      icon: Calculator,
      title: t('public.tools.budgetCalculator.title'),
      description: t('public.tools.budgetCalculator.description'),
      status: 'coming_soon' as const,
    },
    {
      id: 'retirement-planner',
      icon: PieChart,
      title: t('public.tools.retirementPlanner.title'),
      description: t('public.tools.retirementPlanner.description'),
      status: 'coming_soon' as const,
    },
    {
      id: 'investment-simulator',
      icon: TrendingUp,
      title: t('public.tools.investmentSimulator.title'),
      description: t('public.tools.investmentSimulator.description'),
      status: 'coming_soon' as const,
    },
  ];

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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <Card key={tool.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <tool.icon className="h-5 w-5 text-primary" />
                    </div>
                    {tool.status === 'coming_soon' && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {t('public.tools.comingSoon')}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled={tool.status === 'coming_soon'}>
                    {t('public.tools.startTool')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

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
