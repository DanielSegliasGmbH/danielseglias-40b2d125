/**
 * Lightweight hook for section pages to broadcast content to presentation.
 * Uses BroadcastChannel to send section-specific data (title, subtitle, items).
 * Only sends data if a presentation is currently active.
 */
import { useEffect } from 'react';
import { EMPTY_PRESENTATION_STATE, type PresentationState, type PresentationSection } from '@/hooks/usePresentationSync';

const CHANNEL_NAME = 'investment-presentation';
const PRESENTING_KEY = 'investment-presenting';

interface SectionBroadcastOptions {
  section: PresentationSection;
  title: string;
  subtitle?: string;
  items?: string[];
  /** Extra state fields (e.g. selectedTileIds for needs/answers) */
  extra?: Partial<PresentationState>;
}

/**
 * Call this in any investment consulting section page to broadcast
 * section-specific content to the client presentation view.
 */
export function useSectionBroadcast({
  section,
  title,
  subtitle = '',
  items = [],
  extra = {},
}: SectionBroadcastOptions) {
  useEffect(() => {
    if (localStorage.getItem(PRESENTING_KEY) !== 'true') return;

    const ch = new BroadcastChannel(CHANNEL_NAME);
    const state: PresentationState = {
      ...EMPTY_PRESENTATION_STATE,
      ...extra,
      isActive: true,
      currentSection: section,
      sectionTitle: title,
      sectionSubtitle: subtitle,
      sectionItems: items,
    };
    ch.postMessage({ type: 'STATE_UPDATE', payload: state });

    return () => ch.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, title, subtitle, JSON.stringify(items), JSON.stringify(extra)]);
}
