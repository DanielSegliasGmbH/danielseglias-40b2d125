import { useMemo } from 'react';
import { PyramidTile } from './PyramidTile';
import { getTopicsByLevel, PyramidTopic } from '@/config/pyramidTopicsConfig';
import { cn } from '@/lib/utils';

interface TopicState {
  discussed: boolean;
}

interface TrianglePyramidProps {
  selectedTopicId: string | null;
  topicStates: Record<string, TopicState>;
  onSelectTopic: (topic: PyramidTopic) => void;
  onToggleDiscussed: (topicId: string) => void;
}

// Row configuration: level -> percentage from top (equal spacing of 16%)
const rowPositions: Record<number, number> = {
  1: 26,  // Spitze
  2: 42,  // 2 Kacheln
  3: 58,  // 3 Kacheln
  4: 74,  // 4 Kacheln (Basis)
};

// Pyramid background configuration - freely adjustable
const pyramidConfig = {
  // Size as percentage of container width
  width: 92, // %
  // Vertical position offset from top
  top: 10, // %
  // Horizontal position (50 = centered)
  left: 50, // %
  // Color
  color: '#8c8c7c',
};

export function TrianglePyramid({
  selectedTopicId,
  topicStates,
  onSelectTopic,
  onToggleDiscussed,
}: TrianglePyramidProps) {
  // Get topics organized by level
  const levels = useMemo(() => ({
    1: getTopicsByLevel(1),
    2: getTopicsByLevel(2),
    3: getTopicsByLevel(3),
    4: getTopicsByLevel(4),
  }), []);

  return (
    <div 
      className="relative w-full max-w-[1100px] mx-auto"
      style={{
        // CSS variables for tile sizes
        '--tile-w': 'clamp(140px, 18vw, 200px)',
        '--tile-h': 'clamp(90px, 12vw, 120px)',
        '--tile-gap': 'clamp(8px, 1.5vw, 16px)',
      } as React.CSSProperties}
    >
      {/* Container with aspect ratio */}
      <div 
        className="relative w-full"
        style={{ aspectRatio: '1 / 0.866' }}
      >
        {/* Pyramid Background - configurable size and position */}
        <div 
          className="absolute"
          style={{
            width: `${pyramidConfig.width}%`,
            left: `${pyramidConfig.left}%`,
            top: `${pyramidConfig.top}%`,
            bottom: 0,
            transform: 'translateX(-50%)',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            backgroundColor: pyramidConfig.color,
          }}
        />

        {/* Rows Container */}
        {([1, 2, 3, 4] as const).map((level) => (
          <PyramidRow
            key={level}
            topics={levels[level]}
            yPosition={rowPositions[level]}
            selectedTopicId={selectedTopicId}
            topicStates={topicStates}
            onSelectTopic={onSelectTopic}
            onToggleDiscussed={onToggleDiscussed}
          />
        ))}
      </div>
    </div>
  );
}

interface PyramidRowProps {
  topics: PyramidTopic[];
  yPosition: number;
  selectedTopicId: string | null;
  topicStates: Record<string, TopicState>;
  onSelectTopic: (topic: PyramidTopic) => void;
  onToggleDiscussed: (topicId: string) => void;
}

function PyramidRow({
  topics,
  yPosition,
  selectedTopicId,
  topicStates,
  onSelectTopic,
  onToggleDiscussed,
}: PyramidRowProps) {
  return (
    <div
      className={cn(
        'absolute left-0 right-0 flex justify-center',
        'gap-[var(--tile-gap)]'
      )}
      style={{
        top: `${yPosition}%`,
        transform: 'translateY(-50%)',
      }}
    >
      {topics.map((topic) => (
        <PyramidTile
          key={topic.id}
          id={topic.id}
          title={topic.title}
          imageUrl={topic.imageUrl}
          isImportant={topic.isImportant}
          isDiscussed={topicStates[topic.id]?.discussed ?? false}
          isSelected={selectedTopicId === topic.id}
          onSelect={() => onSelectTopic(topic)}
          onToggleDiscussed={(e) => {
            e.stopPropagation();
            onToggleDiscussed(topic.id);
          }}
        />
      ))}
    </div>
  );
}
