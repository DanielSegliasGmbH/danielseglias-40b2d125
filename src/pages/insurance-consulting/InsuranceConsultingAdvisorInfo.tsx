import AdvisorInfoPage from '@/components/consultation/AdvisorInfoPage';
import { useConsultationState } from '@/hooks/useConsultationState';
import { type AdvisorInfoData, DEFAULT_ADVISOR_INFO_DATA } from '@/components/consultation/AdvisorInfoConfig';
import { useCallback } from 'react';

export default function InsuranceConsultingAdvisorInfo() {
  const { consultationData, updateData } = useConsultationState();

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
