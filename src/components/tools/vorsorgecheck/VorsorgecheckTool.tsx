import { PdfExportWrapper } from '../PdfExportWrapper';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  VorsorgecheckAnswers, 
  VorsorgecheckResult, 
  QUESTIONS, 
  calculateScore, 
  RESULT_TEXTS 
} from './types';

export default function VorsorgecheckTool() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<VorsorgecheckAnswers>>({});
  const [result, setResult] = useState<VorsorgecheckResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
  const isLastQuestion = currentStep === QUESTIONS.length - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const handleAnswer = (value: string) => {
    if (currentQuestion) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      submitAnswers();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitAnswers = async () => {
    const completeAnswers = answers as VorsorgecheckAnswers;
    
    // Calculate score
    const calculatedResult = calculateScore(completeAnswers);
    
    setIsSubmitting(true);
    try {
      // Save to database
      const { error } = await supabase.from('leadmagnet_3a_checks').insert({
        result_level: calculatedResult.level,
        score_total: calculatedResult.score,
        q1_provider: completeAnswers.q1_provider,
        q2_year: completeAnswers.q2_year,
        q3_payment: completeAnswers.q3_payment,
        q4_fees: completeAnswers.q4_fees,
        q5_flexibility: completeAnswers.q5_flexibility,
        q6_investment: completeAnswers.q6_investment,
        q7_feeling: completeAnswers.q7_feeling,
      });

      if (error) {
        console.error('Error saving 3a check:', error);
        toast.error('Fehler beim Speichern. Bitte versuche es erneut.');
        return;
      }

      setResult(calculatedResult);
    } catch (err) {
      console.error('Error:', err);
      toast.error('Ein Fehler ist aufgetreten.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookConsultation = () => {
    // Navigate to contact or booking page
    window.location.href = '/contact';
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setResult(null);
  };

  // Result view
  if (result) {
    const resultData = RESULT_TEXTS[result.level];
    const ResultIcon = result.level === 'grün' ? CheckCircle : result.level === 'gelb' ? AlertTriangle : XCircle;
    const iconColorClass = result.level === 'grün' 
      ? 'text-green-500' 
      : result.level === 'gelb' 
        ? 'text-yellow-500' 
        : 'text-red-500';
    const bgColorClass = result.level === 'grün'
      ? 'bg-green-50 border-green-200'
      : result.level === 'gelb'
        ? 'bg-yellow-50 border-yellow-200'
        : 'bg-red-50 border-red-200';

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className={`${bgColorClass} border-2`}>
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <ResultIcon className={`h-16 w-16 mx-auto ${iconColorClass}`} />
            <h2 className="text-2xl font-bold text-foreground">{resultData.title}</h2>
            <p className="text-muted-foreground leading-relaxed max-w-lg mx-auto">
              {resultData.text}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button size="lg" onClick={handleBookConsultation} className="gap-2">
            Kostenlose Vorsorge-Analyse buchen
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" onClick={resetQuiz}>
            Nochmal starten
          </Button>
        </div>
      </div>
    );
  }

  // Question view
  return (
    <PdfExportWrapper toolName="Vorsorgecheck-3a">
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Frage {currentStep + 1} von {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {currentQuestion?.question}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={currentAnswer || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion?.options.map((option) => (
              <div
                key={option.value}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  currentAnswer === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="flex-1 cursor-pointer text-base">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
        <Button
          onClick={handleNext}
          disabled={!currentAnswer || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Wird ausgewertet...
            </>
          ) : isLastQuestion ? (
            'Auswerten'
          ) : (
            <>
              Weiter
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
    </PdfExportWrapper>
  );
}
