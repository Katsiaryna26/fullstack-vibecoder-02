BEGIN;

-- Embeddings are generated with OpenAI text-embedding-3-small (1536 dimensions).
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

ALTER TABLE public.knowledge_base_articles
  ADD COLUMN embedding extensions.vector(1536);

-- Cosine distance is appropriate for normalized text embeddings.
CREATE INDEX knowledge_base_articles_embedding_hnsw_idx
  ON public.knowledge_base_articles
  USING hnsw (embedding extensions.vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_knowledge_base_articles(
  query_embedding extensions.vector(1536),
  match_threshold double precision DEFAULT 0.7,
  match_count integer DEFAULT 5
)
RETURNS TABLE (
  id bigint,
  title text,
  content text,
  similarity double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    article.id,
    article.title,
    article.content,
    1 - (article.embedding OPERATOR(extensions.<=>) query_embedding) AS similarity
  FROM public.knowledge_base_articles AS article
  WHERE article.embedding IS NOT NULL
    AND 1 - (article.embedding OPERATOR(extensions.<=>) query_embedding) >= match_threshold
  ORDER BY article.embedding OPERATOR(extensions.<=>) query_embedding
  LIMIT LEAST(GREATEST(match_count, 1), 50);
$$;

COMMIT;
