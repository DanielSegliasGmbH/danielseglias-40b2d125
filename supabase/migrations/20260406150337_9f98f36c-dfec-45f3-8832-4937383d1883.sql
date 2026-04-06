
-- ============================================
-- Table: tracking_events
-- ============================================
CREATE TABLE public.tracking_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  session_id text,
  event_type text NOT NULL,
  event_name text,
  page_path text,
  page_title text,
  module_key text,
  tool_key text,
  content_key text,
  duration_seconds numeric,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_tracking_events_user_created ON public.tracking_events (user_id, created_at DESC);
CREATE INDEX idx_tracking_events_event_type ON public.tracking_events (event_type);
CREATE INDEX idx_tracking_events_session ON public.tracking_events (session_id);

-- Enable RLS
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Users can insert own events
CREATE POLICY "Users can insert own tracking events"
  ON public.tracking_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view own events
CREATE POLICY "Users can view own tracking events"
  ON public.tracking_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all events
CREATE POLICY "Admins can view all tracking events"
  ON public.tracking_events FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- ============================================
-- Table: tracking_sessions
-- ============================================
CREATE TABLE public.tracking_sessions (
  id text NOT NULL PRIMARY KEY,
  user_id uuid,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_tracking_sessions_user ON public.tracking_sessions (user_id, started_at DESC);

-- Enable RLS
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;

-- Users can insert own sessions
CREATE POLICY "Users can insert own tracking sessions"
  ON public.tracking_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view own sessions
CREATE POLICY "Users can view own tracking sessions"
  ON public.tracking_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update own sessions (heartbeat + session end)
CREATE POLICY "Users can update own tracking sessions"
  ON public.tracking_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all sessions
CREATE POLICY "Admins can view all tracking sessions"
  ON public.tracking_sessions FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));
