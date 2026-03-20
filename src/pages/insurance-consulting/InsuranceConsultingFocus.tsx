import { useViewMode } from '@/hooks/useViewMode';
import { useConsultationState } from '@/hooks/useConsultationState';
import ConversationFocusPage from '@/components/consultation/ConversationFocusPage';
import { type ConversationFocusData, generateDefaultFocusData } from '@/components/consultation/ConversationFocusConfig';
import { useCallback } from 'react';

export default function InsuranceConsultingFocus() {
  const { consultationData, topicStates } = useConsultationState();

  // Store focusData in additionalData
  const focusData = (consultationData.additionalData?.focusData as ConversationFocusData) ?? generateDefaultFocusData();

  // We need a way to update additionalData - the insurance hook doesn't expose updateData directly
  // but we can use the existing save mechanism. For now we'll store locally and rely on auto-save
  // through the consultation data structure.
  // TODO: expose updateData in useConsultationState if needed

  return (
    <ConversationFocusPage
      focusData={focusData}
    />
  );
}
