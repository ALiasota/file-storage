import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateFolderDto {
  @ApiProperty({
    description: 'The name of the folder',
    example: 'Documents',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'The ID of the parent folder, if applicable',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  parentFolderId?: number;
}
