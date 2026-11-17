import { knowledgeArticlesRepository } from "../infrastructure/knowledge-articles-repository.ts";

export const createArticle = {
  execute(input: { title: string; content: string }) {
    return knowledgeArticlesRepository.create(input);
  },
};
