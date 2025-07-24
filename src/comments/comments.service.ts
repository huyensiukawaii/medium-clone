import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { User } from '@prisma/client'

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async createComment(
    slug: string,
    createCommentDto: CreateCommentDto,
    currentUser: User,
  ): Promise<CommentResponseDto> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { author: true },
    });

    if(!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found.`);
    }

    const comment = await this.prisma.comment.create({
      data: {
        body: createCommentDto.body,
        authorId: currentUser.id,
        articleId: article.id,
      },
      include: {
        author: true,
      },
    });

    return new CommentResponseDto(comment, comment.author);
  }

  async findCommentsByArticleSlug(slug: string): Promise<{ comments: CommentResponseDto[] }> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found.`);
    }

    const comments = await this.prisma.comment.findMany({
      where: { articleId: article.id },
      include: { author: true },
      orderBy: { createdAt: 'desc' },
    });

    const commentDtos: CommentResponseDto[] = [];
    for (const comment of comments) {
      commentDtos.push(new CommentResponseDto(comment, comment.author));
    }

    return { comments: commentDtos };
  } 

  async deleteComment(slug: string, commentId: string, currentUserId: string): Promise<void> {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: { id: true }, 
    });

    if (!article) {
      throw new NotFoundException(`Article with slug "${slug}" not found.`);
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, articleId: true },
    });
    
    if (!comment || comment.articleId !== article.id) {
      throw new NotFoundException(`Comment with ID "${commentId}" not found for article "${slug}".`);
    }

    if (comment.authorId !== currentUserId) {
      throw new UnauthorizedException(`You are not authorized to delete this comment.`)
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
