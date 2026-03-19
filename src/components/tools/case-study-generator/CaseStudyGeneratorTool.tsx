import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CaseStudyEditor } from './CaseStudyEditor';
import { CaseStudyPreview } from './CaseStudyPreview';
import { CaseStudyOverview } from './CaseStudyOverview';
import { EMPTY_CASE_STUDY, type CaseStudyData } from './types';
import { FileEdit, Eye, LayoutList } from 'lucide-react';

export function CaseStudyGeneratorTool() {
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [caseStudy, setCaseStudy] = useState<CaseStudyData>({ ...EMPTY_CASE_STUDY });

  const handleEditFromOverview = (cs: CaseStudyData) => {
    setCaseStudy(cs);
    setActiveTab('editor');
  };

  const handleNew = () => {
    setCaseStudy({ ...EMPTY_CASE_STUDY });
    setActiveTab('editor');
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="editor" className="gap-1.5">
            <FileEdit className="h-3.5 w-3.5" /> Editor
          </TabsTrigger>
          <TabsTrigger value="overview" className="gap-1.5">
            <LayoutList className="h-3.5 w-3.5" /> Übersicht
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Editor */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FileEdit className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Eingabe</h3>
              </div>
              <CaseStudyEditor data={caseStudy} onChange={setCaseStudy} />
            </div>

            {/* Right: Preview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Live-Vorschau</h3>
              </div>
              <CaseStudyPreview data={caseStudy} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <CaseStudyOverview onEdit={handleEditFromOverview} onNew={handleNew} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
