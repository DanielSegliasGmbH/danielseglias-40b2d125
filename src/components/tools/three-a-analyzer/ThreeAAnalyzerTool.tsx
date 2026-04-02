import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AnalyzerStep, AnalysisData, UploadedFile, EMPTY_ANALYSIS } from './types';
import { StartScreen } from './StartScreen';
import { UploadScreen } from './UploadScreen';
import { AnalysisScreen } from './AnalysisScreen';
import { MockAnalysisService } from './mockAnalysis';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ThreeAAnalyzerToolProps {
  mode?: 'internal' | 'public';
}

const analysisService = new MockAnalysisService();

export function ThreeAAnalyzerTool({ mode = 'internal' }: ThreeAAnalyzerToolProps) {
  const [step, setStep] = useState<AnalyzerStep>('start');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData>(EMPTY_ANALYSIS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    try {
      // Update analysis status
      await supabase
        .from('three_a_analyses')
        .update({ status: 'processing' })
        .eq('id', analysisId);

      // Run analysis (mock for MVP)
      const result = await analysisService.analyzeDocuments(analysisId);
      setAnalysisData(result);

      // Update analysis with results
      await supabase
        .from('three_a_analyses')
        .update({
          status: 'completed',
          provider: result.provider,
          product_name: result.productName,
          product_type: result.productType,
          contribution_amount: result.contributionAmount,
          contract_start: result.contractStart,
          contract_end: result.contractEnd,
          remaining_years: result.remainingYears,
          current_value: result.currentValue,
          guaranteed_value: result.guaranteedValue,
          funds: result.funds as any,
          equity_quota: result.equityQuota,
          strategy_classification: result.strategyClassification,
          costs: result.costs as any,
          flexibility: result.flexibility as any,
          issues: result.issues as any,
          initial_assessment: result.initialAssessment,
        })
        .eq('id', analysisId);

      setStep('analysis');
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
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
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Analyse wird durchgeführt...</h3>
          <p className="text-sm text-muted-foreground">
            Deine Dokumente werden verarbeitet. Dies kann einen Moment dauern.
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
