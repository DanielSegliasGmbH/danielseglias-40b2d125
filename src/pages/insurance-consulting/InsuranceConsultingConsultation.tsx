import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { PyramidGrid } from '@/components/insurance-consultation/PyramidGrid';
import { DetailPanelOverlay } from '@/components/insurance-consultation/DetailPanelOverlay';
import { useInsurancePyramid } from '@/hooks/useInsurancePyramid';
import { useState, useEffect } from 'react';
import { PyramidItem } from '@/config/insurancePyramidConfig';

export default function InsuranceConsultingConsultation() {
  const { t } = useTranslation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const {
    levels,
    selectedItemId,
    selectedItem,
    selectItem,
    togglePrioritized,
    toggleDiscussed,
    toggleWaiver,
    toggleTopicDiscussed,
  } = useInsurancePyramid();

  // Handle item selection - open panel
  const handleSelectItem = (item: PyramidItem) => {
    selectItem(item);
    setIsPanelOpen(true);
  };

  // Close panel but keep selection
  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container py-6">
            <h1 className="text-2xl font-bold">Unser Beratungsgespräch</h1>
            <p className="text-muted-foreground mt-1">
              Was ist Ihnen wichtig? Wählen Sie einen Bereich aus.
            </p>
          </div>
        </div>

        {/* Main Content - Pyramid centered, full width */}
        <div className="py-8">
          <PyramidGrid
            selectedItemId={selectedItemId}
            onSelectItem={handleSelectItem}
          />
        </div>

        {/* Overlay Detail Panel */}
        <DetailPanelOverlay
          item={selectedItem}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onTogglePrioritized={togglePrioritized}
          onToggleDiscussed={toggleDiscussed}
          onAddWaiver={toggleWaiver}
          onToggleTopicDiscussed={toggleTopicDiscussed}
        />
      </div>
    </AppLayout>
  );
}
