
-- =====================================================
-- Migration: Foreign Keys konsolidieren - RESTRICT statt CASCADE
-- Ziel: Datenintegrität absichern, alle CASCADE-Löschungen entfernen
-- =====================================================

-- PHASE 1: Alte CASCADE FKs entfernen (die doppelten/unsicheren)
-- =====================================================

-- cases.client_id: CASCADE FK entfernen
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_client_id_fkey;

-- tasks.case_id: CASCADE FK entfernen
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_case_id_fkey;

-- meetings.case_id: CASCADE FK entfernen
ALTER TABLE public.meetings DROP CONSTRAINT IF EXISTS meetings_case_id_fkey;

-- notes.case_id: CASCADE FK entfernen
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_case_id_fkey;

-- notes.meeting_id: CASCADE FK entfernen und durch RESTRICT ersetzen
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_meeting_id_fkey;

-- client_users.client_id: CASCADE FK entfernen
ALTER TABLE public.client_users DROP CONSTRAINT IF EXISTS client_users_client_id_fkey;

-- PHASE 2: Fehlende RESTRICT FKs hinzufügen (idempotent)
-- =====================================================

-- notes.meeting_id -> meetings.id (RESTRICT)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_notes_meeting_id'
    ) THEN
        ALTER TABLE public.notes
        ADD CONSTRAINT fk_notes_meeting_id
        FOREIGN KEY (meeting_id) 
        REFERENCES public.meetings(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- client_users.client_id -> clients.id (RESTRICT)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_client_users_client_id'
    ) THEN
        ALTER TABLE public.client_users
        ADD CONSTRAINT fk_client_users_client_id
        FOREIGN KEY (client_id) 
        REFERENCES public.clients(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- PHASE 3: user-bezogene FKs - auf profiles.id verweisen (RESTRICT, nullable)
-- Diese sind nullable, daher RESTRICT ohne NOT NULL
-- =====================================================

-- Alte user-FKs entfernen (verweisen auf auth.users, was problematisch ist für Abfragen)
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_assigned_to_fkey;
ALTER TABLE public.cases DROP CONSTRAINT IF EXISTS cases_created_by_fkey;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;
ALTER TABLE public.meetings DROP CONSTRAINT IF EXISTS meetings_created_by_fkey;
ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_created_by_fkey;
ALTER TABLE public.clients DROP CONSTRAINT IF EXISTS clients_created_by_fkey;

-- Neue FKs auf profiles.id mit RESTRICT
-- cases.assigned_to -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cases_assigned_to'
    ) THEN
        ALTER TABLE public.cases
        ADD CONSTRAINT fk_cases_assigned_to
        FOREIGN KEY (assigned_to) 
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- cases.created_by -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_cases_created_by'
    ) THEN
        ALTER TABLE public.cases
        ADD CONSTRAINT fk_cases_created_by
        FOREIGN KEY (created_by) 
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- tasks.assigned_to -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_tasks_assigned_to'
    ) THEN
        ALTER TABLE public.tasks
        ADD CONSTRAINT fk_tasks_assigned_to
        FOREIGN KEY (assigned_to) 
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- tasks.created_by -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_tasks_created_by'
    ) THEN
        ALTER TABLE public.tasks
        ADD CONSTRAINT fk_tasks_created_by
        FOREIGN KEY (created_by) 
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- meetings.created_by -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_meetings_created_by'
    ) THEN
        ALTER TABLE public.meetings
        ADD CONSTRAINT fk_meetings_created_by
        FOREIGN KEY (created_by) 
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- notes.author_id -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_notes_author_id'
    ) THEN
        ALTER TABLE public.notes
        ADD CONSTRAINT fk_notes_author_id
        FOREIGN KEY (author_id) 
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- clients.created_by -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_clients_created_by'
    ) THEN
        ALTER TABLE public.clients
        ADD CONSTRAINT fk_clients_created_by
        FOREIGN KEY (created_by) 
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- client_users.user_id -> profiles.id (zusätzlich, falls nicht vorhanden)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_client_users_user_id'
    ) THEN
        ALTER TABLE public.client_users
        ADD CONSTRAINT fk_client_users_user_id
        FOREIGN KEY (user_id) 
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- client_users.created_by -> profiles.id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_client_users_created_by'
    ) THEN
        ALTER TABLE public.client_users
        ADD CONSTRAINT fk_client_users_created_by
        FOREIGN KEY (created_by) 
        REFERENCES public.profiles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE;
    END IF;
END $$;

-- =====================================================
-- ZUSAMMENFASSUNG der gesetzten Constraints:
-- =====================================================
-- 
-- ENTFERNT (CASCADE):
-- - cases_client_id_fkey, tasks_case_id_fkey, meetings_case_id_fkey
-- - notes_case_id_fkey, notes_meeting_id_fkey, client_users_client_id_fkey
-- - cases_assigned_to_fkey, cases_created_by_fkey, tasks_assigned_to_fkey
-- - tasks_created_by_fkey, meetings_created_by_fkey, notes_created_by_fkey
-- - clients_created_by_fkey
--
-- HINZUGEFÜGT (RESTRICT + CASCADE UPDATE):
-- - fk_notes_meeting_id: notes.meeting_id -> meetings.id
-- - fk_client_users_client_id: client_users.client_id -> clients.id
-- - fk_cases_assigned_to: cases.assigned_to -> profiles.id
-- - fk_cases_created_by: cases.created_by -> profiles.id
-- - fk_tasks_assigned_to: tasks.assigned_to -> profiles.id
-- - fk_tasks_created_by: tasks.created_by -> profiles.id
-- - fk_meetings_created_by: meetings.created_by -> profiles.id
-- - fk_notes_author_id: notes.author_id -> profiles.id
-- - fk_clients_created_by: clients.created_by -> profiles.id
-- - fk_client_users_user_id: client_users.user_id -> profiles.id
-- - fk_client_users_created_by: client_users.created_by -> profiles.id
--
-- BEREITS VORHANDEN (aus vorheriger Migration):
-- - fk_cases_client_id: cases.client_id -> clients.id (RESTRICT)
-- - fk_tasks_case_id: tasks.case_id -> cases.id (RESTRICT)
-- - fk_meetings_case_id: meetings.case_id -> cases.id (RESTRICT)
-- - fk_notes_case_id: notes.case_id -> cases.id (RESTRICT)
-- =====================================================
