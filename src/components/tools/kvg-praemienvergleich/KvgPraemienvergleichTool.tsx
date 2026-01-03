import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Info, Mail, Trash2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePremiumData } from '@/hooks/usePremiumData';
import { 
  FormData, 
  Person, 
  CalculationResult, 
  PersonSummary,
  FRANCHISES, 
  INSURERS, 
  INSURANCE_MODELS 
} from './types';

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Get category based on birth year
const getCategory = (birthYear: string): string => {
  if (!birthYear || birthYear.length !== 4) return '';
  const year = parseInt(birthYear);
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  
  if (age < 19) return 'Kind';
  if (age < 26) return 'Junger Erwachsener';
  return 'Erwachsene';
};

// Initial form state
const initialFormData: FormData = {
  location: '',
  persons: [
    { id: generateId(), birthYear: '', franchise: '', needsAccidentCoverage: null }
  ],
  currentInsurer: '',
  currentModel: '',
  compareModels: {
    standard: true,
    hausarzt: true,
    hmo: true,
    weitere: true,
  },
};

// Mock results for demonstration (to be replaced with real API data)
const generateMockResults = (): CalculationResult[] => [
  { insurer: 'Atupri', insurerUrl: 'https://www.atupri.ch', model: 'HMO', premium: 329.90, subsidy: 5.15, total: 324.75 },
  { insurer: 'KPT', insurerUrl: 'https://www.kpt.ch', model: 'KPTwin.smart', premium: 330.20, subsidy: 5.15, total: 325.05 },
  { insurer: 'CSS', insurerUrl: 'https://www.css.ch', model: 'Hausarztversicherung Profit', premium: 331.40, subsidy: 5.15, total: 326.25 },
  { insurer: 'Sanitas', insurerUrl: 'https://www.sanitas.com', model: 'TelMed (Compact One)', premium: 335.30, subsidy: 5.15, total: 330.15 },
  { insurer: 'KPT', insurerUrl: 'https://www.kpt.ch', model: 'KPTwin.win', premium: 338.30, subsidy: 5.15, total: 333.15 },
  { insurer: 'Agrisano', insurerUrl: 'https://www.agrisano.ch', model: 'AGRIsmart', premium: 339.70, subsidy: 5.15, total: 334.55 },
  { insurer: 'Helsana', insurerUrl: 'https://www.helsana.ch', model: 'BeneFit PLUS Flexmed R1', premium: 340.00, subsidy: 5.15, total: 334.85 },
  { insurer: 'Helsana', insurerUrl: 'https://www.helsana.ch', model: 'BeneFit PLUS Hausarzt R1', premium: 340.00, subsidy: 5.15, total: 334.85 },
  { insurer: 'Sanitas', insurerUrl: 'https://www.sanitas.com', model: 'Hausarztmodell 1', premium: 340.45, subsidy: 5.15, total: 335.30 },
  { insurer: 'ÖKK', insurerUrl: 'https://www.oekk.ch', model: 'Gesundheitszentrum', premium: 342.70, subsidy: 5.15, total: 337.55 },
  { insurer: 'Swica', insurerUrl: 'https://www.swica.ch', model: 'FAVORIT MULTICHOICE', premium: 343.00, subsidy: 5.15, total: 337.85 },
  { insurer: 'Visana', insurerUrl: 'https://www.visana.ch', model: 'Managed Care', premium: 343.10, subsidy: 5.15, total: 337.95 },
  { insurer: 'Concordia', insurerUrl: 'https://www.concordia.ch', model: 'HMO', premium: 344.00, subsidy: 5.15, total: 338.85 },
  { insurer: 'SLKK', insurerUrl: 'https://www.slkk.ch', model: 'SLKK-SmartMed', premium: 344.40, subsidy: 5.15, total: 339.25 },
  { insurer: 'Assura', insurerUrl: 'https://www.assura.ch', model: 'Qualimed', premium: 344.70, subsidy: 5.15, total: 339.55 },
];

export default function KvgPraemienvergleichTool() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [personSummaries, setPersonSummaries] = useState<PersonSummary[]>([]);
  const [displayMode, setDisplayMode] = useState<'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('sparen');
  
  // Load premium data from Excel
  const premiumData = usePremiumData();
  
  // Debug: Log the data structure when loaded
  useEffect(() => {
    if (!premiumData.isLoading && !premiumData.error) {
      console.log('Premium Data Loaded:', {
        sheets: premiumData.sheets,
        headers: premiumData.headers,
        sampleData: Object.fromEntries(
          Object.entries(premiumData.data).map(([sheet, rows]) => [sheet, rows.slice(0, 5)])
        ),
      });
    }
  }, [premiumData]);

  // Update location
  const handleLocationChange = (value: string) => {
    setFormData(prev => ({ ...prev, location: value }));
  };

  // Update person field
  const updatePerson = (id: string, field: keyof Person, value: string | boolean | null) => {
    setFormData(prev => ({
      ...prev,
      persons: prev.persons.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  // Add person
  const addPerson = () => {
    setFormData(prev => ({
      ...prev,
      persons: [
        ...prev.persons,
        { id: generateId(), birthYear: '', franchise: '', needsAccidentCoverage: null }
      ]
    }));
  };

  // Remove person
  const removePerson = (id: string) => {
    if (formData.persons.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      persons: prev.persons.filter(p => p.id !== id)
    }));
  };

  // Update insurer
  const handleInsurerChange = (value: string) => {
    setFormData(prev => ({ ...prev, currentInsurer: value, currentModel: '' }));
  };

  // Update model
  const handleModelChange = (value: string) => {
    setFormData(prev => ({ ...prev, currentModel: value }));
  };

  // Update compare models
  const handleCompareModelChange = (model: keyof FormData['compareModels'], checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      compareModels: { ...prev.compareModels, [model]: checked }
    }));
  };

  // Get available models for selected insurer
  const getAvailableModels = () => {
    const insurerModels = INSURANCE_MODELS[formData.currentInsurer] || INSURANCE_MODELS['default'];
    return [
      ...insurerModels.standard.map(m => ({ group: 'Standard', model: m })),
      ...insurerModels.hausarzt.map(m => ({ group: 'Hausarzt', model: m })),
      ...insurerModels.weitere.map(m => ({ group: 'Weitere Modelle', model: m })),
    ];
  };

  // Calculate
  const handleCalculate = () => {
    // Generate summaries
    const summaries: PersonSummary[] = formData.persons.map((p, idx) => ({
      id: idx + 1,
      category: getCategory(p.birthYear),
      birthYear: p.birthYear,
      franchise: p.franchise ? `${parseInt(p.franchise).toLocaleString('de-CH')}'` : '',
      accidentCoverage: p.needsAccidentCoverage === true ? 'Ja' : p.needsAccidentCoverage === false ? 'Nein' : '',
    }));
    
    setPersonSummaries(summaries);
    setResults(generateMockResults());
    setShowResults(true);
  };

  // Reset form
  const handleReset = () => {
    setFormData(initialFormData);
    setShowResults(false);
    setResults([]);
    setPersonSummaries([]);
  };

  // Go back to edit
  const handleEdit = () => {
    setShowResults(false);
  };

  // Format price
  const formatPrice = (value: number) => {
    const displayValue = displayMode === 'year' ? value * 12 : value;
    return displayValue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (showResults) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Prämienrechner 2026</h1>
          <h2 className="text-xl font-semibold mb-1">Prämien {formData.location || 'Schweiz'}</h2>
          <p className="text-muted-foreground">Gemeinde {formData.location}, Region 2, Kanton Zürich</p>
        </div>

        {/* Person Summary */}
        <div className="space-y-4">
          <p className="text-sm">Sie haben folgende Personen für die Berechnung angegeben:</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Jahrgang</TableHead>
                <TableHead>Franchise</TableHead>
                <TableHead>Unfalldeckung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {personSummaries.map(person => (
                <TableRow key={person.id}>
                  <TableCell>{person.id}</TableCell>
                  <TableCell>{person.category}</TableCell>
                  <TableCell>{person.birthYear}</TableCell>
                  <TableCell>{person.franchise}</TableCell>
                  <TableCell>{person.accidentCoverage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Button variant="default" onClick={handleEdit} className="bg-[#4a7c8a] hover:bg-[#3d6672] text-white">
              Ändern
            </Button>
            <Button variant="link" className="text-[#0066b3]">
              <Mail className="h-4 w-4 mr-2" />
              Link per E-Mail verschicken
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted">
            <TabsTrigger value="sparen" className="data-[state=active]:bg-[#0066b3] data-[state=active]:text-white">
              Möglichkeit zum Sparen
            </TabsTrigger>
            <TabsTrigger value="franchisen">
              Vergleich der Franchisen
            </TabsTrigger>
            <TabsTrigger value="veraenderung">
              Veränderung der Prämien
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sparen" className="mt-6">
            {/* Display Mode Toggle */}
            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
              <div>
                <p className="text-sm mb-2">Sie können hier die Ansicht der Tabelle wechseln.</p>
                <p className="text-sm text-muted-foreground">Bei «Monat» sehen Sie die Kosten pro Monat, bei «Jahr» die Kosten pro Jahr.</p>
                <RadioGroup 
                  value={displayMode} 
                  onValueChange={(v) => setDisplayMode(v as 'month' | 'year')}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="month" id="month" />
                    <Label htmlFor="month">Monat</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="year" id="year" />
                    <Label htmlFor="year">Jahr</Label>
                  </div>
                </RadioGroup>
              </div>
              <p className="text-sm text-muted-foreground">
                Sie sehen hier die Informationen zu den Prämien der Gemeinde {formData.location || 'Schweiz'}.
              </p>
            </div>

            {/* Info Alert */}
            {!formData.currentInsurer && (
              <Alert className="mb-4 border-[#0066b3] bg-[#0066b3]/10">
                <Info className="h-4 w-4 text-[#0066b3]" />
                <AlertDescription className="text-[#0066b3]">
                  Geben Sie Ihre aktuelle Krankenkasse an. Dann sehen Sie hier, wie viel Sie sparen können.
                </AlertDescription>
              </Alert>
            )}

            {/* Results Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#0066b3] text-white">
                  <TableRow className="hover:bg-[#0066b3]">
                    <TableHead className="text-white">Krankenkasse</TableHead>
                    <TableHead className="text-white">Modell</TableHead>
                    <TableHead className="text-white text-right">Prämie</TableHead>
                    <TableHead className="text-white text-right">Vergütung</TableHead>
                    <TableHead className="text-white text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, idx) => (
                    <TableRow key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                      <TableCell>
                        <a 
                          href={result.insurerUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#0066b3] hover:underline inline-flex items-center gap-1"
                        >
                          {result.insurer}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>{result.model}</TableCell>
                      <TableCell className="text-right">{formatPrice(result.premium)}</TableCell>
                      <TableCell className="text-right">{formatPrice(result.subsidy)}</TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(result.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Alle Prämien in CHF
            </p>
          </TabsContent>

          <TabsContent value="franchisen" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Franchise-Vergleich wird nach Integration der Priminfo API angezeigt.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="veraenderung" className="mt-6">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Prämienveränderung wird nach Integration der Priminfo API angezeigt.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4">Prämienrechner 2026</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="font-semibold">Dieser Text ist in Leichter Sprache geschrieben.</p>
          <p>
            Die Prämien für die Krankenkasse sind unterschiedlich.<br />
            Sie können mit dem Prämien-Rechner die Prämien<br />
            der Krankenkassen vergleichen.<br />
            So sehen Sie,<br />
            welche Krankenkasse für Sie am besten ist.
          </p>
          <p>
            Sie müssen verschiedene Angaben machen.<br />
            Geben Sie alle Angaben ein.<br />
            Sie erhalten dann einen Vergleich der Prämien.
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-right">
        Pflichtfelder sind mit einem Stern (*) markiert.
      </p>

      {/* Location Section */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Wo wohnen Sie?</h2>
        <Separator className="mb-4" />
        <div>
          <Label htmlFor="location" className="text-sm">
            Geben Sie den Wohnort ein<br />
            oder die Post-Leit-Zahl. *
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            placeholder="z.B. Zürich oder 8001"
            className="mt-2 max-w-xl"
          />
        </div>
      </section>

      {/* Persons Section */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Für welche Personen möchten Sie die Prämien vergleichen?</h2>
        <Separator className="mb-4" />
        
        {formData.persons.map((person, index) => (
          <div key={person.id} className="mb-8">
            <h3 className="font-medium mb-4">Person {index + 1}</h3>
            <Separator className="mb-4" />
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Birth Year */}
              <div>
                <Label htmlFor={`birthYear-${person.id}`} className="text-sm">
                  In welchem Jahr ist die {index + 1}. Person geboren?<br />
                  Geben Sie 4 Zahlen ein.<br />
                  Zum Beispiel: 1984 *
                </Label>
                <Input
                  id={`birthYear-${person.id}`}
                  value={person.birthYear}
                  onChange={(e) => updatePerson(person.id, 'birthYear', e.target.value)}
                  placeholder="JJJJ"
                  maxLength={4}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">Format: JJJJ</p>
              </div>

              {/* Franchise */}
              <div>
                <Label className="text-sm">
                  Welche Franchise möchten Sie für die {index + 1}. Person?<br />
                  Klicken Sie auf das Feld<br />
                  und wählen Sie die Franchise. *
                </Label>
                <Select 
                  value={person.franchise} 
                  onValueChange={(v) => updatePerson(person.id, 'franchise', v)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Bitte wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {FRANCHISES.map(f => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Accident Coverage */}
              <div>
                <Label className="text-sm">
                  Braucht die {index + 1}. Person auch eine Unfall-Versicherung?<br />
                  Klicken Sie bei Ja oder bei Nein. *
                </Label>
                <RadioGroup 
                  value={person.needsAccidentCoverage === null ? '' : person.needsAccidentCoverage ? 'yes' : 'no'}
                  onValueChange={(v) => updatePerson(person.id, 'needsAccidentCoverage', v === 'yes')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id={`accident-yes-${person.id}`} />
                    <Label htmlFor={`accident-yes-${person.id}`}>Ja</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id={`accident-no-${person.id}`} />
                    <Label htmlFor={`accident-no-${person.id}`}>Nein</Label>
                  </div>
                </RadioGroup>

                {formData.persons.length > 1 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Möchten Sie für diese Person <strong>keine</strong> Prämie berechnen?</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => removePerson(person.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Diese Person entfernen
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Person */}
        <div className="mt-4">
          <p className="text-sm mb-2">Möchten Sie die Prämie noch für eine weitere Person berechnen?</p>
          <Button 
            variant="default" 
            onClick={addPerson}
            className="bg-[#5a6268] hover:bg-[#4a5258] text-white"
          >
            Weitere Person hinzufügen
          </Button>
        </div>
      </section>

      {/* Current Insurance Section */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Wie sind die Personen jetzt versichert?</h2>
        <Separator className="mb-4" />
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Insurer */}
          <div>
            <Label className="text-sm">
              Geben Sie die Krankenkasse ein.<br />
              Klicken Sie auf das Feld<br />
              und wählen Sie die Krankenkasse.
            </Label>
            <Select 
              value={formData.currentInsurer} 
              onValueChange={handleInsurerChange}
            >
              <SelectTrigger className="mt-2 bg-[#4a7c8a] text-white border-[#4a7c8a]">
                <SelectValue placeholder="Krankenkasse wählen" />
              </SelectTrigger>
              <SelectContent>
                {INSURERS.map(insurer => (
                  <SelectItem key={insurer} value={insurer}>{insurer}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Model */}
          <div>
            <Label className="text-sm">
              Geben Sie das Versicherungs-Modell ein.<br />
              Klicken Sie auf das Feld<br />
              und wählen Sie das Versicherungs-Modell.
            </Label>
            <Select 
              value={formData.currentModel} 
              onValueChange={handleModelChange}
              disabled={!formData.currentInsurer}
            >
              <SelectTrigger className="mt-2 bg-[#4a7c8a] text-white border-[#4a7c8a]">
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
        </div>
      </section>

      {/* Compare Models Section */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Welche Versicherungs-Modelle möchten Sie vergleichen?</h2>
        <Separator className="mb-4" />
        
        <div>
          <p className="text-sm mb-2">
            Wählen Sie hier aus.<br />
            Sie können auch mehr als ein Modell wählen.
          </p>
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="model-standard" 
                checked={formData.compareModels.standard}
                onCheckedChange={(checked) => handleCompareModelChange('standard', !!checked)}
              />
              <Label htmlFor="model-standard">Standard</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="model-hausarzt" 
                checked={formData.compareModels.hausarzt}
                onCheckedChange={(checked) => handleCompareModelChange('hausarzt', !!checked)}
              />
              <Label htmlFor="model-hausarzt">Hausarzt</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="model-hmo" 
                checked={formData.compareModels.hmo}
                onCheckedChange={(checked) => handleCompareModelChange('hmo', !!checked)}
              />
              <Label htmlFor="model-hmo">HMO</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="model-weitere" 
                checked={formData.compareModels.weitere}
                onCheckedChange={(checked) => handleCompareModelChange('weitere', !!checked)}
              />
              <Label htmlFor="model-weitere">Weitere Modelle</Label>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Möchten Sie jetzt die Krankenkassen vergleichen?</h2>
        <p className="text-sm mb-4">Drücken Sie hier:</p>
        
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={handleCalculate}
            className="bg-[#0066b3] hover:bg-[#004d8a] text-white px-12 py-3"
            size="lg"
          >
            Berechnen
          </Button>
          <Button 
            variant="outline"
            onClick={handleReset}
            className="px-12 py-3"
            size="lg"
          >
            Zurücksetzen
          </Button>
        </div>
      </section>
    </div>
  );
}
