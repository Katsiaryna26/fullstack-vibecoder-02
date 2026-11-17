import { knowledgeArticlesRepository } from "../infrastructure/knowledge-articles-repository.ts";

export const searchArticles = {
  execute({ query, limit }: { query: string; limit: number }) {
    return knowledgeArticlesRepository.search(query, limit);
  },
};
