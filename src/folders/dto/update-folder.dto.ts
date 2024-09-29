import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateFolderDto {
  @ApiPropertyOptional({
    description: 'The new name of the folder, if it needs to be updated',
    example: 'Updated Folder Name',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
