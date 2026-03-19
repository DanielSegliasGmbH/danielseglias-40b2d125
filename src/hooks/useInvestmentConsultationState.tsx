import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { pyramidTopics, PyramidTopic } from '@/config/pyramidTopicsConfig';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Reuse the same interfaces from insurance consultation
export interface InvestmentTopicState {
  discussed: boolean;
  prioritized: boolean;
  waiver: boolean;
  important: boolean;
  relatedTopicsDiscussed: Record<string, boolean>;
  relatedTopicNotes: Record<string, string>;
  relatedTopicChecklist: Record<string, string[]>;
  numericValues?: Record<string, number>;
  selections?: Record<string, string>;
}

export interface InvestmentConsultationData {
  topicStates: Record<string, InvestmentTopicState>;
  selectedTopicId: string | null;
  metadata: {
    startedAt: string | null;
    lastModifiedAt: string | null;
    version: number;
  };
  customerInfo?: {
    customerId?: string;
    customerName?: string;
  };
  additionalData?: Record<string, unknown>;
}

export interface SavedInvestmentConsultation {
  id: string;
  version_key: string;
  label: string | null;
  customer_id: string | null;
  consultation_data: InvestmentConsultationData;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

const generateDefaultTopicStates = (): Record<string, InvestmentTopicState> => {
  const states: Record<string, InvestmentTopicState> = {};
  pyramidTopics.forEach((topic) => {
    states[topic.id] = {
      discussed: false,
      prioritized: false,
      waiver: false,
      important: false,
      relatedTopicsDiscussed: topic.relatedTopics.reduce((acc, rt) => {
        acc[rt.id] = false;
        return acc;
      }, {} as Record<string, boolean>),
      relatedTopicNotes: {},
      relatedTopicChecklist: {},
      numericValues: {},
      selections: {},
    };
  });
  return states;
};

const generateDefaultConsultationData = (): InvestmentConsultationData => ({
  topicStates: generateDefaultTopicStates(),
  selectedTopicId: null,
  metadata: {
    startedAt: null,
    lastModifiedAt: null,
    version: 1,
  },
  customerInfo: {},
  additionalData: {},
});

interface InvestmentConsultationContextValue {
  consultationData: InvestmentConsultationData;
  updateData: (updater: (prev: InvestmentConsultationData) => InvestmentConsultationData) => void;
  currentConsultationId: string | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  topicStates: Record<string, InvestmentTopicState>;
  selectedTopicId: string | null;
  selectedTopic: PyramidTopic | null;
  selectTopic: (topic: PyramidTopic) => void;
  clearSelection: () => void;
  toggleDiscussed: (topicId: string) => void;
  togglePrioritized: (topicId: string) => void;
  toggleImportant: (topicId: string) => void;
  toggleWaiver: (topicId: string) => void;
  toggleRelatedTopicDiscussed: (topicId: string, relatedTopicId: string) => void;
  setRelatedTopicNotes: (topicId: string, relatedTopicId: string, notes: string) => void;
  toggleChecklistItem: (topicId: string, relatedTopicId: string, itemId: string) => void;
  getCheckedItems: (topicId: string, relatedTopicId: string) => string[];
  resetConsultation: () => void;
  startNewConsultation: () => void;
  loadConsultation: (id: string) => Promise<void>;
  saveConsultation: (label?: string, customerId?: string) => Promise<string | null>;
  fetchSavedConsultations: () => Promise<SavedInvestmentConsultation[]>;
}

const InvestmentConsultationContext = createContext<InvestmentConsultationContextValue | null>(null);

export function InvestmentConsultationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [consultationData, setConsultationData] = useState<InvestmentConsultationData>(generateDefaultConsultationData);
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateData = useCallback((updater: (prev: InvestmentConsultationData) => InvestmentConsultationData) => {
    setConsultationData((prev) => {
      const updated = updater(prev);
      updated.metadata.lastModifiedAt = new Date().toISOString();
      return updated;
    });
    setHasUnsavedChanges(true);
  }, []);

  const selectTopic = useCallback((topic: PyramidTopic) => {
    updateData((prev) => ({ ...prev, selectedTopicId: topic.id }));
  }, [updateData]);

  const clearSelection = useCallback(() => {
    updateData((prev) => ({ ...prev, selectedTopicId: null }));
  }, [updateData]);

  const toggleDiscussed = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: { ...prev.topicStates[topicId], discussed: !prev.topicStates[topicId]?.discussed },
      },
    }));
  }, [updateData]);

  const togglePrioritized = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: { ...prev.topicStates[topicId], prioritized: !prev.topicStates[topicId]?.prioritized },
      },
    }));
  }, [updateData]);

  const toggleImportant = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: { ...prev.topicStates[topicId], important: !prev.topicStates[topicId]?.important },
      },
    }));
  }, [updateData]);

  const toggleWaiver = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: { ...prev.topicStates[topicId], waiver: !prev.topicStates[topicId]?.waiver },
      },
    }));
  }, [updateData]);

  const toggleRelatedTopicDiscussed = useCallback((topicId: string, relatedTopicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: {
          ...prev.topicStates[topicId],
          relatedTopicsDiscussed: {
            ...prev.topicStates[topicId]?.relatedTopicsDiscussed,
            [relatedTopicId]: !prev.topicStates[topicId]?.relatedTopicsDiscussed?.[relatedTopicId],
          },
        },
      },
    }));
  }, [updateData]);

  const setRelatedTopicNotes = useCallback((topicId: string, relatedTopicId: string, notes: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: {
          ...prev.topicStates[topicId],
          relatedTopicNotes: {
            ...prev.topicStates[topicId]?.relatedTopicNotes,
            [relatedTopicId]: notes,
          },
        },
      },
    }));
  }, [updateData]);

  const toggleChecklistItem = useCallback((topicId: string, relatedTopicId: string, itemId: string) => {
    updateData((prev) => {
      const currentChecked = prev.topicStates[topicId]?.relatedTopicChecklist?.[relatedTopicId] || [];
      const isChecked = currentChecked.includes(itemId);
      const newChecked = isChecked ? currentChecked.filter(id => id !== itemId) : [...currentChecked, itemId];
      return {
        ...prev,
        topicStates: {
          ...prev.topicStates,
          [topicId]: {
            ...prev.topicStates[topicId],
            relatedTopicChecklist: {
              ...prev.topicStates[topicId]?.relatedTopicChecklist,
              [relatedTopicId]: newChecked,
            },
          },
        },
      };
    });
  }, [updateData]);

  const getCheckedItems = useCallback((topicId: string, relatedTopicId: string): string[] => {
    return consultationData.topicStates[topicId]?.relatedTopicChecklist?.[relatedTopicId] || [];
  }, [consultationData.topicStates]);

  const resetConsultation = useCallback(() => {
    setConsultationData(generateDefaultConsultationData());
    setCurrentConsultationId(null);
    setHasUnsavedChanges(false);
  }, []);

  const startNewConsultation = useCallback(() => {
    const newData = generateDefaultConsultationData();
    newData.metadata.startedAt = new Date().toISOString();
    setConsultationData(newData);
    setCurrentConsultationId(null);
    setHasUnsavedChanges(false);
  }, []);

  const loadConsultation = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from('investment_consultations') as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Beratung nicht gefunden');
        return;
      }

      const loadedData = data.consultation_data as unknown as InvestmentConsultationData;
      setConsultationData(loadedData);
      setCurrentConsultationId(data.id);
      setHasUnsavedChanges(false);
      toast.success('Beratung geladen');
    } catch (error) {
      console.error('Error loading investment consultation:', error);
      toast.error('Fehler beim Laden der Beratung');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateVersionKey = useCallback(async (): Promise<string> => {
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 16).replace('T', '-').replace(':', '-');
    
    const { data: existingVersions } = await (supabase
      .from('investment_consultations') as any)
      .select('version_key')
      .like('version_key', `${datePrefix.slice(0, 10)}%`)
      .order('version_key', { ascending: false });

    let sequence = 1;
    if (existingVersions && existingVersions.length > 0) {
      const lastVersion = existingVersions[0].version_key;
      const lastSequence = parseInt(lastVersion.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }

    return `${datePrefix}-${sequence}`;
  }, []);

  const saveConsultation = useCallback(async (label?: string, customerId?: string): Promise<string | null> => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein, um zu speichern');
      return null;
    }

    setIsLoading(true);
    try {
      const versionKey = await generateVersionKey();
      
      const dataToSave: InvestmentConsultationData = {
        ...consultationData,
        metadata: {
          ...consultationData.metadata,
          lastModifiedAt: new Date().toISOString(),
          version: (consultationData.metadata.version || 0) + 1,
        },
        customerInfo: {
          ...consultationData.customerInfo,
          customerId: customerId || consultationData.customerInfo?.customerId,
        },
      };

      const { data, error } = await (supabase
        .from('investment_consultations') as any)
        .insert({
          version_key: versionKey,
          label: label || null,
          customer_id: customerId || null,
          consultation_data: dataToSave,
          created_by: user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentConsultationId(data.id);
      setHasUnsavedChanges(false);
      toast.success(`Beratung gespeichert (${versionKey})`);
      return data.id;
    } catch (error) {
      console.error('Error saving investment consultation:', error);
      toast.error('Fehler beim Speichern der Beratung');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, consultationData, generateVersionKey]);

  const fetchSavedConsultations = useCallback(async (): Promise<SavedInvestmentConsultation[]> => {
    try {
      const { data, error } = await (supabase
        .from('investment_consultations') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        consultation_data: item.consultation_data as unknown as InvestmentConsultationData,
      })) as SavedInvestmentConsultation[];
    } catch (error) {
      console.error('Error fetching investment consultations:', error);
      toast.error('Fehler beim Laden der gespeicherten Beratungen');
      return [];
    }
  }, []);

  const selectedTopic = consultationData.selectedTopicId
    ? pyramidTopics.find((t) => t.id === consultationData.selectedTopicId) ?? null
    : null;

  const value: InvestmentConsultationContextValue = {
    consultationData,
    currentConsultationId,
    isLoading,
    hasUnsavedChanges,
    topicStates: consultationData.topicStates,
    selectedTopicId: consultationData.selectedTopicId,
    selectedTopic,
    selectTopic,
    clearSelection,
    toggleDiscussed,
    togglePrioritized,
    toggleImportant,
    toggleWaiver,
    toggleRelatedTopicDiscussed,
    setRelatedTopicNotes,
    toggleChecklistItem,
    getCheckedItems,
    resetConsultation,
    startNewConsultation,
    loadConsultation,
    saveConsultation,
    fetchSavedConsultations,
  };

  return (
    <InvestmentConsultationContext.Provider value={value}>
      {children}
    </InvestmentConsultationContext.Provider>
  );
}

export function useInvestmentConsultationState() {
  const context = useContext(InvestmentConsultationContext);
  if (!context) {
    throw new Error(
      'useInvestmentConsultationState must be used within an InvestmentConsultationProvider'
    );
  }
  return context;
}
