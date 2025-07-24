import { IsNotEmpty, IsString} from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'Body cannot be empty.' })
  @IsString()
  body: string;
}

