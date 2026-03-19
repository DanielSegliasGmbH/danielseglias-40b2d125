/**
 * Cross-tab synchronisation for the investment consulting presentation mode.
 * Uses BroadcastChannel API to sync advisor → client view in real-time.
 * 
 * Extended for GLOBAL presentation across all consultation sections.
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { setPresentingFlag } from '@/components/investment-consulting/PresentationBar';

const CHANNEL_NAME = 'investment-presentation';

/** All sections that can be presented */
export type PresentationSection =
  | 'topics'
  | 'introduction'
  | 'company'
  | 'advisor-info'
  | 'customer-info'
  | 'consultation'
  | 'needs'
  | 'answers'
  | 'summary'
  | 'offer';

/** Section metadata for the client view */
export interface SectionMeta {
  key: PresentationSection;
  label: string;
  order: number;
}

export const SECTION_ORDER: SectionMeta[] = [
  { key: 'topics', label: 'Themenauswahl', order: 0 },
  { key: 'introduction', label: 'Vorstellung', order: 1 },
  { key: 'company', label: 'Unternehmen', order: 2 },
  { key: 'advisor-info', label: 'Berater', order: 3 },
  { key: 'customer-info', label: 'Kundeninfo', order: 4 },
  { key: 'consultation', label: 'Beratung', order: 5 },
  { key: 'needs', label: 'Bedürfnisse', order: 6 },
  { key: 'answers', label: 'Vertiefung', order: 7 },
  { key: 'summary', label: 'Zusammenfassung', order: 8 },
  { key: 'offer', label: 'Angebot', order: 9 },
];

export interface PresentationState {
  /** Whether presentation is active globally */
  isActive: boolean;
  /** Current section the advisor is viewing */
  currentSection: PresentationSection | null;
  /** Section-specific data title/subtitle for simple sections */
  sectionTitle: string;
  sectionSubtitle: string;
  /** Free-form section content items (bullet points, etc.) */
  sectionItems: string[];

  // ── Answers-specific fields (backward compatible) ──
  /** Currently active tile id (answers section) */
  activeTileId: string | null;
  /** Index in the selected tiles list */
  activeIdx: number;
  /** All selected tile ids (ordered) */
  selectedTileIds: string[];
  /** Status per tile */
  statuses: Record<string, 'resolved' | 'partial' | 'open'>;
  /** Currently opened tool slug (if any) */
  openTool: string | null;
  /** Steps the client has clicked / selected (per tile) */
  clientSelectedSteps: Record<string, string[]>;

  // ── Offer-specific fields ──
  /** Offer module titles visible to client */
  offerModules: { title: string; description: string }[];
  /** Displayed price */
  offerPrice: string;
  /** Total value string */
  offerTotalValue: string;
}

type MessageType =
  | { type: 'STATE_UPDATE'; payload: PresentationState }
  | { type: 'CLIENT_STEP_CLICK'; tileId: string; stepLabel: string }
  | { type: 'CLIENT_OFFER_ACTION'; action: string }
  | { type: 'PING' }
  | { type: 'PONG' };

export const EMPTY_PRESENTATION_STATE: PresentationState = {
  isActive: false,
  currentSection: null,
  sectionTitle: '',
  sectionSubtitle: '',
  sectionItems: [],
  activeTileId: null,
  activeIdx: 0,
  selectedTileIds: [],
  statuses: {},
  openTool: null,
  clientSelectedSteps: {},
  offerModules: [],
  offerPrice: '',
  offerTotalValue: '',
};

/** Derive section key from current route path */
export function sectionFromPath(path: string): PresentationSection | null {
  const match = path.match(/\/app\/investment-consulting\/(.+)/);
  if (!match) return null;
  const key = match[1];
  if (SECTION_ORDER.some((s) => s.key === key)) return key as PresentationSection;
  return null;
}

/**
 * Advisor side – broadcasts state changes to the client tab.
 * Now auto-detects section changes via route.
 */
export function usePresentationBroadcaster() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const clientWindowRef = useRef<Window | null>(null);
  const location = useLocation();
  const latestStateRef = useRef<PresentationState>(EMPTY_PRESENTATION_STATE);

  const onClientStepClickRef = useRef<((tileId: string, stepLabel: string) => void) | null>(null);
  const onClientOfferActionRef = useRef<((action: string) => void) | null>(null);

  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;

    ch.onmessage = (e: MessageEvent<MessageType>) => {
      if (e.data.type === 'PING') {
        ch.postMessage({ type: 'PONG' });
        // Also re-send current state on PING so late-opening client gets data
        if (latestStateRef.current.isActive) {
          ch.postMessage({ type: 'STATE_UPDATE', payload: latestStateRef.current });
        }
      } else if (e.data.type === 'CLIENT_STEP_CLICK') {
        onClientStepClickRef.current?.(e.data.tileId, e.data.stepLabel);
      } else if (e.data.type === 'CLIENT_OFFER_ACTION') {
        onClientOfferActionRef.current?.(e.data.action);
      }
    };

    return () => ch.close();
  }, []);

  const broadcast = useCallback((state: PresentationState) => {
    latestStateRef.current = state;
    channelRef.current?.postMessage({ type: 'STATE_UPDATE', payload: state } satisfies MessageType);
  }, []);

  // Auto-broadcast section change when route changes during active presentation
  useEffect(() => {
    if (!isPresenting) return;
    const section = sectionFromPath(location.pathname);
    if (section && section !== latestStateRef.current.currentSection) {
      const updated = { ...latestStateRef.current, currentSection: section };
      broadcast(updated);
    }
  }, [location.pathname, isPresenting, broadcast]);

  const startPresentation = useCallback((initialState?: Partial<PresentationState>) => {
    const section = sectionFromPath(window.location.pathname);
    const state: PresentationState = {
      ...EMPTY_PRESENTATION_STATE,
      ...initialState,
      isActive: true,
      currentSection: section,
    };
    const url = `${window.location.origin}/presentation/investment`;
    clientWindowRef.current = window.open(url, 'investment-presentation', 'noopener');
    setIsPresenting(true);
    setTimeout(() => broadcast(state), 500);
  }, [broadcast]);

  const stopPresentation = useCallback(() => {
    broadcast({ ...EMPTY_PRESENTATION_STATE, isActive: false });
    setIsPresenting(false);
    if (clientWindowRef.current && !clientWindowRef.current.closed) {
      clientWindowRef.current.close();
    }
    clientWindowRef.current = null;
  }, [broadcast]);

  return {
    isPresenting,
    broadcast,
    startPresentation,
    stopPresentation,
    onClientStepClickRef,
    onClientOfferActionRef,
  };
}

/**
 * Client side – listens for state updates from the advisor tab.
 */
export function usePresentationReceiver() {
  const [state, setState] = useState<PresentationState>(EMPTY_PRESENTATION_STATE);
  const [connected, setConnected] = useState(false);

  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;

    ch.onmessage = (e: MessageEvent<MessageType>) => {
      if (e.data.type === 'STATE_UPDATE') {
        setState(e.data.payload);
        setConnected(true);
      } else if (e.data.type === 'PONG') {
        setConnected(true);
      }
    };

    // Ping to check connection
    ch.postMessage({ type: 'PING' });

    return () => ch.close();
  }, []);

  const sendStepClick = useCallback((tileId: string, stepLabel: string) => {
    channelRef.current?.postMessage({ type: 'CLIENT_STEP_CLICK', tileId, stepLabel } satisfies MessageType);
  }, []);

  const sendOfferAction = useCallback((action: string) => {
    channelRef.current?.postMessage({ type: 'CLIENT_OFFER_ACTION', action } satisfies MessageType);
  }, []);

  return { state, connected, sendStepClick, sendOfferAction };
}
