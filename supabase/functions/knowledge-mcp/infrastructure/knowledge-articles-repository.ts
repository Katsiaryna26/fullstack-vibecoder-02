import { createSupabaseClient } from "../../_shared/supabase.ts";

const articleColumns = "id, title, content, created_at, updated_at";

export const knowledgeArticlesRepository = {
  async list(limit: number) {
    const { data, error } = await createSupabaseClient()
      .from("knowledge_base_articles")
      .select(articleColumns)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) throw new Error(error.message);
    return data;
  },

  async getById(id: number) {
    const { data, error } = await createSupabaseClient()
      .from("knowledge_base_articles")
      .select(articleColumns)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async search(query: string, limit: number) {
    const pattern = `%${
      query.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll(
        "_",
        "\\_",
      )
    }%`;
    const supabase = createSupabaseClient();
    const [titleResult, contentResult] = await Promise.all([
      supabase
        .from("knowledge_base_articles")
        .select(articleColumns)
        .ilike("title", pattern)
        .order("updated_at", { ascending: false })
        .limit(limit),
      supabase
        .from("knowledge_base_articles")
        .select(articleColumns)
        .ilike("content", pattern)
        .order("updated_at", { ascending: false })
        .limit(limit),
    ]);

    if (titleResult.error) throw new Error(titleResult.error.message);
    if (contentResult.error) throw new Error(contentResult.error.message);
    const articles = new Map();
    for (const article of [...(titleResult.data ?? []), ...(contentResult.data ?? [])]) {
      articles.set(article.id, article);
    }

    return [...articles.values()]
      .sort((left, right) =>
        Date.parse(right.updated_at) - Date.parse(left.updated_at)
      )
      .slice(0, limit);
  },

  async create(input: { title: string; content: string }) {
    const { data, error } = await createSupabaseClient()
      .from("knowledge_base_articles")
      .insert(input)
      .select(articleColumns)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(
    id: number,
    updates: { title?: string; content?: string },
  ) {
    const { data: current, error: readError } = await createSupabaseClient()
      .from("knowledge_base_articles")
      .select("id")
      .eq("id", id)
      .single();

    if (readError || !current) {
      throw new Error(readError?.message ?? "Article not found");
    }

    const { data, error } = await createSupabaseClient()
      .from("knowledge_base_articles")
      .update(updates)
      .eq("id", id)
      .select(articleColumns)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: number) {
    const { error } = await createSupabaseClient()
      .from("knowledge_base_articles")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return { id, deleted: true };
  },
};
