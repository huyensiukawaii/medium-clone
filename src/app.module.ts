import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { ArticlesModule } from './articles/articles.module';
import { I18nModule } from './i18n/i18n.module';

@Module({
  imports: [AuthModule, UsersModule, ArticlesModule, I18nModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
