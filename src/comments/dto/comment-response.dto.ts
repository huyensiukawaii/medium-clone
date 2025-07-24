import { User, Comment } from '@prisma/client';
import { UserResponseForCommentDto } from '../../users/dto/user-response-for-comment.dto'; 

export class CommentResponseDto {
  comment: {
    id: string;
    createdAt: string; 
    updatedAt: string; 
    body: string;
    author: UserResponseForCommentDto
  };

  constructor(comment: Comment, author: User) {
    this.comment = {
      id: comment.id,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      body: comment.body,
      author: new UserResponseForCommentDto(author),
    };
  }
}
