ALTER TABLE public.smart_notifications
ADD COLUMN IF NOT EXISTS is_starred boolean NOT NULL DEFAULT false;

-- For broadcast notifications, "starred" must be per-user.
-- The notification_reads table already tracks per-user state — extend it.
ALTER TABLE public.notification_reads
ADD COLUMN IF NOT EXISTS is_starred boolean NOT NULL DEFAULT false;