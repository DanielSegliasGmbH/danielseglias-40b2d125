-- Add monthly_payment, interest_rate, and end_date columns to net_worth_liabilities
ALTER TABLE public.net_worth_liabilities
  ADD COLUMN monthly_payment numeric DEFAULT 0,
  ADD COLUMN interest_rate numeric DEFAULT NULL,
  ADD COLUMN end_date date DEFAULT NULL;
