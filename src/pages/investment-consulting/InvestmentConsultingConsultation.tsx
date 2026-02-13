import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TrianglePyramid } from '@/components/insurance-consultation/TrianglePyramid';
import { TopicDetailOverlay } from '@/components/insurance-consultation/TopicDetailOverlay';
import { OfferTile } from '@/components/insurance-consultation/OfferTile';
import { OfferDetailOverlay } from '@/components/insurance-consultation/OfferDetailOverlay';
import { useInvestmentConsultationState } from '@/hooks/useInvestmentConsultationState';
import { PyramidTopic } from '@/config/pyramidTopicsConfig';

export default function InvestmentConsultingConsultation() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  const {
    topicStates,
    selectedTopicId,
    selectedTopic,
    selectTopic,
    toggleDiscussed,
    togglePrioritized,
    toggleImportant,
    toggleWaiver,
    toggleRelatedTopicDiscussed,
  } = useInvestmentConsultationState();

  const handleSelectTopic = (topic: PyramidTopic) => {
    selectTopic(topic);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container py-6">
            <h1 className="text-2xl font-bold">Unser Beratungsgespräch</h1>
            <p className="text-muted-foreground mt-1">
              Was ist Ihnen wichtig? Wählen Sie einen Bereich aus.
            </p>
          </div>
        </div>

        <div className="py-8 px-4 relative">
          <div className="flex justify-center mb-6 lg:mb-0 lg:block lg:absolute lg:top-8 lg:right-8 xl:right-12 z-10">
            <OfferTile onSelect={() => setIsOfferOpen(true)} />
          </div>

          <TrianglePyramid
            selectedTopicId={selectedTopicId}
            topicStates={topicStates}
            onSelectTopic={handleSelectTopic}
            onToggleImportant={toggleImportant}
          />
        </div>

        <TopicDetailOverlay
          topic={selectedTopic}
          topicState={selectedTopic ? topicStates[selectedTopic.id] : null}
          isOpen={isPanelOpen}
          onClose={handleClosePanel}
          onTogglePrioritized={togglePrioritized}
          onToggleDiscussed={toggleDiscussed}
          onToggleWaiver={toggleWaiver}
          onToggleRelatedTopicDiscussed={toggleRelatedTopicDiscussed}
        />

        <OfferDetailOverlay
          isOpen={isOfferOpen}
          onClose={() => setIsOfferOpen(false)}
        />
      </div>
    </AppLayout>
  );
}
