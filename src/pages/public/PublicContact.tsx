import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ArrowLeft, Send, CheckCircle2, Phone, Mail, MapPin } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name ist erforderlich').max(100),
  email: z.string().trim().email('Ungültige E-Mail-Adresse').max(255),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(10, 'Nachricht muss mindestens 10 Zeichen haben').max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function PublicContact() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          message: data.message,
          source: 'contact_form',
        });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: t('public.contact.successTitle'),
        description: t('public.contact.successMessage'),
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: t('app.error'),
        description: t('public.contact.errorMessage'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-primary">
              {t('public.brand')}
            </Link>
            <div className="flex items-center gap-2">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {t('public.contact.thankYouTitle')}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t('public.contact.thankYouMessage')}
            </p>
            <Link to="/">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('public.contact.backToHome')}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
            <Link to="/tools" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('public.nav.tools')}
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

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('public.contact.title')}</CardTitle>
              <CardDescription>{t('public.contact.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('public.contact.name')} *</FormLabel>
                        <FormControl>
                          <Input placeholder={t('public.contact.namePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('public.contact.email')} *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder={t('public.contact.emailPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('public.contact.phone')}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={t('public.contact.phonePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('public.contact.message')} *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={t('public.contact.messagePlaceholder')} 
                            rows={5}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      t('app.loading')
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        {t('public.contact.submit')}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                {t('public.contact.infoTitle')}
              </h2>
              <p className="text-muted-foreground">
                {t('public.contact.infoDescription')}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t('public.contact.phoneLabel')}</h3>
                  <p className="text-muted-foreground">+41 44 000 00 00</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t('public.contact.emailLabel')}</h3>
                  <p className="text-muted-foreground">info@example.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{t('public.contact.addressLabel')}</h3>
                  <p className="text-muted-foreground">
                    Musterstrasse 123<br />
                    8000 Zürich
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
