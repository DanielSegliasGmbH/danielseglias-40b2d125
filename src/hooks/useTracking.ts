import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──────────────────────────────────────────────
interface TrackEventParams {
  eventType: string;
  eventName?: string;
  moduleKey?: string;
  toolKey?: string;
  contentKey?: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}

// ── Session helpers ────────────────────────────────────
const SESSION_KEY = 'ds_tracking_session_id';

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// Module-level flag so we only start one session per tab
let sessionStarted = false;

// ── Fire-and-forget insert (never throws) ──────────────
async function insertEvent(
  userId: string | undefined,
  sessionId: string,
  params: TrackEventParams,
) {
  try {
    await supabase.from('tracking_events').insert({
      user_id: userId ?? null,
      session_id: sessionId,
      event_type: params.eventType,
      event_name: params.eventName ?? null,
      page_path: window.location.pathname,
      page_title: document.title,
      module_key: params.moduleKey ?? null,
      tool_key: params.toolKey ?? null,
      content_key: params.contentKey ?? null,
      duration_seconds: params.durationSeconds ?? null,
      metadata: (params.metadata as any) ?? {},
    });
  } catch (err) {
    console.warn('[tracking] event insert failed', err);
  }
}

async function upsertSession(userId: string | undefined, sessionId: string) {
  try {
    await supabase.from('tracking_sessions').upsert(
      {
        id: sessionId,
        user_id: userId ?? null,
        started_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        metadata: {},
      },
      { onConflict: 'id' },
    );
  } catch (err) {
    console.warn('[tracking] session upsert failed', err);
  }
}

async function heartbeat(sessionId: string) {
  try {
    await supabase
      .from('tracking_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', sessionId);
  } catch {
    // silent
  }
}

// ── Hook ───────────────────────────────────────────────
export function useTracking() {
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get current user id synchronously from supabase cache when possible
  const getUserId = useCallback(async (): Promise<string | undefined> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user?.id;
    } catch {
      return undefined;
    }
  }, []);

  // Start session once per tab
  useEffect(() => {
    if (sessionStarted) return;
    sessionStarted = true;

    const sessionId = getOrCreateSessionId();

    (async () => {
      const userId = await getUserId();
      await upsertSession(userId, sessionId);
      await insertEvent(userId, sessionId, { eventType: 'session_start' });
    })();

    // Heartbeat every 60s
    heartbeatRef.current = setInterval(() => {
      heartbeat(sessionId);
    }, 60_000);

    // Session end on unload (best-effort via sendBeacon)
    const handleUnload = () => {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/tracking_sessions?id=eq.${sessionId}`;
      const body = JSON.stringify({ ended_at: new Date().toISOString(), last_activity_at: new Date().toISOString() });
      navigator.sendBeacon(
        url,
        new Blob([body], { type: 'application/json' }),
      );
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [getUserId]);

  const trackEvent = useCallback(
    (params: TrackEventParams) => {
      const sessionId = getOrCreateSessionId();
      // Fire-and-forget — never block the caller
      getUserId().then((userId) => {
        insertEvent(userId, sessionId, params);
      });
    },
    [getUserId],
  );

  return { trackEvent };
}

// ── Standalone function for use outside React components ──
export function trackEventDirect(params: TrackEventParams) {
  const sessionId = getOrCreateSessionId();
  supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      insertEvent(session?.user?.id, sessionId, params);
    })
    .catch(() => {
      insertEvent(undefined, sessionId, params);
    });
}
