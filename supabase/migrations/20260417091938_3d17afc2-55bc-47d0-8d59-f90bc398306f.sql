-- Tool visibility system: hide all tools by default, expose only verified ones via phase unlock or admin override
CREATE TYPE public.tool_visibility AS ENUM ('public', 'phase_locked', 'hidden', 'admin_only');

ALTER TABLE public.tools
  ADD COLUMN visibility public.tool_visibility NOT NULL DEFAULT 'hidden',
  ADD COLUMN unlock_phase integer;

-- Default everything to hidden first (already default, but explicit)
UPDATE public.tools SET visibility = 'hidden', unlock_phase = NULL;

-- Phase 2 verified tools
UPDATE public.tools SET visibility = 'phase_locked', unlock_phase = 2
  WHERE key IN ('konten-modell', 'was-kostet-das-wirklich', 'guilty-pleasure-rechner');

-- Phase 3 verified tools (3-Säulen-Rechner = vergleichsrechner-3a)
UPDATE public.tools SET visibility = 'phase_locked', unlock_phase = 3
  WHERE key IN ('abo-audit', 'notfall-check', 'vergleichsrechner-3a');

-- Phase 4 verified tools
UPDATE public.tools SET visibility = 'phase_locked', unlock_phase = 4
  WHERE key IN ('lohnerhoher', 'mein-finanzplan', 'humankapital', 'lebenserwartung');