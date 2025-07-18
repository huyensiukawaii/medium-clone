import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; 
import { PassportModule } from '@nestjs/passport'; 
import { JwtModule } from '@nestjs/jwt'; 
import { JwtStrategy } from './jwt.strategy'; 

@Module({
  imports: [
    UsersModule, 
    PassportModule,
    JwtModule.register({ 
      secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy], 
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
