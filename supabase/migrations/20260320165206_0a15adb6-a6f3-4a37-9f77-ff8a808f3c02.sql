INSERT INTO public.tools (key, name_key, description_key, icon, status, enabled_for_clients, enabled_for_public, slug, sort_order, cta_mode)
VALUES (
  'tragbarkeitsrechner',
  'tools.tragbarkeitsrechner.name',
  'tools.tragbarkeitsrechner.description',
  'home',
  'active',
  true,
  false,
  'tragbarkeitsrechner',
  100,
  'contact'
)
ON CONFLICT (key) DO NOTHING;