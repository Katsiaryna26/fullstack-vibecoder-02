# MCP для базы статей

Edge Function `knowledge-mcp` предоставляет инструменты `list_articles`, `get_article`, `search_articles`, `create_article`, `update_article` и `delete_article`. Поиск проверяет заголовок и текст статьи без учёта регистра через `ILIKE` (`LIKE`). Для MCP-запросов нужен обычный Bearer-токен; JWT-аутентификация Supabase для этой функции выключена.

## Настройка

Задайте длинный случайный токен в Supabase как секрет и задеплойте функцию:

```sh
supabase secrets set KNOWLEDGE_MCP_TOKEN=your-long-random-token
supabase functions deploy knowledge-mcp
```

Функции также нужны стандартные секреты Supabase `SUPABASE_URL` и `SUPABASE_SECRET_KEYS` (используются проектом для доступа к базе статей).

Для Codex добавьте MCP-сервер в `~/.codex/config.toml`, заменив URL на URL своего проекта:

```toml
[mcp_servers.knowledge_base]
url = "https://<project-ref>.supabase.co/functions/v1/knowledge-mcp"
bearer_token_env_var = "KNOWLEDGE_MCP_TOKEN"
```

Перед запуском Codex переменная окружения `KNOWLEDGE_MCP_TOKEN` должна содержать тот же токен. После перезапуска Codex инструменты статей появятся у MCP-сервера `knowledge_base`.
