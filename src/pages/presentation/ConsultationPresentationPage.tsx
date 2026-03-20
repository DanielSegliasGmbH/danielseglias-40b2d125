/**
 * Unified presentation page for both insurance and investment consultations.
 * Opens in a new tab, loads conversation data by ID, and renders
 * the appropriate section in presentation mode.
 * 
 * Route: /presentation/:type/:id
 * - type: 'insurance' | 'investment'
 * - id: consultation UUID
 */
import { useParams } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PresentationLayout } from '@/layouts/PresentationLayout';
import { ViewModeProvider } from '@/hooks/useViewMode';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Section configs ── */
const INSURANCE_SECTIONS = [
  { key: 'focus', label: 'Gesprächsfokus' },
  { key: 'introduction', label: 'Vorstellung' },
  { key: 'company', label: 'Unternehmen' },
  { key: 'advisor-info', label: 'Beraterinformationen' },
  { key: 'customer-info', label: 'Kundeninfo' },
  { key: 'consultation', label: 'Beratung' },
  { key: 'summary', label: 'Zusammenfassung' },
];

const INVESTMENT_SECTIONS = [
  { key: 'focus', label: 'Gesprächsfokus' },
  { key: 'introduction', label: 'Vorstellung' },
  { key: 'company', label: 'Unternehmen' },
  { key: 'advisor-info', label: 'Beraterinformationen' },
  { key: 'customer-info', label: 'Kundeninfo' },
  { key: 'consultation', label: 'Beratung' },
  { key: 'needs', label: 'Bedürfnisse' },
  { key: 'answers', label: 'Vertiefung' },
  { key: 'summary', label: 'Zusammenfassung' },
  { key: 'offer', label: 'Angebot' },
];

/* ── BroadcastChannel for section sync ── */
const CHANNEL_NAME = 'consultation-presentation';

interface SyncMessage {
  type: 'SECTION_CHANGE' | 'PING' | 'PONG';
  section?: string;
  consultationId?: string;
}

/* ── Lazy section components ── */
import InsuranceConsultingFocus from '@/pages/insurance-consulting/InsuranceConsultingFocus';
import InsuranceConsultingIntroduction from '@/pages/insurance-consulting/InsuranceConsultingIntroduction';
import InsuranceConsultingCompany from '@/pages/insurance-consulting/InsuranceConsultingCompany';
import InsuranceConsultingAdvisorInfo from '@/pages/insurance-consulting/InsuranceConsultingAdvisorInfo';
import InsuranceConsultingCustomerInfo from '@/pages/insurance-consulting/InsuranceConsultingCustomerInfo';
import InvestmentConsultingFocus from '@/pages/investment-consulting/InvestmentConsultingFocus';
import InvestmentConsultingIntroduction from '@/pages/investment-consulting/InvestmentConsultingIntroduction';
import InvestmentConsultingCompany from '@/pages/investment-consulting/InvestmentConsultingCompany';
import InvestmentConsultingAdvisorInfo from '@/pages/investment-consulting/InvestmentConsultingAdvisorInfo';
import InvestmentConsultingCustomerInfo from '@/pages/investment-consulting/InvestmentConsultingCustomerInfo';

function getSectionComponent(type: string, section: string) {
  if (type === 'insurance') {
    switch (section) {
      case 'focus': return <InsuranceConsultingFocus />;
      case 'introduction': return <InsuranceConsultingIntroduction />;
      case 'company': return <InsuranceConsultingCompany />;
      case 'advisor-info': return <InsuranceConsultingAdvisorInfo />;
      case 'customer-info': return <InsuranceConsultingCustomerInfo />;
      default: return null;
    }
  }
  if (type === 'investment') {
    switch (section) {
      case 'focus': return <InvestmentConsultingFocus />;
      case 'introduction': return <InvestmentConsultingIntroduction />;
      case 'company': return <InvestmentConsultingCompany />;
      case 'advisor-info': return <InvestmentConsultingAdvisorInfo />;
      case 'customer-info': return <InvestmentConsultingCustomerInfo />;
      default: return null;
    }
  }
  return null;
}

export default function ConsultationPresentationPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [currentSection, setCurrentSection] = useState<string>('topics');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [consultationTitle, setConsultationTitle] = useState<string>('');
  const [transitioning, setTransitioning] = useState(false);
  const prevSectionRef = useRef(currentSection);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const sections = type === 'investment' ? INVESTMENT_SECTIONS : INSURANCE_SECTIONS;

  // Load consultation data to verify it exists
  useEffect(() => {
    if (!id || !type) return;
    const table = type === 'investment' ? 'investment_consultations' : 'insurance_consultations';

    (async () => {
      const { data, error } = await (supabase.from(table) as any)
        .select('id, title, label')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        setConsultationTitle(data.title || data.label || 'Beratung');
      }
      setLoading(false);
    })();
  }, [id, type]);

  // BroadcastChannel for section sync
  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;

    ch.onmessage = (e: MessageEvent<SyncMessage>) => {
      if (e.data.type === 'SECTION_CHANGE' && e.data.consultationId === id) {
        if (e.data.section) {
          setCurrentSection(e.data.section);
        }
      } else if (e.data.type === 'PONG') {
        setConnected(true);
      }
    };

    // Ping to check if admin is active
    ch.postMessage({ type: 'PING', consultationId: id });

    // Also listen on the legacy channel for backward compatibility
    const legacyCh = new BroadcastChannel('investment-presentation');
    legacyCh.onmessage = (e: MessageEvent<any>) => {
      if (e.data.type === 'STATE_UPDATE' && e.data.payload?.currentSection) {
        setCurrentSection(e.data.payload.currentSection);
        setConnected(true);
      } else if (e.data.type === 'PONG') {
        setConnected(true);
      }
    };
    legacyCh.postMessage({ type: 'PING' });

    return () => {
      ch.close();
      legacyCh.close();
    };
  }, [id]);

  // Smooth section transitions
  useEffect(() => {
    if (currentSection !== prevSectionRef.current) {
      setTransitioning(true);
      const timer = setTimeout(() => {
        setTransitioning(false);
        prevSectionRef.current = currentSection;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentSection]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentIdx = sections.findIndex((s) => s.key === currentSection);
  const progress = ((Math.max(currentIdx, 0) + 1) / sections.length) * 100;
  const currentLabel = sections.find((s) => s.key === currentSection)?.label || 'Beratung';

  const sectionComponent = getSectionComponent(type || '', currentSection);

  return (
    <ViewModeProvider mode="presentation">
      <PresentationLayout>
        {/* Top progress bar */}
        <div className="border-b bg-card/80 backdrop-blur px-8 py-4 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-xs shrink-0">
                {currentLabel}
              </Badge>
              {consultationTitle && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {consultationTitle}
                </span>
              )}
            </div>
            <div className="flex-1 max-w-xs">
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </div>

        {/* Section content with transition */}
        <div
          className={cn(
            'transition-all duration-300',
            transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0',
          )}
        >
          {sectionComponent || (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center space-y-4">
                <p className="text-xl text-muted-foreground">
                  Warte auf nächsten Abschnitt…
                </p>
                <p className="text-sm text-muted-foreground/60">
                  Der Berater steuert die Präsentation.
                </p>
              </div>
            </div>
          )}
        </div>
      </PresentationLayout>
    </ViewModeProvider>
  );
}
