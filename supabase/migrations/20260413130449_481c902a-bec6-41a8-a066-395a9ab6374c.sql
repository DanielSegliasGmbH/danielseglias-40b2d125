
-- Add participant_id to identify the non-admin user in a chat conversation
ALTER TABLE public.chat_messages ADD COLUMN participant_id uuid;

-- Backfill participant_id from customer_users where possible
UPDATE public.chat_messages cm
SET participant_id = cu.user_id
FROM public.customer_users cu
WHERE cm.customer_id = cu.customer_id;

-- For messages where no customer_users link exists, use sender_id if sender_role='client'
UPDATE public.chat_messages
SET participant_id = sender_id
WHERE participant_id IS NULL AND sender_role = 'client';

-- Make customer_id nullable (some chats won't have a customer)
ALTER TABLE public.chat_messages ALTER COLUMN customer_id DROP NOT NULL;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Admins can insert chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can update chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can view all chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Clients can insert own chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Clients can update own chat messages read status" ON public.chat_messages;
DROP POLICY IF EXISTS "Clients can view own chat messages" ON public.chat_messages;

-- Recreate RLS policies using participant_id
CREATE POLICY "Admins can view all chat messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert chat messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (is_admin(auth.uid()) AND sender_id = auth.uid());

CREATE POLICY "Admins can update chat messages"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view own chat messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (participant_id = auth.uid());

CREATE POLICY "Users can insert own chat messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (participant_id IS NOT NULL AND sender_id = auth.uid() AND sender_role = 'client');

CREATE POLICY "Users can update own chat messages read status"
ON public.chat_messages FOR UPDATE
TO authenticated
USING (participant_id = auth.uid());
