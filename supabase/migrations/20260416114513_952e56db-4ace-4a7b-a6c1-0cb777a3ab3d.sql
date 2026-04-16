
-- Audit table for document extractions
CREATE TABLE public.document_extractions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  extraction_successful BOOLEAN NOT NULL DEFAULT false,
  fields_extracted_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.document_extractions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own extractions"
  ON public.document_extractions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own extractions"
  ON public.document_extractions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Temporary storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('document-uploads', 'document-uploads', false, 10485760);

-- Storage policies
CREATE POLICY "Users upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'document-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users read own documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'document-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'document-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
