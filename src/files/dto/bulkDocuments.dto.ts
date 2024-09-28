import { IsString, IsOptional } from 'class-validator';

export class BulkDocumentDto {
  @IsString()
  readonly typeId0: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  readonly description0: string;

  @IsString()
  @IsOptional()
  readonly propertyId0: string;

  @IsString()
  @IsOptional()
  readonly typeId1: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  readonly description1: string;

  @IsString()
  @IsOptional()
  readonly propertyId1: string;

  @IsString()
  @IsOptional()
  readonly typeId2: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  readonly description2: string;

  @IsString()
  @IsOptional()
  readonly propertyId2: string;

  @IsString()
  @IsOptional()
  readonly typeId3: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  readonly description3: string;

  @IsString()
  @IsOptional()
  readonly propertyId3: string;

  @IsString()
  @IsOptional()
  readonly typeId4: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  readonly description4: string;

  @IsString()
  @IsOptional()
  readonly propertyId4: string;
}
