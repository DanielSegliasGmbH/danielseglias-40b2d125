import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield, 
  Target, 
  TrendingUp, 
  Calculator, 
  Users, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function PublicLanding() {
  const { t } = useTranslation();

  const services = [
    {
      icon: Shield,
      title: t('public.services.insurance.title'),
      description: t('public.services.insurance.description'),
    },
    {
      icon: Target,
      title: t('public.services.goals.title'),
      description: t('public.services.goals.description'),
    },
    {
      icon: TrendingUp,
      title: t('public.services.investment.title'),
      description: t('public.services.investment.description'),
    },
    {
      icon: Calculator,
      title: t('public.services.planning.title'),
      description: t('public.services.planning.description'),
    },
  ];

  const benefits = [
    t('public.benefits.item1'),
    t('public.benefits.item2'),
    t('public.benefits.item3'),
    t('public.benefits.item4'),
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto">
            {t('public.hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('public.hero.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="w-full sm:w-auto">
                {t('public.hero.cta')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/tools">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t('public.hero.secondary')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-4">
            {t('public.services.title')}
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {t('public.services.subtitle')}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{service.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                {t('public.benefits.title')}
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/contact" className="inline-block mt-8">
                <Button>
                  {t('public.benefits.cta')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 lg:p-12">
              <div className="flex items-center gap-4 mb-6">
                <Users className="h-12 w-12 text-primary" />
                <div>
                  <div className="text-4xl font-bold text-foreground">500+</div>
                  <div className="text-muted-foreground">{t('public.stats.clients')}</div>
                </div>
              </div>
              <p className="text-muted-foreground">
                {t('public.stats.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {t('public.cta.title')}
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            {t('public.cta.subtitle')}
          </p>
          <Link to="/contact">
            <Button variant="secondary" size="lg">
              {t('public.cta.button')}
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
