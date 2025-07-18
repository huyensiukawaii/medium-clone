import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('users') 
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('') 
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async register(
    @Body('user') createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    const { user, token } = await this.usersService.create(createUserDto);
    return new UserResponseDto(user, token);
  }

  @Post('login') 
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(
    @Body('user') loginUserDto: LoginUserDto,
  ): Promise<UserResponseDto> {
    const { user, token } = await this.usersService.login(loginUserDto);
    return new UserResponseDto(user, token);
  }
}

