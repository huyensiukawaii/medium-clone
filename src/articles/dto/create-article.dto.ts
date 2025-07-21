import { IsNotEmpty, IsArray, IsString, ArrayNotEmpty, IsOptional } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty({ message: 'Title cannot be empty.' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Description cannot be empty.' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Body cannot be empty.' })
  @IsString()
  body: string;

  @IsOptional() 
  @IsArray()
  @ArrayNotEmpty({ message: 'Tag list cannot be an empty array if provided.' }) // Nếu có, không được rỗng
  @IsString({ each: true }) 
  tagList?: string[]; 
}
