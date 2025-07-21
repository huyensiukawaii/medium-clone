import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Get,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto'; 
import { Auth } from '../auth/auth.decorator'; 
import { GetUser } from '../auth/get-user.decorator'; 
import { User } from '@prisma/client';

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

@Controller('user') 
export class CurrentUserController {
  constructor(private readonly usersService: UsersService) {}

  @Get() 
  @Auth() 
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) 
  async getCurrentUser(@GetUser() user: User): Promise<UserResponseDto> {
    const token = await this.usersService['generateJwtToken'](user); 
    return new UserResponseDto(user, token);
  }

  @Put()
  @Auth() 
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async updateCurrentUser(@GetUser() user: User, @Body('user') updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const { user: updatedUser, token } = await this.usersService.update(user.id, updateUserDto);
    return new UserResponseDto(updatedUser, token);
  }
}
