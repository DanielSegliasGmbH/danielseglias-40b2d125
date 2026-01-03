import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Save, FileText, Mail, Download, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useConsultationState } from '@/hooks/useConsultationState';
import { pyramidTopics } from '@/config/pyramidTopicsConfig';

export default function InsuranceConsultingSummary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { 
    topicStates, 
    saveConsultation, 
    isLoading, 
    hasUnsavedChanges,
    currentConsultationId 
  } = useConsultationState();
  
  const [saveLabel, setSaveLabel] = useState('');
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Categorize topics
  const importantTopics = pyramidTopics.filter(t => topicStates[t.id]?.important);
  const prioritizedTopics = pyramidTopics.filter(t => topicStates[t.id]?.prioritized);
  const discussedTopics = pyramidTopics.filter(t => topicStates[t.id]?.discussed);
  const waiverTopics = pyramidTopics.filter(t => topicStates[t.id]?.waiver);
  const pendingTopics = pyramidTopics.filter(t => 
    !topicStates[t.id]?.discussed && 
    !topicStates[t.id]?.waiver && 
    topicStates[t.id]?.important
  );

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    const id = await saveConsultation(saveLabel || undefined);
    setIsSaving(false);
    if (id) {
      setIsSaveDialogOpen(false);
      setSaveLabel('');
    }
  };

  return (
    <AppLayout>
      <div className="container py-6 space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {t('insuranceConsulting.summary', 'Zusammenfassung')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Übersicht der Beratungsergebnisse
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Ungespeichert
              </Badge>
            )}
            
            <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Save className="w-4 h-4 mr-2" />
                  Beratung speichern
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Beratung speichern</DialogTitle>
                  <DialogDescription>
                    Geben Sie optional eine Bezeichnung ein (z.B. Kundenname, Status).
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="label">Bezeichnung (optional)</Label>
                  <Input
                    id="label"
                    value={saveLabel}
                    onChange={(e) => setSaveLabel(e.target.value)}
                    placeholder="z.B. Max Mustermann - Erstberatung"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Speichern...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Speichern
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Separator />

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Important Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                Wichtige Themen
              </CardTitle>
              <CardDescription>
                {importantTopics.length} Themen als wichtig markiert
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importantTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Themen als wichtig markiert</p>
              ) : (
                <ul className="space-y-2">
                  {importantTopics.map((topic) => (
                    <li key={topic.id} className="flex items-center justify-between text-sm">
                      <span>{topic.title}</span>
                      {topicStates[topic.id]?.discussed && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Prioritized Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                Priorisierte Themen
              </CardTitle>
              <CardDescription>
                {prioritizedTopics.length} Themen priorisiert
              </CardDescription>
            </CardHeader>
            <CardContent>
              {prioritizedTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">Keine Themen priorisiert</p>
              ) : (
                <ul className="space-y-2">
                  {prioritizedTopics.map((topic) => (
                    <li key={topic.id} className="flex items-center justify-between text-sm">
                      <span>{topic.title}</span>
                      {topicStates[topic.id]?.discussed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Badge variant="outline" className="text-xs">Ausstehend</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Discussed Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Besprochene Themen
              </CardTitle>
              <CardDescription>
                {discussedTopics.length} von {pyramidTopics.length} Themen besprochen
              </CardDescription>
            </CardHeader>
            <CardContent>
              {discussedTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Themen besprochen</p>
              ) : (
                <ul className="space-y-2">
                  {discussedTopics.map((topic) => (
                    <li key={topic.id} className="text-sm">
                      {topic.title}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Waiver Topics */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <XCircle className="w-4 h-4 text-muted-foreground" />
                Beratungsverzicht
              </CardTitle>
              <CardDescription>
                {waiverTopics.length} Themen mit Verzicht
              </CardDescription>
            </CardHeader>
            <CardContent>
              {waiverTopics.length === 0 ? (
                <p className="text-sm text-muted-foreground">Kein Beratungsverzicht erklärt</p>
              ) : (
                <ul className="space-y-2">
                  {waiverTopics.map((topic) => (
                    <li key={topic.id} className="text-sm text-muted-foreground">
                      {topic.title}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pending Important Topics Warning */}
        {pendingTopics.length > 0 && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                Offene wichtige Themen
              </CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-500">
                Diese wichtigen Themen wurden noch nicht besprochen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pendingTopics.map((topic) => (
                  <li key={topic.id} className="text-sm">
                    {topic.title}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Export & Weiterverarbeitung</CardTitle>
            <CardDescription>
              Nutzen Sie die gespeicherten Daten für Dokumente und Kommunikation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" disabled>
              <FileText className="w-4 h-4 mr-2" />
              PDF generieren
              <Badge variant="secondary" className="ml-2 text-xs">Bald verfügbar</Badge>
            </Button>
            <Button variant="outline" disabled>
              <Mail className="w-4 h-4 mr-2" />
              E-Mail senden
              <Badge variant="secondary" className="ml-2 text-xs">Bald verfügbar</Badge>
            </Button>
            <Button variant="outline" disabled>
              <Download className="w-4 h-4 mr-2" />
              Daten exportieren
              <Badge variant="secondary" className="ml-2 text-xs">Bald verfügbar</Badge>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
