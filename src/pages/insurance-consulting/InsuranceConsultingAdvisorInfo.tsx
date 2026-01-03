import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ExternalLink } from 'lucide-react';

const GOOGLE_DRIVE_FILE_ID = '1Ppg1PGzZ2Y3uVQddl5RJ0M0NSade5B7d';

export default function InsuranceConsultingAdvisorInfo() {
  const { t } = useTranslation();

  const googleDrivePreviewUrl = `https://drive.google.com/file/d/${GOOGLE_DRIVE_FILE_ID}/preview`;
  const googleDriveViewUrl = `https://drive.google.com/file/d/${GOOGLE_DRIVE_FILE_ID}/view`;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
                Beraterinformationen
              </h1>
              <p className="text-muted-foreground mt-1">
                Gemäss VAG Art. 45 - Informationspflicht
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href={googleDriveViewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                In neuem Tab öffnen
              </a>
            </Button>
          </div>

          {/* PDF Preview Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                PDF Dokument
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[210/297] max-w-2xl mx-auto bg-muted rounded-lg overflow-hidden">
                <iframe
                  src={googleDrivePreviewUrl}
                  className="w-full h-full border-0"
                  allow="autoplay"
                  title="Beraterinformationen PDF"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
