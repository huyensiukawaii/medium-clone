import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode, 
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Auth } from '../auth/auth.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @Auth() 
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createArticle(@GetUser() user: User, @Body('article') createArticleDto: CreateArticleDto): Promise<ArticleResponseDto> {
    const article = await this.articlesService.create(createArticleDto, user.id);
    const fullArticle = await this.articlesService.findBySlug(article.slug);
    return new ArticleResponseDto(fullArticle, fullArticle.author);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string): Promise<ArticleResponseDto> {
    const article = await this.articlesService.findBySlug(slug);
    return new ArticleResponseDto(article, article.author); 
  }

  @Put(':slug')
  @Auth()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateArticle(@Param('slug') slug: string, @GetUser() user: User, @Body('article') updateArticleDto: UpdateArticleDto): Promise<ArticleResponseDto> {
    const updatedArticle = await this.articlesService.update(slug, updateArticleDto, user.id);
    return new ArticleResponseDto(updatedArticle, updatedArticle.author); // Pass author object
  }

  @Delete(':slug')
  @Auth() 
  @HttpCode(204)
  async deleteArticle(@Param('slug') slug: string, @GetUser() user: User): Promise<void> {
    await this.articlesService.delete(slug, user.id);
  }
}
