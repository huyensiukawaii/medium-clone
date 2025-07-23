import { User } from '@prisma/client';

export class ProfileDto {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;

  constructor(user: User, isFollowing: boolean = false) {
    this.username = user.username;
    this.bio = user.bio || null; 
    this.image = user.image || null;
    this.following = isFollowing;
  }
}
