import AdvisorInfoPage from '@/components/consultation/AdvisorInfoPage';
import { useConsultationState } from '@/hooks/useConsultationState';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';
import { type AdvisorInfoData, DEFAULT_ADVISOR_INFO_DATA } from '@/components/consultation/AdvisorInfoConfig';

export default function InvestmentConsultingAdvisorInfo() {
  const { consultationData, updateData } = useConsultationState('investment');
  useSectionBroadcast('advisor-info');

  const advisorData: AdvisorInfoData =
    (consultationData?.additionalData as any)?.advisorInfoData ?? DEFAULT_ADVISOR_INFO_DATA;

  const handleChange = (d: AdvisorInfoData) => {
    updateData({ advisorInfoData: d });
  };

  return <AdvisorInfoPage data={advisorData} onDataChange={handleChange} />;
}
