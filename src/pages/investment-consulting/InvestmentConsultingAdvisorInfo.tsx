import AdvisorInfoPage from '@/components/consultation/AdvisorInfoPage';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';
import { type AdvisorInfoData, DEFAULT_ADVISOR_INFO_DATA } from '@/components/consultation/AdvisorInfoConfig';
import { useCallback } from 'react';

export default function InvestmentConsultingAdvisorInfo() {
  const { consultationData, updateData } = useInvestmentConsultationState();

  useSectionBroadcast({ section: 'advisor-info', title: 'Transparenz & Nachweise' });

  const advisorData = (consultationData.additionalData?.advisorInfoData as AdvisorInfoData) ?? DEFAULT_ADVISOR_INFO_DATA;

  const handleChange = useCallback(
    (d: AdvisorInfoData) => {
      updateData((prev) => ({
        ...prev,
        additionalData: { ...prev.additionalData, advisorInfoData: d },
      }));
    },
    [updateData]
  );

  return <AdvisorInfoPage data={advisorData} onDataChange={handleChange} />;
}
