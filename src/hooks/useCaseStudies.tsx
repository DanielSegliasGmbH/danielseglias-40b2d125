import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MOCK_CASE_STUDIES, EMPTY_CASE_STUDY, generateId, type CaseStudyData } from '@/components/tools/case-study-generator/types';
import { toast } from 'sonner';

interface CaseStudyContextValue {
  caseStudies: CaseStudyData[];
  save: (cs: CaseStudyData) => void;
  remove: (id: string) => void;
  getPublished: () => CaseStudyData[];
  getBySlug: (slug: string) => CaseStudyData | undefined;
}

const CaseStudyContext = createContext<CaseStudyContextValue | null>(null);

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae')
    .replace(/[öÖ]/g, 'oe')
    .replace(/[üÜ]/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CaseStudyProvider({ children }: { children: ReactNode }) {
  const [caseStudies, setCaseStudies] = useState<CaseStudyData[]>([...MOCK_CASE_STUDIES]);

  const save = useCallback((cs: CaseStudyData) => {
    setCaseStudies(prev => {
      const idx = prev.findIndex(c => c.id === cs.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = cs;
        return next;
      }
      return [...prev, cs];
    });
    toast.success('Case Study gespeichert');
  }, []);

  const remove = useCallback((id: string) => {
    setCaseStudies(prev => prev.filter(c => c.id !== id));
    toast.success('Case Study gelöscht');
  }, []);

  const getPublished = useCallback(() => {
    return caseStudies.filter(cs => cs.status === 'veroeffentlicht');
  }, [caseStudies]);

  const getBySlug = useCallback((slug: string) => {
    return caseStudies.find(cs => {
      const csSlug = generateSlug(cs.publicTitle || cs.internalTitle);
      return csSlug === slug && cs.status === 'veroeffentlicht';
    });
  }, [caseStudies]);

  return (
    <CaseStudyContext.Provider value={{ caseStudies, save, remove, getPublished, getBySlug }}>
      {children}
    </CaseStudyContext.Provider>
  );
}

export function useCaseStudies() {
  const ctx = useContext(CaseStudyContext);
  if (!ctx) throw new Error('useCaseStudies must be used within CaseStudyProvider');
  return ctx;
}
