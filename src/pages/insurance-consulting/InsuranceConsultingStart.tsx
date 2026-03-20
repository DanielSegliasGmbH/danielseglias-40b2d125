import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, FolderOpen, Clock, FileText, Loader2, Monitor } from 'lucide-react';
import { useConsultationState, SavedConsultation } from '@/hooks/useConsultationState';
import { StartConsultationDialog } from '@/components/consultation/StartConsultationDialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import heroImage from '@/assets/insurance-consulting-hero.jpg';

export default function InsuranceConsultingStart() {
  const navigate = useNavigate();
  const { createAndStartConsultation, loadConsultation, fetchSavedConsultations, isLoading } = useConsultationState();
  
  const [savedConsultations, setSavedConsultations] = useState<SavedConsultation[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [startWithPresentation, setStartWithPresentation] = useState(false);

  const handleOpenDialog = async () => {
    setIsDialogOpen(true);
    setIsLoadingList(true);
    const consultations = await fetchSavedConsultations();
    setSavedConsultations(consultations);
    setIsLoadingList(false);
  };

  const handleStartNew = async (title: string, customerId?: string) => {
    const id = await createAndStartConsultation(title, customerId);
    if (id) {
      setIsStartOpen(false);
      if (startWithPresentation) {
        const url = `${window.location.origin}/presentation/insurance/${id}`;
        window.open(url, `presentation-${id}`, 'noopener');
      }
      navigate('/app/insurance-consulting/topics');
    }
  };

  const handleLoadConsultation = async (consultation: SavedConsultation) => {
    await loadConsultation(consultation.id);
    setIsDialogOpen(false);
    navigate('/app/insurance-consulting/consultation');
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        <div className="w-full h-[40vh] min-h-[250px] max-h-[400px] relative">
          <img src={heroImage} alt="Versicherungsberatung" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />
        </div>

        <div className="flex-1 bg-background p-8 md:p-12 -mt-20 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Versicherungsberatung
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Starte ein neues Beratungsgespräch oder setze eine gespeicherte Beratung fort.
            </p>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* New Consultation Card */}
              <Card
                className="border-2 hover:border-primary/50 transition-colors cursor-pointer group"
                onClick={() => { setStartWithPresentation(false); setIsStartOpen(true); }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <PlusCircle className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Neues Gespräch starten</CardTitle>
                  <CardDescription>
                    Beginne eine neue Versicherungsberatung. Das Gespräch wird automatisch gespeichert.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Jetzt starten
                  </Button>
                </CardContent>
              </Card>

              {/* With presentation */}
              <Card
                className="border-2 border-primary/30 hover:border-primary transition-colors cursor-pointer group bg-primary/5"
                onClick={() => { setStartWithPresentation(true); setIsStartOpen(true); }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                    <Monitor className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Gespräch mit Präsentation</CardTitle>
                  <CardDescription>Starte ein Gespräch mit synchronisierter Kundenansicht auf einem zweiten Bildschirm.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" size="lg" variant="default">
                    <Monitor className="w-4 h-4 mr-2" />
                    Präsentation starten
                  </Button>
                </CardContent>
              </Card>

              {/* Load Consultation Card */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Card
                    className="border-2 hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={handleOpenDialog}
                  >
                    <CardHeader>
                      <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors">
                        <FolderOpen className="w-6 h-6 text-foreground" />
                      </div>
                      <CardTitle className="text-xl">Gespeicherte Beratung fortführen</CardTitle>
                      <CardDescription>
                        Lade eine bereits begonnene Beratung und setze diese fort.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" className="w-full" size="lg">
                        <FolderOpen className="w-4 h-4 mr-2" />
                        Beratung laden
                      </Button>
                    </CardContent>
                  </Card>
                </DialogTrigger>

                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Gespeicherte Beratungen</DialogTitle>
                    <DialogDescription>
                      Wähle eine Beratung aus, um sie fortzusetzen.
                    </DialogDescription>
                  </DialogHeader>

                  {isLoadingList ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : savedConsultations.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Keine gespeicherten Beratungen vorhanden.</p>
                      <Button
                        variant="link"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setStartWithPresentation(false);
                          setIsStartOpen(true);
                        }}
                      >
                        Neue Beratung starten
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="max-h-[50vh]">
                      <div className="space-y-2">
                        {savedConsultations.map((consultation) => (
                          <div
                            key={consultation.id}
                            className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                            onClick={() => handleLoadConsultation(consultation)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium">
                                  {consultation.title || consultation.label || 'Unbenannte Beratung'}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {format(new Date(consultation.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs px-2 py-1 rounded-full bg-muted">
                                {consultation.status === 'completed' ? 'Abgeschlossen' :
                                 consultation.status === 'active' ? 'Aktiv' : 'Entwurf'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <StartConsultationDialog
        open={isStartOpen}
        onOpenChange={setIsStartOpen}
        onStart={handleStartNew}
        isLoading={isLoading}
        type="insurance"
      />
    </AppLayout>
  );
}