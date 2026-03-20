INSERT INTO public.tools (key, name_key, description_key, icon, status, enabled_for_clients, enabled_for_public, slug, cta_mode, sort_order)
VALUES ('kosten-impact-simulator', 'tools.kostenImpactSimulator.name', 'tools.kostenImpactSimulator.description', 'trending-up', 'active', true, true, 'kosten-impact-simulator', 'contact', 21)
ON CONFLICT (key) DO NOTHING;