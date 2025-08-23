// [SOURCE: apps/api/src/discrepancies/dto/list-discrepancies.dto.ts]
import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListDiscrepanciesQueryDto {
  @IsOptional()
  @IsString()
  program?: string;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  bac?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minVariance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxVariance?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 50;

  @IsOptional()
  @IsString()
  sortBy?: string = 'variance';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}