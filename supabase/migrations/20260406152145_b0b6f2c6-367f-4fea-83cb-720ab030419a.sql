-- Automation rules table
CREATE TABLE public.automation_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  condition_type text NOT NULL,
  condition_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  action_type text NOT NULL,
  action_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  priority integer NOT NULL DEFAULT 100,
  scope text NOT NULL DEFAULT 'global',
  created_by uuid REFERENCES public.profiles(id),
  last_triggered_at timestamptz,
  trigger_count integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation_rules"
  ON public.automation_rules FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON public.automation_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Automation rule execution logs
CREATE TABLE public.automation_rule_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rule_id uuid NOT NULL REFERENCES public.automation_rules(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  customer_id uuid,
  condition_snapshot jsonb DEFAULT '{}'::jsonb,
  action_executed text NOT NULL,
  result jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_rule_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage automation_rule_logs"
  ON public.automation_rule_logs FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX idx_automation_rules_active ON public.automation_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_automation_rule_logs_user ON public.automation_rule_logs(user_id);
CREATE INDEX idx_automation_rule_logs_rule ON public.automation_rule_logs(rule_id);
CREATE INDEX idx_automation_rule_logs_created ON public.automation_rule_logs(created_at DESC);