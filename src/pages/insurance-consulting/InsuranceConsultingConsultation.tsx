import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { PyramidCanvas } from '@/components/insurance-consultation/PyramidCanvas';
import { DetailPanel } from '@/components/insurance-consultation/DetailPanel';
import { useInsurancePyramid } from '@/hooks/useInsurancePyramid';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PanelRightOpen } from 'lucide-react';

export default function InsuranceConsultingConsultation() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

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

  // Open sheet on mobile when item is selected
  useEffect(() => {
    if (isMobile && selectedItem) {
      setMobileSheetOpen(true);
    }
  }, [selectedItemId, isMobile]);

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

        {/* Main Content */}
        <div className="container py-6">
          <div className="flex gap-6">
            {/* Pyramid Canvas - Left/Center */}
            <div className={`flex-1 ${!isMobile ? 'pr-6' : ''}`}>
              <PyramidCanvas
                selectedItemId={selectedItemId}
                onSelectItem={selectItem}
              />

              {/* Mobile: Show button to open panel */}
              {isMobile && selectedItem && (
                <div className="fixed bottom-4 right-4 z-40">
                  <Button
                    size="lg"
                    onClick={() => setMobileSheetOpen(true)}
                    className="shadow-lg gap-2"
                  >
                    <PanelRightOpen className="w-5 h-5" />
                    Details anzeigen
                  </Button>
                </div>
              )}
            </div>

            {/* Desktop: Fixed Side Panel */}
            {!isMobile && selectedItem && (
              <div className="w-[400px] shrink-0 sticky top-4 self-start">
                <div className="border rounded-lg overflow-hidden shadow-sm h-[calc(100vh-200px)]">
                  <DetailPanel
                    item={selectedItem}
                    onTogglePrioritized={togglePrioritized}
                    onToggleDiscussed={toggleDiscussed}
                    onAddWaiver={toggleWaiver}
                    onToggleTopicDiscussed={toggleTopicDiscussed}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile: Sheet/Drawer */}
        {isMobile && (
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <SheetContent side="bottom" className="h-[85vh] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>
                  {selectedItem?.title || 'Details'}
                </SheetTitle>
              </SheetHeader>
              {selectedItem && (
                <DetailPanel
                  item={selectedItem}
                  onClose={() => setMobileSheetOpen(false)}
                  onTogglePrioritized={togglePrioritized}
                  onToggleDiscussed={toggleDiscussed}
                  onAddWaiver={toggleWaiver}
                  onToggleTopicDiscussed={toggleTopicDiscussed}
                  showCloseButton
                />
              )}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </AppLayout>
  );
}
