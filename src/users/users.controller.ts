// src/users/users.controller.ts
import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users') // Base route for registration/login
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('/') // POST /api/users (Registration)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async register(@Body('user') createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const { user, token } = await this.usersService.create(createUserDto);
        return new UserResponseDto(user, token);
    }

    @Post('login') // POST /api/users/login (Login)
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    async login(@Body('user') loginUserDto: LoginUserDto): Promise<UserResponseDto> {
        const { user, token } = await this.usersService.login(loginUserDto);
        return new UserResponseDto(user, token);
    }
}

