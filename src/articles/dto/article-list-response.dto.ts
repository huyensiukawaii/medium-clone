import { ArticleResponseDto } from './article-response.dto';

export class ArticleListResponseDto {
  articles: ArticleResponseDto[];
  articlesCount: number;

  constructor(articles: ArticleResponseDto[], count: number) {
    this.articles = articles;
    this.articlesCount = count;
  }
}
