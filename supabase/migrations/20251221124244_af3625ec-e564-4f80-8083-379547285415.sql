
-- =====================================================
-- Migration: Foreign Keys mit ON DELETE RESTRICT
-- Ziel: Datenintegrität absichern, keine Kaskadenlöschungen
-- =====================================================

-- 1) notes.case_id auf NOT NULL setzen (aktuell nullable)
-- Prüfung ergab: 0 NULL-Werte vorhanden
ALTER TABLE public.notes 
ALTER COLUMN case_id SET NOT NULL;

-- 2) Foreign Key: cases.client_id -> clients.id
-- ON DELETE RESTRICT: Client kann nicht gelöscht werden solange Cases existieren
-- ON UPDATE CASCADE: Falls Client-ID sich ändert, wird referenz aktualisiert
ALTER TABLE public.cases
ADD CONSTRAINT fk_cases_client_id
FOREIGN KEY (client_id) 
REFERENCES public.clients(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 3) Foreign Key: tasks.case_id -> cases.id
-- ON DELETE RESTRICT: Case kann nicht gelöscht werden solange Tasks existieren
ALTER TABLE public.tasks
ADD CONSTRAINT fk_tasks_case_id
FOREIGN KEY (case_id) 
REFERENCES public.cases(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 4) Foreign Key: meetings.case_id -> cases.id
-- ON DELETE RESTRICT: Case kann nicht gelöscht werden solange Meetings existieren
ALTER TABLE public.meetings
ADD CONSTRAINT fk_meetings_case_id
FOREIGN KEY (case_id) 
REFERENCES public.cases(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- 5) Foreign Key: notes.case_id -> cases.id
-- ON DELETE RESTRICT: Case kann nicht gelöscht werden solange Notes existieren
ALTER TABLE public.notes
ADD CONSTRAINT fk_notes_case_id
FOREIGN KEY (case_id) 
REFERENCES public.cases(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

-- Hinweis: notes.meeting_id bleibt wie es ist (optional, nullable)
-- Falls notes an meetings gebunden werden sollen, separat behandeln
