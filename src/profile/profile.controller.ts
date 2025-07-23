import { Controller, Get, Post, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Auth } from '../auth/auth.decorator'; 
import { GetUser } from '../auth/get-user.decorator';
import { User as PrismaUser } from '@prisma/client';
import { ProfileDto } from '../users/dto/profile.dto'; 

@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @Auth()
  async getProfile(
    @Param('username') username: string,
    @GetUser() currentUser: PrismaUser,
  ): Promise<{ profile: ProfileDto }> {
    const profile = await this.profileService.getProfile(
      username,
      currentUser.id,
    );
    return { profile };
  }

  @Post(':username/follow')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async followUser(
    @Param('username') username: string,
    @GetUser() currentUser: PrismaUser,
  ): Promise<{ profile: ProfileDto }> {
    const profile = await this.profileService.followUser(username, currentUser.id);
    return { profile };
  }

  @Delete(':username/follow')
  @Auth()
  @HttpCode(HttpStatus.OK) 
  async unfollowUser(
    @Param('username') username: string,
    @GetUser() currentUser: PrismaUser,
  ): Promise<{ profile: ProfileDto }> {
    const profile = await this.profileService.unfollowUser(username, currentUser.id);
    return { profile };
  }
}
