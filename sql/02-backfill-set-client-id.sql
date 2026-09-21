BEGIN;

UPDATE public.messages AS m
SET client_id = c.id
    FROM public.clients AS c
WHERE m.messenger_type = 'telegram'
  AND btrim(m.messenger_user_id) = c.user_telegram_id
  AND m.client_id IS NULL;

COMMIT;
