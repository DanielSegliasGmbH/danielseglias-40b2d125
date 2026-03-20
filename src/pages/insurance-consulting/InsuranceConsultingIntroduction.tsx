import { useConsultationState } from '@/hooks/useConsultationState';
import IntroductionPage from '@/components/consultation/IntroductionPage';
import { type IntroductionData, DEFAULT_INTRODUCTION_DATA } from '@/components/consultation/IntroductionConfig';
import { useCallback } from 'react';

export default function InsuranceConsultingIntroduction() {
  const { consultationData, updateData } = useConsultationState();

  const introData = (consultationData.additionalData?.introData as IntroductionData) ?? DEFAULT_INTRODUCTION_DATA;

  const handleDataChange = useCallback(
    (newIntro: IntroductionData) => {
      updateData((prev) => ({
        ...prev,
        additionalData: {
          ...prev.additionalData,
          introData: newIntro,
        },
      }));
    },
    [updateData]
  );

  return (
    <IntroductionPage
      introData={introData}
      onDataChange={handleDataChange}
    />
  );
}
