import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service'; 
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule, 
  ],
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService],
  exports: [ProfileService], 
})
export class ProfileModule {}
