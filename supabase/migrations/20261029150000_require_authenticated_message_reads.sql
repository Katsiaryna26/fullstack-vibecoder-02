BEGIN;

DROP POLICY IF EXISTS "Allow realtime reads for messages" ON public.messages;
DROP POLICY IF EXISTS "Allow authenticated realtime reads for messages" ON public.messages;

CREATE POLICY "Allow authenticated realtime reads for messages"
ON public.messages
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

REVOKE SELECT ON TABLE public.messages FROM anon;

COMMIT;
