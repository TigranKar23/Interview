import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({ description: 'User Todo' })
  @IsString({ message: 'Title must be a string' })
  title: string;
}