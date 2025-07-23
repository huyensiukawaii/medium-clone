import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { ArticlesModule } from './articles/articles.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [AuthModule, UsersModule, ArticlesModule, ProfileModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
