import { knowledgeArticlesRepository } from "../infrastructure/knowledge-articles-repository.ts";

export const updateArticle = {
  execute(input: { id: number; title?: string; content?: string }) {
    const { id, ...updates } = input;
    return knowledgeArticlesRepository.update(id, updates);
  },
};
