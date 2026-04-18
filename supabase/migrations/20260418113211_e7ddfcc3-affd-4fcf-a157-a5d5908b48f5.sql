-- Push subscription storage
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  platform TEXT,
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user ON public.push_subscriptions(user_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own push subs"
  ON public.push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own push subs"
  ON public.push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own push subs"
  ON public.push_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own push subs"
  ON public.push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins read all push subs"
  ON public.push_subscriptions FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_push_subs_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: send push when a new chat message arrives
CREATE OR REPLACE FUNCTION public.notify_chat_message_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
BEGIN
  IF NEW.sender_id = NEW.participant_id THEN
    recipient_id := NULL;
  ELSE
    recipient_id := NEW.participant_id;
  END IF;

  SELECT COALESCE(NULLIF(TRIM(first_name || ' ' || last_name), ''), 'Neue Nachricht')
    INTO sender_name
    FROM public.profiles WHERE id = NEW.sender_id;

  PERFORM net.http_post(
    url := 'https://nzdnlwditksqpcyvxfgc.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object(
      'user_id', recipient_id,
      'broadcast_to_admins', recipient_id IS NULL,
      'title', sender_name,
      'body', LEFT(NEW.message, 140),
      'url', '/app/client-portal/chat',
      'tag', 'chat-' || NEW.id::text
    )
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_chat_message_push
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_chat_message_push();
