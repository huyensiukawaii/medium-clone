import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
    @IsEmail({}, { message: 'Invalid email format.' })
    @IsNotEmpty({ message: 'Email cannot be empty.' })
    email: string;

    @IsNotEmpty({ message: 'Password cannot be empty.' })
    password: string;
}