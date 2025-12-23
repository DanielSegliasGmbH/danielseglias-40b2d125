-- Create tools table as central source of truth
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  name_key TEXT NOT NULL,
  description_key TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'wrench',
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('active', 'planned', 'deprecated')),
  enabled_for_clients BOOLEAN NOT NULL DEFAULT false,
  enabled_for_public BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can do everything
CREATE POLICY "Admins can view all tools"
ON public.tools FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert tools"
ON public.tools FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update tools"
ON public.tools FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete tools"
ON public.tools FOR DELETE
USING (is_admin(auth.uid()));

-- Staff can view all tools (read-only)
CREATE POLICY "Staff can view all tools"
ON public.tools FOR SELECT
USING (is_staff_or_admin(auth.uid()));

-- Clients can view enabled tools
CREATE POLICY "Clients can view enabled tools"
ON public.tools FOR SELECT
USING (is_client(auth.uid()) AND enabled_for_clients = true AND status = 'active');

-- Public can view public-enabled tools (no auth required)
CREATE POLICY "Public can view public tools"
ON public.tools FOR SELECT
USING (enabled_for_public = true AND status = 'active');

-- Create trigger for updated_at
CREATE TRIGGER update_tools_updated_at
BEFORE UPDATE ON public.tools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial tools from existing hardcoded data
INSERT INTO public.tools (key, name_key, description_key, icon, status, enabled_for_clients, enabled_for_public, sort_order)
VALUES
  ('budget-calculator', 'tools.budgetCalculator.name', 'tools.budgetCalculator.description', 'calculator', 'planned', false, true, 1),
  ('retirement-planner', 'tools.retirementPlanner.name', 'tools.retirementPlanner.description', 'pie-chart', 'planned', false, true, 2),
  ('investment-simulator', 'tools.investmentSimulator.name', 'tools.investmentSimulator.description', 'trending-up', 'planned', false, true, 3),
  ('document-generator', 'tools.documentGenerator.name', 'tools.documentGenerator.description', 'file-text', 'planned', false, false, 4);