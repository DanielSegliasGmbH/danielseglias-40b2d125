-- Add RLS policy for anonymous/public users to read published pages
CREATE POLICY "Public can view published pages" 
ON public.public_pages 
FOR SELECT 
USING (is_published = true);