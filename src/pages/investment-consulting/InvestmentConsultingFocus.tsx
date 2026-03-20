import { useViewMode } from '@/hooks/useViewMode';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import ConversationFocusPage from '@/components/consultation/ConversationFocusPage';
import { type ConversationFocusData, generateDefaultFocusData } from '@/components/consultation/ConversationFocusConfig';
import { useCallback } from 'react';
import { useSectionBroadcast } from '@/hooks/useSectionBroadcast';

export default function InvestmentConsultingFocus() {
  const { consultationData, updateData } = useInvestmentConsultationState();

  const focusData = (consultationData.additionalData?.focusData as ConversationFocusData) ?? generateDefaultFocusData();

  useSectionBroadcast({
    section: 'focus',
    title: 'Gesprächsfokus & Erwartungen',
  });

  const handleDataChange = useCallback(
    (newFocus: ConversationFocusData) => {
      updateData((prev) => ({
        ...prev,
        additionalData: {
          ...prev.additionalData,
          focusData: newFocus,
        },
      }));
    },
    [updateData]
  );

  return (
    <ConversationFocusPage
      focusData={focusData}
      onDataChange={handleDataChange}
    />
  );
}
