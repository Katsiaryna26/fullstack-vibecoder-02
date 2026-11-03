BEGIN;

-- Access to the inbox is an explicit allowlist. An authenticated Supabase
-- account is not automatically an authorized inbox operator.
CREATE TABLE IF NOT EXISTS public.inbox_members (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.inbox_members ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.inbox_members FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_inbox_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.inbox_members AS member
    WHERE member.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_inbox_member() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_inbox_member() TO authenticated;

DROP POLICY IF EXISTS "Allow realtime reads for messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated realtime reads for messages" ON public.messages;
DROP POLICY IF EXISTS "Inbox members can read clients" ON public.clients;
DROP POLICY IF EXISTS "Inbox members can read messages" ON public.messages;

CREATE POLICY "Inbox members can read clients"
ON public.clients
FOR SELECT
TO authenticated
USING (public.is_inbox_member());

CREATE POLICY "Inbox members can read messages"
ON public.messages
FOR SELECT
TO authenticated
USING (public.is_inbox_member());

REVOKE SELECT ON TABLE public.clients FROM anon;
REVOKE SELECT ON TABLE public.messages FROM anon;

COMMIT;
