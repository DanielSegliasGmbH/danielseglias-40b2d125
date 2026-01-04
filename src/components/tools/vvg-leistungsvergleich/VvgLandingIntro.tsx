import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, 
  Brain, 
  Compass,
  Copy,
  MessageCircle,
  ArrowDown,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { FRANCHISES, INSURERS, INSURANCE_MODELS } from './types';

interface VvgLandingIntroProps {
  onCalculate: (formData: {
    currentInsurer: string;
    currentModel: string;
    birthYear: string;
    franchise: string;
    hasEmployerAccident: boolean | null;
    location: string;
  }) => void;
}

export default function VvgLandingIntro({ onCalculate }: VvgLandingIntroProps) {
  const [copied, setCopied] = useState(false);
  
  // Form state
  const [currentInsurer, setCurrentInsurer] = useState('');
  const [currentModel, setCurrentModel] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [franchise, setFranchise] = useState('');
  const [hasEmployerAccident, setHasEmployerAccident] = useState<boolean | null>(null);
  const [location, setLocation] = useState('');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link kopiert');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Link konnte nicht kopiert werden');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent('Schau dir mal diese Seite an – vielleicht hilft sie dir beim Thema Krankenkasse: ' + window.location.href);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Get available models for selected insurer
  const getAvailableModels = () => {
    const insurerModels = INSURANCE_MODELS[currentInsurer] || INSURANCE_MODELS['default'];
    return [
      ...insurerModels.standard.map(m => ({ group: 'Standard', model: m })),
      ...insurerModels.hausarzt.map(m => ({ group: 'Hausarzt', model: m })),
      ...insurerModels.weitere.map(m => ({ group: 'Weitere Modelle', model: m })),
    ];
  };

  const handleInsurerChange = (value: string) => {
    setCurrentInsurer(value);
    setCurrentModel('');
  };

  const handleCalculate = () => {
    onCalculate({
      currentInsurer,
      currentModel,
      birthYear,
      franchise,
      hasEmployerAccident,
      location,
    });
  };

  const handleReset = () => {
    setCurrentInsurer('');
    setCurrentModel('');
    setBirthYear('');
    setFranchise('');
    setHasEmployerAccident(null);
    setLocation('');
  };

  return (
    <div className="space-y-0">
      {/* SECTION 1 – HERO (Emotionale Identifikation) */}
      <section className="min-h-[80vh] flex items-center py-12 lg:py-20">
        <div className="w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text Content */}
            <div className="max-w-xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-tight mb-6">
                Niemand liebt seine Krankenkasse.
                <br />
                <span className="text-muted-foreground">Aber fast alle zahlen zu viel dafür.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Prämien steigen. Leistungen sind unübersichtlich.
                <br />
                Und trotzdem schieben die meisten dieses Thema jahrelang vor sich her.
              </p>
              
              <p className="text-sm text-muted-foreground/80 mb-8 italic">
                Diese Seite ist kein Verkauf.
                <br />
                Sie ist eine Übersetzung dessen, was eine Optimierung wirklich verändert.
              </p>
              
              <Button 
                size="lg" 
                onClick={() => scrollToSection('wirkung')}
                className="group"
              >
                Was würde sich für mich ändern?
                <ArrowDown className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1" />
              </Button>
            </div>
            
            {/* Abstract Illustration */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-80 h-80">
                {/* Abstract calm shapes */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-scale-1/40" />
                <div className="absolute top-16 left-8 w-24 h-24 rounded-full bg-scale-2/30" />
                <div className="absolute top-20 right-8 w-20 h-20 rounded-full bg-scale-3/35" />
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-scale-1/25" />
                <div className="absolute bottom-8 left-16 w-16 h-16 rounded-full bg-scale-4/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 – REALITÄTSANKER / STUDIENBEZUG */}
      <section className="py-16 lg:py-24 bg-scale-1/20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-xl">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-6">
            Wovor sich Menschen in der Schweiz wirklich sorgen
          </h2>
          
          {/* Simple visual element */}
          <div className="flex justify-center mb-8">
            <div className="flex items-end gap-2 h-20">
              <div className="w-8 bg-scale-3/50 rounded-t" style={{ height: '40%' }} />
              <div className="w-8 bg-scale-4/60 rounded-t" style={{ height: '55%' }} />
              <div className="w-8 bg-scale-5/70 rounded-t" style={{ height: '70%' }} />
              <div className="w-8 bg-primary rounded-t" style={{ height: '100%' }} />
              <div className="w-8 bg-scale-5/70 rounded-t" style={{ height: '65%' }} />
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">
            Öffentliche Studien zeigen: Die steigenden Krankenkassenprämien
            gehören zu den grössten finanziellen Sorgen der Schweizer Bevölkerung –
            noch vor vielen anderen Alltagskosten.
          </p>
          
          <p className="text-sm text-muted-foreground/70">
            Basierend auf öffentlich zugänglichen Studien (z. B. moneyland.ch)
          </p>
        </div>
      </section>

      {/* SECTION 3 – KERNBEREICH: WIRKUNG STATT SYSTEM */}
      <section id="wirkung" className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* CARD 1 – Finanzielle Entlastung */}
            <Card className="border-scale-2/50 shadow-card">
              <CardContent className="p-6 lg:p-8">
                <div className="w-12 h-12 rounded-xl bg-scale-1/50 flex items-center justify-center mb-5">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Finanzielle Entlastung
                </h3>
                
                <div className="mb-4">
                  <div className="text-2xl font-semibold text-primary">
                    CHF X.– pro Jahr
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ≈ X freie Abende / Wochenenden
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Dieses Geld ist kein Bonus.
                  Es ist Zeit und Freiheit, die vorher still jeden Monat verschwunden ist.
                </p>
              </CardContent>
            </Card>

            {/* CARD 2 – Mentale Entlastung */}
            <Card className="border-scale-2/50 shadow-card">
              <CardContent className="p-6 lg:p-8">
                <div className="w-12 h-12 rounded-xl bg-scale-1/50 flex items-center justify-center mb-5">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Mentale Ruhe
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Deckung geklärt</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Keine Überversicherung</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Wenn du weisst, dass deine Lösung passt,
                  hörst du auf, bei jeder Prämienmeldung ein ungutes Gefühl zu haben.
                </p>
              </CardContent>
            </Card>

            {/* CARD 3 – Entscheidungsfreiheit */}
            <Card className="border-scale-2/50 shadow-card">
              <CardContent className="p-6 lg:p-8">
                <div className="w-12 h-12 rounded-xl bg-scale-1/50 flex items-center justify-center mb-5">
                  <Compass className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Klar entscheiden – ohne Druck
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Wenn Beratung nicht vom Produkt abhängt,
                  geht es nicht mehr darum, was verkauft wird,
                  sondern was zu deinem Leben passt.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-10">
            <Button 
              size="lg"
              onClick={() => scrollToSection('datenerfassung')}
            >
              Meine Situation einordnen
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 4 – EMOTIONALE ZUSAMMENFASSUNG (SIGNATURE) */}
      <section className="py-16 lg:py-24 bg-scale-1/10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-xl">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-8">
            Was diese Optimierung für dein Leben bedeutet
          </h2>
          
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Es geht nicht um eine günstigere Police.
            </p>
            <p>
              Es geht darum, ein Thema abzuschliessen,
              <br className="hidden sm:block" />
              das viele jahrelang mit sich herumschleppen.
            </p>
            <div className="pt-4 space-y-2">
              <p className="text-foreground font-medium">Weniger Kopfstress.</p>
              <p className="text-foreground font-medium">Mehr Klarheit.</p>
              <p className="text-foreground font-medium">Das gute Gefühl, es richtig geregelt zu haben.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 – DATENERFASSUNG (INLINE FORM) */}
      <section id="datenerfassung" className="py-16 lg:py-24">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Deine Situation verstehen
            </h2>
            <p className="text-muted-foreground">
              Damit wir deine Situation korrekt einordnen können,
              benötigen wir einige grundlegende Angaben.
            </p>
          </div>
          
          <Card className="border-scale-2/50 shadow-card">
            <CardContent className="p-6 lg:p-8 space-y-6">
              {/* Krankenkasse wählen */}
              <div>
                <Label className="text-sm font-medium">Krankenkasse wählen</Label>
                <Select value={currentInsurer} onValueChange={handleInsurerChange}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Krankenkasse wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSURERS.map(insurer => (
                      <SelectItem key={insurer} value={insurer}>{insurer}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Versicherungsmodell wählen */}
              <div>
                <Label className="text-sm font-medium">Versicherungsmodell wählen</Label>
                <Select 
                  value={currentModel} 
                  onValueChange={setCurrentModel}
                  disabled={!currentInsurer}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Versicherungsmodell wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableModels().map((item, idx) => (
                      <SelectItem key={idx} value={item.model}>
                        {item.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Geburtsjahr */}
              <div>
                <Label htmlFor="birthYear" className="text-sm font-medium">Geburtsjahr</Label>
                <Input
                  id="birthYear"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="z.B. 1984"
                  maxLength={4}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Format: JJJJ</p>
              </div>

              {/* Aktuelle Franchise */}
              <div>
                <Label className="text-sm font-medium">Aktuelle Franchise</Label>
                <Select value={franchise} onValueChange={setFranchise}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Franchise wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {FRANCHISES.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Unfallversicherung über Arbeitgeber */}
              <div>
                <Label className="text-sm font-medium">Unfallversicherung über Arbeitgeber vorhanden?</Label>
                <RadioGroup 
                  value={hasEmployerAccident === null ? '' : hasEmployerAccident ? 'yes' : 'no'}
                  onValueChange={(v) => setHasEmployerAccident(v === 'yes')}
                  className="mt-2 flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="accident-yes" />
                    <Label htmlFor="accident-yes">Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="accident-no" />
                    <Label htmlFor="accident-no">Nein</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Wohnort oder PLZ */}
              <div>
                <Label htmlFor="location" className="text-sm font-medium">Wohnort oder PLZ</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="z.B. Zürich oder 8001"
                  className="mt-2"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleCalculate}
                  className="flex-1"
                  size="lg"
                >
                  Berechnen
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleReset}
                  size="lg"
                >
                  Zurücksetzen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 6 – SHARE-MECHANIK */}
      <section className="py-12 lg:py-16">
        <div className="max-w-lg mx-auto">
          <Card className="border-scale-2/50 shadow-card bg-scale-1/10">
            <CardContent className="p-6 lg:p-8 text-center">
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                Kennst du jemanden,
                <br />
                der dieses Thema seit Jahren aufschiebt?
                <br />
                <span className="text-muted-foreground">Vielleicht hilft diese Seite weiter.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleCopyLink}
                  className="gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Kopiert!' : 'Link kopieren'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleWhatsAppShare}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Per WhatsApp teilen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* SECTION 7 – FINALER CTA (FREIWILLIGER KONTAKT) */}
      <section className="py-16 lg:py-24 bg-primary/5 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-xl">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-lg text-foreground leading-relaxed mb-8">
            Wenn du willst, schauen wir gemeinsam drauf.
            <br />
            <span className="text-muted-foreground">Ohne Verkaufsdruck.</span>
            <br />
            <span className="text-muted-foreground">Ohne Produktinteresse.</span>
            <br />
            <span className="text-muted-foreground">Einfach, um Klarheit zu schaffen.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => scrollToSection('datenerfassung')}>
              Unverbindlich anschauen lassen
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => scrollToSection('wirkung')}
              className="text-muted-foreground"
            >
              Erst später entscheiden
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
