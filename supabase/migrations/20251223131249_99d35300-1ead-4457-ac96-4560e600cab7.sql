-- PHASE A+D: Erweitere leads und tools für Attribution und Routing

-- 1) leads erweitern um Attribution-Felder
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS page_slug TEXT,
ADD COLUMN IF NOT EXISTS tool_key TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_content TEXT,
ADD COLUMN IF NOT EXISTS utm_term TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 2) tools erweitern um slug für Public Routing
ALTER TABLE public.tools
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS cta_mode TEXT DEFAULT 'contact' CHECK (cta_mode IN ('contact', 'download', 'booking'));

-- Update existing tools with slugs based on key
UPDATE public.tools SET slug = key WHERE slug IS NULL;

-- Add index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_tools_slug ON public.tools(slug);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);