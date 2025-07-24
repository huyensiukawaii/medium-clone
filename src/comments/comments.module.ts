import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { PrismaService } from '../prisma/prisma.service'; 
import { AuthModule } from '../auth/auth.module'; 
import { UsersModule } from '../users/users.module'; 

@Module({
  imports: [
    AuthModule, 
    UsersModule,
  ],
  providers: [CommentsService, PrismaService],
  controllers: [CommentsController]
})
export class CommentsModule {}
