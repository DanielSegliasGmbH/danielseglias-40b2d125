import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, FileSearch, BarChart3, Shield, ArrowRight } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

const steps = [
  {
    icon: Upload,
    title: 'Unterlagen hochladen',
    description: 'Lade deine Police, Jahresauszüge oder Produktblätter als PDF hoch.',
  },
  {
    icon: FileSearch,
    title: 'Daten automatisch strukturieren',
    description: 'Wir extrahieren die relevanten Informationen aus deinen Dokumenten.',
  },
  {
    icon: BarChart3,
    title: 'Ersteinschätzung erhalten',
    description: 'Du erhältst eine verständliche Analyse zu Struktur, Kosten und Optimierungspotenzial.',
  },
];

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <FileSearch className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Verstehe, was wirklich in deiner Säule 3a steckt.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Lade deine Unterlagen hoch und erhalte eine erste, verständliche Einschätzung zu Struktur, Kosten, Fonds und möglichem Optimierungspotenzial deiner 3a-Lösung.
        </p>
      </div>

      {/* How it works */}
      <div className="space-y-4">
        <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          So funktioniert's
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, idx) => (
            <Card key={idx} className="relative">
              <CardContent className="pt-6 pb-5 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <span className="text-sm font-bold text-primary">{idx + 1}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mx-auto">
                  <step.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Button size="lg" onClick={onStart} className="gap-2 px-8">
          Analyse starten
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Trust & Privacy */}
      <Card className="bg-muted/50 border-muted">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Vertraulichkeit und Datenschutz</p>
              <p className="text-sm text-muted-foreground">
                Deine Dokumente werden ausschliesslich für die Analyse verwendet und nicht an Dritte weitergegeben. Die Auswertung dient als erste Orientierung – sie ersetzt keine persönliche Finanzberatung.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
