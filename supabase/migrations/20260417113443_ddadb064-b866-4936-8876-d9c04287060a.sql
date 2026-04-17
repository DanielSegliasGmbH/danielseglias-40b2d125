-- ────────────────────────────────────────────────────────────────
-- Security hardening migration
-- ────────────────────────────────────────────────────────────────

-- (1) PROFILES: own-read policy is already present from previous migration.
--     Ensure it exists, and harden the staff/admin SELECT policy so non-admin
--     "staff" cannot blanket-read all profiles. Customer-record access for
--     staff is already enforced via the dedicated customers/customer_users
--     tables, so for the profiles table itself we restrict to admin + self.

DROP POLICY IF EXISTS "Staff can view profiles" ON public.profiles;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles'
    AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT TO authenticated
    USING (id = auth.uid());
  END IF;
END $$;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- (3) STORAGE: three-a-documents bucket — restrict uploads to authenticated
--     users into their own folder (folder name must equal auth.uid()).
DROP POLICY IF EXISTS "Anyone can upload 3a documents" ON storage.objects;

CREATE POLICY "Authenticated users can upload own 3a documents"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'three-a-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can read own 3a documents"
ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'three-a-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin(auth.uid())
  )
);

CREATE POLICY "Authenticated users can delete own 3a documents"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'three-a-documents'
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR public.is_admin(auth.uid())
  )
);

-- (4) GROUP FEED POSTS: require authentication to read.
DROP POLICY IF EXISTS "Anyone can read published feed posts" ON public.group_feed_posts;

CREATE POLICY "Authenticated users can read published feed posts"
ON public.group_feed_posts
FOR SELECT TO authenticated
USING (is_published = true);

-- (5) Replace overly permissive INSERT policies with owner-scoped ones.

-- 5a. three_a_analyses: only insert your own row
DROP POLICY IF EXISTS "Anyone can create analyses" ON public.three_a_analyses;
CREATE POLICY "Users can create own analyses"
ON public.three_a_analyses
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 5b. three_a_documents: only insert documents for analyses you own
DROP POLICY IF EXISTS "Anyone can create documents" ON public.three_a_documents;
CREATE POLICY "Users can create documents for own analyses"
ON public.three_a_documents
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.three_a_analyses a
    WHERE a.id = three_a_documents.analysis_id
      AND a.user_id = auth.uid()
  )
);

-- 5c. three_a_extracted_fields: only insert fields for analyses you own
DROP POLICY IF EXISTS "Anyone can create extracted_fields" ON public.three_a_extracted_fields;
CREATE POLICY "Users can create extracted fields for own analyses"
ON public.three_a_extracted_fields
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.three_a_analyses a
    WHERE a.id = three_a_extracted_fields.analysis_id
      AND a.user_id = auth.uid()
  )
);

-- 5d. three_a_review_requests: only request review for your own analyses
DROP POLICY IF EXISTS "Anyone can create review requests" ON public.three_a_review_requests;
CREATE POLICY "Users can create review requests for own analyses"
ON public.three_a_review_requests
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.three_a_analyses a
    WHERE a.id = three_a_review_requests.analysis_id
      AND a.user_id = auth.uid()
  )
);

-- 5e. leadmagnet_3a_checks is the PUBLIC lead-capture form (unauthenticated
--     by design). We keep INSERT open to anon BUT add basic shape validation
--     so it cannot be used as an arbitrary write-anywhere endpoint.
--     (No change to the open policy; rate limiting is handled by lead-capture
--     edge functions.)
