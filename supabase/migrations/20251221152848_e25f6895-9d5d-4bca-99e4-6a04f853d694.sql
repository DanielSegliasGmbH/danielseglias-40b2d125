-- Create system_map_nodes table
CREATE TABLE public.system_map_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('core', 'module', 'ui', 'security', 'automation', 'integration')),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  position_x NUMERIC,
  position_y NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_map_edges table
CREATE TABLE public.system_map_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_key TEXT NOT NULL REFERENCES public.system_map_nodes(key) ON DELETE CASCADE,
  target_key TEXT NOT NULL REFERENCES public.system_map_nodes(key) ON DELETE CASCADE,
  relation TEXT NOT NULL CHECK (relation IN ('owns', 'depends_on', 'uses', 'contains', 'manages', 'creates')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_key, target_key)
);

-- Enable RLS
ALTER TABLE public.system_map_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_map_edges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_map_nodes (Admin only)
CREATE POLICY "Admins can view system_map_nodes"
ON public.system_map_nodes
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert system_map_nodes"
ON public.system_map_nodes
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update system_map_nodes"
ON public.system_map_nodes
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete system_map_nodes"
ON public.system_map_nodes
FOR DELETE
USING (is_admin(auth.uid()));

-- RLS Policies for system_map_edges (Admin only)
CREATE POLICY "Admins can view system_map_edges"
ON public.system_map_edges
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert system_map_edges"
ON public.system_map_edges
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update system_map_edges"
ON public.system_map_edges
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete system_map_edges"
ON public.system_map_edges
FOR DELETE
USING (is_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_system_map_nodes_updated_at
BEFORE UPDATE ON public.system_map_nodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_map_edges_updated_at
BEFORE UPDATE ON public.system_map_edges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();