import { Injectable, NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, User } from '@prisma/client';
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

  private generateSlug(title: string): string {
    return slugify(title, { lower: true, strict: true });
  }

  private processTagListForDb(tagList: string[] | undefined): string {
    if (tagList === undefined || tagList === null) return '[]';
    return JSON.stringify(tagList); 
  }
}
