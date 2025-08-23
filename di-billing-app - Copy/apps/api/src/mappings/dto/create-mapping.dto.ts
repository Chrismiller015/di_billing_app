import { IsString, IsNotEmpty, IsEnum, IsInt, IsBoolean, IsOptional } from 'class-validator';
import { Program } from '@prisma/client';

export class CreateMappingDto {
@IsString()
@IsNotEmpty()
productCode: string;

@IsString()
@IsNotEmpty()
canonical: string;

@IsEnum(Program)
program: Program;

@IsInt()
standardPrice: number;

@IsBoolean()
@IsOptional()
active?: boolean;
}
