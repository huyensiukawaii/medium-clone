import { User } from '@prisma/client';

export class UserResponseForCommentDto {
  username: string;
  bio: string | null;
  image: string | null;

  constructor(user: User) {
    this.username = user.username;
    this.bio = user.bio || null; 
    this.image = user.image || null;
  }
}
