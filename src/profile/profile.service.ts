import { Injectable,NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileDto } from '../users/dto/profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(username: string, currentUserId: string): Promise<ProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if(!user){
      throw new NotFoundException(`Profile with username "${username}" not found.`);
    }

    let isFollowing = false;
    
    if (currentUserId === user.id) {
      isFollowing = false; 
    } else {
      const followRelation = await this.prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!followRelation;
    }

    return new ProfileDto(user, isFollowing);
  }

  async followUser(username: string, currentUserId: string): Promise<ProfileDto> {
    const userToFollow = await this.prisma.user.findUnique({
      where: { username },
    });

    if(!userToFollow) {
      throw new NotFoundException(`User with username "${username}" not found.`)
    }

    if (userToFollow.id === currentUserId) {
      throw new ConflictException('You cannot follow yourself.');
    }

    const existingFollow = await this.prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userToFollow.id,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException(`You are already following "${username}".`);
    }

    await this.prisma.follows.create({
      data: {
        followerId: currentUserId,
        followingId: userToFollow.id,
      },
    });

    return new ProfileDto(userToFollow, true);
  } 

  async unfollowUser(username: string, currentUserId: string): Promise<ProfileDto> {
    const userToUnfollow = await this.prisma.user.findUnique({
      where: { username },
    });

    if(!userToUnfollow) {
      throw new NotFoundException(`User with username"${username}" not found.`);
    }

    if (userToUnfollow.id === currentUserId) {
      throw new ConflictException('You cannot unfollow yourself.');
    }

    const existingFollow = await this.prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userToUnfollow.id,
        },
      },
    });

    if (!existingFollow) {
      throw new ConflictException(`You are not following "${username}".`);
    }

    await this.prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userToUnfollow.id,
        },
      },
    });

    return new ProfileDto(userToUnfollow, false);
  }
}
