-- Create client_portal_settings table for admin configuration
CREATE TABLE public.client_portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  show_insurances BOOLEAN NOT NULL DEFAULT true,
  show_goals BOOLEAN NOT NULL DEFAULT true,
  show_tasks BOOLEAN NOT NULL DEFAULT true,
  show_strategies BOOLEAN NOT NULL DEFAULT true,
  show_library BOOLEAN NOT NULL DEFAULT true,
  show_tools BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id)
);

-- Enable RLS
ALTER TABLE public.client_portal_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_portal_settings
-- Admin can view all settings
CREATE POLICY "Admins can view all client_portal_settings"
ON public.client_portal_settings
FOR SELECT
USING (is_admin(auth.uid()));

-- Admin can insert settings
CREATE POLICY "Admins can insert client_portal_settings"
ON public.client_portal_settings
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

-- Admin can update settings
CREATE POLICY "Admins can update client_portal_settings"
ON public.client_portal_settings
FOR UPDATE
USING (is_admin(auth.uid()));

-- Admin can delete settings
CREATE POLICY "Admins can delete client_portal_settings"
ON public.client_portal_settings
FOR DELETE
USING (is_admin(auth.uid()));

-- Client can view only their own settings
CREATE POLICY "Clients can view own client_portal_settings"
ON public.client_portal_settings
FOR SELECT
USING (
  is_client(auth.uid()) AND 
  client_id = get_client_id_for_user(auth.uid())
);

-- Add trigger for updated_at
CREATE TRIGGER update_client_portal_settings_updated_at
BEFORE UPDATE ON public.client_portal_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();