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
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListArticlesDto } from './dto/list-articles.dto';
import { ArticleListResponseDto } from './dto/article-list-response.dto';
import { Auth } from '../auth/auth.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '@prisma/client';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }))
  async getArticles(@Query() query: ListArticlesDto): Promise<ArticleListResponseDto> {
    return this.articlesService.findAllArticles(query);
  }

  @Get('feed') 
  @Auth() 
  @UsePipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }))
  async getFeed(
    @GetUser() currentUser: User, 
    @Query() query: ListArticlesDto, 
  ): Promise<ArticleListResponseDto> {
    return this.articlesService.findFeedArticles(query, currentUser.id);
  }
  
  @Post()
  @Auth() 
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async createArticle(@GetUser() user: User, @Body('article') createArticleDto: CreateArticleDto): Promise<ArticleResponseDto> {
    const article = await this.articlesService.create(createArticleDto, user.id);
    const fullArticle = await this.articlesService.findBySlug(article.slug);
    return new ArticleResponseDto(fullArticle);
  }

  @Get(':slug')
  async getArticle(@Param('slug') slug: string): Promise<ArticleResponseDto> {
    const article = await this.articlesService.findBySlug(slug);
    return new ArticleResponseDto(article); 
  }

  @Put(':slug')
  @Auth()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateArticle(@Param('slug') slug: string, @GetUser() user: User, @Body('article') updateArticleDto: UpdateArticleDto): Promise<ArticleResponseDto> {
    const updatedArticle = await this.articlesService.update(slug, updateArticleDto, user.id);
    return new ArticleResponseDto(updatedArticle); 
  }

  @Delete(':slug')
  @Auth() 
  @HttpCode(204)
  async deleteArticle(@Param('slug') slug: string, @GetUser() user: User): Promise<void> {
    await this.articlesService.delete(slug, user.id);
  }

}
