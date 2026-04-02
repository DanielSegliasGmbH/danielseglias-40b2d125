import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyzerStep, AnalysisData, UploadedFile, EMPTY_ANALYSIS } from './types';
import { StartScreen } from './StartScreen';
import { UploadScreen } from './UploadScreen';
import { AnalysisScreen } from './AnalysisScreen';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ThreeAAnalyzerToolProps {
  mode?: 'internal' | 'public';
}

function mapDbToAnalysisData(row: Record<string, unknown>): AnalysisData {
  const costs = (row.costs as Record<string, unknown>) || {};
  const flexibility = (row.flexibility as Record<string, unknown>) || {};

  const mapCost = (key: string, label: string) => {
    const c = (costs[key] as Record<string, unknown>) || {};
    return {
      label,
      value: c.value != null ? Number(c.value) : null,
      isVerified: Boolean(c.isVerified),
      source: (c.source as string) || undefined,
    };
  };

  return {
    provider: (row.provider as string) || null,
    productName: (row.product_name as string) || null,
    productType: (row.product_type as AnalysisData['productType']) || null,
    contributionAmount: row.contribution_amount != null ? Number(row.contribution_amount) : null,
    contributionFrequency: (row.contribution_frequency as AnalysisData['contributionFrequency']) || null,
    contractStart: (row.contract_start as string) || null,
    contractEnd: (row.contract_end as string) || null,
    remainingYears: row.remaining_years != null ? Number(row.remaining_years) : null,
    paidContributions: row.paid_contributions != null ? Number(row.paid_contributions) : null,
    currentValue: row.current_value != null ? Number(row.current_value) : null,
    guaranteedValue: row.guaranteed_value != null ? Number(row.guaranteed_value) : null,
    funds: (row.funds as AnalysisData['funds']) || [],
    equityQuota: row.equity_quota != null ? Number(row.equity_quota) : null,
    strategyClassification: (row.strategy_classification as AnalysisData['strategyClassification']) || null,
    costs: {
      acquisition: mapCost('acquisition', 'Abschlusskosten'),
      ongoing: mapCost('ongoing', 'Laufende Kosten'),
      management: mapCost('management', 'Verwaltungsgebühren'),
      fundFees: mapCost('fundFees', 'Fondsgebühren / TER'),
      other: mapCost('other', 'Sonstige Kosten'),
    },
    flexibility: {
      contributionAdjustment: (flexibility.contributionAdjustment as AnalysisData['flexibility']['contributionAdjustment']) || null,
      pause: (flexibility.pause as AnalysisData['flexibility']['pause']) || null,
      cancellationDisadvantages: (flexibility.cancellationDisadvantages as string) || null,
    },
    issues: (row.issues as AnalysisData['issues']) || [],
    initialAssessment: (row.initial_assessment as string) || null,
    analysisResult: (row.analysis_result as AnalysisData['analysisResult']) || null,
  };
}

const STATUS_MESSAGES: Record<string, { title: string; description: string }> = {
  extracting: {
    title: 'Dokumente werden ausgelesen...',
    description: 'Die KI analysiert deine hochgeladenen Dokumente und extrahiert die Vertragsdaten.',
  },
  extracted: {
    title: 'Daten extrahiert – Analyse läuft...',
    description: 'Die Vertragsdaten wurden erfolgreich erkannt. Die Ersteinschätzung wird erstellt.',
  },
  analyzing: {
    title: 'Ersteinschätzung wird erstellt...',
    description: 'Basierend auf den extrahierten Daten wird jetzt eine verständliche Analyse erzeugt.',
  },
};

export function ThreeAAnalyzerTool({ mode = 'internal' }: ThreeAAnalyzerToolProps) {
  const [step, setStep] = useState<AnalyzerStep>('start');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData>(EMPTY_ANALYSIS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  const createAnalysis = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('three_a_analyses')
        .insert({ status: 'pending' })
        .select('id')
        .single();

      if (error) throw error;
      setAnalysisId(data.id);
      return data.id;
    } catch (err) {
      console.error('Error creating analysis:', err);
      return null;
    }
  }, []);

  const handleStart = useCallback(async () => {
    const id = await createAnalysis();
    if (id) {
      setStep('upload');
    }
  }, [createAnalysis]);

  const handleAnalyze = useCallback(async () => {
    if (!analysisId) return;

    setIsAnalyzing(true);
    setAnalysisStatus('extracting');

    try {
      // Call the edge function for real AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-3a', {
        body: { analysisId },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Analyse fehlgeschlagen');
      }

      if (data?.error) {
        if (data.error === 'rate_limited') {
          toast.error('Zu viele Anfragen. Bitte versuche es in einer Minute erneut.');
        } else if (data.error === 'payment_required') {
          toast.error('Die KI-Analyse steht aktuell nicht zur Verfügung. Bitte versuche es später erneut.');
        } else if (data.error === 'no_text_extracted') {
          toast.error('Aus den Dokumenten konnte kein lesbarer Text extrahiert werden. Bitte lade gut lesbare PDF-Dateien hoch.');
        } else {
          toast.error('Die Analyse konnte nicht durchgeführt werden. Bitte versuche es erneut.');
        }
        return;
      }

      if (data?.data) {
        const result = mapDbToAnalysisData(data.data);
        setAnalysisData(result);
        setStep('analysis');
      } else {
        throw new Error('Keine Daten zurückgegeben');
      }
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      toast.error(`Analysefehler: ${message}`);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus(null);
    }
  }, [analysisId]);

  const handleReset = useCallback(() => {
    setStep('start');
    setFiles([]);
    setAnalysisId(null);
    setAnalysisData(EMPTY_ANALYSIS);
  }, []);

  const handleFilesChange = useCallback((newFiles: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => {
    if (typeof newFiles === 'function') {
      setFiles(newFiles);
    } else {
      setFiles(newFiles);
    }
  }, []);

  if (isAnalyzing) {
    const statusInfo = STATUS_MESSAGES[analysisStatus || 'extracting'] || STATUS_MESSAGES.extracting;
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">{statusInfo.title}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {statusInfo.description}
          </p>
          <div className="flex justify-center gap-2 mt-6">
            {['extracting', 'analyzing'].map((s, i) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full transition-colors ${
                  analysisStatus === s
                    ? 'bg-primary animate-pulse'
                    : i < ['extracting', 'analyzing'].indexOf(analysisStatus || 'extracting')
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Dies kann bis zu einer Minute dauern.
          </p>
        </CardContent>
      </Card>
    );
  }

  switch (step) {
    case 'start':
      return <StartScreen onStart={handleStart} />;
    case 'upload':
      return (
        <UploadScreen
          files={files}
          onFilesChange={handleFilesChange}
          onAnalyze={handleAnalyze}
          onBack={() => setStep('start')}
          analysisId={analysisId}
        />
      );
    case 'analysis':
      return (
        <AnalysisScreen
          data={analysisData}
          analysisId={analysisId}
          onBack={() => setStep('upload')}
          onReset={handleReset}
        />
      );
  }
}
