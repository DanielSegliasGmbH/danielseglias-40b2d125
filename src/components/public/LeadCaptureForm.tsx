import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Send, CheckCircle2 } from 'lucide-react';
import { useUtmParams } from '@/hooks/useUtmParams';

const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name ist erforderlich').max(100),
  email: z.string().trim().email('Ungültige E-Mail-Adresse').max(255),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(2000).optional(),
  honeypot: z.string().optional(), // Hidden honeypot field
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadCaptureFormProps {
  source: string;
  pageSlug?: string;
  toolKey?: string;
  title?: string;
  description?: string;
  showMessage?: boolean;
  ctaText?: string;
  metadata?: Json;
  onSuccess?: () => void;
  compact?: boolean;
}

export function LeadCaptureForm({
  source,
  pageSlug,
  toolKey,
  title,
  description,
  showMessage = true,
  ctaText,
  metadata,
  onSuccess,
  compact = false,
}: LeadCaptureFormProps) {
  const { t } = useTranslation();
  const utmParams = useUtmParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      honeypot: '',
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    setIsRateLimited(false);
    
    try {
      const response = await supabase.functions.invoke('submit-lead', {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          message: data.message || null,
          source,
          page_slug: pageSlug || null,
          tool_key: toolKey || null,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_content: utmParams.utm_content,
          utm_term: utmParams.utm_term,
          metadata: metadata || null,
          honeypot: data.honeypot || '',
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data as { success: boolean; code?: string; message?: string };

      if (!result.success) {
        if (result.code === 'RATE_LIMIT') {
          setIsRateLimited(true);
          toast.error(t('public.lead.rateLimited'));
          return;
        }
        if (result.code === 'VALIDATION') {
          toast.error(result.message || t('public.lead.validationError'));
          return;
        }
        throw new Error(result.code || 'Unknown error');
      }

      setIsSuccess(true);
      toast.success(t('public.lead.success'));
      onSuccess?.();
    } catch (error) {
      console.error('Lead submission error:', error);
      toast.error(t('public.lead.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className={compact ? 'bg-primary/5 border-primary/20' : ''}>
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">
            {t('public.lead.thankYouTitle')}
          </h3>
          <p className="text-muted-foreground">
            {t('public.lead.thankYouMessage')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={compact ? 'bg-primary/5 border-primary/20' : ''}>
      {(title || description) && (
        <CardHeader className={compact ? 'pb-4' : ''}>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className={!title && !description ? 'pt-6' : ''}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={compact ? 'space-y-3' : 'space-y-4'}>
            {/* Honeypot field - hidden from users, catches bots */}
            <div className="hidden" aria-hidden="true">
              <Input
                {...form.register('honeypot')}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>
            
            {isRateLimited && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {t('public.lead.rateLimitedMessage')}
              </div>
            )}
            <div className={compact ? 'grid sm:grid-cols-2 gap-3' : 'space-y-4'}>
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
            </div>

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

            {showMessage && (
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('public.contact.message')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('public.contact.messagePlaceholder')}
                        rows={compact ? 3 : 5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                t('app.loading')
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {ctaText || t('public.contact.submit')}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
