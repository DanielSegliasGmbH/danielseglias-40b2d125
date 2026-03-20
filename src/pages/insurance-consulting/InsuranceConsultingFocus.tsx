import { useConsultationState } from '@/hooks/useConsultationState';
import ConversationFocusPage from '@/components/consultation/ConversationFocusPage';
import { type ConversationFocusData, generateDefaultFocusData } from '@/components/consultation/ConversationFocusConfig';
import { useCallback } from 'react';

export default function InsuranceConsultingFocus() {
  const { consultationData, updateData } = useConsultationState();

  const focusData = (consultationData.additionalData?.focusData as ConversationFocusData) ?? generateDefaultFocusData();

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
