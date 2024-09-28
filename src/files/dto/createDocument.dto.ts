import { IsString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  readonly typeId: string;

  @IsString()
  @IsOptional()
  readonly userId: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  readonly description: string;

  @IsString()
  @IsOptional()
  readonly propertyId: string;

  @IsString()
  @IsOptional()
  readonly requestId: string;
}
