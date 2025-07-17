import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Username cannot be empty.' })
    username: string;

    @IsEmail({}, { message: 'Invalid email format.' })
    @IsNotEmpty({ message: 'Email cannot be empty.' })
    email: string;

    @IsNotEmpty({ message: 'Password cannot be empty.' })
    @MinLength(6, { message: 'Password must be at least 6 characters long.' })
    password: string;
}