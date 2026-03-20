INSERT INTO public.tools (key, name_key, description_key, icon, status, enabled_for_clients, enabled_for_public, slug, sort_order, cta_mode)
VALUES (
  'verlustrechner-3a',
  'tools.verlustrechner3a.name',
  'tools.verlustrechner3a.description',
  'trending-up',
  'active',
  true,
  false,
  'verlustrechner-3a',
  110,
  'booking'
)
ON CONFLICT (key) DO NOTHING;