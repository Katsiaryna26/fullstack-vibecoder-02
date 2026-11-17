import { knowledgeArticlesRepository } from "../infrastructure/knowledge-articles-repository.ts";

export const deleteArticle = {
  execute({ id }: { id: number }) {
    return knowledgeArticlesRepository.delete(id);
  },
};
