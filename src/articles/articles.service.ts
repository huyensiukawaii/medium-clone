import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, User, Follows } from '@prisma/client';
import { ListArticlesDto } from './dto/list-articles.dto'
import { ArticleListResponseDto } from './dto/article-list-response.dto'
import { ArticleResponseDto } from './dto/article-response.dto'
import slugify from 'slugify';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto, authorId: string): Promise<Article> {
    const { title, description, body, tagList } = createArticleDto;
    const slug = this.generateSlug(title);

    const existingArticle = await this.prisma.article.findUnique({ where: { slug } });
    if (existingArticle) { throw new ConflictException('Article with this title already exists.'); }

    const article = await this.prisma.article.create({
      data: {
        slug,
        title,
        description,
        body,
        tagList: this.processTagListForDb(tagList),
        author: { connect: { id: authorId } },
      },
    });
    return article;
  }

  async findBySlug(slug: string): Promise<Article & { author: User }> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: true }, 
    });
    if (!article) { throw new NotFoundException(`Article with slug "${slug}" not found.`); }
    return article;
  }

  async update(slug: string, updateArticleDto: UpdateArticleDto, userId: string): Promise<Article & { author: User }> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: true },
    });
    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found.`);
    }
    if (article.authorId !== userId) {
      throw new UnauthorizedException('You are not authorized to update this article.');
    }
    let newSlug = article.slug;
    if (updateArticleDto.title && updateArticleDto.title !== article.title) {
      newSlug = this.generateSlug(updateArticleDto.title);
      const existingArticleWithNewSlug = await this.prisma.article.findUnique({ where: { slug: newSlug } });
      if (existingArticleWithNewSlug && existingArticleWithNewSlug.id !== article.id) {
          throw new ConflictException('Another article with this new title already exists.');
      }
    }
    const updatedArticle = await this.prisma.article.update({
      where: { slug },
      data: {
        slug: newSlug,
        title: updateArticleDto.title || article.title,
        description: updateArticleDto.description || article.description,
        body: updateArticleDto.body || article.body,
        tagList: updateArticleDto.tagList !== undefined ? this.processTagListForDb(updateArticleDto.tagList) : article.tagList,
      },
      include: { author: true }, 
    });
    return updatedArticle;
  }

  async delete(slug: string, userId: string): Promise<void> {
    const article = await this.prisma.article.findUnique({ where: { slug }, include: { author: true } });
    if (!article) { throw new NotFoundException(`Article with slug "${slug}" not found.`); }
    if (article.authorId !== userId) { throw new UnauthorizedException('You are not authorized to delete this article.'); }

    await this.prisma.article.delete({ where: { slug } });
  }

  async findAllArticles(query: ListArticlesDto): Promise<ArticleListResponseDto> {
    const { tag, author, limit = 20, offset = 0 } = query;
  
    const whereClause: any = {};

    if (tag) {
      whereClause.tagList = { contains: `"${tag}"` };
    }

    if (author) {
      const authorUser = await this.prisma.user.findUnique({
        where: { username: author },
        select: { id: true },
      });

      if (!authorUser) {
        return { articles: [], articlesCount: 0 };
      }
      whereClause.authorId = authorUser.id;
    }

    const [articles, totalCount] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        include: {
          author: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.article.count({
        where: whereClause,
      }),
    ]);

    const articleDtos: ArticleResponseDto[] = articles.map(article => {
      return new ArticleResponseDto(article);
    });

    return new ArticleListResponseDto(articleDtos, totalCount);
  }

  async findFeedArticles(query: ListArticlesDto, currentUserId: string): Promise<ArticleListResponseDto> {
    const { limit = 20, offset = 0 } = query;

    const followingUsers = await this.prisma.follows.findMany({
      where: {
        followerId: currentUserId,
      },
      select: {
        followingId: true, 
      },
    });

    const followingIds = followingUsers.map(f => f.followingId); 
    if (followingIds.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const whereClause = {
      authorId: {
        in: followingIds, 
      },
    };

    const [articles, totalCount] = await this.prisma.$transaction([
      this.prisma.article.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        include: {
          author: true,
        },
        orderBy: { createdAt: 'desc' }, 
      }),
      this.prisma.article.count({
        where: whereClause,
      }),
    ]);

    const articleDtos: ArticleResponseDto[] = articles.map(article => {
      return new ArticleResponseDto(article);
    });

    return new ArticleListResponseDto(articleDtos, totalCount);
  }


  private generateSlug(title: string): string {
    return slugify(title, { lower: true, strict: true });
  }

  private processTagListForDb(tagList: string[] | undefined): string {
    if (tagList === undefined || tagList === null) return '[]';
    return JSON.stringify(tagList); 
  }
}
