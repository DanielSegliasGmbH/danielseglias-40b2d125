import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Shield, ArrowRight } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export function FinanzcheckStep0({ onStart }: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Finanzcheck</CardTitle>
          <CardDescription className="text-base">
            Kostenlose Selbsteinschätzung in wenigen Minuten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <Clock className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">5-10 Minuten</h3>
              <p className="text-sm text-muted-foreground">Schnell & unkompliziert</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <Shield className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">100% anonym</h3>
              <p className="text-sm text-muted-foreground">Keine Datenspeicherung</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
              <CheckCircle className="h-8 w-8 text-primary mb-2" />
              <h3 className="font-medium">Sofort-Auswertung</h3>
              <p className="text-sm text-muted-foreground">Mit Handlungsempfehlungen</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-medium mb-3">Was Sie erhalten:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Einen persönlichen Finanz-Score (0-100)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Auswertung nach Themenbereichen</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                <span>Konkrete Handlungsempfehlungen</span>
              </li>
            </ul>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg text-xs text-muted-foreground">
            <strong>Hinweis:</strong> Dieser Finanzcheck dient der Selbsteinschätzung und ersetzt keine 
            professionelle Finanzberatung. Ihre Eingaben werden nicht gespeichert.
          </div>

          <Button onClick={onStart} size="lg" className="w-full">
            Jetzt starten
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
