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

  /*
   * Pyramid Geometry Calculation:
   * - Padding top/bottom = 0.5 × tile height
   * - Pyramid spans from row 1 (26%) to row 4 (74%) + half tile height on each end
   * - Width based on bottom row: 4 tiles + 3 gaps
   */

  return (
    <div 
      className="relative w-full max-w-[1100px] mx-auto"
      style={{
        // CSS variables for tile sizes
        '--tile-w': 'clamp(140px, 18vw, 200px)',
        '--tile-h': 'clamp(90px, 12vw, 120px)',
        '--tile-gap': 'clamp(8px, 1.5vw, 16px)',
        // Derived: bottom row width (4 tiles + 3 gaps) + small padding
        '--pyramid-base-width': 'calc(4 * var(--tile-w) + 3 * var(--tile-gap) + var(--tile-gap))',
        // Derived: vertical padding = 0.5 × tile height
        '--pyramid-v-padding': 'calc(var(--tile-h) * 0.5)',
      } as React.CSSProperties}
    >
      {/* Container with aspect ratio */}
      <div 
        className="relative w-full"
        style={{ aspectRatio: '1 / 0.866' }}
      >
        {/* 
          Pyramid Background - dynamically positioned based on tile geometry
          - Top: row 1 position (26%) minus half tile height minus padding
          - Bottom: row 4 position (74%) plus half tile height plus padding
          - Width: based on bottom row (4 tiles + 3 gaps + small margin)
        */}
        <div 
          className="absolute bg-scale-2 left-1/2 -translate-x-1/2"
          style={{
            // Top position: first row (26%) - half tile - padding
            top: 'calc(26% - var(--tile-h) * 0.5 - var(--pyramid-v-padding))',
            // Bottom position: 100% - (last row position + half tile + padding)
            bottom: 'calc(100% - 74% - var(--tile-h) * 0.5 - var(--pyramid-v-padding))',
            // Width based on bottom row geometry
            width: 'var(--pyramid-base-width)',
            // Max width to prevent overflow
            maxWidth: '95%',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
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
