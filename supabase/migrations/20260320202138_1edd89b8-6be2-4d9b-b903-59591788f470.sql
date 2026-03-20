INSERT INTO public.tools (key, name_key, description_key, icon, status, enabled_for_clients, enabled_for_public, slug, sort_order)
VALUES (
  'zufalls-realitaets-check',
  'tools.zufallsRealitaetsCheck.name',
  'tools.zufallsRealitaetsCheck.description',
  'ClipboardCheck',
  'active',
  true,
  false,
  'zufalls-realitaets-check',
  130
)
ON CONFLICT (key) DO NOTHING;