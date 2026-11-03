BEGIN;

-- The product access model is organization-wide: every authenticated user may
-- read the inbox, while anonymous clients must not receive client or message
-- data. Realtime uses these same table policies for postgres_changes.
DROP POLICY IF EXISTS "Inbox members can read clients" ON public.clients;
DROP POLICY IF EXISTS "Inbox members can read messages" ON public.messages;
DROP POLICY IF EXISTS "Allow realtime reads for messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated realtime reads for messages" ON public.messages;

CREATE POLICY "Authenticated users can read clients"
ON public.clients
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read messages"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

REVOKE SELECT ON TABLE public.clients FROM anon;
REVOKE SELECT ON TABLE public.messages FROM anon;

COMMIT;
