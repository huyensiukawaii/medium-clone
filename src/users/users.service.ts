import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt'; //

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    // Helpers
    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }

    private async generateJwtToken(user: any): Promise<string> {
        const payload = { email: user.email, sub: user.id };
        return this.jwtService.sign(payload);
    }

    // Register User
    async create(createUserDto: CreateUserDto) {
        const { username, email, password } = createUserDto;

        const existingUserByEmail = await this.prisma.user.findUnique({ where: { email } });
        if (existingUserByEmail) {
        throw new ConflictException('Email is already taken.');
        }

        const existingUserByUsername = await this.prisma.user.findUnique({ where: { username } });
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

    // Login User
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

    
}