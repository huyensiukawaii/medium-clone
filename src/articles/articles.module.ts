import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { PrismaService } from '../prisma/prisma.service'; 
import { AuthModule } from '../auth/auth.module'; 
import { UsersModule } from '../users/users.module'; 

@Module({
  imports: [
    AuthModule, 
    UsersModule,
  ],
  providers: [ArticlesService, PrismaService],
  controllers: [ArticlesController]
})
export class ArticlesModule {}
