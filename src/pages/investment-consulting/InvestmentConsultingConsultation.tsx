import ConsultationProcessPage from '@/components/consultation/ConsultationProcessPage';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';

export default function InvestmentConsultingConsultation() {
  useSectionBroadcast({ section: 'consultation', title: 'So gehen wir heute vor' });
  return <ConsultationProcessPage />;
}
