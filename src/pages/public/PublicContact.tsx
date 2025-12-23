import { useTranslation } from 'react-i18next';
import { PublicLayout } from '@/layouts/PublicLayout';
import { LeadCaptureForm } from '@/components/public/LeadCaptureForm';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function PublicContact() {
  const { t } = useTranslation();

  return (
    <PublicLayout title={t('public.contact.title')} description={t('public.contact.subtitle')}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <LeadCaptureForm
            source="contact_form"
            pageSlug="contact"
            title={t('public.contact.title')}
            description={t('public.contact.subtitle')}
            showMessage={true}
          />

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
      </div>
    </PublicLayout>
  );
}
