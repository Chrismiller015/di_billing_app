import { IsString, IsOptional, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { Program } from '@prisma/client';

export class UpdateMappingDto {
@IsString()
@IsOptional()
canonical?: string;

@IsEnum(Program)
@IsOptional()
program?: Program;

@IsInt()
@IsOptional()
standardPrice?: number;

@IsBoolean()
@IsOptional()
active?: boolean;
}
