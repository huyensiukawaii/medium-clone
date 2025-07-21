import { IsEmail, IsOptional, MinLength, ValidateIf  } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format.' })
  email?: string;

  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password?: string;

  @IsOptional()
  bio?: string;

  @IsOptional()
  image?: string;

  @ValidateIf(o => o.password !== undefined) // Chỉ validate nếu trường password được cung cấp
  passwordConfirmation?: string;
}
