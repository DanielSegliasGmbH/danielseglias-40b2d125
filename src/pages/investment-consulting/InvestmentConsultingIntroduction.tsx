import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import IntroductionPage from '@/components/consultation/IntroductionPage';
import { type IntroductionData, DEFAULT_INTRODUCTION_DATA } from '@/components/consultation/IntroductionConfig';
import { useCallback } from 'react';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';

export default function InvestmentConsultingIntroduction() {
  const { consultationData, updateData } = useInvestmentConsultationState();

  const introData = (consultationData.additionalData?.introData as IntroductionData) ?? DEFAULT_INTRODUCTION_DATA;

  useSectionBroadcast({
    section: 'introduction',
    title: 'Meine Vorstellung',
  });

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
