INSERT INTO public.tools (key, name_key, description_key, icon, status, enabled_for_clients, enabled_for_public, slug, cta_mode, sort_order)
VALUES ('wahrscheinlichkeitsrechner', 'tools.wahrscheinlichkeitsrechner.name', 'tools.wahrscheinlichkeitsrechner.description', 'trending-up', 'active', true, true, 'wahrscheinlichkeitsrechner', 'contact', 22)
ON CONFLICT (key) DO NOTHING;