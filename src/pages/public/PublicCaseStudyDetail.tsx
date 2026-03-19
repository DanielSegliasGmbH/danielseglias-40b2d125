import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useCaseStudies } from '@/hooks/useCaseStudies';
import { CaseStudyPreview } from '@/components/tools/case-study-generator/CaseStudyPreview';

export default function PublicCaseStudyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { getBySlug } = useCaseStudies();
  const caseStudy = slug ? getBySlug(slug) : undefined;

  if (!caseStudy) {
    return (
      <PublicLayout title="Case Study nicht gefunden">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Case Study nicht gefunden</h1>
          <p className="text-muted-foreground mb-6">Diese Case Study existiert nicht oder wurde noch nicht veröffentlicht.</p>
          <Link to="/case-studies">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
            </Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout title={caseStudy.publicTitle || caseStudy.internalTitle}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/case-studies">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4" /> Alle Case Studies
            </Button>
          </Link>
        </div>

        <div className="max-w-3xl mx-auto">
          <CaseStudyPreview data={caseStudy} />
        </div>
      </div>
    </PublicLayout>
  );
}
