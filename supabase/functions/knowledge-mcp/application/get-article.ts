import { knowledgeArticlesRepository } from "../infrastructure/knowledge-articles-repository.ts";

export const getArticle = {
  execute({ id }: { id: number }) {
    return knowledgeArticlesRepository.getById(id);
  },
};
