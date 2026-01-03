import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { pyramidTopics, PyramidTopic } from '@/config/pyramidTopicsConfig';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

// Topic state interface
export interface TopicState {
  discussed: boolean;
  prioritized: boolean;
  waiver: boolean;
  important: boolean;
  relatedTopicsDiscussed: Record<string, boolean>;
  // Notes for related topics (b-ebene3)
  relatedTopicNotes: Record<string, string>;
  // Extensible: add numeric values, selections, etc.
  numericValues?: Record<string, number>;
  selections?: Record<string, string>;
}

// Complete consultation state interface
export interface ConsultationData {
  topicStates: Record<string, TopicState>;
  selectedTopicId: string | null;
  metadata: {
    startedAt: string | null;
    lastModifiedAt: string | null;
    version: number;
  };
  // Extensible fields for future use
  customerInfo?: {
    customerId?: string;
    customerName?: string;
  };
  additionalData?: Record<string, unknown>;
}

// Saved consultation from database
export interface SavedConsultation {
  id: string;
  version_key: string;
  label: string | null;
  customer_id: string | null;
  consultation_data: ConsultationData;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Generate default topic states - ALL values set to false for reset
const generateDefaultTopicStates = (): Record<string, TopicState> => {
  const states: Record<string, TopicState> = {};
  pyramidTopics.forEach((topic) => {
    states[topic.id] = {
      discussed: false,
      prioritized: false,
      waiver: false,
      important: false, // Always false on reset/new consultation
      relatedTopicsDiscussed: topic.relatedTopics.reduce((acc, rt) => {
        acc[rt.id] = false; // Always false on reset/new consultation
        return acc;
      }, {} as Record<string, boolean>),
      relatedTopicNotes: {}, // Empty notes on reset
      numericValues: {},
      selections: {},
    };
  });
  return states;
};

// Generate default consultation data
const generateDefaultConsultationData = (): ConsultationData => ({
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

// Context interface
interface ConsultationContextValue {
  // State
  consultationData: ConsultationData;
  currentConsultationId: string | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  
  // Topic state accessors
  topicStates: Record<string, TopicState>;
  selectedTopicId: string | null;
  selectedTopic: PyramidTopic | null;
  
  // Topic actions
  selectTopic: (topic: PyramidTopic) => void;
  clearSelection: () => void;
  toggleDiscussed: (topicId: string) => void;
  togglePrioritized: (topicId: string) => void;
  toggleImportant: (topicId: string) => void;
  toggleWaiver: (topicId: string) => void;
  toggleRelatedTopicDiscussed: (topicId: string, relatedTopicId: string) => void;
  setRelatedTopicNotes: (topicId: string, relatedTopicId: string, notes: string) => void;
  
  // Consultation management
  resetConsultation: () => void;
  startNewConsultation: () => void;
  loadConsultation: (id: string) => Promise<void>;
  saveConsultation: (label?: string, customerId?: string) => Promise<string | null>;
  fetchSavedConsultations: () => Promise<SavedConsultation[]>;
}

const ConsultationContext = createContext<ConsultationContextValue | null>(null);

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [consultationData, setConsultationData] = useState<ConsultationData>(generateDefaultConsultationData);
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper to update consultation data and mark as changed
  const updateData = useCallback((updater: (prev: ConsultationData) => ConsultationData) => {
    setConsultationData((prev) => {
      const updated = updater(prev);
      updated.metadata.lastModifiedAt = new Date().toISOString();
      return updated;
    });
    setHasUnsavedChanges(true);
  }, []);

  // Select topic
  const selectTopic = useCallback((topic: PyramidTopic) => {
    updateData((prev) => ({
      ...prev,
      selectedTopicId: topic.id,
    }));
  }, [updateData]);

  // Clear selection
  const clearSelection = useCallback(() => {
    updateData((prev) => ({
      ...prev,
      selectedTopicId: null,
    }));
  }, [updateData]);

  // Toggle discussed
  const toggleDiscussed = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: {
          ...prev.topicStates[topicId],
          discussed: !prev.topicStates[topicId]?.discussed,
        },
      },
    }));
  }, [updateData]);

  // Toggle prioritized
  const togglePrioritized = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: {
          ...prev.topicStates[topicId],
          prioritized: !prev.topicStates[topicId]?.prioritized,
        },
      },
    }));
  }, [updateData]);

  // Toggle important
  const toggleImportant = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: {
          ...prev.topicStates[topicId],
          important: !prev.topicStates[topicId]?.important,
        },
      },
    }));
  }, [updateData]);

  // Toggle waiver
  const toggleWaiver = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: {
        ...prev.topicStates,
        [topicId]: {
          ...prev.topicStates[topicId],
          waiver: !prev.topicStates[topicId]?.waiver,
        },
      },
    }));
  }, [updateData]);

  // Toggle related topic discussed
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

  // Set related topic notes
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
  const resetConsultation = useCallback(() => {
    setConsultationData(generateDefaultConsultationData());
    setCurrentConsultationId(null);
    setHasUnsavedChanges(false);
  }, []);

  // Start new consultation
  const startNewConsultation = useCallback(() => {
    const newData = generateDefaultConsultationData();
    newData.metadata.startedAt = new Date().toISOString();
    setConsultationData(newData);
    setCurrentConsultationId(null);
    setHasUnsavedChanges(false);
  }, []);

  // Load consultation from database
  const loadConsultation = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase
        .from('insurance_consultations') as any)
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error('Beratung nicht gefunden');
        return;
      }

      // Parse consultation data from JSONB
      const loadedData = data.consultation_data as unknown as ConsultationData;
      setConsultationData(loadedData);
      setCurrentConsultationId(data.id);
      setHasUnsavedChanges(false);
      toast.success('Beratung geladen');
    } catch (error) {
      console.error('Error loading consultation:', error);
      toast.error('Fehler beim Laden der Beratung');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generate version key: YYYY-MM-DD-HH-mm-X
  const generateVersionKey = useCallback(async (): Promise<string> => {
    const now = new Date();
    const datePrefix = now.toISOString().slice(0, 16).replace('T', '-').replace(':', '-');
    
    // Check for existing versions on this day
    const { data: existingVersions } = await (supabase
      .from('insurance_consultations') as any)
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

  // Save consultation to database
  const saveConsultation = useCallback(async (label?: string, customerId?: string): Promise<string | null> => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein, um zu speichern');
      return null;
    }

    setIsLoading(true);
    try {
      const versionKey = await generateVersionKey();
      
      // Update metadata before saving
      const dataToSave: ConsultationData = {
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

      // Note: Using type assertion as the table types may not be updated yet
      const { data, error } = await (supabase
        .from('insurance_consultations') as any)
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
      console.error('Error saving consultation:', error);
      toast.error('Fehler beim Speichern der Beratung');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, consultationData, generateVersionKey]);

  // Fetch saved consultations
  const fetchSavedConsultations = useCallback(async (): Promise<SavedConsultation[]> => {
    try {
      const { data, error } = await (supabase
        .from('insurance_consultations') as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map((item) => ({
        ...item,
        consultation_data: item.consultation_data as unknown as ConsultationData,
      })) as SavedConsultation[];
    } catch (error) {
      console.error('Error fetching consultations:', error);
      toast.error('Fehler beim Laden der gespeicherten Beratungen');
      return [];
    }
  }, []);

  // Get selected topic
  const selectedTopic = consultationData.selectedTopicId
    ? pyramidTopics.find((t) => t.id === consultationData.selectedTopicId) ?? null
    : null;

  const value: ConsultationContextValue = {
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
    resetConsultation,
    startNewConsultation,
    loadConsultation,
    saveConsultation,
    fetchSavedConsultations,
  };

  return (
    <ConsultationContext.Provider value={value}>
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultationState() {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error('useConsultationState must be used within a ConsultationProvider');
  }
  return context;
}
