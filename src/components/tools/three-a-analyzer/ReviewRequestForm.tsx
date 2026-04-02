import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Send, CheckCircle2 } from 'lucide-react';

const reviewSchema = z.object({
  firstName: z.string().trim().min(1, 'Vorname ist erforderlich').max(100),
  lastName: z.string().trim().min(1, 'Nachname ist erforderlich').max(100),
  email: z.string().trim().email('Ungültige E-Mail-Adresse').max(255),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().max(2000).optional(),
  consent: z.boolean().refine(val => val === true, 'Einverständnis ist erforderlich'),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewRequestFormProps {
  analysisId: string | null;
}

export function ReviewRequestForm({ analysisId }: ReviewRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      message: '',
      consent: false,
    },
  });

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('three_a_review_requests').insert({
        analysis_id: analysisId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
        consent_given: data.consent,
        status: 'new',
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Anfrage erfolgreich gesendet');
    } catch (err) {
      console.error('Review request error:', err);
      toast.error('Fehler beim Senden der Anfrage. Bitte versuche es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Vielen Dank für deine Anfrage</h3>
          <p className="text-muted-foreground">
            Wir melden uns zeitnah bei dir, um die vertiefte Analyse zu besprechen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Meine 3a persönlich prüfen lassen</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vorname *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dein Vorname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nachname *</FormLabel>
                    <FormControl>
                      <Input placeholder="Dein Nachname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="deine@email.ch" {...field} />
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
                  <FormLabel>Telefon (optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+41 79 ..." {...field} />
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
                  <FormLabel>Nachricht (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hast du konkrete Fragen zu deiner 3a-Lösung?"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Ich bin einverstanden, dass ich zum Zweck der Analyse kontaktiert werde. *
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                'Wird gesendet...'
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Vertiefte Analyse anfragen
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
