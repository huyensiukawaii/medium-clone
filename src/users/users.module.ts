import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; 
import { PrismaService } from '../prisma/prisma.service'; 
import { JwtModule } from '@nestjs/jwt'; 

@Module({
  imports: [
    JwtModule.register({ 
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key', 
      signOptions: { expiresIn: '7d' }, 
    }),
  ],
  controllers: [UsersController], 
  providers: [UsersService, PrismaService], 
  exports: [UsersService], 
})
export class UsersModule {}
