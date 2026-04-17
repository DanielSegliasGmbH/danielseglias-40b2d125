
-- 1) Restrict voice_scripts SELECT to authenticated users only
DROP POLICY IF EXISTS "Anyone can read active voice scripts" ON public.voice_scripts;

CREATE POLICY "Authenticated users can read active voice scripts"
ON public.voice_scripts
FOR SELECT
TO authenticated
USING (is_active = true);

-- 2) Realtime channel-level authorization
-- Enable RLS on realtime.messages (it may already be enabled by Supabase; safe no-op otherwise)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Drop any prior policies we created so this migration is idempotent
DROP POLICY IF EXISTS "Authenticated users can receive scoped realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users can send scoped realtime" ON realtime.messages;

-- Allow authenticated users to RECEIVE broadcasts/postgres_changes only on
-- channels they own. The channel topic is in realtime.messages.topic.
--   * chat-participant-<auth.uid()>   -> only that user
--   * chat-unread-global              -> only admins
--   * chat-admin-conversations        -> only admins
--   * any other topic                 -> any authenticated user (default)
CREATE POLICY "Authenticated users can receive scoped realtime"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'chat-participant-%'
      THEN realtime.topic() = 'chat-participant-' || (auth.uid())::text
    WHEN realtime.topic() IN ('chat-unread-global', 'chat-admin-conversations')
      THEN public.is_admin(auth.uid())
    ELSE true
  END
);

-- Allow authenticated users to SEND broadcasts on channels they own (same scoping)
CREATE POLICY "Authenticated users can send scoped realtime"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (
  CASE
    WHEN realtime.topic() LIKE 'chat-participant-%'
      THEN realtime.topic() = 'chat-participant-' || (auth.uid())::text
    WHEN realtime.topic() IN ('chat-unread-global', 'chat-admin-conversations')
      THEN public.is_admin(auth.uid())
    ELSE true
  END
);
