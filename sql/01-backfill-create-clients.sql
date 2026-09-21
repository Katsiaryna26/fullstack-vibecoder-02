BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS clients_user_telegram_id_uidx
    ON public.clients (user_telegram_id);

INSERT INTO public.clients (
    user_telegram_id,
    first_name,
    last_name,
    last_message_at
)
SELECT DISTINCT ON (btrim(m.messenger_user_id))
    btrim(m.messenger_user_id),
    NULLIF(split_part(btrim(m.author), ' ', 1), ''),
    NULLIF(regexp_replace(btrim(m.author), '^\S+\s*', ''), ''),
    m.created_at AT TIME ZONE 'UTC'
FROM public.messages AS m
WHERE m.messenger_type = 'telegram'
  AND m.messenger_user_id IS NOT NULL
  AND btrim(m.messenger_user_id) <> ''
ORDER BY
    btrim(m.messenger_user_id),
    m.created_at DESC,
    m.id DESC
ON CONFLICT (user_telegram_id)
    DO UPDATE SET
    first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           last_message_at = EXCLUDED.last_message_at;

COMMIT;
