import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { CaseStudyEditor } from './CaseStudyEditor';
import { CaseStudyPreview } from './CaseStudyPreview';
import { CaseStudyOverview } from './CaseStudyOverview';
import { EMPTY_CASE_STUDY, MOCK_CASE_STUDIES, generateId, type CaseStudyData } from './types';
import { FileEdit, LayoutList, Save } from 'lucide-react';
import { toast } from 'sonner';

export function CaseStudyGeneratorTool() {
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [caseStudies, setCaseStudies] = useState<CaseStudyData[]>([...MOCK_CASE_STUDIES]);
  const [currentStudy, setCurrentStudy] = useState<CaseStudyData>({ ...EMPTY_CASE_STUDY, id: generateId() });

  const handleSave = useCallback(() => {
    setCaseStudies(prev => {
      const idx = prev.findIndex(cs => cs.id === currentStudy.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = currentStudy;
        return next;
      }
      return [...prev, currentStudy];
    });
    toast.success('Case Study gespeichert');
  }, [currentStudy]);

  const handleEditFromOverview = (cs: CaseStudyData) => {
    setCurrentStudy(cs);
    setActiveTab('editor');
  };

  const handleNew = () => {
    setCurrentStudy({ ...EMPTY_CASE_STUDY, id: generateId() });
    setActiveTab('editor');
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="editor" className="gap-1.5">
              <FileEdit className="h-3.5 w-3.5" /> Editor
            </TabsTrigger>
            <TabsTrigger value="overview" className="gap-1.5">
              <LayoutList className="h-3.5 w-3.5" /> Übersicht
            </TabsTrigger>
          </TabsList>

          {activeTab === 'editor' && (
            <Button onClick={handleSave} size="sm" className="gap-1.5">
              <Save className="h-3.5 w-3.5" /> Speichern
            </Button>
          )}
        </div>

        <TabsContent value="editor" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileEdit className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Eingabe</h3>
              </div>
              <CaseStudyEditor data={currentStudy} onChange={setCurrentStudy} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-4 w-4 text-muted-foreground">👁️</span>
                <h3 className="text-sm font-medium text-muted-foreground">Live-Vorschau</h3>
              </div>
              <CaseStudyPreview data={currentStudy} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <CaseStudyOverview caseStudies={caseStudies} onEdit={handleEditFromOverview} onNew={handleNew} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
