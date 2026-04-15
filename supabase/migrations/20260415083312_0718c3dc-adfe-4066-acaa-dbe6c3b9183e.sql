ALTER TABLE public.budget_expenses
  ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurring_frequency text DEFAULT NULL;