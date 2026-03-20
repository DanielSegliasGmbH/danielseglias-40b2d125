import React, { createContext, useContext, useState, useCallback, useRef, useEffect, ReactNode } from 'react';
import { pyramidTopics, PyramidTopic } from '@/config/pyramidTopicsConfig';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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
  title: string | null;
  customer_id: string | null;
  consultation_data: InvestmentConsultationData;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

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
  metadata: { startedAt: null, lastModifiedAt: null, version: 1 },
  customerInfo: {},
  additionalData: {},
});

interface InvestmentConsultationContextValue {
  consultationData: InvestmentConsultationData;
  updateData: (updater: (prev: InvestmentConsultationData) => InvestmentConsultationData) => void;
  currentConsultationId: string | null;
  currentTitle: string | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  autoSaveStatus: AutoSaveStatus;
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
  createAndStartConsultation: (title: string, customerId?: string) => Promise<string | null>;
  loadConsultation: (id: string) => Promise<void>;
  completeConsultation: () => Promise<void>;
  fetchSavedConsultations: () => Promise<SavedInvestmentConsultation[]>;
  // Legacy compat
  startNewConsultation: () => void;
  saveConsultation: (label?: string, customerId?: string) => Promise<string | null>;
}

const InvestmentConsultationContext = createContext<InvestmentConsultationContextValue | null>(null);

export function InvestmentConsultationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [consultationData, setConsultationData] = useState<InvestmentConsultationData>(generateDefaultConsultationData);
  const [currentConsultationId, setCurrentConsultationId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef(consultationData);
  dataRef.current = consultationData;

  // Auto-save effect
  useEffect(() => {
    if (!currentConsultationId || !hasUnsavedChanges || !user) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving');
      try {
        const { error } = await (supabase
          .from('investment_consultations') as any)
          .update({
            consultation_data: dataRef.current,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentConsultationId);

        if (error) throw error;
        setHasUnsavedChanges(false);
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 2000);
      } catch (err) {
        console.error('Auto-save failed:', err);
        setAutoSaveStatus('error');
      }
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [consultationData, currentConsultationId, hasUnsavedChanges, user]);

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
      topicStates: { ...prev.topicStates, [topicId]: { ...prev.topicStates[topicId], discussed: !prev.topicStates[topicId]?.discussed } },
    }));
  }, [updateData]);

  const togglePrioritized = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: { ...prev.topicStates, [topicId]: { ...prev.topicStates[topicId], prioritized: !prev.topicStates[topicId]?.prioritized } },
    }));
  }, [updateData]);

  const toggleImportant = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: { ...prev.topicStates, [topicId]: { ...prev.topicStates[topicId], important: !prev.topicStates[topicId]?.important } },
    }));
  }, [updateData]);

  const toggleWaiver = useCallback((topicId: string) => {
    updateData((prev) => ({
      ...prev,
      topicStates: { ...prev.topicStates, [topicId]: { ...prev.topicStates[topicId], waiver: !prev.topicStates[topicId]?.waiver } },
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
          relatedTopicNotes: { ...prev.topicStates[topicId]?.relatedTopicNotes, [relatedTopicId]: notes },
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
            relatedTopicChecklist: { ...prev.topicStates[topicId]?.relatedTopicChecklist, [relatedTopicId]: newChecked },
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
    setCurrentTitle(null);
    setHasUnsavedChanges(false);
    setAutoSaveStatus('idle');
  }, []);

  const startNewConsultation = useCallback(() => {
    const newData = generateDefaultConsultationData();
    newData.metadata.startedAt = new Date().toISOString();
    setConsultationData(newData);
    setCurrentConsultationId(null);
    setCurrentTitle(null);
    setHasUnsavedChanges(false);
  }, []);

  const createAndStartConsultation = useCallback(async (title: string, customerId?: string): Promise<string | null> => {
    if (!user) {
      toast.error('Du musst angemeldet sein');
      return null;
    }

    setIsLoading(true);
    try {
      const now = new Date();
      const datePrefix = now.toISOString().slice(0, 16).replace('T', '-').replace(':', '-');
      const versionKey = `${datePrefix}-1`;

      const newData = generateDefaultConsultationData();
      newData.metadata.startedAt = now.toISOString();
      if (customerId) {
        newData.customerInfo = { customerId };
      }

      const { data, error } = await (supabase
        .from('investment_consultations') as any)
        .insert({
          version_key: versionKey,
          title,
          label: title,
          customer_id: customerId || null,
          consultation_data: newData,
          created_by: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      setConsultationData(newData);
      setCurrentConsultationId(data.id);
      setCurrentTitle(title);
      setHasUnsavedChanges(false);
      return data.id;
    } catch (err) {
      console.error('Error creating consultation:', err);
      toast.error('Beratung konnte nicht erstellt werden');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
      setCurrentTitle(data.title || data.label || null);
      setHasUnsavedChanges(false);
      toast.success('Beratung geladen');
    } catch (error) {
      console.error('Error loading investment consultation:', error);
      toast.error('Fehler beim Laden der Beratung');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeConsultation = useCallback(async () => {
    if (!currentConsultationId) return;
    try {
      const { error } = await (supabase
        .from('investment_consultations') as any)
        .update({
          status: 'completed',
          consultation_data: dataRef.current,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentConsultationId);

      if (error) throw error;
      setHasUnsavedChanges(false);
      toast.success('Beratung abgeschlossen');
    } catch (err) {
      console.error('Error completing consultation:', err);
      toast.error('Fehler beim Abschliessen');
    }
  }, [currentConsultationId]);

  const saveConsultation = useCallback(async (label?: string, customerId?: string): Promise<string | null> => {
    if (!user) {
      toast.error('Du musst angemeldet sein');
      return null;
    }

    if (currentConsultationId) {
      try {
        const { error } = await (supabase
          .from('investment_consultations') as any)
          .update({
            consultation_data: consultationData,
            label: label || currentTitle || null,
            customer_id: customerId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentConsultationId);

        if (error) throw error;
        setHasUnsavedChanges(false);
        toast.success('Beratung gespeichert');
        return currentConsultationId;
      } catch (err) {
        console.error('Error saving consultation:', err);
        toast.error('Fehler beim Speichern');
        return null;
      }
    }

    return createAndStartConsultation(label || 'Unbenannte Beratung', customerId);
  }, [user, currentConsultationId, consultationData, currentTitle, createAndStartConsultation]);

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
      toast.error('Fehler beim Laden der Beratungen');
      return [];
    }
  }, []);

  const selectedTopic = consultationData.selectedTopicId
    ? pyramidTopics.find((t) => t.id === consultationData.selectedTopicId) ?? null
    : null;

  const value: InvestmentConsultationContextValue = {
    consultationData,
    updateData,
    currentConsultationId,
    currentTitle,
    isLoading,
    hasUnsavedChanges,
    autoSaveStatus,
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
    createAndStartConsultation,
    loadConsultation,
    completeConsultation,
    fetchSavedConsultations,
    startNewConsultation,
    saveConsultation,
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
    throw new Error('useInvestmentConsultationState must be used within an InvestmentConsultationProvider');
  }
  return context;
}
