import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Program } from '@prisma/client';

export class ListMappingsQueryDto {
  @IsOptional()
  @IsString()
  productCode?: string;

  @IsOptional()
  @IsString()
  canonical?: string;

  @IsOptional()
  @IsEnum(Program)
  program?: Program;
}