import { AppLayout } from '@/components/AppLayout';
import { useConsultationState } from '@/hooks/useConsultationState';
import { AutoSaveIndicator } from '@/components/consultation/AutoSaveIndicator';
import { TrianglePyramid } from '@/components/insurance-consultation/TrianglePyramid';
import { TopicDetailOverlay } from '@/components/insurance-consultation/TopicDetailOverlay';
import { pyramidTopics } from '@/config/pyramidTopicsConfig';
import { useViewMode } from '@/hooks/useViewMode';

export default function InsuranceConsultingConsultation() {
  const { isPresentation } = useViewMode();
  const {
    topicStates,
    selectedTopicId,
    selectedTopic,
    selectTopic,
    clearSelection,
    toggleDiscussed,
    togglePrioritized,
    toggleImportant,
    toggleWaiver,
    toggleRelatedTopicDiscussed,
    autoSaveStatus,
    currentTitle,
  } = useConsultationState();

  const Wrapper = isPresentation ? 'div' : AppLayout;

  return (
    <Wrapper>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        {!isPresentation && (
          <div className="border-b bg-background px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Beratungsgespräch</h1>
              <p className="text-sm text-muted-foreground">
                Wähle ein Bedürfnis aus der Pyramide, um Details zu sehen und zu dokumentieren.
              </p>
            </div>
            <AutoSaveIndicator status={autoSaveStatus} title={currentTitle || undefined} />
          </div>
        )}

        {/* Pyramid */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <TrianglePyramid
            selectedTopicId={selectedTopicId}
            topicStates={topicStates}
            onSelectTopic={selectTopic}
            onToggleImportant={toggleImportant}
          />
        </div>

        {/* Detail Overlay */}
        <TopicDetailOverlay
          topic={selectedTopic}
          topicState={selectedTopicId ? topicStates[selectedTopicId] ?? null : null}
          isOpen={!!selectedTopic}
          onClose={clearSelection}
          onTogglePrioritized={togglePrioritized}
          onToggleDiscussed={toggleDiscussed}
          onToggleWaiver={toggleWaiver}
          onToggleRelatedTopicDiscussed={toggleRelatedTopicDiscussed}
        />
      </div>
    </Wrapper>
  );
}
