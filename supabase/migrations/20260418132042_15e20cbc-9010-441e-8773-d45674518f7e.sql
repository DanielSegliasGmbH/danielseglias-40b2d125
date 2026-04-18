COMMENT ON TABLE public.meta_profiles IS
  'DEPRECATED 2026-04-18: Data migrated to profiles table. Kept for backwards compatibility. Remove after Claude Code migration.';

COMMENT ON TABLE public.customer_profiles IS
  'DEPRECATED 2026-04-18: Old advisor CRM. Use profiles table instead.';

COMMENT ON TABLE public.user_scoring IS
  'DEPRECATED 2026-04-18: Old advisor scoring system. Decoupled from client app.';

COMMENT ON TABLE public.tasks IS
  'DEPRECATED 2026-04-18: Old CRM tasks. Use client_tasks instead.';