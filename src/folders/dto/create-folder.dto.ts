import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  parentFolderId?: number;
}
