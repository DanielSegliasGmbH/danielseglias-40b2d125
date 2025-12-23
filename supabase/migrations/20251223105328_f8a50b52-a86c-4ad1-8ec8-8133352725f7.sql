-- Create leads table for contact form submissions
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'contact_form',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads can be inserted by anyone (public contact form)
CREATE POLICY "Anyone can submit a lead"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only admins and staff can view leads
CREATE POLICY "Staff and admins can view leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

-- Only admins and staff can update leads
CREATE POLICY "Staff and admins can update leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (public.is_staff_or_admin(auth.uid()));

-- Create public pages table for blog/content
CREATE TABLE public.public_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  page_type TEXT NOT NULL CHECK (page_type IN ('landing', 'blog', 'tool', 'info')),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.public_pages ENABLE ROW LEVEL SECURITY;

-- Published pages are visible to everyone
CREATE POLICY "Published pages are public"
ON public.public_pages
FOR SELECT
TO anon, authenticated
USING (is_published = true);

-- Admins can see all pages
CREATE POLICY "Admins can view all pages"
ON public.public_pages
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can create pages
CREATE POLICY "Admins can create pages"
ON public.public_pages
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

-- Admins can update pages
CREATE POLICY "Admins can update pages"
ON public.public_pages
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Admins can delete pages
CREATE POLICY "Admins can delete pages"
ON public.public_pages
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create updated_at triggers
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_public_pages_updated_at
BEFORE UPDATE ON public.public_pages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();