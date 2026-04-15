
-- Snapshot table for net worth historical tracking
CREATE TABLE public.net_worth_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('asset', 'liability')),
  entry_id UUID NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_nw_snapshots_user_date ON public.net_worth_snapshots (user_id, snapshot_date);
CREATE INDEX idx_nw_snapshots_entry ON public.net_worth_snapshots (entry_id, snapshot_date);

-- Unique constraint: one snapshot per entry per day
CREATE UNIQUE INDEX idx_nw_snapshots_unique ON public.net_worth_snapshots (entry_id, snapshot_date);

-- Enable RLS
ALTER TABLE public.net_worth_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON public.net_worth_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own snapshots"
  ON public.net_worth_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own snapshots"
  ON public.net_worth_snapshots FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all snapshots"
  ON public.net_worth_snapshots FOR SELECT
  USING (is_admin(auth.uid()));
