import { knowledgeArticlesRepository } from "../infrastructure/knowledge-articles-repository.ts";

export const listArticles = {
  execute({ limit }: { limit: number }) {
    return knowledgeArticlesRepository.list(limit);
  },
};
