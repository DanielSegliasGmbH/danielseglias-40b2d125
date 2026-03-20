/**
 * Hook for admin side to broadcast section changes to the presentation tab.
 * Used in consultation pages to sync the current section.
 */
import { useRef, useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CHANNEL_NAME = 'consultation-presentation';

interface SyncMessage {
  type: 'SECTION_CHANGE' | 'PING' | 'PONG';
  section?: string;
  consultationId?: string;
}

export function useConsultationPresentationSync(consultationId: string | null) {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const location = useLocation();

  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;

    ch.onmessage = (e: MessageEvent<SyncMessage>) => {
      if (e.data.type === 'PING') {
        ch.postMessage({ type: 'PONG' });
        // Re-send current section on ping
        if (consultationId) {
          const section = sectionFromPath(location.pathname);
          if (section) {
            ch.postMessage({ type: 'SECTION_CHANGE', section, consultationId });
          }
        }
      }
    };

    return () => ch.close();
  }, [consultationId, location.pathname]);

  // Broadcast section change when route changes
  useEffect(() => {
    if (!consultationId) return;
    const section = sectionFromPath(location.pathname);
    if (section) {
      channelRef.current?.postMessage({
        type: 'SECTION_CHANGE',
        section,
        consultationId,
      } satisfies SyncMessage);
    }
  }, [location.pathname, consultationId]);

  const openPresentationTab = useCallback((type: 'insurance' | 'investment', id: string) => {
    const url = `${window.location.origin}/presentation/${type}/${id}`;
    window.open(url, `presentation-${id}`, 'noopener');
  }, []);

  return { openPresentationTab };
}

function sectionFromPath(path: string): string | null {
  // Match /app/insurance-consulting/{section} or /app/investment-consulting/{section}
  const match = path.match(/\/app\/(?:insurance|investment)-consulting\/(.+)/);
  return match?.[1] || null;
}
