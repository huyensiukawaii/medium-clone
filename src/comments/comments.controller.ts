import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  HttpCode,
  HttpStatus, 
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { Auth } from '../auth/auth.decorator';
import { GetUser } from '../auth/get-user.decorator';
import { User as PrismaUser } from '@prisma/client';

@Controller('articles')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post(':slug/comments')
  @Auth()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @HttpCode(HttpStatus.CREATED)
  async createComment(
    @Param('slug') slug: string,
    @Body('comment') createCommentDto: CreateCommentDto, 
    @GetUser() currentUser: PrismaUser,
  ): Promise<CommentResponseDto> {
    return this.commentsService.createComment(
      slug,
      createCommentDto, 
      currentUser,
    );
  }

  @Get(':slug/comments')
  async getCommentsByArticleSlug(
    @Param('slug') slug: string,
  ): Promise<{ comments: CommentResponseDto[] }> {
    return this.commentsService.findCommentsByArticleSlug(slug);
  }

  @Delete(':slug/comments/:id')
  @Auth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(
    @Param('slug') slug: string,
    @Param('id') commentId: string,
    @GetUser() currentUser: PrismaUser, 
  ): Promise<void> {
    await this.commentsService.deleteComment(slug, commentId, currentUser.id);
  }
}
