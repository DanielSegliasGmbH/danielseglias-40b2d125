
-- 1. Analyses table
CREATE TABLE public.three_a_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  provider TEXT,
  product_name TEXT,
  product_type TEXT,
  contribution_amount NUMERIC,
  contribution_frequency TEXT,
  contract_start DATE,
  contract_end DATE,
  remaining_years NUMERIC,
  paid_contributions NUMERIC,
  current_value NUMERIC,
  guaranteed_value NUMERIC,
  funds JSONB DEFAULT '[]'::jsonb,
  equity_quota NUMERIC,
  strategy_classification TEXT,
  costs JSONB DEFAULT '{}'::jsonb,
  flexibility JSONB DEFAULT '{}'::jsonb,
  issues JSONB DEFAULT '[]'::jsonb,
  initial_assessment TEXT,
  raw_extraction JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.three_a_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create analyses" ON public.three_a_analyses FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Users can view own analyses by session" ON public.three_a_analyses FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins can manage all analyses" ON public.three_a_analyses FOR ALL TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Users can update own analyses" ON public.three_a_analyses FOR UPDATE TO authenticated, anon USING (true);

-- 2. Documents table
CREATE TABLE public.three_a_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.three_a_analyses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  document_type TEXT DEFAULT 'unknown',
  processing_status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.three_a_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create documents" ON public.three_a_documents FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Anyone can view documents" ON public.three_a_documents FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins can manage all documents" ON public.three_a_documents FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 3. Extracted fields table
CREATE TABLE public.three_a_extracted_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES public.three_a_analyses(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  field_value TEXT,
  confidence TEXT DEFAULT 'unknown',
  source_document_id UUID REFERENCES public.three_a_documents(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.three_a_extracted_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create extracted_fields" ON public.three_a_extracted_fields FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Anyone can view extracted_fields" ON public.three_a_extracted_fields FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Admins can manage all extracted_fields" ON public.three_a_extracted_fields FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- 4. Review requests table
CREATE TABLE public.three_a_review_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID REFERENCES public.three_a_analyses(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  consent_given BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.three_a_review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create review requests" ON public.three_a_review_requests FOR INSERT TO authenticated, anon WITH CHECK (true);
CREATE POLICY "Admins can view all review requests" ON public.three_a_review_requests FOR SELECT TO authenticated USING (is_admin(auth.uid()));
CREATE POLICY "Admins can update review requests" ON public.three_a_review_requests FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- 5. Triggers for updated_at
CREATE TRIGGER update_three_a_analyses_updated_at BEFORE UPDATE ON public.three_a_analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_three_a_review_requests_updated_at BEFORE UPDATE ON public.three_a_review_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('three-a-documents', 'three-a-documents', false);

CREATE POLICY "Anyone can upload 3a documents" ON storage.objects FOR INSERT TO authenticated, anon WITH CHECK (bucket_id = 'three-a-documents');
CREATE POLICY "Anyone can view own 3a documents" ON storage.objects FOR SELECT TO authenticated, anon USING (bucket_id = 'three-a-documents');
CREATE POLICY "Admins can manage 3a documents" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'three-a-documents' AND is_admin(auth.uid()));
