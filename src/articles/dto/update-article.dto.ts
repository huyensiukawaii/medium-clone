import { IsOptional, IsString, IsArray, ArrayNotEmpty } from 'class-validator';

export class UpdateArticleDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Tag list cannot be an empty array if provided.' })
  @IsString({ each: true })
  tagList?: string[];
}
