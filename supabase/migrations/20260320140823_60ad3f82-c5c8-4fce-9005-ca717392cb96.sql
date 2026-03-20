INSERT INTO public.tools (key, name_key, description_key, icon, status, enabled_for_clients, enabled_for_public, slug, sort_order)
VALUES ('inflationsrechner', 'tools.inflationsrechner.name', 'tools.inflationsrechner.description', 'trending-up', 'active', true, false, 'inflationsrechner', 70)
ON CONFLICT (key) DO NOTHING;