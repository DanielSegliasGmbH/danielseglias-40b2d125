
-- Add referral_code column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate a unique referral code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  code TEXT;
  name_part TEXT;
BEGIN
  -- Build code from first name or fallback
  name_part := UPPER(COALESCE(NULLIF(TRIM(NEW.first_name), ''), 'USER'));
  -- Take first 6 chars and append random digits
  name_part := LEFT(REGEXP_REPLACE(name_part, '[^A-Z]', '', 'g'), 6);
  IF LENGTH(name_part) < 2 THEN
    name_part := 'USER';
  END IF;
  code := name_part || TO_CHAR(EXTRACT(YEAR FROM now()), 'FM9999') || LPAD(FLOOR(RANDOM() * 100)::text, 2, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code) LOOP
    code := name_part || TO_CHAR(EXTRACT(YEAR FROM now()), 'FM9999') || LPAD(FLOOR(RANDOM() * 1000)::text, 3, '0');
  END LOOP;
  
  NEW.referral_code := code;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code on profile creation
CREATE TRIGGER trg_generate_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION public.generate_referral_code();

-- Backfill existing profiles that don't have a code
DO $$
DECLARE
  r RECORD;
  code TEXT;
  name_part TEXT;
BEGIN
  FOR r IN SELECT id, first_name FROM public.profiles WHERE referral_code IS NULL LOOP
    name_part := UPPER(COALESCE(NULLIF(TRIM(r.first_name), ''), 'USER'));
    name_part := LEFT(REGEXP_REPLACE(name_part, '[^A-Z]', '', 'g'), 6);
    IF LENGTH(name_part) < 2 THEN
      name_part := 'USER';
    END IF;
    code := name_part || TO_CHAR(EXTRACT(YEAR FROM now()), 'FM9999') || LPAD(FLOOR(RANDOM() * 100)::text, 2, '0');
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code) LOOP
      code := name_part || TO_CHAR(EXTRACT(YEAR FROM now()), 'FM9999') || LPAD(FLOOR(RANDOM() * 1000)::text, 3, '0');
    END LOOP;
    UPDATE public.profiles SET referral_code = code WHERE id = r.id;
  END LOOP;
END;
$$;

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  xp_awarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (referred_user_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can see referrals they made
CREATE POLICY "Users can view own referrals as referrer"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid());

-- Users can see their own referred record
CREATE POLICY "Users can view own referred record"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (referred_user_id = auth.uid());

-- Authenticated users can insert a referral for themselves
CREATE POLICY "Users can insert own referral"
  ON public.referrals FOR INSERT
  TO authenticated
  WITH CHECK (referred_user_id = auth.uid());

-- Admins can view all
CREATE POLICY "Admins can view all referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Admins can update referrals (for XP awarding)
CREATE POLICY "Admins can update referrals"
  ON public.referrals FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Users can update their own referrals (to mark completed)
CREATE POLICY "Referrers can update own referrals"
  ON public.referrals FOR UPDATE
  TO authenticated
  USING (referrer_id = auth.uid());
