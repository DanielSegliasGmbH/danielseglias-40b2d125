
-- Create storage bucket for case study media
INSERT INTO storage.buckets (id, name, public) VALUES ('case-study-media', 'case-study-media', true);

-- Allow anyone to view files (public bucket)
CREATE POLICY "Public can view case study media"
ON storage.objects FOR SELECT
USING (bucket_id = 'case-study-media');

-- Allow authenticated staff/admin to upload
CREATE POLICY "Staff can upload case study media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'case-study-media' AND public.is_staff_or_admin(auth.uid()));

-- Allow authenticated staff/admin to delete
CREATE POLICY "Staff can delete case study media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'case-study-media' AND public.is_staff_or_admin(auth.uid()));
