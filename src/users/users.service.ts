import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUserByEmail) {
      throw new ConflictException('Email is already taken.');
    }

    const existingUserByUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUserByUsername) {
      throw new ConflictException('Username is already taken.');
    }

    const hashedPassword = await this.hashPassword(password);

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = await this.generateJwtToken(user);
    return { user, token };
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const token = await this.generateJwtToken(user);
    return { user, token };
  }

  async findById(id: string) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundException('User not found.');
    } 
  return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { email, username, password, passwordConfirmation, bio, image } = updateUserDto;
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) { throw new NotFoundException('User not found.'); }
    if (email && email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
      if (existingUser) { throw new ConflictException('Email is already taken.'); }
  }
  if (username && username !== user.username) {
    const existingUser = await this.prisma.user.findUnique({ where: { username } });
    if (existingUser) { throw new ConflictException('Username is already taken.'); }
  }

  let hashedPassword = user.password;
  if (password) {
    if (passwordConfirmation === undefined) {
            throw new BadRequestException('Please enter password confirmation,');
    }
    if (password !== passwordConfirmation) {
            throw new BadRequestException('New password and password confirmation do not match.');
        }
    hashedPassword = await this.hashPassword(password);
  }

  const updatedUser = await this.prisma.user.update({
    where: { id },
    data: {
      email: email || user.email,
      username: username || user.username,
      password: hashedPassword,
      bio: bio !== undefined ? bio : user.bio,
      image: image !== undefined ? image : user.image,
    },
  });

  const token = await this.generateJwtToken(updatedUser);
  return { user: updatedUser, token };
}

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private async generateJwtToken(user: any): Promise<string> {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }
}
