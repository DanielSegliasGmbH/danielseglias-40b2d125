-- Add importance and phase columns to system_map_nodes
ALTER TABLE public.system_map_nodes 
ADD COLUMN IF NOT EXISTS importance TEXT NOT NULL DEFAULT 'supporting' 
CHECK (importance IN ('core', 'supporting', 'optional'));

ALTER TABLE public.system_map_nodes 
ADD COLUMN IF NOT EXISTS phase INTEGER NOT NULL DEFAULT 0 
CHECK (phase >= 0 AND phase <= 4);

-- Update existing seed data with sensible defaults
UPDATE public.system_map_nodes SET importance = 'core', phase = 0 WHERE key IN ('auth', 'users_roles', 'clients', 'cases', 'tasks');
UPDATE public.system_map_nodes SET importance = 'core', phase = 0 WHERE key IN ('meetings', 'notes');
UPDATE public.system_map_nodes SET importance = 'supporting', phase = 0 WHERE key IN ('dashboard', 'admin_ui');
UPDATE public.system_map_nodes SET importance = 'optional', phase = 1 WHERE key IN ('documents', 'activity_log');
UPDATE public.system_map_nodes SET importance = 'optional', phase = 2 WHERE key IN ('automations', 'taxes', 'mortgage', 'insurance', 'investments');
UPDATE public.system_map_nodes SET importance = 'optional', phase = 3 WHERE key IN ('google_workspace', 'notion_hubspot');