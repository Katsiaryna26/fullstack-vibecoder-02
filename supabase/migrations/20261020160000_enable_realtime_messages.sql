BEGIN;

ALTER TABLE public.messages REPLICA IDENTITY FULL;

DROP POLICY IF EXISTS "Allow realtime reads for messages" ON public.messages;
CREATE POLICY "Allow realtime reads for messages"
ON public.messages
FOR SELECT
TO anon, authenticated
USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END;
$$;

COMMIT;
