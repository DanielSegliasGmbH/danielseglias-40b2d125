import { useState, useCallback } from 'react';
import { pyramidTopics, PyramidTopic } from '@/config/pyramidTopicsConfig';

export interface TopicState {
  discussed: boolean;
  prioritized: boolean;
  waiver: boolean;
  important: boolean; // Dynamic important state (toggleable via button)
  relatedTopicsDiscussed: Record<string, boolean>;
}

export function usePyramidState() {
  // Initialize state for all topics
  const [topicStates, setTopicStates] = useState<Record<string, TopicState>>(() => {
    const initial: Record<string, TopicState> = {};
    pyramidTopics.forEach((topic) => {
      initial[topic.id] = {
        discussed: false,
        prioritized: false,
        waiver: false,
        important: topic.isImportant, // Initialize with config value
        relatedTopicsDiscussed: topic.relatedTopics.reduce((acc, rt) => {
          acc[rt.id] = rt.discussed;
          return acc;
        }, {} as Record<string, boolean>),
      };
    });
    return initial;
  });

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  const selectTopic = useCallback((topic: PyramidTopic) => {
    setSelectedTopicId(topic.id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedTopicId(null);
  }, []);

  const toggleDiscussed = useCallback((topicId: string) => {
    setTopicStates((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        discussed: !prev[topicId]?.discussed,
      },
    }));
  }, []);

  const togglePrioritized = useCallback((topicId: string) => {
    setTopicStates((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        prioritized: !prev[topicId]?.prioritized,
      },
    }));
  }, []);

  const toggleImportant = useCallback((topicId: string) => {
    setTopicStates((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        important: !prev[topicId]?.important,
      },
    }));
  }, []);

  const toggleWaiver = useCallback((topicId: string) => {
    setTopicStates((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        waiver: !prev[topicId]?.waiver,
      },
    }));
  }, []);

  const toggleRelatedTopicDiscussed = useCallback((topicId: string, relatedTopicId: string) => {
    setTopicStates((prev) => ({
      ...prev,
      [topicId]: {
        ...prev[topicId],
        relatedTopicsDiscussed: {
          ...prev[topicId]?.relatedTopicsDiscussed,
          [relatedTopicId]: !prev[topicId]?.relatedTopicsDiscussed?.[relatedTopicId],
        },
      },
    }));
  }, []);

  const getSelectedTopic = useCallback((): PyramidTopic | null => {
    if (!selectedTopicId) return null;
    return pyramidTopics.find((t) => t.id === selectedTopicId) ?? null;
  }, [selectedTopicId]);

  return {
    topicStates,
    selectedTopicId,
    selectedTopic: getSelectedTopic(),
    selectTopic,
    clearSelection,
    toggleDiscussed,
    togglePrioritized,
    toggleImportant,
    toggleWaiver,
    toggleRelatedTopicDiscussed,
  };
}
