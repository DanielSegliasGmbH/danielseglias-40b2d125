-- =============================================
-- DATENMODELL-ANPASSUNGEN
-- =============================================

-- 1. Neues Enum für Task-Status
CREATE TYPE public.task_status AS ENUM ('offen', 'in_arbeit', 'erledigt', 'blockiert');

-- 2. TASKS: Status-Spalte hinzufügen
ALTER TABLE public.tasks 
ADD COLUMN status task_status NOT NULL DEFAULT 'offen';

-- Index für Task-Status
CREATE INDEX idx_tasks_status ON public.tasks(status);

-- 3. CASES: due_date hinzufügen
ALTER TABLE public.cases 
ADD COLUMN due_date DATE;

-- Index für Cases due_date
CREATE INDEX idx_cases_due_date ON public.cases(due_date);

-- 4. NOTES: Flexibilisieren
-- meeting_id nullable machen
ALTER TABLE public.notes 
ALTER COLUMN meeting_id DROP NOT NULL;

-- case_id hinzufügen (für Notizen direkt am Mandat)
ALTER TABLE public.notes 
ADD COLUMN case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE;

-- author_id umbenennen von created_by für Klarheit
-- (created_by existiert bereits, wir benennen um für bessere Semantik)
ALTER TABLE public.notes 
RENAME COLUMN created_by TO author_id;

-- Index für Notes
CREATE INDEX idx_notes_case_id ON public.notes(case_id);
CREATE INDEX idx_notes_author_id ON public.notes(author_id);

-- 5. CHECK CONSTRAINT: Notiz muss entweder Meeting ODER Case haben
ALTER TABLE public.notes
ADD CONSTRAINT notes_must_have_parent 
CHECK (meeting_id IS NOT NULL OR case_id IS NOT NULL);