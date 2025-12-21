-- =====================================================
-- DATEN-INTEGRITÄT: Indizes für Performance
-- =====================================================
-- ENUMs, DEFAULTs und NOT NULL sind bereits korrekt gesetzt.
-- Dieses Skript erstellt nur die fehlenden Performance-Indizes.
-- =====================================================

-- Index für cases(client_id)
CREATE INDEX IF NOT EXISTS idx_cases_client_id ON public.cases(client_id);

-- Index für tasks(case_id)
CREATE INDEX IF NOT EXISTS idx_tasks_case_id ON public.tasks(case_id);

-- Index für meetings(case_id)
CREATE INDEX IF NOT EXISTS idx_meetings_case_id ON public.meetings(case_id);

-- Index für notes(case_id)
CREATE INDEX IF NOT EXISTS idx_notes_case_id ON public.notes(case_id);