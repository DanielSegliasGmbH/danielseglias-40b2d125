import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, FileText, ExternalLink, Save, X } from 'lucide-react';

// Default Google Drive File ID - replace with actual PDF file ID
// To get the file ID: Open the PDF in Google Drive, click "Share", copy link
// Link format: https://drive.google.com/file/d/FILE_ID/view
// Extract the FILE_ID part
const DEFAULT_GOOGLE_DRIVE_FILE_ID = '';

export default function InsuranceConsultingAdvisorInfo() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [fileId, setFileId] = useState(DEFAULT_GOOGLE_DRIVE_FILE_ID);
  const [tempFileId, setTempFileId] = useState(fileId);

  const handleSave = () => {
    // Extract file ID from full URL if pasted
    let extractedId = tempFileId;
    const match = tempFileId.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
      extractedId = match[1];
    }
    setFileId(extractedId);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempFileId(fileId);
    setIsEditing(false);
  };

  const googleDrivePreviewUrl = fileId 
    ? `https://drive.google.com/file/d/${fileId}/preview`
    : null;

  const googleDriveViewUrl = fileId
    ? `https://drive.google.com/file/d/${fileId}/view`
    : null;

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
            {googleDriveViewUrl && (
              <Button variant="outline" asChild>
                <a href={googleDriveViewUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  In neuem Tab öffnen
                </a>
              </Button>
            )}
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
              {googleDrivePreviewUrl ? (
                <div className="aspect-[3/4] md:aspect-[4/3] lg:aspect-video w-full bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={googleDrivePreviewUrl}
                    className="w-full h-full border-0"
                    allow="autoplay"
                    title="Beraterinformationen PDF"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Kein PDF verknüpft</p>
                  <p className="text-sm mt-1">
                    Klicken Sie auf "Bearbeiten" um ein Google Drive PDF hinzuzufügen
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Section */}
          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Google Drive PDF verknüpfen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fileId">Google Drive Link oder File ID</Label>
                  <Input
                    id="fileId"
                    value={tempFileId}
                    onChange={(e) => setTempFileId(e.target.value)}
                    placeholder="https://drive.google.com/file/d/FILE_ID/view oder FILE_ID"
                  />
                  <p className="text-xs text-muted-foreground">
                    Öffnen Sie das PDF in Google Drive, klicken Sie auf "Teilen" und kopieren Sie den Link. 
                    Stellen Sie sicher, dass die Freigabe auf "Jeder mit dem Link" gesetzt ist.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave}>
                    <Save className="w-4 h-4 mr-2" />
                    Speichern
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Abbrechen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button 
              variant="link" 
              className="text-primary p-0 h-auto font-normal"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Bearbeiten
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
