INSERT INTO public.tools (key, name_key, description_key, icon, status, enabled_for_clients, enabled_for_public, slug, cta_mode, sort_order)
VALUES ('kostenaufschluesselung', 'tools.kostenaufschluesselung.name', 'tools.kostenaufschluesselung.description', 'trending-up', 'active', true, true, 'kostenaufschluesselung', 'contact', 20)
ON CONFLICT (key) DO NOTHING;