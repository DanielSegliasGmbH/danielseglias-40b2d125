import { useState, useCallback } from 'react';
import { pyramidConfig, PyramidItem, PyramidLevel } from '@/config/insurancePyramidConfig';

export interface PyramidState {
  levels: PyramidLevel[];
  selectedItemId: string | null;
}

export function useInsurancePyramid() {
  // Deep clone the config to allow mutations
  const [levels, setLevels] = useState<PyramidLevel[]>(() => 
    JSON.parse(JSON.stringify(pyramidConfig))
  );
  
  // Select first item by default
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    pyramidConfig[0]?.items[0]?.id || null
  );

  const getSelectedItem = useCallback((): PyramidItem | null => {
    for (const level of levels) {
      const item = level.items.find(i => i.id === selectedItemId);
      if (item) return item;
    }
    return null;
  }, [levels, selectedItemId]);

  const selectItem = useCallback((item: PyramidItem) => {
    setSelectedItemId(item.id);
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<PyramidItem>) => {
    setLevels(prev => prev.map(level => ({
      ...level,
      items: level.items.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })));
  }, []);

  const togglePrioritized = useCallback((itemId: string) => {
    setLevels(prev => prev.map(level => ({
      ...level,
      items: level.items.map(item => 
        item.id === itemId 
          ? { ...item, status: { ...item.status, prioritized: !item.status.prioritized } }
          : item
      ),
    })));
  }, []);

  const toggleDiscussed = useCallback((itemId: string) => {
    setLevels(prev => prev.map(level => ({
      ...level,
      items: level.items.map(item => 
        item.id === itemId 
          ? { ...item, status: { ...item.status, discussed: !item.status.discussed } }
          : item
      ),
    })));
  }, []);

  const toggleWaiver = useCallback((itemId: string) => {
    setLevels(prev => prev.map(level => ({
      ...level,
      items: level.items.map(item => 
        item.id === itemId 
          ? { ...item, status: { ...item.status, waiver: !item.status.waiver } }
          : item
      ),
    })));
  }, []);

  const toggleTopicDiscussed = useCallback((itemId: string, topicId: string) => {
    setLevels(prev => prev.map(level => ({
      ...level,
      items: level.items.map(item => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          relatedTopics: item.relatedTopics.map(topic =>
            topic.id === topicId 
              ? { ...topic, discussed: !topic.discussed }
              : topic
          ),
        };
      }),
    })));
  }, []);

  return {
    levels,
    selectedItemId,
    selectedItem: getSelectedItem(),
    selectItem,
    updateItem,
    togglePrioritized,
    toggleDiscussed,
    toggleWaiver,
    toggleTopicDiscussed,
  };
}
