import { Article, User } from '@prisma/client'; 
import { UserResponseForArticleDto } from '../../users/dto/user-response-for-article.dto'; 

export class ArticleResponseDto {
  article: {
    slug: string;
    title: string;
    description: string;
    body: string;
    tagList: string[];
    createdAt: string; 
    updatedAt: string; 
    author: UserResponseForArticleDto;
  };

  constructor(article: Article, author: User) {
    this.article = {
      slug: article.slug,
      title: article.title,
      description: article.description,
      body: article.body,
      tagList: JSON.parse(article.tagList || '[]'),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
      author: new UserResponseForArticleDto(author),
    };
  }
}
