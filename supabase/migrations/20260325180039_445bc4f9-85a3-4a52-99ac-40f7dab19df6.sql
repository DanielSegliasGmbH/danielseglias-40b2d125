
-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role text NOT NULL DEFAULT 'client',
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Clients can view messages for their own customer record
CREATE POLICY "Clients can view own chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (
    is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid())
  );

-- Clients can insert messages for their own customer record
CREATE POLICY "Clients can insert own chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    is_client(auth.uid()) 
    AND customer_id = get_customer_id_for_user(auth.uid())
    AND sender_id = auth.uid()
    AND sender_role = 'client'
  );

-- Admins can view all chat messages
CREATE POLICY "Admins can view all chat messages"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Admins can insert chat messages
CREATE POLICY "Admins can insert chat messages"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin(auth.uid()) AND sender_id = auth.uid()
  );

-- Admins can update chat messages (for marking as read)
CREATE POLICY "Admins can update chat messages"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Clients can update their own chat messages (for marking admin messages as read)
CREATE POLICY "Clients can update own chat messages read status"
  ON public.chat_messages FOR UPDATE
  TO authenticated
  USING (
    is_client(auth.uid()) AND customer_id = get_customer_id_for_user(auth.uid())
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Index for fast lookups
CREATE INDEX idx_chat_messages_customer_id ON public.chat_messages(customer_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
