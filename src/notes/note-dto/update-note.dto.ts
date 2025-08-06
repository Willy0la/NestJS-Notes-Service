import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsNotEmpty()
  title?: string;
  @IsOptional()
  @IsNotEmpty()
  content?: string;
}
