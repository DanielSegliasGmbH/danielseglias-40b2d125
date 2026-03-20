import { PdfExportWrapper } from '../PdfExportWrapper';
import { useState, useEffect, useMemo } from 'react';
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
import { ExternalLink, Info, Mail, Trash2, Loader2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePremiumData } from '@/hooks/usePremiumData';
import VvgLandingIntro from './VvgLandingIntro';
import { 
  FormData, 
  Person, 
  CalculationResult, 
  PersonSummary,
  FRANCHISES, 
  INSURERS, 
  INSURANCE_MODELS 
} from './types';

type SortDirection = 'asc' | 'desc' | null;
type SortColumn = 'insurer' | 'model' | 'savings' | 'premium' | 'subsidy' | 'total';
type FranchiseSortColumn = 'insurer' | 'model' | 'f300' | 'f500' | 'f1000' | 'f1500' | 'f2000' | 'f2500';

interface FranchiseResult {
  insurer: string;
  insurerUrl?: string;
  model: string;
  f300: number;
  f500: number;
  f1000: number;
  f1500: number;
  f2000: number;
  f2500: number;
}

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

// Current model reference price for calculating savings
const CURRENT_MODEL_PREMIUM = 340.00;

// Mock franchise data - to be replaced with real data
const generateMockFranchiseResults = (): FranchiseResult[] => [
  { insurer: 'Agrisano', model: 'AGRIcontact', f300: 467.80, f500: 457.70, f1000: 432.70, f1500: 407.60, f2000: 382.50, f2500: 357.50 },
  { insurer: 'Agrisano', model: 'AGRIeco', f300: 475.60, f500: 465.30, f1000: 439.90, f1500: 414.40, f2000: 388.80, f2500: 363.40 },
  { insurer: 'Agrisano', model: 'AGRIsmart', f300: 444.50, f500: 435.00, f1000: 411.20, f1500: 387.30, f2000: 363.50, f2500: 339.70 },
  { insurer: 'Agrisano', model: 'Grundversicherung', f300: 516.90, f500: 505.80, f1000: 478.10, f1500: 450.40, f2000: 422.70, f2500: 395.00 },
  { insurer: 'Aquilana', model: 'CASAMED', f300: 483.20, f500: 472.40, f1000: 445.20, f1500: 418.20, f2000: 391.00, f2500: 363.90 },
  { insurer: 'Aquilana', model: 'Grundversicherung', f300: 536.80, f500: 526.10, f1000: 498.90, f1500: 471.80, f2000: 444.70, f2500: 417.50 },
  { insurer: 'Aquilana', model: 'SMARTMED', f300: 467.10, f500: 457.80, f1000: 434.10, f1500: 410.50, f2000: 386.90, f2500: 354.90 },
  { insurer: 'Assura', model: 'FeminaVita', f300: 485.10, f500: 474.30, f1000: 447.20, f1500: 420.00, f2000: 393.00, f2500: 365.80 },
  { insurer: 'Assura', model: 'Grundversicherung', f300: 527.30, f500: 516.50, f1000: 489.30, f1500: 462.20, f2000: 435.10, f2500: 407.90 },
  { insurer: 'Assura', model: 'Hausarzt Modell', f300: 469.30, f500: 458.50, f1000: 431.40, f1500: 404.20, f2000: 377.20, f2500: 350.00 },
  { insurer: 'Assura', model: 'PharMed', f300: 469.30, f500: 458.50, f1000: 431.40, f1500: 404.20, f2000: 377.20, f2500: 350.00 },
  { insurer: 'Assura', model: 'PreventoMed', f300: 485.10, f500: 474.30, f1000: 447.20, f1500: 420.00, f2000: 393.00, f2500: 365.80 },
  { insurer: 'Assura', model: 'Qualimed', f300: 464.00, f500: 453.20, f1000: 426.10, f1500: 398.90, f2000: 371.90, f2500: 344.70 },
  { insurer: 'Atupri', model: 'CareMed', f300: 478.30, f500: 467.30, f1000: 439.60, f1500: 411.80, f2000: 384.20, f2500: 356.40 },
  { insurer: 'Atupri', model: 'Grundversicherung', f300: 530.60, f500: 519.30, f1000: 491.50, f1500: 463.80, f2000: 436.10, f2500: 408.40 },
  { insurer: 'Atupri', model: 'HMO', f300: 451.80, f500: 440.80, f1000: 413.10, f1500: 385.30, f2000: 357.70, f2500: 329.90 },
  { insurer: 'Atupri', model: 'SmartCare', f300: 470.90, f500: 459.90, f1000: 432.20, f1500: 404.40, f2000: 376.80, f2500: 349.00 },
  { insurer: 'Concordia', model: 'Grundversicherung', f300: 535.20, f500: 524.60, f1000: 498.20, f1500: 471.80, f2000: 445.40, f2500: 419.00 },
  { insurer: 'Concordia', model: 'HMO', f300: 469.80, f500: 459.20, f1000: 432.80, f1500: 406.40, f2000: 380.00, f2500: 353.60 },
  { insurer: 'Concordia', model: 'Hausarzt', f300: 475.40, f500: 464.80, f1000: 438.40, f1500: 412.00, f2000: 385.60, f2500: 359.20 },
  { insurer: 'CSS', model: 'Grundversicherung', f300: 528.40, f500: 517.80, f1000: 491.40, f1500: 465.00, f2000: 438.60, f2500: 412.20 },
  { insurer: 'CSS', model: 'Hausarztmodell', f300: 463.20, f500: 452.60, f1000: 426.20, f1500: 399.80, f2000: 373.40, f2500: 347.00 },
  { insurer: 'CSS', model: 'Multimed', f300: 458.00, f500: 447.40, f1000: 421.00, f1500: 394.60, f2000: 368.20, f2500: 341.80 },
  { insurer: 'Helsana', model: 'BeneFit PLUS', f300: 520.00, f500: 509.40, f1000: 483.00, f1500: 456.60, f2000: 430.20, f2500: 403.80 },
  { insurer: 'Helsana', model: 'BeneFit PLUS Hausarzt', f300: 468.00, f500: 457.40, f1000: 431.00, f1500: 404.60, f2000: 378.20, f2500: 351.80 },
  { insurer: 'Helsana', model: 'BeneFit PLUS Telmed', f300: 455.60, f500: 445.00, f1000: 418.60, f1500: 392.20, f2000: 365.80, f2500: 339.40 },
  { insurer: 'KPT', model: 'Grundversicherung', f300: 522.60, f500: 512.00, f1000: 485.60, f1500: 459.20, f2000: 432.80, f2500: 406.40 },
  { insurer: 'KPT', model: 'KPTwin.doc', f300: 470.40, f500: 459.80, f1000: 433.40, f1500: 407.00, f2000: 380.60, f2500: 354.20 },
  { insurer: 'KPT', model: 'KPTwin.smart', f300: 452.40, f500: 441.80, f1000: 415.40, f1500: 389.00, f2000: 362.60, f2500: 336.20 },
  { insurer: 'ÖKK', model: 'Gesundheitszentrum', f300: 478.20, f500: 467.60, f1000: 441.20, f1500: 414.80, f2000: 388.40, f2500: 362.00 },
  { insurer: 'ÖKK', model: 'Grundversicherung', f300: 531.40, f500: 520.80, f1000: 494.40, f1500: 468.00, f2000: 441.60, f2500: 415.20 },
  { insurer: 'ÖKK', model: 'Hausarzt', f300: 478.20, f500: 467.60, f1000: 441.20, f1500: 414.80, f2000: 388.40, f2500: 362.00 },
  { insurer: 'Sanitas', model: 'Compact', f300: 459.00, f500: 448.40, f1000: 422.00, f1500: 395.60, f2000: 369.20, f2500: 342.80 },
  { insurer: 'Sanitas', model: 'Grundversicherung', f300: 540.00, f500: 529.40, f1000: 503.00, f1500: 476.60, f2000: 450.20, f2500: 423.80 },
  { insurer: 'Sanitas', model: 'NetMed', f300: 432.00, f500: 421.40, f1000: 395.00, f1500: 368.60, f2000: 342.20, f2500: 315.80 },
  { insurer: 'SLKK', model: 'Grundversicherung', f300: 498.60, f500: 488.00, f1000: 461.60, f1500: 435.20, f2000: 408.80, f2500: 382.40 },
  { insurer: 'SLKK', model: 'SmartMed', f300: 448.80, f500: 438.20, f1000: 411.80, f1500: 385.40, f2000: 359.00, f2500: 332.60 },
  { insurer: 'Swica', model: 'FAVORIT CASA', f300: 486.40, f500: 475.80, f1000: 449.40, f1500: 423.00, f2000: 396.60, f2500: 370.20 },
  { insurer: 'Swica', model: 'FAVORIT MULTICHOICE', f300: 466.40, f500: 455.80, f1000: 429.40, f1500: 403.00, f2000: 376.60, f2500: 350.20 },
  { insurer: 'Swica', model: 'Grundversicherung', f300: 540.40, f500: 529.80, f1000: 503.40, f1500: 477.00, f2000: 450.60, f2500: 424.20 },
  { insurer: 'Visana', model: 'Grundversicherung', f300: 533.80, f500: 523.20, f1000: 496.80, f1500: 470.40, f2000: 444.00, f2500: 417.60 },
  { insurer: 'Visana', model: 'HMO', f300: 453.80, f500: 443.20, f1000: 416.80, f1500: 390.40, f2000: 364.00, f2500: 337.60 },
  { insurer: 'Visana', model: 'Managed Care', f300: 480.30, f500: 469.70, f1000: 443.30, f1500: 416.90, f2000: 390.50, f2500: 364.10 },
];

const generateMockResults = (): CalculationResult[] => [
  { insurer: 'Atupri', insurerUrl: 'https://www.atupri.ch', model: 'HMO', premium: 329.90, subsidy: 5.15, total: 324.75 },
  { insurer: 'KPT', insurerUrl: 'https://www.kpt.ch', model: 'KPTwin.smart', premium: 330.20, subsidy: 5.15, total: 325.05 },
  { insurer: 'CSS', insurerUrl: 'https://www.css.ch', model: 'Hausarztversicherung Profit', premium: 331.40, subsidy: 5.15, total: 326.25 },
  { insurer: 'Sanitas', insurerUrl: 'https://www.sanitas.com', model: 'TelMed (Compact One)', premium: 335.30, subsidy: 5.15, total: 330.15 },
  { insurer: 'KPT', insurerUrl: 'https://www.kpt.ch', model: 'KPTwin.win', premium: 338.30, subsidy: 5.15, total: 333.15 },
  { insurer: 'Agrisano', insurerUrl: 'https://www.agrisano.ch', model: 'AGRIsmart', premium: 339.70, subsidy: 5.15, total: 334.55 },
  { insurer: 'Helsana', insurerUrl: 'https://www.helsana.ch', model: 'BeneFit PLUS Flexmed R1', premium: 340.00, subsidy: 5.15, total: 334.85, isCurrentModel: true },
  { insurer: 'Helsana', insurerUrl: 'https://www.helsana.ch', model: 'BeneFit PLUS Hausarzt R1', premium: 340.00, subsidy: 5.15, total: 334.85 },
  { insurer: 'Sanitas', insurerUrl: 'https://www.sanitas.com', model: 'Hausarztmodell 1', premium: 340.45, subsidy: 5.15, total: 335.30 },
  { insurer: 'ÖKK', insurerUrl: 'https://www.oekk.ch', model: 'Gesundheitszentrum', premium: 342.70, subsidy: 5.15, total: 337.55 },
  { insurer: 'Swica', insurerUrl: 'https://www.swica.ch', model: 'FAVORIT MULTICHOICE', premium: 343.00, subsidy: 5.15, total: 337.85 },
  { insurer: 'Visana', insurerUrl: 'https://www.visana.ch', model: 'Managed Care', premium: 343.10, subsidy: 5.15, total: 337.95 },
  { insurer: 'Concordia', insurerUrl: 'https://www.concordia.ch', model: 'HMO', premium: 344.00, subsidy: 5.15, total: 338.85 },
  { insurer: 'SLKK', insurerUrl: 'https://www.slkk.ch', model: 'SLKK-SmartMed', premium: 344.40, subsidy: 5.15, total: 339.25 },
  { insurer: 'Assura', insurerUrl: 'https://www.assura.ch', model: 'Qualimed', premium: 344.70, subsidy: 5.15, total: 339.55 },
  { insurer: 'Helsana', insurerUrl: 'https://www.helsana.ch', model: 'BeneFit PLUS Telmed', premium: 345.50, subsidy: 5.15, total: 340.35 },
  { insurer: 'CSS', insurerUrl: 'https://www.css.ch', model: 'Multimed', premium: 341.80, subsidy: 5.15, total: 336.65 },
  { insurer: 'CSS', insurerUrl: 'https://www.css.ch', model: 'Hausarztmodell', premium: 347.00, subsidy: 5.15, total: 341.85 },
  { insurer: 'Sanitas', insurerUrl: 'https://www.sanitas.com', model: 'NetMed', premium: 315.80, subsidy: 5.15, total: 310.65 },
  { insurer: 'Concordia', insurerUrl: 'https://www.concordia.ch', model: 'Hausarzt', premium: 359.20, subsidy: 5.15, total: 354.05 },
  { insurer: 'Swica', insurerUrl: 'https://www.swica.ch', model: 'FAVORIT CASA', premium: 370.20, subsidy: 5.15, total: 365.05 },
  { insurer: 'Agrisano', insurerUrl: 'https://www.agrisano.ch', model: 'AGRIcontact', premium: 357.50, subsidy: 5.15, total: 352.35 },
  { insurer: 'Agrisano', insurerUrl: 'https://www.agrisano.ch', model: 'AGRIeco', premium: 363.40, subsidy: 5.15, total: 358.25 },
  { insurer: 'Aquilana', insurerUrl: 'https://www.aquilana.ch', model: 'CASAMED', premium: 363.90, subsidy: 5.15, total: 358.75 },
  { insurer: 'Aquilana', insurerUrl: 'https://www.aquilana.ch', model: 'SMARTMED', premium: 354.90, subsidy: 5.15, total: 349.75 },
  { insurer: 'Assura', insurerUrl: 'https://www.assura.ch', model: 'FeminaVita', premium: 365.80, subsidy: 5.15, total: 360.65 },
  { insurer: 'Assura', insurerUrl: 'https://www.assura.ch', model: 'Hausarzt Modell', premium: 350.00, subsidy: 5.15, total: 344.85 },
  { insurer: 'Assura', insurerUrl: 'https://www.assura.ch', model: 'PharMed', premium: 350.00, subsidy: 5.15, total: 344.85 },
  { insurer: 'Assura', insurerUrl: 'https://www.assura.ch', model: 'PreventoMed', premium: 365.80, subsidy: 5.15, total: 360.65 },
  { insurer: 'Atupri', insurerUrl: 'https://www.atupri.ch', model: 'CareMed', premium: 356.40, subsidy: 5.15, total: 351.25 },
  { insurer: 'Atupri', insurerUrl: 'https://www.atupri.ch', model: 'SmartCare', premium: 349.00, subsidy: 5.15, total: 343.85 },
  { insurer: 'Helsana', insurerUrl: 'https://www.helsana.ch', model: 'BeneFit PLUS Hausarzt', premium: 351.80, subsidy: 5.15, total: 346.65 },
  { insurer: 'KPT', insurerUrl: 'https://www.kpt.ch', model: 'KPTwin.doc', premium: 354.20, subsidy: 5.15, total: 349.05 },
  { insurer: 'ÖKK', insurerUrl: 'https://www.oekk.ch', model: 'Hausarzt', premium: 362.00, subsidy: 5.15, total: 356.85 },
  { insurer: 'Sanitas', insurerUrl: 'https://www.sanitas.com', model: 'Compact', premium: 342.80, subsidy: 5.15, total: 337.65 },
  { insurer: 'SLKK', insurerUrl: 'https://www.slkk.ch', model: 'SmartMed', premium: 332.60, subsidy: 5.15, total: 327.45 },
  { insurer: 'Visana', insurerUrl: 'https://www.visana.ch', model: 'HMO', premium: 337.60, subsidy: 5.15, total: 332.45 },
];

export default function VvgLeistungsvergleichTool() {
  const [currentView, setCurrentView] = useState<'intro' | 'form' | 'results'>('intro');
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [results, setResults] = useState<CalculationResult[]>([]);
  const [franchiseResults, setFranchiseResults] = useState<FranchiseResult[]>([]);
  const [personSummaries, setPersonSummaries] = useState<PersonSummary[]>([]);
  const [displayMode, setDisplayMode] = useState<'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState('sparen');
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [franchiseSortColumn, setFranchiseSortColumn] = useState<FranchiseSortColumn | null>(null);
  const [franchiseSortDirection, setFranchiseSortDirection] = useState<SortDirection>(null);
  
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
    setFranchiseResults(generateMockFranchiseResults());
    setCurrentView('results');
  };

  // Reset form
  const handleReset = () => {
    setFormData(initialFormData);
    setCurrentView('form');
    setResults([]);
    setFranchiseResults([]);
    setPersonSummaries([]);
  };

  // Go back to edit
  const handleEdit = () => {
    setCurrentView('form');
  };

  // Format price
  const formatPrice = (value: number) => {
    const displayValue = displayMode === 'year' ? value * 12 : value;
    return displayValue.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calculate savings (difference from current model)
  const calculateSavings = (premium: number): number => {
    return premium - CURRENT_MODEL_PREMIUM;
  };

  // Format savings with sign
  const formatSavings = (savings: number) => {
    const displayValue = displayMode === 'year' ? savings * 12 : savings;
    const formatted = Math.abs(displayValue).toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (displayValue < 0) return `-${formatted}`;
    if (displayValue > 0) return `+${formatted}`;
    return '0.00';
  };

  // Sort handler
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ChevronsUpDown className="h-3 w-3 ml-1" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="h-3 w-3 ml-1" />;
    }
    return <ChevronDown className="h-3 w-3 ml-1" />;
  };

  // Sorted results
  const sortedResults = useMemo(() => {
    if (!sortColumn || !sortDirection) return results;
    
    return [...results].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortColumn) {
        case 'insurer':
          aValue = a.insurer.toLowerCase();
          bValue = b.insurer.toLowerCase();
          break;
        case 'model':
          aValue = a.model.toLowerCase();
          bValue = b.model.toLowerCase();
          break;
        case 'savings':
          aValue = calculateSavings(a.premium);
          bValue = calculateSavings(b.premium);
          break;
        case 'premium':
          aValue = a.premium;
          bValue = b.premium;
          break;
        case 'subsidy':
          aValue = a.subsidy;
          bValue = b.subsidy;
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    });
  }, [results, sortColumn, sortDirection]);

  // Franchise sort handler
  const handleFranchiseSort = (column: FranchiseSortColumn) => {
    if (franchiseSortColumn === column) {
      if (franchiseSortDirection === 'asc') {
        setFranchiseSortDirection('desc');
      } else if (franchiseSortDirection === 'desc') {
        setFranchiseSortColumn(null);
        setFranchiseSortDirection(null);
      }
    } else {
      setFranchiseSortColumn(column);
      setFranchiseSortDirection('asc');
    }
  };

  // Get franchise sort icon
  const getFranchiseSortIcon = (column: FranchiseSortColumn) => {
    if (franchiseSortColumn !== column) {
      return <ChevronsUpDown className="h-3 w-3 ml-1" />;
    }
    if (franchiseSortDirection === 'asc') {
      return <ChevronUp className="h-3 w-3 ml-1" />;
    }
    return <ChevronDown className="h-3 w-3 ml-1" />;
  };

  // Sorted franchise results
  const sortedFranchiseResults = useMemo(() => {
    if (!franchiseSortColumn || !franchiseSortDirection) return franchiseResults;
    
    return [...franchiseResults].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (franchiseSortColumn) {
        case 'insurer':
          aValue = a.insurer.toLowerCase();
          bValue = b.insurer.toLowerCase();
          break;
        case 'model':
          aValue = a.model.toLowerCase();
          bValue = b.model.toLowerCase();
          break;
        case 'f300':
          aValue = a.f300;
          bValue = b.f300;
          break;
        case 'f500':
          aValue = a.f500;
          bValue = b.f500;
          break;
        case 'f1000':
          aValue = a.f1000;
          bValue = b.f1000;
          break;
        case 'f1500':
          aValue = a.f1500;
          bValue = b.f1500;
          break;
        case 'f2000':
          aValue = a.f2000;
          bValue = b.f2000;
          break;
        case 'f2500':
          aValue = a.f2500;
          bValue = b.f2500;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return franchiseSortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return franchiseSortDirection === 'asc' 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    });
  }, [franchiseResults, franchiseSortColumn, franchiseSortDirection]);

  // Handle calculation from intro form
  const handleIntroCalculate = (introFormData: {
    currentInsurer: string;
    currentModel: string;
    birthYear: string;
    franchise: string;
    hasEmployerAccident: boolean | null;
    location: string;
  }) => {
    // Update form data with intro values
    setFormData({
      location: introFormData.location,
      persons: [{
        id: generateId(),
        birthYear: introFormData.birthYear,
        franchise: introFormData.franchise,
        needsAccidentCoverage: introFormData.hasEmployerAccident === null ? null : !introFormData.hasEmployerAccident,
      }],
      currentInsurer: introFormData.currentInsurer,
      currentModel: introFormData.currentModel,
      compareModels: {
        standard: true,
        hausarzt: true,
        hmo: true,
        weitere: true,
      },
    });
    
    // Generate summaries and results
    const category = getCategory(introFormData.birthYear);
    const summaries: PersonSummary[] = [{
      id: 1,
      category,
      birthYear: introFormData.birthYear,
      franchise: introFormData.franchise ? `${parseInt(introFormData.franchise).toLocaleString('de-CH')}'` : '',
      accidentCoverage: introFormData.hasEmployerAccident === true ? 'Nein' : introFormData.hasEmployerAccident === false ? 'Ja' : '',
    }];
    
    setPersonSummaries(summaries);
    setResults(generateMockResults());
    setFranchiseResults(generateMockFranchiseResults());
    setCurrentView('results');
  };

  // Show intro landing page
  if (currentView === 'intro') {
    return <VvgLandingIntro onCalculate={handleIntroCalculate} />;
  }

  // Show results
  if (currentView === 'results') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Leistungsvergleich 2026</h1>
          <h2 className="text-xl font-semibold mb-1">Leistungen {formData.location || 'Schweiz'}</h2>
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
            <Button variant="default" onClick={handleEdit} className="bg-[#7a7a67] hover:bg-[#6E6E5E] text-white">
              Ändern
            </Button>
            <Button variant="link" className="text-[#7a7a67]">
              <Mail className="h-4 w-4 mr-2" />
              Link per E-Mail verschicken
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted">
            <TabsTrigger value="sparen" className="data-[state=active]:bg-[#7a7a67] data-[state=active]:text-white">
              Möglichkeit zum Sparen
            </TabsTrigger>
            <TabsTrigger value="franchisen" className="data-[state=active]:bg-[#7a7a67] data-[state=active]:text-white">
              Vergleich der Franchisen
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
                Sie sehen hier die Informationen zu den Leistungen der Gemeinde {formData.location || 'Schweiz'}.
              </p>
            </div>

            {/* Info Alert */}
            {!formData.currentInsurer && (
              <Alert className="mb-4 border-[#7a7a67] bg-[#7a7a67]/10">
                <Info className="h-4 w-4 text-[#7a7a67]" />
                <AlertDescription className="text-[#7a7a67]">
                  Geben Sie Ihre aktuelle Krankenkasse an. Dann sehen Sie hier, wie viel Sie sparen können.
                </AlertDescription>
              </Alert>
            )}

            {/* Results Table */}
            <div className="border rounded-lg overflow-hidden">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="bg-[#7a7a67] text-white sticky top-0 z-10">
                    <TableRow className="hover:bg-[#7a7a67]">
                      <TableHead 
                        className="text-white cursor-pointer select-none"
                        onClick={() => handleSort('insurer')}
                      >
                        <span className="inline-flex items-center">
                          Krankenkasse {getSortIcon('insurer')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none"
                        onClick={() => handleSort('model')}
                      >
                        <span className="inline-flex items-center">
                          Modell {getSortIcon('model')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleSort('savings')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          <span className="text-green-300">(-)</span>&nbsp;Sparmöglichkeit / <span className="text-red-300">(+)</span>&nbsp;Mehrkosten {getSortIcon('savings')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleSort('premium')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          Prämie {getSortIcon('premium')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleSort('subsidy')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          Vergütung {getSortIcon('subsidy')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleSort('total')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          Total {getSortIcon('total')}
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedResults.map((result, idx) => {
                      const savings = calculateSavings(result.premium);
                      const isCurrentModel = result.isCurrentModel;
                      
                      return (
                        <TableRow 
                          key={idx} 
                          className={`${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'} ${isCurrentModel ? 'bg-amber-50 dark:bg-amber-950/20' : ''}`}
                        >
                          <TableCell>
                            <a 
                              href={result.insurerUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#7a7a67] hover:underline inline-flex items-center gap-1"
                            >
                              {result.insurer}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>
                            {result.model}
                            {isCurrentModel && <span className="text-muted-foreground ml-1">(Ihr aktuelles Modell)</span>}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${
                            savings < 0 ? 'text-green-600' : savings > 0 ? 'text-red-600' : ''
                          }`}>
                            {formatSavings(savings)}
                          </TableCell>
                          <TableCell className="text-right">{formatPrice(result.premium)}</TableCell>
                          <TableCell className="text-right">{formatPrice(result.subsidy)}</TableCell>
                          <TableCell className="text-right font-medium">{formatPrice(result.total)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Alle Prämien in CHF
            </p>
          </TabsContent>

          <TabsContent value="franchisen" className="mt-6">
            <p className="text-sm text-muted-foreground mb-4 text-right">
              Sie sehen hier die Unterschiede bei den Prämien für die verschiedenen Franchisen.
            </p>
            
            <div className="border rounded-lg overflow-hidden">
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader className="bg-[#7a7a67] text-white sticky top-0 z-10">
                    <TableRow className="hover:bg-[#7a7a67]">
                      <TableHead 
                        className="text-white cursor-pointer select-none"
                        onClick={() => handleFranchiseSort('insurer')}
                      >
                        <span className="inline-flex items-center">
                          Krankenkasse {getFranchiseSortIcon('insurer')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none"
                        onClick={() => handleFranchiseSort('model')}
                      >
                        <span className="inline-flex items-center">
                          Modell {getFranchiseSortIcon('model')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleFranchiseSort('f300')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          300 {getFranchiseSortIcon('f300')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleFranchiseSort('f500')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          500 {getFranchiseSortIcon('f500')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleFranchiseSort('f1000')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          1'000 {getFranchiseSortIcon('f1000')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleFranchiseSort('f1500')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          1'500 {getFranchiseSortIcon('f1500')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleFranchiseSort('f2000')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          2'000 {getFranchiseSortIcon('f2000')}
                        </span>
                      </TableHead>
                      <TableHead 
                        className="text-white cursor-pointer select-none text-right"
                        onClick={() => handleFranchiseSort('f2500')}
                      >
                        <span className="inline-flex items-center justify-end w-full">
                          2'500 {getFranchiseSortIcon('f2500')}
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedFranchiseResults.map((result, idx) => (
                      <TableRow 
                        key={idx} 
                        className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
                      >
                        <TableCell className="font-medium">{result.insurer}</TableCell>
                        <TableCell>{result.model}</TableCell>
                        <TableCell className="text-right">{result.f300.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{result.f500.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{result.f1000.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{result.f1500.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{result.f2000.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{result.f2500.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Alle Prämien in CHF pro Monat
            </p>
          </TabsContent>

        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4">Leistungsvergleich 2026</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="font-semibold">Dieser Text ist in Leichter Sprache geschrieben.</p>
          <p>
            Die Leistungen der Krankenkasse sind unterschiedlich.<br />
            Sie können mit dem Leistungs-Vergleich die Leistungen<br />
            der Krankenkassen vergleichen.<br />
            So sehen Sie,<br />
            welche Krankenkasse für Sie am besten ist.
          </p>
          <p>
            Sie müssen verschiedene Angaben machen.<br />
            Geben Sie alle Angaben ein.<br />
            Sie erhalten dann einen Vergleich der Leistungen.
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
        <h2 className="text-lg font-semibold mb-2">Für welche Personen möchten Sie die Leistungen vergleichen?</h2>
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
                    <p className="text-sm font-medium mb-2">Möchten Sie für diese Person <strong>keine</strong> Leistung berechnen?</p>
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
          <p className="text-sm mb-2">Möchten Sie die Leistung noch für eine weitere Person berechnen?</p>
          <Button 
            variant="default" 
            onClick={addPerson}
            className="bg-[#7a7a67] hover:bg-[#6E6E5E] text-white"
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
              <SelectTrigger className="mt-2 bg-[#7a7a67] text-white border-[#7a7a67]">
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
              <SelectTrigger className="mt-2 bg-[#7a7a67] text-white border-[#7a7a67]">
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
            className="bg-[#7a7a67] hover:bg-[#6E6E5E] text-white px-12 py-3"
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
