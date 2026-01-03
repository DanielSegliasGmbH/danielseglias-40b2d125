import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { TrianglePyramid } from '@/components/insurance-consultation/TrianglePyramid';
import { TopicDetailOverlay } from '@/components/insurance-consultation/TopicDetailOverlay';
import { useConsultationState } from '@/hooks/useConsultationState';
import { PyramidTopic } from '@/config/pyramidTopicsConfig';

export default function InsuranceConsultingConsultation() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

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
  } = useConsultationState();

  // Handle topic selection - open panel
  const handleSelectTopic = (topic: PyramidTopic) => {
    selectTopic(topic);
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

        {/* Main Content - Triangle Pyramid centered */}
        <div className="py-8 px-4">
          <TrianglePyramid
            selectedTopicId={selectedTopicId}
            topicStates={topicStates}
            onSelectTopic={handleSelectTopic}
            onToggleImportant={toggleImportant}
          />
        </div>

        {/* Overlay Detail Panel */}
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
      </div>
    </AppLayout>
  );
}
