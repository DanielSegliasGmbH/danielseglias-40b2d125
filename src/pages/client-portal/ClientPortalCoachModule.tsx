import { useParams, useNavigate } from 'react-router-dom';
import { ClientPortalLayout } from '@/layouts/ClientPortalLayout';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Brain, Eye, Target, LayoutGrid, Shield, Settings2, TrendingUp, Rocket, Star, RotateCcw, MessageSquare, BarChart3, CheckSquare, Lightbulb, Info } from 'lucide-react';

const moduleData: Record<string, { title: string; desc: string; icon: React.ElementType }> = {
  mindset: { title: 'Mindset', desc: 'Erkenne deine finanziellen Glaubenssätze und ersetze sie durch kraftvolle Überzeugungen.', icon: Brain },
  klarheit: { title: 'Klarheit', desc: 'Verschaffe dir einen vollständigen Überblick über deine aktuelle finanzielle Situation.', icon: Eye },
  ziele: { title: 'Ziele', desc: 'Definiere klare, messbare Finanzziele mit konkreten Zeitrahmen.', icon: Target },
  struktur: { title: 'Struktur', desc: 'Organisiere deine Konten, Budgets und Geldflüsse sauber und nachvollziehbar.', icon: LayoutGrid },
  absicherung: { title: 'Absicherung', desc: 'Stelle sicher, dass die wichtigsten Risiken richtig abgesichert sind.', icon: Shield },
  optimierung: { title: 'Optimierung', desc: 'Prüfe bestehende Verträge, Gebühren und Kosten – und verbessere sie gezielt.', icon: Settings2 },
  investment: { title: 'Investment', desc: 'Lerne, dein Geld strategisch und langfristig für dich arbeiten zu lassen.', icon: TrendingUp },
  skalierung: { title: 'Skalierung', desc: 'Bringe deinen Vermögensaufbau auf die nächste Stufe mit fortgeschrittenen Strategien.', icon: Rocket },
  freiheit: { title: 'Freiheit', desc: 'Plane deine finanzielle Unabhängigkeit konkret und realistisch.', icon: Star },
  review: { title: 'Review', desc: 'Überprüfe regelmässig deine Fortschritte und passe deine Strategie an.', icon: RotateCcw },
};

const sections = [
  { key: 'fragen', icon: MessageSquare, title: 'Fragen', placeholder: 'Schreibe hier deine Gedanken und Antworten auf...' },
  { key: 'analyse', icon: BarChart3, title: 'Analyse', placeholder: null },
  { key: 'aufgaben', icon: CheckSquare, title: 'Aufgaben', placeholder: null },
  { key: 'reflexion', icon: Lightbulb, title: 'Reflexion', placeholder: null },
];

export default function ClientPortalCoachModule() {
  const { moduleKey } = useParams<{ moduleKey: string }>();
  const navigate = useNavigate();
  const mod = moduleKey ? moduleData[moduleKey] : null;

  if (!mod) {
    return (
      <ClientPortalLayout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <p className="text-muted-foreground">Modul nicht gefunden.</p>
        </div>
      </ClientPortalLayout>
    );
  }

  const Icon = mod.icon;

  return (
    <ClientPortalLayout>
      <ScreenHeader title={mod.title} showBack backTo="/app/client-portal/coach" />

      <div className="max-w-2xl mx-auto space-y-5 p-4 pb-8">
        {/* Module header */}
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{mod.title}</h2>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{mod.desc}</p>
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => {
          const SIcon = section.icon;
          return (
            <Card key={section.key}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <SIcon className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">{section.title}</h3>
                </div>

                {section.placeholder ? (
                  <Textarea
                    placeholder={section.placeholder}
                    className="min-h-[100px] text-sm"
                  />
                ) : (
                  <div className="rounded-lg bg-muted/50 border border-dashed border-border p-6 flex flex-col items-center justify-center text-center">
                    <Badge variant="muted" className="mb-2 text-[10px]">Kommt bald</Badge>
                    <p className="text-xs text-muted-foreground">
                      Dieser Bereich wird in einer späteren Version freigeschaltet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Data hint */}
        <div className="flex items-start gap-2.5 px-1 py-3">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deine sensiblen Dokumente werden nicht in dieser App gespeichert.
            Du kannst externe Links (z.&nbsp;B. Google Drive) verwenden.
          </p>
        </div>
      </div>
    </ClientPortalLayout>
  );
}
