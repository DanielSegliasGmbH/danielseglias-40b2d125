import { useEffect, useRef } from 'react';
import { PdfExportWrapper } from '../PdfExportWrapper';
import { useFinanzcheckLogic } from './useFinanzcheckLogic';
import { FinanzcheckStep0 } from './FinanzcheckStep0';
import { FinanzcheckStep1 } from './FinanzcheckStep1';
import { FinanzcheckStep2 } from './FinanzcheckStep2';
import { FinanzcheckStep3 } from './FinanzcheckStep3';
import { useMemorySnapshot } from '@/hooks/useMemories';

interface Props {
  mode: 'internal' | 'public';
}

export function FinanzcheckTool({ mode }: Props) {
  const {
    currentStep,
    userData,
    updateUserData,
    updateAnswer,
    updateCategoryInterest,
    isStep1Valid,
    isStep2Valid,
    interestedCategories,
    result,
    goNext,
    goBack,
    reset,
  } = useFinanzcheckLogic();

  const { saveSnapshot } = useMemorySnapshot();
  const snapshotSaved = useRef(false);

  // Save memory snapshot when result is computed
  useEffect(() => {
    if (currentStep === 3 && result && !snapshotSaved.current) {
      snapshotSaved.current = true;
      saveSnapshot(
        'finanzcheck',
        'Berechnung durchgeführt',
        { age: userData.age, income: userData.income, expenses: userData.expenses, thirdPillar: userData.thirdPillar },
        { overallScore: result.overallScore, categoryScores: result.categoryScores.map(c => ({ id: c.categoryId, label: c.label, score: c.percentage })) }
      );
    }
    if (currentStep !== 3) snapshotSaved.current = false;
  }, [currentStep, result]);

  // Progress indicator
  const steps = ['Start', 'Basisdaten', 'Themen', 'Ergebnis'];

  return (
    <PdfExportWrapper toolName="Finanzcheck" hideExport={mode === 'public'}>
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      {currentStep > 0 && currentStep < 3 && (
        <div className="mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, idx) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    idx <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`h-0.5 w-8 sm:w-16 md:w-24 ${
                      idx < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, idx) => (
              <span
                key={step}
                className={`text-xs ${
                  idx <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      {currentStep === 0 && <FinanzcheckStep0 onStart={goNext} />}

      {currentStep === 1 && (
        <FinanzcheckStep1
          userData={userData}
          updateUserData={updateUserData}
          isValid={isStep1Valid}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {currentStep === 2 && (
        <FinanzcheckStep2
          userData={userData}
          updateCategoryInterest={updateCategoryInterest}
          updateAnswer={updateAnswer}
          interestedCategories={interestedCategories}
          isValid={isStep2Valid}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {currentStep === 3 && result && (
        <FinanzcheckStep3 result={result} onBack={goBack} onReset={reset} />
      )}
    </div>
    </PdfExportWrapper>
  );
}
