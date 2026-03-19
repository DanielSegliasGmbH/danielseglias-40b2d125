/**
 * Cross-tab synchronisation for the investment consulting presentation mode.
 * Uses BroadcastChannel API to sync advisor → client view in real-time.
 */
import { useEffect, useRef, useCallback, useState } from 'react';

const CHANNEL_NAME = 'investment-presentation';

export interface PresentationState {
  /** Currently active tile id */
  activeTileId: string | null;
  /** Index in the selected tiles list */
  activeIdx: number;
  /** All selected tile ids (ordered) */
  selectedTileIds: string[];
  /** Status per tile */
  statuses: Record<string, 'resolved' | 'partial' | 'open'>;
  /** Whether presentation is active */
  isActive: boolean;
  /** Currently opened tool slug (if any) */
  openTool: string | null;
  /** Steps the client has clicked / selected (per tile) */
  clientSelectedSteps: Record<string, string[]>;
}

type MessageType =
  | { type: 'STATE_UPDATE'; payload: PresentationState }
  | { type: 'CLIENT_STEP_CLICK'; tileId: string; stepLabel: string }
  | { type: 'PING' }
  | { type: 'PONG' };

/**
 * Advisor side – broadcasts state changes to the client tab.
 */
export function usePresentationBroadcaster() {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);
  const clientWindowRef = useRef<Window | null>(null);

  const onClientStepClickRef = useRef<((tileId: string, stepLabel: string) => void) | null>(null);

  useEffect(() => {
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;

    ch.onmessage = (e: MessageEvent<MessageType>) => {
      if (e.data.type === 'PING') {
        ch.postMessage({ type: 'PONG' });
      } else if (e.data.type === 'CLIENT_STEP_CLICK') {
        onClientStepClickRef.current?.(e.data.tileId, e.data.stepLabel);
      }
    };

    return () => ch.close();
  }, []);

  const broadcast = useCallback((state: PresentationState) => {
    channelRef.current?.postMessage({ type: 'STATE_UPDATE', payload: state } satisfies MessageType);
  }, []);

  const startPresentation = useCallback((initialState: PresentationState) => {
    const url = `${window.location.origin}/presentation/investment`;
    clientWindowRef.current = window.open(url, 'investment-presentation', 'noopener');
    setIsPresenting(true);
    // Small delay to let window initialise then send state
    setTimeout(() => broadcast({ ...initialState, isActive: true }), 500);
  }, [broadcast]);

  const stopPresentation = useCallback(() => {
    broadcast({ activeTileId: null, activeIdx: 0, selectedTileIds: [], statuses: {}, isActive: false, openTool: null, clientSelectedSteps: {} });
    setIsPresenting(false);
    if (clientWindowRef.current && !clientWindowRef.current.closed) {
      clientWindowRef.current.close();
    }
    clientWindowRef.current = null;
  }, [broadcast]);

  return { isPresenting, broadcast, startPresentation, stopPresentation, onClientStepClickRef };
}

/**
 * Client side – listens for state updates from the advisor tab.
 */
export function usePresentationReceiver() {
  const [state, setState] = useState<PresentationState>({
    activeTileId: null,
    activeIdx: 0,
    selectedTileIds: [],
    statuses: {},
    isActive: false,
    openTool: null,
    clientSelectedSteps: {},
  });
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

  return { state, connected, sendStepClick };
}
